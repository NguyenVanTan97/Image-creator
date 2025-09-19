
import React, { useState, useCallback } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { ResultsPanel } from './components/ResultsPanel';
import { ImagePreviewModal } from './components/ImagePreviewModal';
import { generateImageVariations } from './services/geminiService';
import { FacebookIcon } from './constants';
import type { ControlPanelState } from './types';

const App: React.FC = () => {
  const [controlState, setControlState] = useState<ControlPanelState>({
    uploadedFiles: [],
    characterPrompt: '',
    backgroundPrompt: '',
    removeBackground: false,
    width: 0,
    height: 0,
    aspectRatio: '9:16',
  });

  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

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
        controlState.removeBackground,
        controlState.width,
        controlState.height,
        controlState.aspectRatio
      );
      setGeneratedImages(imageUrls);
    } catch (err) {
      console.error(err);
      setError('Failed to generate images. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [controlState]);

  const handleNextImage = useCallback(() => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((prevIndex) => 
        prevIndex === null ? 0 : (prevIndex + 1) % generatedImages.length
      );
    }
  }, [selectedImageIndex, generatedImages.length]);

  const handlePrevImage = useCallback(() => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((prevIndex) => 
        prevIndex === null ? 0 : (prevIndex - 1 + generatedImages.length) % generatedImages.length
      );
    }
  }, [selectedImageIndex, generatedImages.length]);

  return (
    <div className="min-h-screen bg-dark-bg text-accent font-sans">
      <header className="p-4 flex justify-between items-center shadow-lg bg-gray-900/50 backdrop-blur-sm">
        <h1 className="text-2xl md:text-3xl font-bold text-secondary">Image Creator (Dev T)</h1>
        <a
          href="https://www.facebook.com/97.Dev.T"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-secondary text-dark-bg px-4 py-2 rounded-lg font-semibold hover:bg-secondary/80 transition-transform transform hover:scale-105"
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
            onImageSelect={setSelectedImageIndex}
          />
        </div>
      </main>

      {selectedImageIndex !== null && generatedImages.length > 0 && (
        <ImagePreviewModal 
          images={generatedImages}
          currentIndex={selectedImageIndex}
          onClose={() => setSelectedImageIndex(null)}
          onNext={handleNextImage}
          onPrev={handlePrevImage}
        />
      )}
    </div>
  );
};

export default App;
