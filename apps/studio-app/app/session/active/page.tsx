'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Card, CardBody } from '@/components/Card';
import { PageLayout } from '@/components/PageLayout';
import { PhotoPreview } from '@/components/PhotoPreview';
import { ErrorMessage } from '@/components/ErrorMessage';
import DebugSidebar from '@/components/DebugSidebar';
import { api, ApiClientError } from '@/lib/api/client';
import { useSocket } from '@/lib/hooks/useSocket';
import { useSession } from '@/contexts/SessionContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { PhotoSession, Photo } from '@snapstudio/types';
import styles from './page.module.css';

export default function ActiveSessionPage() {
  const router = useRouter();
  const { on, off, isConnected } = useSocket();
  const { session, isLoading: sessionLoading, error: sessionError, updateSessionStatus } = useSession();
  const { t } = useLanguage();
  const [error, setError] = useState<Error | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number>(-1);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const [isTakingFakePhoto, setIsTakingFakePhoto] = useState(false);

  useEffect(() => {
    // Check session status and redirect if needed
    if (session) {
      if (session.status === 'review') {
        console.log('Session is in review status, redirecting...');
        router.push('/session/review');
        return;
      }
      // Initialize photos from session
      setPhotos(session.photos || []);
    } else if (!sessionLoading) {
      console.log('No active session, redirecting to home');
      router.push('/');
    }
  }, [session, sessionLoading, router]);

  useEffect(() => {
    // Set up WebSocket listeners for photos only
    const handleNewPhoto = (photo: Photo) => {
      console.log('New photo received:', photo);
      setPhotos((prev) => [...prev, photo]);
    };

    on('new-photo', handleNewPhoto);

    return () => {
      off('new-photo', handleNewPhoto);
    };
  }, [on, off]);

  // Combine errors
  const displayError = error || sessionError;


  const handleSkipToReview = async () => {
    try {
      setError(null);
      console.log('Updating session status to review...');
      await updateSessionStatus('review');
      console.log('Session updated, navigating to review page');
      router.push('/session/review');
    } catch (err) {
      console.error('Failed to update session:', err);
      setError(err as Error);
    }
  };

  const handleCancel = async () => {
    if (confirm(t.session.cancelConfirm)) {
      try {
        setError(null);
        await api.sessions.complete();
        router.push('/');
      } catch (err) {
        console.error('Failed to cancel session:', err);
        setError(err as Error);
      }
    }
  };

  const handleAddTestPhoto = async () => {
    if (isTakingFakePhoto) return; // Prevent multiple simultaneous requests
    
    try {
      setError(null);
      setIsTakingFakePhoto(true);
      console.log('Creating test photo...');
      
      const response = await api.test.createPhoto();
      console.log('Test photo created:', response);
      
      // The photo will be detected by the file watcher and added via WebSocket
    } catch (err) {
      console.error('Failed to add test photo:', err);
      setError(err as Error);
    } finally {
      setIsTakingFakePhoto(false);
    }
  };

  const handlePhotoClick = (index: number) => {
    if (photos[index]) {
      setPreviewIndex(index);
      setIsPreviewOpen(true);
    }
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewIndex(-1);
  };

  const handleNavigatePreview = (index: number) => {
    setPreviewIndex(index);
  };

  if (sessionLoading) {
    return (
      <PageLayout>
        <main className={styles.main}>
          <div className={styles.loading}>{t.common.loading}</div>
        </main>
      </PageLayout>
    );
  }

  if (displayError) {
    return (
      <PageLayout showBack>
        <main className={styles.main}>
          <div className={styles.container}>
            <ErrorMessage 
              error={displayError} 
              onRetry={() => window.location.reload()}
            />
          </div>
        </main>
      </PageLayout>
    );
  }

  if (!session) {
    return (
      <PageLayout showBack>
        <main className={styles.main}>
          <div className={styles.container}>
            <ErrorMessage 
              error={new Error(t.errors.noActiveSession)} 
            />
          </div>
        </main>
      </PageLayout>
    );
  }

  const photoCount = photos.length;
  const photosRemaining = session.maxPhotos - photoCount;

  return (
    <PageLayout showBack>
      <main className={styles.main}>
      {/* Debug button - only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <button 
          className={styles.debugToggle}
          onClick={() => setIsDebugOpen(true)}
          aria-label="Open debug tools"
        >
          Debug
        </button>
      )}

      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>{session.poseName} {t.session.title}</h1>
          <p className={styles.subtitle}>{t.session.takePhotos}</p>
        </div>

        <Card className={styles.progressCard}>
          <CardBody>
            <div className={styles.progressInfo}>
              <h2 className={styles.progressTitle}>
                {t.session.photoProgress.replace('{current}', String(photoCount + 1)).replace('{total}', String(session.maxPhotos))}
              </h2>
              <p className={styles.progressText}>
                {photosRemaining > 0
                  ? t.session.photosRemaining.replace('{count}', String(photosRemaining))
                  : t.session.sessionComplete}
              </p>
            </div>

            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${(photoCount / session.maxPhotos) * 100}%` }}
              />
            </div>

            <div className={styles.photoGrid}>
              {Array.from({ length: session.maxPhotos }).map((_, index) => {
                const photo = photos[index];
                return (
                  <div
                    key={index}
                    className={styles.photoSlot}
                    onClick={() => handlePhotoClick(index)}
                  >
                    {photo ? (
                      <img
                        src={`/api/photos/${photo.id}`}
                        alt={`Photo ${index + 1}`}
                        className={styles.photoThumbnail}
                      />
                    ) : (
                      <div className={styles.emptySlot}>
                        <span className={styles.slotNumber}>{index + 1}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        <div className={styles.instructions}>
          <Card>
            <CardBody>
              <h3>{t.session.instructions}:</h3>
              <ol>
                {t.session.instructionsList.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
            </CardBody>
          </Card>
        </div>

        <div className={styles.actions}>
          {photoCount > 0 && (
            <Button
              variant="primary"
              size="large"
              onClick={handleSkipToReview}
            >
              {t.session.continueToReview} ({photoCount} {t.session.photos})
            </Button>
          )}
          <Button
            variant="ghost"
            size="medium"
            onClick={handleCancel}
          >
            {t.session.cancelSession}
          </Button>
        </div>

        <div className={styles.waitingMessage}>
          <p>{t.session.waitingForPhotos}</p>
          <div className={styles.spinner} />
          {!isConnected && (
            <p className={styles.connectionWarning}>
              ⚠️ {t.session.connectionLost}
            </p>
          )}
        </div>
      </div>

      {/* Fullscreen Photo Preview */}
      <PhotoPreview
        photos={photos}
        currentIndex={previewIndex}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        onNavigate={handleNavigatePreview}
      />

      {/* Debug Sidebar */}
      <DebugSidebar
        isOpen={isDebugOpen}
        onClose={() => setIsDebugOpen(false)}
        onTakeFakePhoto={photoCount < session.maxPhotos ? handleAddTestPhoto : undefined}
        isTakingPhoto={isTakingFakePhoto}
      />
      </main>
    </PageLayout>
  );
}