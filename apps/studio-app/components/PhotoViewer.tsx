'use client';

import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styles from './PhotoViewer.module.css';

interface Photo {
  id: string;
  url?: string;
  sessionId?: string;
}

interface PhotoViewerProps {
  photos: Photo[];
  initialIndex: number;
  isStarred: (photoId: string) => boolean;
  onStar: (photoId: string) => void;
  onClose: () => void;
}

export function PhotoViewer({ 
  photos, 
  initialIndex, 
  isStarred, 
  onStar, 
  onClose 
}: PhotoViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const currentPhoto = photos[currentIndex];
  const starred = isStarred(currentPhoto?.id);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  }, [photos.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  }, [photos.length]);

  const handleDownload = async () => {
    if (isDownloading || !currentPhoto) return;
    
    setIsDownloading(true);
    try {
      // Fetch the image
      const response = await fetch(`/api/photos/${currentPhoto.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      // Get the content type and determine extension
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      let extension = 'jpg';
      if (contentType.includes('png')) extension = 'png';
      else if (contentType.includes('gif')) extension = 'gif';
      else if (contentType.includes('webp')) extension = 'webp';
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `photo-${currentPhoto.id}-${timestamp}.${extension}`;
      
      // Different download methods for different browsers
      if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
        // IE/Edge legacy
        (window.navigator as any).msSaveOrOpenBlob(blob, filename);
      } else {
        // Modern browsers
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        // Add to body, click, and remove
        document.body.appendChild(link);
        link.click();
        
        // Cleanup after a short delay
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 100);
      }
      
      console.log(`Downloaded: ${filename}`);
    } catch (error) {
      console.error('Download failed:', error);
      alert(`Failed to download photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDownloading(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'Escape':
          onClose();
          break;
        case ' ':
          e.preventDefault();
          if (currentPhoto) {
            onStar(currentPhoto.id);
          }
          break;
        case 'd':
        case 'D':
          handleDownload();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPhoto, goToPrevious, goToNext, onClose, onStar]);

  // Touch handling for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  // Prevent body scroll when viewer is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!mounted || !currentPhoto) return null;

  const content = (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header} onClick={(e) => e.stopPropagation()}>
          <div className={styles.counter}>
            {currentIndex + 1} / {photos.length}
          </div>
          <button 
            className={styles.closeButton} 
            onClick={onClose}
            aria-label="Close viewer"
          >
            ✕
          </button>
        </div>

        {/* Main content */}
        <div 
          className={styles.content}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Previous button */}
          {photos.length > 1 && (
            <button 
              className={`${styles.navButton} ${styles.prevButton}`}
              onClick={goToPrevious}
              aria-label="Previous photo"
            >
              ‹
            </button>
          )}

          {/* Photo */}
          <div className={styles.photoWrapper}>
            <img
              src={`/api/photos/${currentPhoto.id}`}
              alt={`Photo ${currentIndex + 1}`}
              className={styles.photo}
              draggable={false}
            />
          </div>

          {/* Next button */}
          {photos.length > 1 && (
            <button 
              className={`${styles.navButton} ${styles.nextButton}`}
              onClick={goToNext}
              aria-label="Next photo"
            >
              ›
            </button>
          )}
        </div>

        {/* Bottom controls */}
        <div className={styles.controls} onClick={(e) => e.stopPropagation()}>
          <button
            className={`${styles.controlButton} ${starred ? styles.starred : ''}`}
            onClick={() => onStar(currentPhoto.id)}
            aria-label={starred ? 'Unstar photo' : 'Star photo'}
          >
            {starred ? '★' : '☆'}
            <span>{starred ? 'Starred' : 'Star'}</span>
          </button>
          
          <button
            className={styles.controlButton}
            onClick={handleDownload}
            disabled={isDownloading}
            aria-label="Download photo"
          >
            {isDownloading ? '⏳' : '↓'}
            <span>{isDownloading ? 'Downloading...' : 'Download'}</span>
          </button>
        </div>

        {/* Thumbnail strip */}
        {photos.length > 1 && (
          <div className={styles.thumbnails} onClick={(e) => e.stopPropagation()}>
            <div className={styles.thumbnailContainer}>
              {photos.map((photo, index) => (
                <button
                  key={photo.id}
                  className={`${styles.thumbnail} ${
                    index === currentIndex ? styles.activeThumbnail : ''
                  }`}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Go to photo ${index + 1}`}
                >
                  <img
                    src={`/api/photos/${photo.id}`}
                    alt={`Thumbnail ${index + 1}`}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}