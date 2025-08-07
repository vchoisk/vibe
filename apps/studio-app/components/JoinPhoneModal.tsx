'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/Button';
import { useLanguage } from '@/contexts/LanguageContext';
import styles from './JoinPhoneModal.module.css';

interface JoinPhoneModalProps {
  shootId: string;
  onClose: () => void;
}

export function JoinPhoneModal({ shootId, onClose }: JoinPhoneModalProps) {
  const { t } = useLanguage();
  const [sessionQrCodeUrl, setSessionQrCodeUrl] = useState<string>('');
  const [sessionUrl, setSessionUrl] = useState<string>('');
  const [networkUrl, setNetworkUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [showNetworkTip, setShowNetworkTip] = useState(false);

  useEffect(() => {
    const generateSessionQR = async () => {
      // Get the current URL components
      const protocol = window.location.protocol;
      const currentHostname = window.location.hostname;
      const port = window.location.port ? `:${window.location.port}` : '';
      
      let primaryUrl = `${protocol}//${currentHostname}${port}/session/join/${shootId}`;
      let networkIpUrl = '';
      
      // Check if we're on localhost and try to get network IP
      if (currentHostname === 'localhost' || currentHostname === '127.0.0.1') {
        setShowNetworkTip(true);
        
        try {
          // Fetch the server's network IP
          const response = await fetch('/api/network-info');
          const data = await response.json();
          
          if (data.networkIP && data.networkIP !== 'localhost') {
            networkIpUrl = `${protocol}//${data.networkIP}${port}/session/join/${shootId}`;
            // Use network IP as primary URL for QR code when on localhost
            primaryUrl = networkIpUrl;
          }
        } catch (err) {
          console.error('Failed to get network info:', err);
        }
      }
      
      setSessionUrl(primaryUrl);
      setNetworkUrl(networkIpUrl);
      
      try {
        const qrUrl = await QRCode.toDataURL(primaryUrl, {
          width: 250,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        setSessionQrCodeUrl(qrUrl);
      } catch (err) {
        console.error('Failed to generate session QR code:', err);
      }
    };

    if (shootId) {
      generateSessionQR();
    }
  }, [shootId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(sessionUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Join Photo Session</h2>
          <button
            className={styles.modalClose}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className={styles.modalBody}>
          <p className={styles.modalDescription}>
            Scan the QR code or visit the URL to join the photo session from your phone.
          </p>
          
          <div className={styles.sessionSection}>
            <div className={styles.qrContainer}>
              {sessionQrCodeUrl && (
                <img 
                  src={sessionQrCodeUrl} 
                  alt="Session QR Code" 
                  className={styles.qrCode}
                />
              )}
              <p className={styles.qrInstruction}>
                Scan to join session
              </p>
            </div>

            <div className={styles.sessionInfo}>
              <div className={styles.sessionField}>
                <label>Session URL:</label>
                <div className={styles.urlContainer}>
                  <code className={styles.url}>{sessionUrl}</code>
                  <button
                    className={styles.copyButton}
                    onClick={handleCopy}
                    title="Copy URL"
                  >
                    {copied ? '✓' : '📋'}
                  </button>
                </div>
              </div>
              <div className={styles.sessionField}>
                <label>Session ID:</label>
                <strong>{shootId}</strong>
              </div>
            </div>
          </div>

          {showNetworkTip && networkUrl && (
            <div className={styles.networkTip}>
              <p>
                <strong>✅ Network Access:</strong> The QR code and URL above use your 
                computer's network IP address. Make sure your phone is connected to the 
                same WiFi network to access this session.
              </p>
              {window.location.hostname === 'localhost' && (
                <p className={styles.tipNote}>
                  Tip: Access this app from <code>{networkUrl.split('/session')[0]}</code> 
                  on your computer for better network sharing.
                </p>
              )}
            </div>
          )}
          
          {showNetworkTip && !networkUrl && (
            <div className={styles.networkTip}>
              <p>
                <strong>⚠️ Network Access Required:</strong> Could not detect network IP. 
                To access from your phone, open this app using your computer's network IP 
                address (e.g., http://192.168.1.100:3000) instead of localhost.
              </p>
            </div>
          )}
          
          <div className={styles.modalNote}>
            <p>
              <strong>Note:</strong> Once you open this link on your phone, 
              you'll be able to upload photos directly to this session.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}