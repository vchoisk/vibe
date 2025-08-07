'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Card, CardBody } from '@/components/Card';
import { Toast } from '@/components/Toast';
import { useEvent } from '@/contexts/EventContext';
import { useSession } from '@/contexts/SessionContext';
import { api } from '@/lib/api/client';
import styles from './page.module.css';

export default function ActiveEventPage() {
  const router = useRouter();
  const { event, remainingMinutes, completeEvent } = useEvent();
  const { session } = useSession();
  const [isCompleting, setIsCompleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [eventSessions, setEventSessions] = useState<any[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [showPhotos, setShowPhotos] = useState(false);

  useEffect(() => {
    if (!event || event.status !== 'active') {
      router.push('/');
    }
  }, [event, router]);

  useEffect(() => {
    if (event && showPhotos) {
      loadEventSessions();
    }
  }, [event, showPhotos]);

  const loadEventSessions = async () => {
    if (!event) return;
    
    setIsLoadingSessions(true);
    try {
      const response = await fetch(`/api/events/${event.id}/sessions`);
      const data = await response.json();
      setEventSessions(data.sessions || []);
    } catch (error) {
      console.error('Failed to load event sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const handleStartSession = () => {
    if (session && session.status === 'active') {
      router.push('/session/active');
    } else {
      // Go directly to pose selection when starting a new session
      router.push('/session/pose-select');
    }
  };

  const handleCompleteEvent = async () => {
    if (!event) return;

    // Check if there's an active session that needs to be completed first
    if (session && session.status === 'active') {
      setToast({
        message: 'Please complete the current photo session first.',
        type: 'error',
      });
      return;
    }

    setIsCompleting(true);
    try {
      const summary = await completeEvent(event.id);
      
      setToast({
        message: `Event completed! ${summary.totalPhotos} photos from ${summary.totalSessions} sessions.`,
        type: 'success',
      });

      // Navigate to summary page after delay
      setTimeout(() => {
        router.push(`/event/summary?id=${event.id}`);
      }, 2000);
    } catch (error) {
      console.error('Failed to complete event:', error);
      // Show more detailed error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete event';
      setToast({
        message: errorMessage,
        type: 'error',
      });
      setIsCompleting(false);
    }
  };

  if (!event) {
    return null;
  }

  const isOvertime = remainingMinutes <= 0;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>{event.name}</h1>
          <p className={styles.subtitle}>Client: {event.clientName}</p>
          
          <div className={styles.timer}>
            <div className={`${styles.timeDisplay} ${isOvertime ? styles.overtime : ''}`}>
              {isOvertime ? (
                <>
                  <span className={styles.overtimeLabel}>OVERTIME</span>
                  <span className={styles.time}>-{formatTime(Math.abs(remainingMinutes))}</span>
                </>
              ) : (
                <>
                  <span className={styles.timeLabel}>Time Remaining</span>
                  <span className={styles.time}>{formatTime(remainingMinutes)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={styles.stats}>
          <Card>
            <CardBody>
              <div className={styles.statGrid}>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Sessions</span>
                  <span className={styles.statValue}>{event.sessions.length}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Total Photos</span>
                  <span className={styles.statValue}>{event.totalPhotos}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Starred Photos</span>
                  <span className={styles.statValue}>{event.totalStarredPhotos}</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className={styles.actions}>
          {session && session.status === 'active' ? (
            <Card>
              <CardBody>
                <div className={styles.sessionActive}>
                  <div>
                    <h3>Session in Progress</h3>
                    <p>{session.photos.length} / {session.maxPhotos} photos taken</p>
                  </div>
                  <Button
                    variant="primary"
                    size="medium"
                    onClick={handleStartSession}
                  >
                    Continue Session
                  </Button>
                </div>
              </CardBody>
            </Card>
          ) : (
            <Button
              variant="primary"
              size="large"
              onClick={handleStartSession}
              className={styles.startButton}
            >
              Start New Photo Session
            </Button>
          )}
        </div>

        {event.notes && (
          <Card className={styles.notes}>
            <CardBody>
              <h3 className={styles.notesTitle}>Notes</h3>
              <p className={styles.notesText}>{event.notes}</p>
            </CardBody>
          </Card>
        )}

        <div className={styles.photosSection}>
          <Button
            variant="ghost"
            size="medium"
            onClick={() => setShowPhotos(!showPhotos)}
          >
            {showPhotos ? 'Hide' : 'Show'} All Event Photos
          </Button>
          
          {showPhotos && (
            <>
              {isLoadingSessions ? (
                <div className={styles.loading}>Loading photos...</div>
              ) : eventSessions.length === 0 ? (
                <p className={styles.noPhotos}>No photos yet. Start a session to begin!</p>
              ) : (
                <div className={styles.sessionsContainer}>
                  {eventSessions.map((session, index) => (
                    <div key={session.id} className={styles.sessionSection}>
                      <h3 className={styles.sessionTitle}>
                        Session {index + 1} - {session.poseName} ({session.photos.length} photos)
                      </h3>
                      <div className={styles.photoGrid}>
                        {session.photos.map((photo: any) => (
                          <div
                            key={photo.id}
                            className={`${styles.photoCard} ${
                              session.starredPhotos.includes(photo.id) ? styles.starred : ''
                            }`}
                          >
                            <img
                              src={`/api/photos/${photo.id}`}
                              alt={`Photo ${photo.id}`}
                              className={styles.photo}
                            />
                            {session.starredPhotos.includes(photo.id) && (
                              <div className={styles.starBadge}>★</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className={styles.footer}>
          <Button
            variant="destructive"
            size="medium"
            onClick={handleCompleteEvent}
            loading={isCompleting}
            disabled={isCompleting}
          >
            Complete Event
          </Button>
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