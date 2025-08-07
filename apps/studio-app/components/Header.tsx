'use client';

import { LanguageSelector } from './LanguageSelector';
import styles from './Header.module.css';

interface HeaderProps {
  showBack?: boolean;
  onBack?: () => void;
}

export function Header({ showBack, onBack }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {showBack && onBack && (
          <button className={styles.backButton} onClick={onBack} aria-label="Go back">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
      <div className={styles.right}>
        <LanguageSelector />
      </div>
    </header>
  );
}