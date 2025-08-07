'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Card, CardBody } from '@/components/Card';
import { Toast } from '@/components/Toast';
import { api } from '@/lib/api/client';
import { useSession } from '@/contexts/SessionContext';
import { useEvent } from '@/contexts/EventContext';
import { Photo, PhotoSession } from '@snapstudio/types';
import styles from './page.module.css';

export default function ReviewPage() {
  const router = useRouter();
  const { session, isLoading: sessionLoading, updateSessionStatus } = useSession();
  const { event } = useEvent();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [starredPhotos, setStarredPhotos] = useState<Set<string>>(new Set());
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (session) {
      if (session.status === 'active') {
        // Redirect to active page if session is not in review
        router.push('/session/active');
        return;
      }
      // Use photos from session object instead of making API call
      setPhotos(session.photos || []);
      setStarredPhotos(new Set(session.starredPhotos || []));
      setIsLoadingPhotos(false);
    } else if (!sessionLoading) {
      // No session, redirect to home
      router.push('/');
    }
  }, [session, sessionLoading, router]);

  const handleStarPhoto = async (photo: Photo) => {
    const isStarred = starredPhotos.has(photo.id);
    const newStarred = !isStarred;

    // Optimistic update
    const newStarredSet = new Set(starredPhotos);
    if (newStarred) {
      newStarredSet.add(photo.id);
    } else {
      newStarredSet.delete(photo.id);
    }
    setStarredPhotos(newStarredSet);

    try {
      await api.photos.star(photo.id, newStarred);
    } catch (error) {
      console.error('Failed to star photo:', error);
      // Revert on error
      if (newStarred) {
        newStarredSet.delete(photo.id);
      } else {
        newStarredSet.add(photo.id);
      }
      setStarredPhotos(newStarredSet);
    }
  };

  const handleStarAll = async () => {
    const newStarredSet = new Set(photos.map((p) => p.id));
    setStarredPhotos(newStarredSet);
    
    // Update all photos
    try {
      await Promise.all(photos.map((photo) => 
        api.photos.star(photo.id, true)
      ));
    } catch (error) {
      console.error('Failed to star all photos:', error);
    }
  };

  const handleClearAll = async () => {
    setStarredPhotos(new Set());
    
    // Update all photos
    try {
      await Promise.all(photos.map((photo) => 
        api.photos.star(photo.id, false)
      ));
    } catch (error) {
      console.error('Failed to clear all stars:', error);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    
    // Store event info before completing session
    const hasActiveEvent = event && event.status === 'active';
    
    try {
      const response = await api.sessions.complete();
      
      // Show success message
      const starredCount = response.starredCount || 0;
      const message = starredCount > 0
        ? `Session complete! ${starredCount} photo${starredCount === 1 ? '' : 's'} saved to your output folder.`
        : 'Session complete! No photos were saved.';
      
      setToast({ message, type: 'success' });
      
      // Navigate directly to event page if there's an active event
      if (hasActiveEvent) {
        // Navigate immediately without delay for better UX
        router.push('/event/active');
      } else {
        // Only delay for home navigation
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to complete session:', error);
      setToast({ message: 'Failed to complete session. Please try again.', type: 'error' });
      setIsCompleting(false);
    }
  };

  const handleBackToPhotos = async () => {
    if (isReturning) return; // Prevent multiple clicks
    
    setIsReturning(true);
    try {
      // Update session status back to 'active' before navigating
      await updateSessionStatus('active');
      router.push('/session/active');
    } catch (error) {
      console.error('Failed to update session status:', error);
      setIsReturning(false);
    }
  };

  if (sessionLoading || isLoadingPhotos || !session) {
    return (
      <main className={styles.main}>
        <div className={styles.loading}>Loading photos...</div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Review Your Photos</h1>
          <p className={styles.subtitle}>
            Star your favorite photos to save them
          </p>
          <div className={styles.stats}>
            {starredPhotos.size} of {photos.length} photos starred
          </div>
        </div>

        <div className={styles.actions}>
          <Button variant="secondary" size="small" onClick={handleStarAll}>
            Star All
          </Button>
          <Button variant="ghost" size="small" onClick={handleClearAll}>
            Clear All
          </Button>
        </div>

        <div className={styles.photoGrid}>
          {photos.map((photo) => (
            <div
              key={photo.id}
              className={`${styles.photoCard} ${
                starredPhotos.has(photo.id) ? styles.starred : ''
              }`}
            >
              <div className={styles.photoWrapper}>
                <img
                  src={`/api/photos/${photo.id}`}
                  alt={`Photo ${photos.indexOf(photo) + 1}`}
                  className={styles.photo}
                />
                <button
                  className={styles.starButton}
                  onClick={() => handleStarPhoto(photo)}
                  aria-label={
                    starredPhotos.has(photo.id) ? 'Unstar photo' : 'Star photo'
                  }
                >
                  {starredPhotos.has(photo.id) ? '★' : '☆'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <Card>
            <CardBody>
              <div className={styles.footerContent}>
                <div className={styles.footerInfo}>
                  <h3>Ready to finish?</h3>
                  <p>
                    {starredPhotos.size > 0
                      ? `Your ${starredPhotos.size} starred photo${
                          starredPhotos.size === 1 ? '' : 's'
                        } will be saved to your output folder.`
                      : 'No photos selected. Star some photos to save them.'}
                  </p>
                </div>
                <div className={styles.footerActions}>
                  <Button
                    variant="ghost"
                    size="medium"
                    onClick={handleBackToPhotos}
                    loading={isReturning}
                    disabled={isReturning}
                  >
                    Take More Photos
                  </Button>
                  <Button
                    variant="primary"
                    size="large"
                    onClick={handleComplete}
                    loading={isCompleting}
                    disabled={starredPhotos.size === 0}
                  >
                    Complete Session
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </main>
  );
}