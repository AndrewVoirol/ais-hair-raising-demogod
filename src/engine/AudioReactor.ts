export class AudioReactor {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private dataArray: any = null;
  private isListening = false;
  private smoothedLevel = 0;

  public async start(): Promise<MediaStream | null> {
    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
      const source = this.audioCtx.createMediaStreamSource(this.micStream);

      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.75;

      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      this.isListening = true;

      return this.micStream;
    } catch (err) {
      console.warn('Microphone access not available or denied:', err);
      return null;
    }
  }

  public stop() {
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close();
    }
    this.isListening = false;
  }

  public getAudioLevel(): number {
    if (!this.isListening || !this.analyser || !this.dataArray) {
      return 0;
    }

    this.analyser.getByteFrequencyData(this.dataArray);

    let sum = 0;
    // Focus on speech frequencies (bins 2 to 45 ~ 150Hz - 3kHz)
    const count = Math.min(this.dataArray.length, 45);
    for (let i = 2; i < count; i++) {
      sum += this.dataArray[i];
    }

    const rawLevel = sum / ((count - 2) * 255);
    this.smoothedLevel += (rawLevel - this.smoothedLevel) * 0.35;
    return Math.min(Math.max(this.smoothedLevel, 0), 1);
  }

  public getFrequencyData(): any {
    if (!this.isListening || !this.analyser || !this.dataArray) return null;
    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }

  public getStream(): MediaStream | null {
    return this.micStream;
  }
}
