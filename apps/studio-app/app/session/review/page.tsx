'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Card, CardBody } from '@/components/Card';
import { api } from '@/lib/api/client';
import { Photo, PhotoSession } from '@snapstudio/types';
import styles from './page.module.css';

export default function ReviewPage() {
  const router = useRouter();
  const [session, setSession] = useState<PhotoSession | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [starredPhotos, setStarredPhotos] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    loadSessionAndPhotos();
  }, []);

  const loadSessionAndPhotos = async () => {
    try {
      const [sessionRes, photosRes] = await Promise.all([
        api.sessions.current(),
        api.photos.list(),
      ]);

      if (!sessionRes.session) {
        router.push('/');
        return;
      }

      setSession(sessionRes.session);
      setPhotos(photosRes.photos);
      setStarredPhotos(new Set(sessionRes.session.starredPhotos));
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load session:', error);
      router.push('/');
    }
  };

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

  const handleStarAll = () => {
    const newStarredSet = new Set(photos.map((p) => p.id));
    setStarredPhotos(newStarredSet);
    
    // Update all photos
    photos.forEach((photo) => {
      api.photos.star(photo.id, true).catch(console.error);
    });
  };

  const handleClearAll = () => {
    setStarredPhotos(new Set());
    
    // Update all photos
    photos.forEach((photo) => {
      api.photos.star(photo.id, false).catch(console.error);
    });
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      const response = await api.sessions.complete();
      router.push('/session/complete');
    } catch (error) {
      console.error('Failed to complete session:', error);
      setIsCompleting(false);
    }
  };

  const handleBackToPhotos = () => {
    router.push('/session/active');
  };

  if (isLoading || !session) {
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
                {/* In production, this would show the actual photo */}
                <div className={styles.photoPlaceholder}>
                  Photo {photos.indexOf(photo) + 1}
                </div>
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
    </main>
  );
}