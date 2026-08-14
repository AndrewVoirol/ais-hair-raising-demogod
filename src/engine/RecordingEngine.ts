export class RecordingEngine {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private onStopCallback: ((blob: Blob, url: string) => void) | null = null;
  private isRecording = false;
  private isPaused = false;

  public startRecording(
    canvas: HTMLCanvasElement,
    micStream: MediaStream | null,
    onStop: (blob: Blob, url: string) => void
  ): boolean {
    try {
      this.recordedChunks = [];
      this.onStopCallback = onStop;

      const canvasStream = canvas.captureStream(60);
      const combinedTracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];

      if (micStream && micStream.getAudioTracks().length > 0) {
        combinedTracks.push(...micStream.getAudioTracks());
      }

      const combinedStream = new MediaStream(combinedTracks);

      const mimeTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4',
      ];

      let selectedMimeType = '';
      for (const mime of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          selectedMimeType = mime;
          break;
        }
      }

      const options: MediaRecorderOptions = selectedMimeType ? { mimeType: selectedMimeType } : {};
      this.mediaRecorder = new MediaRecorder(combinedStream, options);

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const mime = selectedMimeType || 'video/webm';
        const recordedBlob = new Blob(this.recordedChunks, { type: mime });
        const blobUrl = URL.createObjectURL(recordedBlob);
        this.isRecording = false;
        this.isPaused = false;
        if (this.onStopCallback) {
          this.onStopCallback(recordedBlob, blobUrl);
        }
      };

      this.mediaRecorder.start(1000); // 1-second chunks for reliability
      this.isRecording = true;
      this.isPaused = false;
      return true;
    } catch (err) {
      console.error('Failed to start MediaRecorder:', err);
      return false;
    }
  }

  public pauseRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      this.isPaused = true;
    }
  }

  public resumeRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      this.isPaused = false;
    }
  }

  public stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }

  public takeSnapshot(canvas: HTMLCanvasElement): string {
    return canvas.toDataURL('image/png');
  }

  public downloadBlob(blob: Blob, filename = 'hair-raising-demogod-demo.webm') {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  public downloadDataUrl(dataUrl: string, filename = 'demogod-snapshot.png') {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  public getState() {
    return {
      isRecording: this.isRecording,
      isPaused: this.isPaused,
    };
  }
}
