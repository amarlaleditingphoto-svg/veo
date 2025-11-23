export type AspectRatio = '16:9' | '9:16';

export interface GenerationConfig {
  prompt: string;
  image: File | null;
  aspectRatio: AspectRatio;
}

export type GenerationStatus = 'idle' | 'uploading' | 'generating' | 'polling' | 'downloading' | 'success' | 'error';

export interface VideoResult {
  url: string;
  prompt: string;
}
