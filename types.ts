
export interface ImageData {
  base64: string;
  mimeType: string;
  previewUrl: string;
}

export type ProcessingStatus = 'idle' | 'processing' | 'success' | 'error';

export interface AppState {
  bodyImage: ImageData | null;
  outfitImage: ImageData | null;
  resultImage: string | null;
  status: ProcessingStatus;
  errorMessage: string | null;
}
