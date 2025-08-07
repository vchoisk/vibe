'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Card, CardBody } from '@/components/Card';
import { useEvent } from '@/contexts/EventContext';
import styles from './page.module.css';

const DURATION_OPTIONS = [
  { value: 30, label: '30 minutes', price: 50 },
  { value: 60, label: '1 hour', price: 90 },
  { value: 90, label: '1.5 hours', price: 130 },
  { value: 120, label: '2 hours', price: 160 },
  { value: 180, label: '3 hours', price: 220 },
];

export default function NewEventPage() {
  const router = useRouter();
  const { createEvent, startEvent } = useEvent();
  const [clientName, setClientName] = useState('');
  const [eventName, setEventName] = useState('');
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPackage = DURATION_OPTIONS.find(opt => opt.value === duration);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setError('Client name is required');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const event = await createEvent({
        name: eventName || `${clientName}'s Session`,
        clientName,
        durationMinutes: duration,
        notes: notes.trim() || undefined,
        pricePackage: selectedPackage ? {
          name: selectedPackage.label,
          durationMinutes: selectedPackage.value,
          price: selectedPackage.price,
        } : undefined,
      });

      // Auto-start the event
      await startEvent(event.id);
      
      // Navigate to active event page
      router.push('/event/active');
    } catch (err) {
      console.error('Failed to create event:', err);
      setError(err instanceof Error ? err.message : 'Failed to create event');
      setIsCreating(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Start New Event</h1>
          <p className={styles.subtitle}>
            Create a timed photo session event for your client
          </p>
        </div>

        <Card>
          <CardBody>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="clientName" className={styles.label}>
                  Client Name <span className={styles.required}>*</span>
                </label>
                <input
                  id="clientName"
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className={styles.input}
                  placeholder="Enter client name"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="eventName" className={styles.label}>
                  Event Name (optional)
                </label>
                <input
                  id="eventName"
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className={styles.input}
                  placeholder="e.g., Birthday Photoshoot"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="duration" className={styles.label}>
                  Duration
                </label>
                <select
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className={styles.select}
                >
                  {DURATION_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label} - ${option.price}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="notes" className={styles.label}>
                  Notes (optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={styles.textarea}
                  placeholder="Any special requests or notes..."
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
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  loading={isCreating}
                  disabled={isCreating}
                >
                  Start Event
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}