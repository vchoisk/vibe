'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Card, CardBody } from '@/components/Card';
import { api } from '@/lib/api/client';
import { useSession } from '@/contexts/SessionContext';
import { useEvent } from '@/contexts/EventContext';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const { session } = useSession();
  const { event } = useEvent();
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
      } else if (event && event.status === 'active') {
        // If there's an active event, redirect to event page to start session
        router.push('/event/active');
      } else {
        // No active event - sessions can only be started from events
        alert('Please start an event first to begin photo sessions.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to start session:', error);
      setIsLoading(false);
    }
  };

  const handleStartEvent = () => {
    if (event && event.status === 'active') {
      router.push('/event/active');
    } else {
      router.push('/event/new');
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
            
            {event && event.status === 'active' ? (
              <div className={styles.eventBanner}>
                <h3>Event in Progress</h3>
                <p>{event.name} • {event.clientName}</p>
                <Button
                  size="medium"
                  variant="secondary"
                  onClick={() => router.push('/event/active')}
                >
                  View Event Details
                </Button>
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
                  Resume Session
                </Button>
              ) : null}
              
              <Button
                variant="primary"
                size="large"
                fullWidth
                onClick={handleStartEvent}
              >
                {event && event.status === 'active' ? 'Manage Event' : 'Start Timed Event'}
              </Button>
              
              {!event || event.status !== 'active' ? (
                <p className={styles.hint}>
                  Start an event to begin taking photo sessions
                </p>
              ) : null}
              
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
                <li>Start a timed event (30min - 3hr)</li>
                <li>Take unlimited 9-photo sessions</li>
                <li>Each session: choose pose, capture photos, review & star favorites</li>
                <li>See all photos from all sessions when event ends</li>
              </ol>
              
              <h3>Perfect for:</h3>
              <ul>
                <li>Professional photo shoots</li>
                <li>Multiple outfit changes</li>
                <li>Group sessions</li>
                <li>Extended creative sessions</li>
              </ul>
            </div>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}