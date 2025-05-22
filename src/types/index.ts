export interface ModelFile {
  id: string;
  file: File;
  name: string;
  screenshotUrl: string | null;
  isLoading: boolean;
}

export interface ScreenshotDimensions {
  width: number;
  height: number;
}

export interface CameraAngles {
  alpha: number; // in degrees
  beta: number; // in degrees
}
