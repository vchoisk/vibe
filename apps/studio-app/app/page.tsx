'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Card, CardBody } from '@/components/Card';
import { api } from '@/lib/api/client';
import { useSession } from '@/contexts/SessionContext';
import { useShoot } from '@/contexts/ShootContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { PageLayout } from '@/components/PageLayout';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const { session } = useSession();
  const { shoot } = useShoot();
  const { t } = useLanguage();
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
      } else if (shoot && shoot.status === 'active') {
        // If there's an active shoot, redirect to shoot page to start session
        router.push('/shoot/active');
      } else {
        // No active shoot - sessions can only be started from shoots
        alert(t.errors.noActiveShoot);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to start session:', error);
      setIsLoading(false);
    }
  };

  const handleStartShoot = () => {
    if (shoot && shoot.status === 'active') {
      router.push('/shoot/active');
    } else {
      router.push('/shoot/new');
    }
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  return (
    <PageLayout>
      <div className={styles.main}>
        <div className={styles.container}>
        <Card className={styles.welcomeCard}>
          <CardBody>
            <h1 className={styles.title}>{t.home.welcome}</h1>
            <p className={styles.subtitle}>
              {t.home.subtitle}
            </p>
            
            {shoot && shoot.status === 'active' ? (
              <div className={styles.shootBanner}>
                <h3>{t.home.shootInProgress}</h3>
                <p>{shoot.name} • {shoot.clientName}</p>
              </div>
            ) : null}
            
            <div className={styles.actions}>
              {session ? (
                <Button
                  size="large"
                  fullWidth
                  onClick={handleStartSession}
                  loading={isLoading}
                >
                  {t.home.resumeSession}
                </Button>
              ) : null}
              
              <Button
                variant="primary"
                size="large"
                fullWidth
                onClick={handleStartShoot}
              >
                {shoot && shoot.status === 'active' ? t.home.manageShoot : t.home.startShoot}
              </Button>
              
              {!shoot || shoot.status !== 'active' ? (
                <p className={styles.hint}>
                  {t.home.startShootHint}
                </p>
              ) : null}
              
              <Button
                variant="ghost"
                size="medium"
                fullWidth
                onClick={handleSettings}
              >
                {t.home.studioSettings}
              </Button>
            </div>

            <div className={styles.instructions}>
              <h3>{t.home.howItWorks}</h3>
              <ol>
                {t.home.howItWorksSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
              
              <h3>{t.home.perfectFor}</h3>
              <ul>
                {t.home.perfectForItems.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </CardBody>
        </Card>
      </div>
      </div>
    </PageLayout>
  );
}