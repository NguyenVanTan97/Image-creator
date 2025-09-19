import React, { useState, useCallback } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { ResultsPanel } from './components/ResultsPanel';
import { generateImageVariations } from './services/geminiService';
import { FacebookIcon } from './constants';
import type { ControlPanelState } from './types';

const App: React.FC = () => {
  const [controlState, setControlState] = useState<ControlPanelState>({
    uploadedFiles: [],
    characterPrompt: '',
    backgroundPrompt: '',
    removeBackground: false,
    width: 1024,
    height: 1024,
  });

  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (controlState.uploadedFiles.length === 0) {
      setError('Please upload at least one image.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    try {
      const imageUrls = await generateImageVariations(
        controlState.uploadedFiles,
        controlState.characterPrompt,
        controlState.backgroundPrompt,
        controlState.removeBackground
      );
      setGeneratedImages(imageUrls);
    } catch (err) {
      console.error(err);
      setError('Failed to generate images. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [controlState]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-white text-white font-sans">
      <header className="p-4 flex justify-between items-center shadow-lg bg-primary/50 backdrop-blur-sm">
        <h1 className="text-2xl md:text-3xl font-bold text-accent">Image Creator (Dev T)</h1>
        <a
          href="https://www.facebook.com/97.Dev.T"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-accent text-primary px-4 py-2 rounded-lg font-semibold hover:bg-white transition-transform transform hover:scale-105"
        >
          {FacebookIcon}
          <span className="hidden sm:inline">Dev T</span>
        </a>
      </header>

      <main className="p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <ControlPanel
            state={controlState}
            setState={setControlState}
            onGenerate={handleGenerate}
            isLoading={isLoading}
          />
          <ResultsPanel
            images={generatedImages}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </main>
    </div>
  );
};

export default App;