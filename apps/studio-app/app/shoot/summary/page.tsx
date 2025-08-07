'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/Button';
import { Card, CardBody } from '@/components/Card';
import { api } from '@/lib/api/client';
import { Shoot, ShootSummary } from '@snapstudio/types';
import styles from './page.module.css';

function ShootSummaryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shootId = searchParams.get('id');
  
  const [shoot, setShoot] = useState<Shoot | null>(null);
  const [summary, setSummary] = useState<ShootSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSessionIndex, setSelectedSessionIndex] = useState(0);

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
          <h1 className={styles.title}>Shoot Complete</h1>
          <p className={styles.subtitle}>{shoot.name} • {shoot.clientName}</p>
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
    </main>
  );
}

export default function ShootSummaryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShootSummaryContent />
    </Suspense>
  );
}