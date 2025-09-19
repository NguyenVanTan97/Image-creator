import React, { useCallback, useState } from 'react';
import { ToggleSwitch } from './ToggleSwitch';
import { UploadIcon } from '../constants';
import type { ControlPanelState } from '../types';

interface ControlPanelProps {
  state: ControlPanelState;
  setState: React.Dispatch<React.SetStateAction<ControlPanelState>>;
  onGenerate: () => void;
  isLoading: boolean;
}

const MAX_FILES = 5;

export const ControlPanel: React.FC<ControlPanelProps> = ({ state, setState, onGenerate, isLoading }) => {
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = e.target.files ? Array.from(e.target.files) : [];
    if (newFiles.length === 0) return;

    setState(s => {
      const currentFiles = s.uploadedFiles;
      if (currentFiles.length >= MAX_FILES) {
        alert(`You can only upload a maximum of ${MAX_FILES} images.`);
        return s;
      }

      const remainingSlots = MAX_FILES - currentFiles.length;
      const filesToAdd = newFiles.slice(0, remainingSlots);

      if (newFiles.length > remainingSlots) {
        alert(`You can upload a maximum of ${MAX_FILES} images. Only the first ${remainingSlots} image(s) have been added.`);
      }

      const updatedFiles = [...currentFiles, ...filesToAdd];

      const readAsDataURL = (file: File): Promise<string> => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      };
      
      Promise.all(updatedFiles.map(readAsDataURL)).then(newPreviews => {
        setPreviews(newPreviews);
      });

      return { ...s, uploadedFiles: updatedFiles };
    });
    
    e.target.value = '';
  }, [setState]);
  
  const handleClearFiles = useCallback(() => {
    setState(s => ({ ...s, uploadedFiles: [] }));
    setPreviews([]);
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }, [setState]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setState(s => ({ ...s, [name]: value }));
  };

  const handleDimensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setState(s => ({ ...s, [name]: parseInt(value, 10) || 0 }));
  };
  
  const isUploadDisabled = state.uploadedFiles.length >= MAX_FILES;

  return (
    <div className="bg-primary/30 backdrop-blur-md p-6 rounded-2xl shadow-2xl space-y-6 border border-white/20">
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-accent font-semibold">
            Upload Image(s) ({state.uploadedFiles.length}/{MAX_FILES})
          </label>
          {previews.length > 0 && (
            <button 
              onClick={handleClearFiles} 
              className="text-sm text-accent hover:text-white underline focus:outline-none"
              aria-label="Clear uploaded files"
            >
              Clear
            </button>
          )}
        </div>
        <div className="bg-primary/50 p-2 rounded-lg min-h-[10rem] flex items-center">
          <div className="flex items-center space-x-4 overflow-x-auto w-full">
            {previews.map((src, index) => (
              <div key={index} className="flex-shrink-0 h-32 w-32">
                <img  src={src} alt={`Preview ${index + 1}`} className="h-full w-full rounded-lg object-cover bg-black/20" />
              </div>
            ))}
            {!isUploadDisabled && (
              <label 
                htmlFor="file-upload" 
                className="flex-shrink-0 w-32 h-32 flex flex-col items-center justify-center border-2 border-accent border-dashed rounded-lg cursor-pointer hover:bg-accent/20 transition text-accent"
                aria-label="Upload more images"
              >
                {UploadIcon}
                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} multiple disabled={isUploadDisabled} />
              </label>
            )}
          </div>
        </div>
      </div>

      <ToggleSwitch
        label="Remove Background"
        checked={state.removeBackground}
        onChange={(checked) => setState(s => ({ ...s, removeBackground: checked }))}
      />

      <div>
        <label htmlFor="characterPrompt" className="block text-accent font-semibold mb-2">Character Description</label>
        <textarea
          id="characterPrompt"
          name="characterPrompt"
          rows={3}
          value={state.characterPrompt}
          onChange={handleInputChange}
          className="w-full bg-primary/50 border border-secondary rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-secondary focus:border-transparent transition"
          placeholder={state.removeBackground ? "e.g., make the person wear glasses" : "e.g., a futuristic knight with glowing armor"}
        />
      </div>

      <div className={`space-y-6 transition-opacity duration-300 ${state.removeBackground ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        <div>
          <label htmlFor="backgroundPrompt" className="block text-accent font-semibold mb-2">Background, Scenery, etc.</label>
          <textarea
            id="backgroundPrompt"
            name="backgroundPrompt"
            rows={3}
            value={state.backgroundPrompt}
            onChange={handleInputChange}
            className="w-full bg-primary/50 border border-secondary rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-secondary focus:border-transparent transition"
            placeholder="e.g., a mystical forest at night with two moons"
            disabled={state.removeBackground}
          />
        </div>

        <div className="flex gap-4">
          <div>
            <label htmlFor="width" className="block text-accent font-semibold mb-2">Width (px)</label>
            <input
              type="number"
              id="width"
              name="width"
              value={state.width}
              onChange={handleDimensionChange}
              className="w-full bg-primary/50 border border-secondary rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-secondary focus:border-transparent transition"
              disabled={state.removeBackground}
            />
          </div>
          <div>
            <label htmlFor="height" className="block text-accent font-semibold mb-2">Height (px)</label>
            <input
              type="number"
              id="height"
              name="height"
              value={state.height}
              onChange={handleDimensionChange}
              className="w-full bg-primary/50 border border-secondary rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-secondary focus:border-transparent transition"
              disabled={state.removeBackground}
            />
          </div>
        </div>
      </div>
      
      <button
        onClick={onGenerate}
        disabled={isLoading || state.uploadedFiles.length === 0}
        className="w-full py-3 px-4 text-lg font-bold rounded-lg transition-all duration-300 ease-in-out bg-gradient-to-r from-accent to-white text-primary shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
      >
        {isLoading ? 'Generating...' : 'Generate'}
      </button>
    </div>
  );
};