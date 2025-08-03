'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Card, CardBody } from '@/components/Card';
import { PhotoPreview } from '@/components/PhotoPreview';
import { ErrorMessage } from '@/components/ErrorMessage';
import { api, ApiClientError } from '@/lib/api/client';
import { useSocket } from '@/lib/hooks/useSocket';
import { PhotoSession, Photo } from '@snapstudio/types';
import styles from './page.module.css';

export default function ActiveSessionPage() {
  const router = useRouter();
  const { on, off, isConnected } = useSocket();
  const [session, setSession] = useState<PhotoSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number>(-1);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    loadSession();

    // Set up WebSocket listeners
    on('new-photo', (photo: Photo) => {
      console.log('New photo received:', photo);
      setPhotos((prev) => [...prev, photo]);
    });

    on('session-updated', (updatedSession: PhotoSession) => {
      console.log('Session updated:', updatedSession);
      setSession(updatedSession);
      setPhotos(updatedSession.photos || []);
      
      // Auto-redirect to review when session is in review status
      if (updatedSession.status === 'review') {
        router.push('/session/review');
      }
    });

    return () => {
      off('new-photo');
      off('session-updated');
    };
  }, [on, off, router]);

  const loadSession = async () => {
    try {
      setError(null);
      const response = await api.sessions.current();
      
      if (!response.session) {
        console.log('No active session found, redirecting to home');
        router.push('/');
        return;
      }
      
      console.log('Loaded session:', response.session.id);
      setSession(response.session);
      setPhotos(response.session.photos || []);
    } catch (err) {
      console.error('Failed to load session:', err);
      setError(err as Error);
      
      // Only redirect to home if it's a 404 (no session)
      if (err instanceof ApiClientError && err.code === 'NO_ACTIVE_SESSION') {
        setTimeout(() => router.push('/'), 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };


  const handleSkipToReview = async () => {
    try {
      setError(null);
      console.log('Updating session status to review...');
      await api.sessions.updateStatus('review');
      console.log('Session updated, navigating to review page');
      router.push('/session/review');
    } catch (err) {
      console.error('Failed to update session:', err);
      setError(err as Error);
      
      // If no session found, redirect to home
      if (err instanceof ApiClientError && err.code === 'NOT_FOUND') {
        alert('Session has been lost. Returning to home page.');
        router.push('/');
      }
    }
  };

  const handleCancel = async () => {
    if (confirm('Are you sure you want to cancel this session? All photos will be lost.')) {
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
    try {
      setError(null);
      console.log('Creating test photo...');
      
      const response = await api.test.createPhoto();
      console.log('Test photo created:', response);
      
      // The photo will be detected by the file watcher and added via WebSocket
    } catch (err) {
      console.error('Failed to add test photo:', err);
      setError(err as Error);
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

  if (isLoading) {
    return (
      <main className={styles.main}>
        <div className={styles.loading}>Loading session...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <ErrorMessage 
            error={error} 
            onRetry={loadSession}
          />
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <ErrorMessage 
            error={new Error('No active session. Redirecting to home...')} 
          />
        </div>
      </main>
    );
  }

  const photoCount = photos.length;
  const photosRemaining = session.maxPhotos - photoCount;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>{session.poseName} Session</h1>
          <p className={styles.subtitle}>Take your photos in the camera</p>
        </div>

        <Card className={styles.progressCard}>
          <CardBody>
            <div className={styles.progressInfo}>
              <h2 className={styles.progressTitle}>
                Photo {photoCount + 1} of {session.maxPhotos}
              </h2>
              <p className={styles.progressText}>
                {photosRemaining > 0
                  ? `${photosRemaining} photos remaining`
                  : 'Session complete!'}
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
              <h3>Instructions:</h3>
              <ol>
                <li>Position yourself according to the pose guide</li>
                <li>Use the camera timer or remote</li>
                <li>Take your photo when ready</li>
                <li>Photos will appear here automatically</li>
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
              Continue to Review ({photoCount} photos)
            </Button>
          )}
          <Button
            variant="ghost"
            size="medium"
            onClick={handleCancel}
          >
            Cancel Session
          </Button>
          {/* Test button for development */}
          {process.env.NODE_ENV === 'development' && (
            <Button
              variant="secondary"
              size="medium"
              onClick={handleAddTestPhoto}
              disabled={photoCount >= session.maxPhotos}
            >
              Add Test Photo
            </Button>
          )}
        </div>

        <div className={styles.waitingMessage}>
          <p>Waiting for photos from camera...</p>
          <div className={styles.spinner} />
          {!isConnected && (
            <p className={styles.connectionWarning}>
              ⚠️ Connection lost. Reconnecting...
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
    </main>
  );
}