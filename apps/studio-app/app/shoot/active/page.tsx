'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Card, CardBody } from '@/components/Card';
import { Toast } from '@/components/Toast';
import { useShoot } from '@/contexts/ShootContext';
import { useSession } from '@/contexts/SessionContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { PageLayout } from '@/components/PageLayout';
import { api } from '@/lib/api/client';
import styles from './page.module.css';

export default function ActiveShootPage() {
  const router = useRouter();
  const { shoot, remainingMinutes, completeShoot } = useShoot();
  const { session } = useSession();
  const { t } = useLanguage();
  const [isCompleting, setIsCompleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [shootSessions, setShootSessions] = useState<any[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [photoFilter, setPhotoFilter] = useState<'all' | 'starred'>('all');

  useEffect(() => {
    if (!shoot || shoot.status !== 'active') {
      router.push('/');
    }
  }, [shoot, router]);

  useEffect(() => {
    if (shoot) {
      loadShootSessions();
    }
  }, [shoot]);

  // Reload sessions when session completes
  useEffect(() => {
    if (shoot && !session) {
      loadShootSessions();
    }
  }, [session, shoot]);

  const loadShootSessions = async () => {
    if (!shoot) return;
    
    setIsLoadingSessions(true);
    try {
      const response = await fetch(`/api/shoots/${shoot.id}/sessions`);
      const data = await response.json();
      setShootSessions(data.sessions || []);
    } catch (error) {
      console.error('Failed to load shoot sessions:', error);
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

  const handleCompleteShoot = async () => {
    if (!shoot) return;

    // Check if there's an active session that needs to be completed first
    if (session && session.status === 'active') {
      setToast({
        message: t.shoot.completeSessionFirst,
        type: 'error',
      });
      return;
    }

    setIsCompleting(true);
    
    // Store shoot ID before completing (shoot will be cleared from context)
    const shootId = shoot.id;
    
    try {
      const summary = await completeShoot(shootId, () => {
        // Navigate in the same execution context as clearing the shoot
        router.push(`/shoot/summary?id=${shootId}`);
      });
      
      // Toast will show on the summary page
      console.log(`Shoot completed! ${summary.totalPhotos} photos from ${summary.totalSessions} sessions.`);
    } catch (error) {
      console.error('Failed to complete shoot:', error);
      // Show more detailed error message
      const errorMessage = error instanceof Error ? error.message : t.errors.failedToCompleteShoot;
      setToast({
        message: errorMessage,
        type: 'error',
      });
      setIsCompleting(false);
    }
  };

  if (!shoot) {
    return null;
  }

  const isOvertime = remainingMinutes <= 0;

  return (
    <PageLayout showBack backPath="/">
      <main className={styles.main}>
        <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>{shoot.name}</h1>
          <p className={styles.subtitle}>{t.shoot.client}: {shoot.clientName}</p>
          
          <div className={styles.timer}>
            <div className={`${styles.timeDisplay} ${isOvertime ? styles.overtime : ''}`}>
              {isOvertime ? (
                <>
                  <span className={styles.overtimeLabel}>{t.shoot.overtime}</span>
                  <span className={styles.time}>-{formatTime(Math.abs(remainingMinutes))}</span>
                </>
              ) : (
                <>
                  <span className={styles.timeLabel}>{t.shoot.timeRemaining}</span>
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
                  <span className={styles.statLabel}>{t.shoot.sessionsCount}</span>
                  <span className={styles.statValue}>{shoot.sessions.length}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>{t.shoot.totalPhotos}</span>
                  <span className={styles.statValue}>{shoot.totalPhotos}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>{t.shoot.starredPhotos}</span>
                  <span className={styles.statValue}>{shoot.totalStarredPhotos}</span>
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
                    <h3>{t.shoot.sessionInProgress}</h3>
                    <p>{session.photos.length} / {session.maxPhotos} {t.shoot.photosTaken}</p>
                  </div>
                  <Button
                    variant="primary"
                    size="medium"
                    onClick={handleStartSession}
                  >
                    {t.shoot.continueSession}
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
              {t.shoot.startNewSession}
            </Button>
          )}
        </div>

        {shoot.notes && (
          <Card className={styles.notes}>
            <CardBody>
              <h3 className={styles.notesTitle}>{t.shoot.notes}</h3>
              <p className={styles.notesText}>{shoot.notes}</p>
            </CardBody>
          </Card>
        )}

        <div className={styles.photosSection}>
          <div className={styles.photosSectionHeader}>
            <h2 className={styles.photosSectionTitle}>{t.shoot.shootPhotos}</h2>
            <div className={styles.photoFilters}>
              <Button
                variant={photoFilter === 'all' ? 'primary' : 'ghost'}
                size="small"
                onClick={() => setPhotoFilter('all')}
              >
                {t.shoot.allPhotos}
              </Button>
              <Button
                variant={photoFilter === 'starred' ? 'primary' : 'ghost'}
                size="small"
                onClick={() => setPhotoFilter('starred')}
              >
                ★ {t.shoot.starredOnly}
              </Button>
            </div>
          </div>
          
          {isLoadingSessions ? (
            <div className={styles.loading}>{t.shoot.loadingPhotos}</div>
          ) : shootSessions.length === 0 ? (
            <p className={styles.noPhotos}>{t.shoot.noPhotosYet}</p>
          ) : (
            <div className={styles.sessionsContainer}>
              {shootSessions.map((session, index) => {
                const filteredPhotos = photoFilter === 'starred' 
                  ? session.photos.filter((photo: any) => session.starredPhotos.includes(photo.id))
                  : session.photos;
                
                // Skip sessions with no photos matching the filter
                if (filteredPhotos.length === 0) return null;
                
                return (
                  <div key={session.id} className={styles.sessionSection}>
                    <h3 className={styles.sessionTitle}>
                      {t.shoot.sessionLabel} {index + 1} - {session.poseName} ({filteredPhotos.length} {photoFilter === 'starred' ? t.shoot.starredPhotosLabel.toLowerCase() : t.shoot.photosLabel.toLowerCase()})
                    </h3>
                    <div className={styles.photoGrid}>
                      {filteredPhotos.map((photo: any) => (
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
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <Button
            variant="danger"
            size="medium"
            onClick={handleCompleteShoot}
            loading={isCompleting}
            disabled={isCompleting}
          >
            {t.shoot.completeShoot}
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
    </PageLayout>
  );
}