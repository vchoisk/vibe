'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Card, CardBody } from '@/components/Card';
import { PageLayout } from '@/components/PageLayout';
import { JoinPhoneModal } from '@/components/JoinPhoneModal';
import { api } from '@/lib/api/client';
import { useSession } from '@/contexts/SessionContext';
import { useShoot } from '@/contexts/ShootContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Pose } from '@snapstudio/types';
import styles from './page.module.css';

export default function PoseSelectPage() {
  const router = useRouter();
  const { session, isLoading: sessionLoading } = useSession();
  const { shoot } = useShoot();
  const { t } = useLanguage();
  const [poses, setPoses] = useState<Pose[]>([]);
  const [categories, setCategories] = useState<Array<{ name: string; count: number }>>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPose, setSelectedPose] = useState<Pose | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Check for existing session and active shoot
  useEffect(() => {
    if (!sessionLoading) {
      if (session) {
        // If there's an active session, redirect to appropriate page
        if (session.status === 'active') {
          router.push('/session/active');
        } else if (session.status === 'review') {
          router.push('/session/review');
        }
      } else if (!shoot || shoot.status !== 'active') {
        // No active shoot - redirect to home
        router.push('/');
      }
    }
  }, [session, sessionLoading, shoot, router]);

  useEffect(() => {
    loadPoses();
  }, [selectedCategory]);

  const loadPoses = async () => {
    try {
      const params = selectedCategory !== 'all' ? { category: selectedCategory } : undefined;
      const response = await api.poses.list(params);
      setPoses(response.poses);
      setCategories(response.categories);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load poses:', error);
      setIsLoading(false);
    }
  };

  const handlePoseSelect = (pose: Pose) => {
    setSelectedPose(pose);
  };

  const handleStartSession = async () => {
    if (!selectedPose) return;

    setIsCreating(true);
    try {
      // Pass shootId if we're within an active shoot
      const response = await api.sessions.create(
        selectedPose.id, 
        undefined,
        shoot && shoot.status === 'active' ? shoot.id : undefined
      );
      console.log('Session created:', response);
      
      // Small delay to ensure WebSocket updates are received
      await new Promise(resolve => setTimeout(resolve, 100));
      
      router.push('/session/active');
    } catch (error) {
      console.error('Failed to create session:', error);
      alert(t.errors.failedToCreateSession);
      setIsCreating(false);
    }
  };

  const handleBack = () => {
    // Go back to shoot page if there's an active shoot
    if (shoot && shoot.status === 'active') {
      router.push('/shoot/active');
    } else {
      router.push('/');
    }
  };

  const filteredPoses = selectedCategory === 'all' 
    ? poses 
    : poses.filter(p => p.category === selectedCategory);

  // Don't render until we've checked for existing sessions
  if (sessionLoading) {
    return (
      <PageLayout>
        <main className={styles.main}>
          <div className={styles.loading}>{t.common.loading}</div>
        </main>
      </PageLayout>
    );
  }

  return (
    <PageLayout showBack backPath={shoot && shoot.status === 'active' ? '/shoot/active' : '/'}>
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.titleSection}>
              <div>
                <h1 className={styles.title}>{t.poseSelect.title}</h1>
                <p className={styles.subtitle}>
                  {shoot && shoot.status === 'active' 
                    ? t.poseSelect.subtitleWithClient.replace('{clientName}', shoot.clientName)
                    : t.poseSelect.subtitle}
                </p>
              </div>
              {shoot && shoot.status === 'active' && (
                <Button
                  type="button"
                  variant="secondary"
                  size="medium"
                  onClick={() => setShowJoinModal(true)}
                >
                  {t.shoot.joinWithPhone || 'Join with my cellphone'}
                </Button>
              )}
            </div>
          </div>


          {selectedPose && (
          <div className={styles.selectedInfo}>
            <Card>
              <CardBody>
                <h3>{t.poseSelect.selected}: {selectedPose.name}</h3>
                <p>{selectedPose.description}</p>
                <div className={styles.instructions}>
                  <h4>{t.poseSelect.instructions}:</h4>
                  <ul>
                    {selectedPose.instructions.map((instruction, index) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ul>
                </div>
                <Button
                  size="large"
                  fullWidth
                  onClick={handleStartSession}
                  loading={isCreating}
                >
                  {t.poseSelect.startSession} {selectedPose.name}
                </Button>
              </CardBody>
            </Card>
          </div>
        )}

        <div className={styles.categories}>
          <Button
            variant={selectedCategory === 'all' ? 'primary' : 'ghost'}
            size="small"
            onClick={() => setSelectedCategory('all')}
          >
            {t.poseSelect.allPoses}
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.name}
              variant={selectedCategory === cat.name ? 'primary' : 'ghost'}
              size="small"
              onClick={() => setSelectedCategory(cat.name)}
            >
              {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)} ({cat.count})
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className={styles.loading}>{t.poseSelect.loadingPoses}</div>
        ) : (
          <div className={styles.poseGrid}>
            {filteredPoses.map((pose) => (
              <Card
                key={pose.id}
                className={`${styles.poseCard} ${
                  selectedPose?.id === pose.id ? styles.selected : ''
                }`}
                onClick={() => handlePoseSelect(pose)}
              >
                <div className={styles.poseImage}>
                  <div className={styles.posePlaceholder}>
                    {pose.name}
                  </div>
                </div>
                <CardBody>
                  <h3 className={styles.poseName}>{pose.name}</h3>
                  <p className={styles.poseDescription}>{pose.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

      </div>
      
      {showJoinModal && shoot && (
        <JoinPhoneModal 
          shootId={shoot.id}
          onClose={() => setShowJoinModal(false)}
        />
      )}
      </main>
    </PageLayout>
  );
}