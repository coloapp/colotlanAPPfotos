// Fix: Defining types for the application.
export interface ImageFile {
  file: File;
  base64: string; // The base64 string with data URI
}

export interface FinalImage {
  id: string;
  src: string; // base64 data URI
  createdAt: Date;
}

export type AppStage = 
  | 'UPLOAD_PRODUCT' 
  | 'REFINE_PRODUCT' 
  | 'UPLOAD_LOGO' 
  | 'REFINE_LOGO'
  | 'SELECT_DESIGN' 
  | 'FINALIZE';