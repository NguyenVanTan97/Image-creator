
export interface ControlPanelState {
  uploadedFiles: File[];
  characterPrompt: string;
  backgroundPrompt: string;
  removeBackground: boolean;
  width: number;
  height: number;
  aspectRatio: string;
}