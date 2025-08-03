'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { Photo } from '@snapstudio/types';
import styles from './PhotoPreview.module.css';

interface PhotoPreviewProps {
  photos: Photo[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function PhotoPreview({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}: PhotoPreviewProps) {
  const currentPhoto = photos[currentIndex];
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in pixels)
  const minSwipeDistance = 50;

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        if (currentIndex > 0) {
          onNavigate(currentIndex - 1);
        }
        break;
      case 'ArrowRight':
        if (currentIndex < photos.length - 1) {
          onNavigate(currentIndex + 1);
        }
        break;
    }
  }, [isOpen, currentIndex, photos.length, onClose, onNavigate]);

  // Touch event handlers
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
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < photos.length - 1) {
      onNavigate(currentIndex + 1);
    }
    if (isRightSwipe && currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  };

  // Mouse wheel navigation
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!isOpen) return;
    
    e.preventDefault();
    
    // Horizontal scroll or shift+scroll
    const delta = e.deltaX || (e.shiftKey ? e.deltaY : 0);
    
    if (delta > 0 && currentIndex < photos.length - 1) {
      onNavigate(currentIndex + 1);
    } else if (delta < 0 && currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  }, [isOpen, currentIndex, photos.length, onNavigate]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    const container = containerRef.current;
    
    if (container && isOpen) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [handleKeyDown, handleWheel, isOpen]);

  // Prevent body scroll when preview is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !currentPhoto) return null;

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < photos.length - 1;

  return (
    <div 
      className={styles.overlay} 
      onClick={onClose}
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className={styles.container}>
        {/* Close button */}
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close preview"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Navigation buttons */}
        {canGoPrev && (
          <button
            className={`${styles.navButton} ${styles.prevButton}`}
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(currentIndex - 1);
            }}
            aria-label="Previous photo"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        {canGoNext && (
          <button
            className={`${styles.navButton} ${styles.nextButton}`}
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(currentIndex + 1);
            }}
            aria-label="Next photo"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 18l6-6-6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        {/* Photo display */}
        <div 
          className={styles.photoContainer}
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={`/api/photos/${currentPhoto.id}`}
            alt={`Photo ${currentIndex + 1}`}
            className={styles.photo}
          />
        </div>

        {/* Photo counter */}
        <div className={styles.counter}>
          {currentIndex + 1} / {photos.length}
        </div>
      </div>
    </div>
  );
}