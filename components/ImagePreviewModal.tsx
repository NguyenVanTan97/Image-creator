import React, { useEffect, useCallback } from 'react';
import { CloseIcon, ModalDownloadIcon } from '../constants';

interface ImagePreviewModalProps {
  imageUrl: string;
  onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ imageUrl, onClose }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const handleDownload = useCallback(() => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [imageUrl]);

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="relative max-w-4xl max-h-[90vh] w-full"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside the image from closing the modal
      >
        <img 
          src={imageUrl} 
          alt="Full-screen preview" 
          className="w-full h-full object-contain"
        />
        <div className="absolute -top-2 -right-2 md:top-2 md:right-2 flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="text-dark-bg bg-secondary rounded-full p-2 hover:bg-secondary/80 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Download image"
          >
            {ModalDownloadIcon}
          </button>
          <button
            onClick={onClose}
            className="text-dark-bg bg-secondary rounded-full p-2 hover:bg-secondary/80 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Close image preview"
          >
            {CloseIcon}
          </button>
        </div>
      </div>
    </div>
  );
};