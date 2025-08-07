'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/Button';
import { Card, CardBody } from '@/components/Card';
import { api } from '@/lib/api/client';
import { Event, EventSummary } from '@snapstudio/types';
import styles from './page.module.css';

export default function EventSummaryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('id');
  
  const [event, setEvent] = useState<Event | null>(null);
  const [summary, setSummary] = useState<EventSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSessionIndex, setSelectedSessionIndex] = useState(0);

  useEffect(() => {
    if (eventId) {
      loadEventSummary();
    } else {
      router.push('/');
    }
  }, [eventId, router]);

  const loadEventSummary = async () => {
    try {
      const [eventResponse, sessionsResponse] = await Promise.all([
        api.events.get(eventId!),
        fetch(`/api/events/${eventId}/sessions`).then(r => r.json())
      ]);
      
      setEvent(eventResponse.event);
      
      // Create summary from the event and session data
      const allPhotos = sessionsResponse.sessions.flatMap((s: any) => s.photos || []);
      
      setSummary({
        eventId: eventResponse.event.id,
        totalSessions: eventResponse.event.sessions.length,
        totalPhotos: eventResponse.event.totalPhotos,
        totalStarredPhotos: eventResponse.event.totalStarredPhotos,
        allPhotos,
        sessionDetails: sessionsResponse.sessions,
        duration: {
          scheduled: eventResponse.event.durationMinutes,
          actual: eventResponse.event.activatedAt 
            ? Math.floor((new Date(eventResponse.event.completedAt).getTime() - new Date(eventResponse.event.activatedAt).getTime()) / 60000)
            : 0,
        },
      });
    } catch (err) {
      console.error('Failed to load event summary:', err);
      setError('Failed to load event summary');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackHome = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <main className={styles.main}>
        <div className={styles.loading}>Loading event summary...</div>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className={styles.main}>
        <div className={styles.error}>
          {error || 'Event not found'}
          <Button onClick={handleBackHome}>Back to Home</Button>
        </div>
      </main>
    );
  }

  const currentSession = summary?.sessionDetails[selectedSessionIndex];

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Event Complete</h1>
          <p className={styles.subtitle}>{event.name} • {event.clientName}</p>
        </div>

        <div className={styles.stats}>
          <Card>
            <CardBody>
              <div className={styles.statGrid}>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Total Sessions</span>
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
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Duration</span>
                  <span className={styles.statValue}>
                    {summary?.duration.actual || event.durationMinutes} min
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {summary && summary.sessionDetails.length > 0 && (
          <>
            <div className={styles.sessionTabs}>
              {summary.sessionDetails.map((session, index) => (
                <Button
                  key={session.id}
                  variant={selectedSessionIndex === index ? 'primary' : 'ghost'}
                  size="small"
                  onClick={() => setSelectedSessionIndex(index)}
                >
                  Session {index + 1} ({session.photos.length} photos)
                </Button>
              ))}
            </div>

            {currentSession && (
              <div className={styles.photoGrid}>
                {currentSession.photos.map((photo) => (
                  <div
                    key={photo.id}
                    className={`${styles.photoCard} ${
                      currentSession.starredPhotos.includes(photo.id) ? styles.starred : ''
                    }`}
                  >
                    <div className={styles.photoWrapper}>
                      <img
                        src={`/api/photos/${photo.id}`}
                        alt={`Photo ${photo.id}`}
                        className={styles.photo}
                      />
                      {currentSession.starredPhotos.includes(photo.id) && (
                        <div className={styles.starBadge}>★</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {event.pricePackage && (
          <Card className={styles.invoice}>
            <CardBody>
              <h3>Invoice Summary</h3>
              <div className={styles.invoiceRow}>
                <span>{event.pricePackage.name}</span>
                <span>${event.pricePackage.price}</span>
              </div>
              {summary && summary.duration.actual > event.durationMinutes && (
                <div className={styles.invoiceRow}>
                  <span className={styles.overtime}>
                    Overtime ({summary.duration.actual - event.durationMinutes} min)
                  </span>
                  <span className={styles.overtime}>Additional charges may apply</span>
                </div>
              )}
            </CardBody>
          </Card>
        )}

        <div className={styles.actions}>
          <Button
            variant="primary"
            size="large"
            onClick={handleBackHome}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </main>
  );
}