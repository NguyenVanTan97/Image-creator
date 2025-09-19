
import React, { useCallback } from 'react';
import { DownloadIcon } from '../constants';

interface ResultsPanelProps {
  images: string[];
  isLoading: boolean;
  error: string | null;
}

const ImageCard: React.FC<{ src: string, index: number, onDownload: () => void }> = ({ src, index, onDownload }) => (
  <div className="relative group aspect-square bg-primary/20 rounded-lg overflow-hidden shadow-lg">
    <img src={src} alt={`Generated result ${index + 1}`} className="w-full h-full object-cover" />
    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
      <button 
        onClick={onDownload} 
        className="bg-accent text-primary px-4 py-2 rounded-lg font-semibold hover:bg-white transition-transform transform hover:scale-105"
      >
        Download
      </button>
    </div>
  </div>
);

const SkeletonLoader: React.FC = () => (
  <div className="animate-pulse bg-primary/20 rounded-lg aspect-square"></div>
);

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ images, isLoading, error }) => {
  
  const downloadImage = useCallback((url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);
  
  const handleDownloadAll = useCallback(() => {
    images.forEach((url, index) => {
      downloadImage(url, `generated-image-${index + 1}.png`);
    });
  }, [images, downloadImage]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-2 gap-4">
          {Array(4).fill(0).map((_, i) => <SkeletonLoader key={i} />)}
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full bg-red-900/50 rounded-lg p-4">
          <p className="text-center text-red-300">{error}</p>
        </div>
      );
    }

    if (images.length > 0) {
      return (
        <div className="grid grid-cols-2 gap-4">
          {images.map((src, index) => (
            <ImageCard 
              key={index} 
              src={src} 
              index={index} 
              onDownload={() => downloadImage(src, `generated-image-${index + 1}.png`)} 
            />
          ))}
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-full border-2 border-dashed border-accent/50 rounded-lg">
        <p className="text-accent/80">Your generated images will appear here</p>
      </div>
    );
  };

  return (
    <div className="bg-primary/30 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-white/20 h-full flex flex-col">
      <div className="flex-grow min-h-[300px] lg:min-h-0">
        {renderContent()}
      </div>
      {images.length > 0 && !isLoading && (
        <button
          onClick={handleDownloadAll}
          className="mt-6 w-full py-3 px-4 flex items-center justify-center bg-accent text-primary text-lg font-bold rounded-lg hover:bg-white transition-transform transform hover:scale-105"
        >
          {DownloadIcon}
          Download All
        </button>
      )}
    </div>
  );
};
