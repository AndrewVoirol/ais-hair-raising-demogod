import type { FaceTrackingData } from '../types/studio';

declare global {
  interface Window {
    FaceMesh?: any;
    Camera?: any;
  }
}

export class FaceTracker {
  private videoElement: HTMLVideoElement | null = null;
  private faceMesh: any = null;
  private isSimulated = false;
  private simTime = 0;

  // Smoothed tracking values
  private currentData: FaceTrackingData = {
    detected: false,
    yaw: 0,
    pitch: 0,
    roll: 0,
    faceX: 0.5,
    faceY: 0.45,
    faceWidth: 0.32,
    faceHeight: 0.42,
    leftEyeOpen: 1.0,
    rightEyeOpen: 1.0,
    mouthOpen: 0.0,
    mouthSmile: 0.2,
    eyebrowRaise: 0.0,
    audioLevel: 0.0,
  };

  private targetData: FaceTrackingData = { ...this.currentData };
  private smoothingFactor = 0.22; // Responsive yet smooth filter

  constructor() {
    this.initMediaPipe();
  }

  private async initMediaPipe() {
    try {
      const FaceMeshClass = window.FaceMesh || (await import('@mediapipe/face_mesh')).FaceMesh;
      if (FaceMeshClass) {
        this.faceMesh = new FaceMeshClass({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        this.faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        this.faceMesh.onResults(this.onFaceMeshResults.bind(this));
      }
    } catch (err) {
      console.warn('MediaPipe initialization fallback to lightweight simulation/vision engine:', err);
    }
  }

  public setVideoSource(video: HTMLVideoElement) {
    this.videoElement = video;
    this.isSimulated = false;
  }

  public enableSimulation(simulated = true) {
    this.isSimulated = simulated;
  }

  public async processFrame(): Promise<FaceTrackingData> {
    if (this.isSimulated || !this.videoElement || this.videoElement.readyState < 2) {
      this.updateSimulation();
      return this.currentData;
    }

    if (this.faceMesh && this.videoElement) {
      try {
        await this.faceMesh.send({ image: this.videoElement });
      } catch {
        // Continue smoothing
      }
    }

    this.smoothData();
    return this.currentData;
  }

  private onFaceMeshResults(results: any) {
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      this.targetData.detected = false;
      return;
    }

    const landmarks = results.multiFaceLandmarks[0];
    this.targetData.detected = true;

    const nose = landmarks[1];
    const chin = landmarks[152];
    const forehead = landmarks[10];
    const leftCheek = landmarks[234];
    const rightCheek = landmarks[454];

    // Center & scale
    this.targetData.faceX = nose.x;
    this.targetData.faceY = (nose.y + forehead.y) * 0.5;
    this.targetData.faceWidth = Math.hypot(rightCheek.x - leftCheek.x, rightCheek.y - leftCheek.y);
    this.targetData.faceHeight = Math.hypot(chin.x - forehead.x, chin.y - forehead.y);

    // Yaw (Head turn left / right)
    const distToLeft = Math.abs(nose.x - leftCheek.x);
    const distToRight = Math.abs(nose.x - rightCheek.x);
    const totalDist = distToLeft + distToRight || 1;
    this.targetData.yaw = ((distToRight - distToLeft) / totalDist) * 1.4;

    // Pitch (Head nod up / down)
    const faceMidY = (forehead.y + chin.y) * 0.5;
    this.targetData.pitch = ((nose.y - faceMidY) / (this.targetData.faceHeight || 1)) * 2.2;

    // Roll (Head tilt)
    const dx = rightCheek.x - leftCheek.x;
    const dy = rightCheek.y - leftCheek.y;
    this.targetData.roll = Math.atan2(dy, dx);

    // Eye openness & blinking
    const leftEyeTop = landmarks[159];
    const leftEyeBottom = landmarks[145];
    const leftEyeH = Math.hypot(leftEyeTop.x - leftEyeBottom.x, leftEyeTop.y - leftEyeBottom.y);
    this.targetData.leftEyeOpen = Math.min(Math.max((leftEyeH / (this.targetData.faceHeight * 0.08)) * 1.5, 0), 1);

    const rightEyeTop = landmarks[386];
    const rightEyeBottom = landmarks[374];
    const rightEyeH = Math.hypot(rightEyeTop.x - rightEyeBottom.x, rightEyeTop.y - rightEyeBottom.y);
    this.targetData.rightEyeOpen = Math.min(Math.max((rightEyeH / (this.targetData.faceHeight * 0.08)) * 1.5, 0), 1);

    // Mouth openness (speaking)
    const upperLip = landmarks[13];
    const lowerLip = landmarks[14];
    const mouthH = Math.hypot(upperLip.x - lowerLip.x, upperLip.y - lowerLip.y);
    this.targetData.mouthOpen = Math.min(Math.max((mouthH / (this.targetData.faceHeight * 0.12)) * 1.4, 0), 1);

    // Smile / Mouth width
    const mouthLeft = landmarks[61];
    const mouthRight = landmarks[291];
    const mouthW = Math.hypot(mouthRight.x - mouthLeft.x, mouthRight.y - mouthLeft.y);
    const smileMetric = mouthW / (this.targetData.faceWidth * 0.55);
    this.targetData.mouthSmile = Math.min(Math.max((smileMetric - 0.7) * 2.5, 0), 1);

    // Eyebrows
    const leftBrow = landmarks[70];
    const rightBrow = landmarks[300];
    const browY = (leftBrow.y + rightBrow.y) * 0.5;
    const browDist = forehead.y - browY;
    this.targetData.eyebrowRaise = Math.min(Math.max(browDist * 8, 0), 1);
  }

  private updateSimulation() {
    this.simTime += 0.03;
    const t = this.simTime;

    this.targetData.detected = true;
    this.targetData.faceX = 0.5 + Math.sin(t * 0.5) * 0.02;
    this.targetData.faceY = 0.44 + Math.cos(t * 0.4) * 0.015;
    this.targetData.faceWidth = 0.32;
    this.targetData.faceHeight = 0.42;

    this.targetData.yaw = Math.sin(t * 0.7) * 0.18;
    this.targetData.pitch = Math.sin(t * 0.9) * 0.12 + Math.cos(t * 0.3) * 0.05;
    this.targetData.roll = Math.sin(t * 0.5) * 0.04;

    const blinkCycle = t % 4.0;
    const isBlinking = blinkCycle > 3.8 && blinkCycle < 3.95;
    this.targetData.leftEyeOpen = isBlinking ? 0.05 : 1.0;
    this.targetData.rightEyeOpen = isBlinking ? 0.05 : 1.0;

    const speechWave = Math.max(0, Math.sin(t * 4.5) * Math.cos(t * 2.2));
    this.targetData.mouthOpen = speechWave * 0.7;
    this.targetData.mouthSmile = 0.3 + Math.sin(t * 0.6) * 0.2;
    this.targetData.eyebrowRaise = Math.max(0, Math.sin(t * 1.8) * 0.4);

    this.smoothData();
  }

  public setAudioLevel(level: number) {
    this.targetData.audioLevel = level;
    if (level > 0.08) {
      this.targetData.mouthOpen = Math.max(this.targetData.mouthOpen, Math.min(level * 2.2, 0.95));
    }
  }

  private smoothData() {
    const k = this.smoothingFactor;
    this.currentData.detected = this.targetData.detected;
    this.currentData.yaw += (this.targetData.yaw - this.currentData.yaw) * k;
    this.currentData.pitch += (this.targetData.pitch - this.currentData.pitch) * k;
    this.currentData.roll += (this.targetData.roll - this.currentData.roll) * k;
    this.currentData.faceX += (this.targetData.faceX - this.currentData.faceX) * k;
    this.currentData.faceY += (this.targetData.faceY - this.currentData.faceY) * k;
    this.currentData.faceWidth += (this.targetData.faceWidth - this.currentData.faceWidth) * k;
    this.currentData.faceHeight += (this.targetData.faceHeight - this.currentData.faceHeight) * k;
    this.currentData.leftEyeOpen += (this.targetData.leftEyeOpen - this.currentData.leftEyeOpen) * 0.4;
    this.currentData.rightEyeOpen += (this.targetData.rightEyeOpen - this.currentData.rightEyeOpen) * 0.4;
    this.currentData.mouthOpen += (this.targetData.mouthOpen - this.currentData.mouthOpen) * 0.35;
    this.currentData.mouthSmile += (this.targetData.mouthSmile - this.currentData.mouthSmile) * k;
    this.currentData.eyebrowRaise += (this.targetData.eyebrowRaise - this.currentData.eyebrowRaise) * k;
    this.currentData.audioLevel += (this.targetData.audioLevel - this.currentData.audioLevel) * 0.4;
  }

  public getTrackingData(): FaceTrackingData {
    return { ...this.currentData };
  }
}
