'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Card, CardBody } from '@/components/Card';
import { Toast } from '@/components/Toast';
import { PageLayout } from '@/components/PageLayout';
import { JoinPhoneModal } from '@/components/JoinPhoneModal';
import { api } from '@/lib/api/client';
import { useSession } from '@/contexts/SessionContext';
import { useShoot } from '@/contexts/ShootContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Photo, PhotoSession } from '@snapstudio/types';
import styles from './page.module.css';

export default function ReviewPage() {
  const router = useRouter();
  const { session, isLoading: sessionLoading, updateSessionStatus } = useSession();
  const { shoot } = useShoot();
  const { t } = useLanguage();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [starredPhotos, setStarredPhotos] = useState<Set<string>>(new Set());
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);

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
      // Store shoot info and determine navigation before completing session
      const hasActiveShoot = shoot && shoot.status === 'active';
      const navigateTo = hasActiveShoot ? '/shoot/active' : '/';
      
      // No session, redirect to home
      router.push(navigateTo);
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
    
    // Store shoot info and determine navigation before completing session
    const hasActiveShoot = shoot && shoot.status === 'active';
    
    try {
      // If navigating to shoot page, do it immediately to avoid redirect race
      if (hasActiveShoot) {
        router.push('/shoot/active');
      }
      
      const response = await api.sessions.complete();
      
      // Show success message
      const starredCount = response.starredCount || 0;
      const message = starredCount > 0
        ? t.review.sessionCompleteWithPhotos.replace('{count}', String(starredCount))
        : t.review.sessionCompleteNoPhotos;
      
      setToast({ message, type: 'success' });
      
      // Only navigate home after delay if not going to shoot
      if (!hasActiveShoot) {
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to complete session:', error);
      setToast({ message: t.errors.failedToCompleteSession, type: 'error' });
      setIsCompleting(false);
      
      // If we navigated to shoot but completion failed, go back
      if (hasActiveShoot) {
        router.push('/session/review');
      }
    }
  };

  const handleBackToPhotos = async () => {
    if (isReturning) return; // Prshoot multiple clicks
    
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
      <PageLayout>
        <main className={styles.main}>
          <div className={styles.loading}>{t.common.loading}</div>
        </main>
      </PageLayout>
    );
  }

  return (
    <PageLayout showBack>
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.titleSection}>
              <div>
                <h1 className={styles.title}>{t.review.title}</h1>
                <p className={styles.subtitle}>
                  {t.review.subtitle}
                </p>
                <div className={styles.stats}>
                  {t.review.starredCount.replace('{starred}', String(starredPhotos.size)).replace('{total}', String(photos.length))}
                </div>
              </div>
              {shoot && (
                <Button
                  type="button"
                  variant="secondary"
                  size="medium"
                  onClick={() => setShowJoinModal(true)}
                >
                  {t.shoot.joinWithPhone || 'Join with my cellphone'}
                </Button>
              )}
            </div>
          </div>

        <div className={styles.actions}>
          <Button variant="secondary" size="small" onClick={handleStarAll}>
            {t.review.starAll}
          </Button>
          <Button variant="ghost" size="small" onClick={handleClearAll}>
            {t.review.clearAll}
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
                    starredPhotos.has(photo.id) ? t.review.unstarPhoto : t.review.starPhoto
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
                  <h3>{t.review.readyToFinish}</h3>
                  <p>
                    {starredPhotos.size > 0
                      ? t.review.photosSavedMessage.replace('{count}', String(starredPhotos.size))
                      : t.review.noPhotosSelected}
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
                    {t.review.takeMorePhotos}
                  </Button>
                  <Button
                    variant="primary"
                    size="large"
                    onClick={handleComplete}
                    loading={isCompleting}
                    disabled={starredPhotos.size === 0}
                  >
                    {t.review.completeSession}
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
      
      {showJoinModal && shoot && (
        <JoinPhoneModal 
          shootId={shoot.id}
          onClose={() => setShowJoinModal(false)}
        />
      )}
      </main>
    </PageLayout>
  );
}