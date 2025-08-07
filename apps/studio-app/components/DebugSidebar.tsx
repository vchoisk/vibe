'use client';

import { useState } from 'react';
import styles from './DebugSidebar.module.css';

interface DebugSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onTakeFakePhoto?: () => void;
  isTakingPhoto?: boolean;
}

export default function DebugSidebar({ isOpen, onClose, onTakeFakePhoto, isTakingPhoto = false }: DebugSidebarProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className={styles.backdrop} 
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>Debug Tools</h2>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close debug sidebar"
          >
            ×
          </button>
        </div>
        
        <div className={styles.content}>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Photo Testing</h3>
            {onTakeFakePhoto && (
              <button 
                className={`${styles.debugButton} ${isTakingPhoto ? styles.loading : ''}`}
                onClick={onTakeFakePhoto}
                disabled={isTakingPhoto}
              >
                {isTakingPhoto ? (
                  <>
                    <span className={styles.spinner}></span>
                    Adding Photo...
                  </>
                ) : (
                  'Take Fake Photo'
                )}
              </button>
            )}
          </section>
          
          {/* Add more debug sections here as needed */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Session Info</h3>
            <p className={styles.info}>More debug features coming soon...</p>
          </section>
        </div>
      </div>
    </>
  );
}