import React, { useEffect, useCallback, useRef } from 'react';
import { CloseIcon, ModalDownloadIcon, LeftArrowIcon, RightArrowIcon } from '../constants';

interface ImagePreviewModalProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ images, currentIndex, onClose, onNext, onPrev }) => {
  const imageUrl = images[currentIndex];
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowRight') {
        onNext();
      } else if (event.key === 'ArrowLeft') {
        onPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, onNext, onPrev]);

  const handleDownload = useCallback(() => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `generated-image-${currentIndex + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [imageUrl, currentIndex]);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (images.length <= 1) return;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || images.length <= 1) {
      return;
    }

    const touchEndX = e.changedTouches[0].clientX;
    const swipeDistance = touchStartX.current - touchEndX;
    const minSwipeDistance = 50; // Minimum distance for a swipe to be registered

    if (swipeDistance > minSwipeDistance) {
      onNext(); // Swiped left
    } else if (swipeDistance < -minSwipeDistance) {
      onPrev(); // Swiped right
    }

    touchStartX.current = null; // Reset for the next touch
  };

  if (!imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-accent bg-black/20 md:bg-black/30 rounded-full p-2 hover:bg-black/50 md:hover:bg-black/60 transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent z-10"
          aria-label="Previous image"
        >
          {LeftArrowIcon}
        </button>
      )}

      <div 
        className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img 
          src={imageUrl} 
          alt={`Full-screen preview ${currentIndex + 1}`} 
          className="max-w-full max-h-[90vh] object-contain"
        />
        <div className="absolute -top-12 right-0 flex items-center gap-2">
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

      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-accent bg-black/20 md:bg-black/30 rounded-full p-2 hover:bg-black/50 md:hover:bg-black/60 transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent z-10"
          aria-label="Next image"
        >
          {RightArrowIcon}
        </button>
      )}
    </div>
  );
};
