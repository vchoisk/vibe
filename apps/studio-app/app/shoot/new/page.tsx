'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Card, CardBody } from '@/components/Card';
import { useShoot } from '@/contexts/ShootContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { PageLayout } from '@/components/PageLayout';
import styles from './page.module.css';

const DURATION_OPTIONS = [
  { value: 30, labelKey: 'minutes', count: 30, price: 50 },
  { value: 60, labelKey: 'hour', count: 1, price: 90 },
  { value: 90, labelKey: 'hours', count: 1.5, price: 130 },
  { value: 120, labelKey: 'hours', count: 2, price: 160 },
  { value: 180, labelKey: 'hours', count: 3, price: 220 },
];

export default function NewShootPage() {
  const router = useRouter();
  const { createShoot, startShoot } = useShoot();
  const { t } = useLanguage();
  const [clientName, setClientName] = useState('');
  const [shootName, setShootName] = useState('');
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPackage = DURATION_OPTIONS.find(opt => opt.value === duration);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setError(t.errors.required);
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const shoot = await createShoot({
        name: shootName || `${clientName}'s ${t.shoot.newShoot}`,
        clientName,
        durationMinutes: duration,
        notes: notes.trim() || undefined,
        pricePackage: selectedPackage ? {
          name: `${selectedPackage.count} ${selectedPackage.labelKey === 'minutes' ? t.shoot.minutes : selectedPackage.labelKey === 'hour' ? t.shoot.hour : t.shoot.hours}`,
          durationMinutes: selectedPackage.value,
          price: selectedPackage.price,
        } : undefined,
      });

      // Auto-start the shoot
      await startShoot(shoot.id);
      
      // Navigate to active shoot page
      router.push('/shoot/active');
    } catch (err) {
      console.error('Failed to create shoot:', err);
      setError(err instanceof Error ? err.message : 'Failed to create shoot');
      setIsCreating(false);
    }
  };

  return (
    <PageLayout showBack backPath="/">
      <main className={styles.main}>
        <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t.shoot.newShoot}</h1>
          <p className={styles.subtitle}>
            {t.shoot.createShootSubtitle}
          </p>
        </div>

        <Card>
          <CardBody>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="clientName" className={styles.label}>
                  {t.shoot.clientName} <span className={styles.required}>*</span>
                </label>
                <input
                  id="clientName"
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className={styles.input}
                  placeholder={t.shoot.clientName}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="shootName" className={styles.label}>
                  {t.shoot.shootName}
                </label>
                <input
                  id="shootName"
                  type="text"
                  value={shootName}
                  onChange={(e) => setShootName(e.target.value)}
                  className={styles.input}
                  placeholder={t.shoot.shootName}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="duration" className={styles.label}>
                  {t.shoot.duration}
                </label>
                <select
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className={styles.select}
                >
                  {DURATION_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.count} {option.labelKey === 'minutes' ? t.shoot.minutes : option.labelKey === 'hour' ? t.shoot.hour : t.shoot.hours} - ${option.price}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="notes" className={styles.label}>
                  {t.shoot.notes}
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={styles.textarea}
                  placeholder={t.shoot.notes}
                  rows={3}
                />
              </div>

              {error && (
                <div className={styles.error}>
                  {error}
                </div>
              )}

              <div className={styles.actions}>
                <Button
                  type="button"
                  variant="ghost"
                  size="medium"
                  onClick={() => router.push('/')}
                  disabled={isCreating}
                >
                  {t.common.cancel}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  loading={isCreating}
                  disabled={isCreating}
                >
                  {t.common.start}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
      </main>
    </PageLayout>
  );
}