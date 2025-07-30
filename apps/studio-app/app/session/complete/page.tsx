'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Card, CardBody } from '@/components/Card';
import styles from './page.module.css';

export default function CompletePage() {
  const router = useRouter();

  const handleNewSession = () => {
    router.push('/');
  };

  const handleViewPhotos = () => {
    // In production, this would open the file explorer to the output directory
    alert('Your photos have been saved to the output directory!');
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <Card className={styles.successCard}>
          <CardBody>
            <div className={styles.successIcon}>✓</div>
            <h1 className={styles.title}>Session Complete!</h1>
            <p className={styles.subtitle}>
              Your starred photos have been saved and organized.
            </p>

            <div className={styles.summary}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Photos Taken</span>
                <span className={styles.summaryValue}>9</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Photos Saved</span>
                <span className={styles.summaryValue}>3</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Session Time</span>
                <span className={styles.summaryValue}>5 minutes</span>
              </div>
            </div>

            <div className={styles.actions}>
              <Button
                variant="primary"
                size="large"
                fullWidth
                onClick={handleViewPhotos}
              >
                View Your Photos
              </Button>
              <Button
                variant="secondary"
                size="large"
                fullWidth
                onClick={handleNewSession}
              >
                Start New Session
              </Button>
            </div>

            <div className={styles.tip}>
              <h3>💡 Tip</h3>
              <p>
                Your photos are organized by session in the output folder.
                Each session has its own folder with the date and pose name.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}