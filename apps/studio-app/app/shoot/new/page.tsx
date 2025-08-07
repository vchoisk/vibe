'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { Button } from '@/components/Button';
import { Card, CardBody } from '@/components/Card';
import { useShoot } from '@/contexts/ShootContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { PageLayout } from '@/components/PageLayout';
import styles from './page.module.css';

// Temporary WiFi credentials for demo
const WIFI_CONFIG = {
  ssid: 'StudioWiFi',
  password: 'studio123',
  security: 'WPA2',
};

export default function NewShootPage() {
  const router = useRouter();
  const { createShoot, startShoot } = useShoot();
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [clientName, setClientName] = useState('');
  const [shootId, setShootId] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wifiQrCodeUrl, setWifiQrCodeUrl] = useState<string>('');

  // Generate WiFi QR code when entering step 2
  useEffect(() => {
    const generateWifiQR = async () => {
      // WiFi QR code format: WIFI:T:WPA;S:ssid;P:password;;
      const wifiString = `WIFI:T:${WIFI_CONFIG.security};S:${WIFI_CONFIG.ssid};P:${WIFI_CONFIG.password};;`;
      try {
        const url = await QRCode.toDataURL(wifiString, {
          width: 250,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        setWifiQrCodeUrl(url);
      } catch (err) {
        console.error('Failed to generate WiFi QR code:', err);
      }
    };

    if (step === 2) {
      generateWifiQR();
    }
  }, [step]);


  const handleContinueToWifi = () => {
    if (!clientName.trim()) {
      setError(t.errors.required);
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleStartSession = async () => {
    setIsCreating(true);
    setError(null);

    try {
      const shoot = await createShoot({
        name: `${clientName}'s ${t.shoot.newShoot}`,
        clientName,
        durationMinutes: 60, // Default to 1 hour
        notes: undefined,
        pricePackage: {
          name: '1 hour',
          durationMinutes: 60,
          price: 90,
        },
      });

      // Auto-start the shoot
      await startShoot(shoot.id);
      setShootId(shoot.id);
      
      // Navigate to active shoot page
      router.push('/shoot/active');
    } catch (err) {
      console.error('Failed to create shoot:', err);
      setError(err instanceof Error ? err.message : 'Failed to create shoot');
      setIsCreating(false);
    }
  };


  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      router.push('/');
    }
  };

  return (
    <PageLayout showBack onBack={handleBack}>
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>{t.shoot.newShoot}</h1>
            <div className={styles.stepIndicator}>
              <div className={`${styles.step} ${step >= 1 ? styles.stepActive : ''}`}>
                <span className={styles.stepNumber}>1</span>
                <span className={styles.stepLabel}>Client Info</span>
              </div>
              <div className={styles.stepLine} />
              <div className={`${styles.step} ${step >= 2 ? styles.stepActive : ''}`}>
                <span className={styles.stepNumber}>2</span>
                <span className={styles.stepLabel}>Connect WiFi</span>
              </div>
            </div>
          </div>

          {step === 1 ? (
            <Card>
              <CardBody>
                <div className={styles.form}>
                  <h2 className={styles.stepTitle}>Enter Client Information</h2>
                  
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
                      placeholder="Enter client's name"
                      required
                      autoFocus
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
                    >
                      {t.common.cancel}
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="large"
                      onClick={handleContinueToWifi}
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ) : step === 2 ? (
            <Card>
              <CardBody>
                <div className={styles.form}>
                  <h2 className={styles.stepTitle}>Connect to Studio WiFi</h2>
                  <p className={styles.stepDescription}>
                    Have the client connect their phone to the studio WiFi network.
                  </p>

                  <div className={styles.wifiSection}>
                    <div className={styles.wifiGrid}>
                      <div className={styles.qrContainer}>
                        {wifiQrCodeUrl && (
                          <img 
                            src={wifiQrCodeUrl} 
                            alt="WiFi QR Code" 
                            className={styles.qrCode}
                          />
                        )}
                        <p className={styles.qrInstruction}>
                          Scan with phone camera
                        </p>
                      </div>

                      <div className={styles.wifiInfo}>
                        <h3 className={styles.wifiTitle}>WiFi Details</h3>
                        <div className={styles.wifiField}>
                          <label>Network Name:</label>
                          <strong>{WIFI_CONFIG.ssid}</strong>
                        </div>
                        <div className={styles.wifiField}>
                          <label>Password:</label>
                          <strong>{WIFI_CONFIG.password}</strong>
                        </div>
                        <div className={styles.wifiField}>
                          <label>Security:</label>
                          <strong>{WIFI_CONFIG.security}</strong>
                        </div>
                      </div>
                    </div>
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
                      onClick={() => setStep(1)}
                      disabled={isCreating}
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="large"
                      loading={isCreating}
                      disabled={isCreating}
                      onClick={handleStartSession}
                    >
                      Start Session
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ) : null}
        </div>
      </main>
    </PageLayout>
  );
}