
export interface ImageFile {
  file: File;
  base64: string;
}

// Fix: Added BackgroundStyle type to be shared across the application.
export type BackgroundStyle = 'watermark' | 'pattern_small' | 'pattern_large';

// Fix: Added TrainingExample interface to be shared across the application.
export interface TrainingExample {
  id: string;
  originalProductImage: string;
  logoImage: string;
  backgroundStyle: BackgroundStyle;
  finalImage: string;
}
