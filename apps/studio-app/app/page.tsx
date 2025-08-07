'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Card, CardBody } from '@/components/Card';
import { api } from '@/lib/api/client';
import { useSession } from '@/contexts/SessionContext';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const { session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [studioName, setStudioName] = useState('SnapStudio');

  useEffect(() => {
    // Load config only (session is handled by context)
    api.config.get().then((configRes) => {
      if (configRes?.config) {
        setStudioName(configRes.config.studioName);
      }
    });
  }, []);

  const handleStartSession = async () => {
    setIsLoading(true);
    try {
      if (session) {
        // Resume existing session based on status
        if (session.status === 'active') {
          router.push('/session/active');
        } else if (session.status === 'review') {
          router.push('/session/review');
        }
      } else {
        // Start new session
        router.push('/session/pose-select');
      }
    } catch (error) {
      console.error('Failed to start session:', error);
      setIsLoading(false);
    }
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <Card className={styles.welcomeCard}>
          <CardBody>
            <h1 className={styles.title}>Welcome to {studioName}</h1>
            <p className={styles.subtitle}>
              Professional self-service photo studio
            </p>
            
            <div className={styles.actions}>
              <Button
                size="large"
                fullWidth
                onClick={handleStartSession}
                loading={isLoading}
              >
                {session ? 'Resume Session' : 'Start New Session'}
              </Button>
              
              <Button
                variant="ghost"
                size="medium"
                fullWidth
                onClick={handleSettings}
              >
                Studio Settings
              </Button>
            </div>

            <div className={styles.instructions}>
              <h3>How it works:</h3>
              <ol>
                <li>Choose your pose style</li>
                <li>Take up to 9 photos</li>
                <li>Review and star your favorites</li>
                <li>Get your photos organized instantly</li>
              </ol>
            </div>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}