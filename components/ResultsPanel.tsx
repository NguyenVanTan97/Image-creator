import React, { useCallback } from 'react';
import { DownloadIcon } from '../constants';

interface ResultsPanelProps {
  images: string[];
  isLoading: boolean;
  error: string | null;
  onImageSelect: (index: number) => void;
}

const ImageCard: React.FC<{ 
  src: string; 
  index: number; 
  onDownload: () => void;
  onSelect: () => void;
}> = ({ src, index, onDownload, onSelect }) => (
  <div className="relative aspect-square bg-black/20 rounded-lg overflow-hidden shadow-lg">
    <img 
      src={src} 
      alt={`Generated result ${index + 1}`} 
      className="w-full h-full object-cover cursor-pointer"
      onClick={onSelect}
    />
    <button 
      onClick={(e) => {
        e.stopPropagation(); // Prevent the image click from firing
        onDownload();
      }} 
      className="absolute top-2 right-2 bg-secondary text-accent p-2 rounded-full font-semibold hover:bg-secondary/80 transition-transform transform hover:scale-110 shadow-lg focus:outline-none focus:ring-2 focus:ring-accent"
      aria-label={`Download image ${index + 1}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    </button>
  </div>
);

const SkeletonLoader: React.FC = () => (
  <div className="animate-pulse bg-black/20 rounded-lg aspect-square"></div>
);

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ images, isLoading, error, onImageSelect }) => {
  
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
              onSelect={() => onImageSelect(index)}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-full border-2 border-dashed border-secondary/50 rounded-lg">
        <p className="text-secondary/80">Your generated images will appear here</p>
      </div>
    );
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-secondary/20 h-full flex flex-col">
      <div className="flex-grow min-h-[300px] lg:min-h-0">
        {renderContent()}
      </div>
      {images.length > 0 && !isLoading && (
        <button
          onClick={handleDownloadAll}
          className="mt-6 w-full py-3 px-4 flex items-center justify-center bg-gradient-to-r from-primary to-accent text-black text-lg font-bold rounded-lg hover:shadow-2xl transition-all transform hover:scale-105"
        >
          {DownloadIcon}
          Download All
        </button>
      )}
    </div>
  );
};
