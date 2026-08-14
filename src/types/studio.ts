export type HairColorPreset = {
  id: string;
  name: string;
  baseColor: string;
  highlightColor: string;
  shininess: number;
};

export interface HairSettings {
  height: number; // 0.5 to 3.5 (1.0 = baseline, 2.0 = double tall, 3.5 = sky high)
  bigness: number; // 0.5 to 2.5 (1.0 = standard width, 2.5 = massive volume)
  shininess: number; // 0 to 100 (specular highlight intensity & gloss)
  hairlineLift: number; // -20 to 50
  color: string;
  highlightColor: string;
  physics: boolean;
  springStiffness: number; // 0.05 to 0.4
  audioReactive: boolean;
  superDemogodMode: boolean; // Golden lightning & glowing aura!
  activePresetId?: string;
}

export interface FaceTrackingData {
  detected: boolean;
  yaw: number; // Head rotation Y (turn left/right)
  pitch: number; // Head rotation X (nod up/down)
  roll: number; // Head rotation Z (tilt left/right)
  faceX: number; // Normalized center X (0 to 1)
  faceY: number; // Normalized center Y (0 to 1)
  faceWidth: number; // Normalized face width
  faceHeight: number; // Normalized face height
  leftEyeOpen: number; // 0 = closed, 1 = open
  rightEyeOpen: number;
  mouthOpen: number; // 0 = closed, 1 = wide open (speaking)
  mouthSmile: number; // 0 = neutral, 1 = broad smile
  eyebrowRaise: number; // 0 = relaxed, 1 = surprised/raised
  audioLevel: number; // 0 to 1 (normalized voice volume)
}

export type PresentationMode = 'avatar' | 'face_swap' | 'hybrid';
export type LutFilterType = 'warm_loft' | 'io_keynote' | 'crisp_tech' | 'cinematic_teal' | 'noir' | 'none';
export type AspectRatioType = '16:9' | '9:16' | '1:1';

export interface StudioSettings {
  mode: PresentationMode;
  showGlasses: boolean;
  showOutfit: boolean;
  showLaptopProps: boolean;
  showMugProps: boolean;
  showPlants: boolean;
  backgroundBlur: number; // 0 to 25px
  ambientWarmth: number; // 0 to 100
  lutFilter: LutFilterType;
  aspectRatio: AspectRatioType;
  cameraMirror: boolean;
  enableAudioVisualizer: boolean;
  hairWobbleReaction: number; // 0 to 100
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  durationSec: number;
  blobUrl: string | null;
  recordedBlob: Blob | null;
  mimeType: string;
}

export interface TeleprompterSettings {
  isOpen: boolean;
  text: string;
  fontSize: number; // 14 to 36
  speed: number; // 1 to 10
  isScrolling: boolean;
  opacity: number; // 0.2 to 1.0
}

export interface PresetStyle {
  id: string;
  name: string;
  tagline: string;
  hair: Partial<HairSettings>;
  studio: Partial<StudioSettings>;
}
