'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Card, CardBody } from '@/components/Card';
import { api } from '@/lib/api/client';
import { useSession } from '@/contexts/SessionContext';
import { Pose } from '@snapstudio/types';
import styles from './page.module.css';

export default function PoseSelectPage() {
  const router = useRouter();
  const { session, isLoading: sessionLoading } = useSession();
  const [poses, setPoses] = useState<Pose[]>([]);
  const [categories, setCategories] = useState<Array<{ name: string; count: number }>>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPose, setSelectedPose] = useState<Pose | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Check for existing session
  useEffect(() => {
    if (!sessionLoading && session) {
      // If there's an active session, redirect to appropriate page
      if (session.status === 'active') {
        router.push('/session/active');
      } else if (session.status === 'review') {
        router.push('/session/review');
      }
    }
  }, [session, sessionLoading, router]);

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
      const response = await api.sessions.create(selectedPose.id);
      console.log('Session created:', response);
      
      // Small delay to ensure WebSocket updates are received
      await new Promise(resolve => setTimeout(resolve, 100));
      
      router.push('/session/active');
    } catch (error) {
      console.error('Failed to create session:', error);
      alert('Failed to create session. Please try again.');
      setIsCreating(false);
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  const filteredPoses = selectedCategory === 'all' 
    ? poses 
    : poses.filter(p => p.category === selectedCategory);

  // Don't render until we've checked for existing sessions
  if (sessionLoading) {
    return (
      <main className={styles.main}>
        <div className={styles.loading}>Loading...</div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Button variant="ghost" size="small" onClick={handleBack}>
            ← Back
          </Button>
          <h1 className={styles.title}>Choose Your Pose Style</h1>
          <p className={styles.subtitle}>
            Select a pose to start your 9-photo session
          </p>
        </div>

        <div className={styles.categories}>
          <Button
            variant={selectedCategory === 'all' ? 'primary' : 'ghost'}
            size="small"
            onClick={() => setSelectedCategory('all')}
          >
            All Poses
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
          <div className={styles.loading}>Loading poses...</div>
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

        {selectedPose && (
          <div className={styles.selectedInfo}>
            <Card>
              <CardBody>
                <h3>Selected: {selectedPose.name}</h3>
                <p>{selectedPose.description}</p>
                <div className={styles.instructions}>
                  <h4>Instructions:</h4>
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
                  Start Session with {selectedPose.name}
                </Button>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}