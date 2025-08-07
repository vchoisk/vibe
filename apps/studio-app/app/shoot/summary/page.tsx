'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/Button';
import { Card, CardBody } from '@/components/Card';
import { Toast } from '@/components/Toast';
import { PageLayout } from '@/components/PageLayout';
import { JoinPhoneModal } from '@/components/JoinPhoneModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { api } from '@/lib/api/client';
import { Shoot, ShootSummary } from '@snapstudio/types';
import styles from './page.module.css';

function ShootSummaryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const shootId = searchParams.get('id');
  
  const [shoot, setShoot] = useState<Shoot | null>(null);
  const [summary, setSummary] = useState<ShootSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSessionIndex, setSelectedSessionIndex] = useState(0);
  const [starringPhoto, setStarringPhoto] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    if (shootId) {
      loadShootSummary();
    } else {
      router.push('/');
    }
  }, [shootId, router]);

  const loadShootSummary = async () => {
    try {
      const [shootResponse, sessionsResponse] = await Promise.all([
        api.shoots.get(shootId!),
        fetch(`/api/shoots/${shootId}/sessions`).then(r => r.json())
      ]);
      
      setShoot(shootResponse.shoot);
      
      // Create summary from the shoot and session data
      const allPhotos = sessionsResponse.sessions.flatMap((s: any) => s.photos || []);
      
      setSummary({
        shootId: shootResponse.shoot.id,
        totalSessions: shootResponse.shoot.sessions.length,
        totalPhotos: shootResponse.shoot.totalPhotos,
        totalStarredPhotos: shootResponse.shoot.totalStarredPhotos,
        allPhotos,
        sessionDetails: sessionsResponse.sessions,
        duration: {
          scheduled: shootResponse.shoot.durationMinutes,
          actual: shootResponse.shoot.activatedAt 
            ? Math.floor((new Date(shootResponse.shoot.completedAt).getTime() - new Date(shootResponse.shoot.activatedAt).getTime()) / 60000)
            : 0,
        },
      });
    } catch (err) {
      console.error('Failed to load shoot summary:', err);
      setError('Failed to load shoot summary');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackHome = () => {
    router.push('/');
  };

  const handleStarPhoto = async (photoId: string, sessionId: string, currentlyStarred: boolean) => {
    if (starringPhoto) return; // Prevent multiple simultaneous requests
    
    setStarringPhoto(photoId);
    try {
      // Call the star API
      await api.photos.star(photoId, !currentlyStarred, sessionId);
      
      // Update local state - modify the summary
      setSummary(prevSummary => {
        if (!prevSummary) return prevSummary;
        
        const updatedSessionDetails = prevSummary.sessionDetails.map(session => {
          // Check if this photo belongs to this session
          const photoInSession = session.photos.find((p: any) => p.id === photoId);
          if (photoInSession) {
            const updatedStarredPhotos = currentlyStarred
              ? session.starredPhotos.filter((id: string) => id !== photoId)
              : [...session.starredPhotos, photoId];
            
            return {
              ...session,
              starredPhotos: updatedStarredPhotos
            };
          }
          return session;
        });

        // Update total starred photos count
        const newTotalStarred = currentlyStarred 
          ? prevSummary.totalStarredPhotos - 1 
          : prevSummary.totalStarredPhotos + 1;

        return {
          ...prevSummary,
          sessionDetails: updatedSessionDetails,
          totalStarredPhotos: newTotalStarred
        };
      });

      // Update shoot state as well
      setShoot(prevShoot => {
        if (!prevShoot) return prevShoot;
        
        const newStarredCount = currentlyStarred 
          ? prevShoot.totalStarredPhotos - 1 
          : prevShoot.totalStarredPhotos + 1;
        
        return {
          ...prevShoot,
          totalStarredPhotos: newStarredCount
        };
      });

      setToast({
        message: currentlyStarred ? t.common.photoUnstarred : t.common.photoStarred,
        type: 'success'
      });
    } catch (error) {
      console.error('Failed to star photo:', error);
      setToast({
        message: t.errors.failedToStarPhoto,
        type: 'error'
      });
    } finally {
      setStarringPhoto(null);
    }
  };

  if (isLoading) {
    return (
      <main className={styles.main}>
        <div className={styles.loading}>Loading shoot summary...</div>
      </main>
    );
  }

  if (error || !shoot) {
    return (
      <main className={styles.main}>
        <div className={styles.error}>
          {error || 'Shoot not found'}
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
          <div className={styles.titleSection}>
            <div>
              <h1 className={styles.title}>Shoot Complete</h1>
              <p className={styles.subtitle}>{shoot.name} • {shoot.clientName}</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="medium"
              onClick={() => setShowJoinModal(true)}
            >
              {t.shoot.joinWithPhone || 'Join with my cellphone'}
            </Button>
          </div>
        </div>

        <div className={styles.stats}>
          <Card>
            <CardBody>
              <div className={styles.statGrid}>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Total Sessions</span>
                  <span className={styles.statValue}>{shoot.sessions.length}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Total Photos</span>
                  <span className={styles.statValue}>{shoot.totalPhotos}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Starred Photos</span>
                  <span className={styles.statValue}>{shoot.totalStarredPhotos}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Duration</span>
                  <span className={styles.statValue}>
                    {summary?.duration.actual || shoot.durationMinutes} min
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
                {currentSession.photos.map((photo) => {
                  const isStarred = currentSession.starredPhotos.includes(photo.id);
                  return (
                    <div
                      key={photo.id}
                      className={`${styles.photoCard} ${isStarred ? styles.starred : ''}`}
                    >
                      <div className={styles.photoWrapper}>
                        <img
                          src={`/api/photos/${photo.id}`}
                          alt={`Photo ${photo.id}`}
                          className={styles.photo}
                        />
                        <button
                          className={styles.starButton}
                          onClick={() => handleStarPhoto(photo.id, currentSession.id, isStarred)}
                          disabled={starringPhoto === photo.id}
                          aria-label={isStarred ? t.review.unstarPhoto : t.review.starPhoto}
                        >
                          {isStarred ? '★' : '☆'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {shoot.pricePackage && (
          <Card className={styles.invoice}>
            <CardBody>
              <h3>Invoice Summary</h3>
              <div className={styles.invoiceRow}>
                <span>{shoot.pricePackage.name}</span>
                <span>${shoot.pricePackage.price}</span>
              </div>
              {summary && summary.duration.actual > shoot.durationMinutes && (
                <div className={styles.invoiceRow}>
                  <span className={styles.overtime}>
                    Overtime ({summary.duration.actual - shoot.durationMinutes} min)
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
  );
}

export default function ShootSummaryPage() {
  const { t } = useLanguage();
  return (
    <Suspense fallback={<div>{t.common.loading}</div>}>
      <ShootSummaryContent />
    </Suspense>
  );
}