'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Card, CardBody } from '@/components/Card';
import { api } from '@/lib/api/client';
import { useSocket } from '@/lib/hooks/useSocket';
import { PhotoSession, Photo } from '@snapstudio/types';
import styles from './page.module.css';

export default function ActiveSessionPage() {
  const router = useRouter();
  const { on, off, isConnected } = useSocket();
  const [session, setSession] = useState<PhotoSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [photoCount, setPhotoCount] = useState(0);

  useEffect(() => {
    loadSession();

    // Set up WebSocket listeners
    on('new-photo', (photo: Photo) => {
      console.log('New photo received:', photo);
      setPhotoCount((prev) => prev + 1);
    });

    on('session-updated', (updatedSession: PhotoSession) => {
      console.log('Session updated:', updatedSession);
      setSession(updatedSession);
      setPhotoCount(updatedSession.photoCount);
      
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
      const response = await api.sessions.current();
      if (!response.session) {
        router.push('/');
        return;
      }
      setSession(response.session);
      setPhotoCount(response.session.photoCount);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load session:', error);
      router.push('/');
    }
  };


  const handleSkipToReview = async () => {
    try {
      await api.sessions.updateStatus('review');
      router.push('/session/review');
    } catch (error) {
      console.error('Failed to update session:', error);
    }
  };

  const handleCancel = async () => {
    if (confirm('Are you sure you want to cancel this session? All photos will be lost.')) {
      try {
        await api.sessions.complete();
        router.push('/');
      } catch (error) {
        console.error('Failed to cancel session:', error);
      }
    }
  };

  if (isLoading || !session) {
    return (
      <main className={styles.main}>
        <div className={styles.loading}>Loading session...</div>
      </main>
    );
  }

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

            <div className={styles.photoCounter}>
              {Array.from({ length: session.maxPhotos }).map((_, index) => (
                <div
                  key={index}
                  className={`${styles.photoSlot} ${
                    index < photoCount ? styles.filled : ''
                  }`}
                >
                  {index + 1}
                </div>
              ))}
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
    </main>
  );
}