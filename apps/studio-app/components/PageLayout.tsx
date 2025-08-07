'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from './Header';
import styles from './PageLayout.module.css';

interface PageLayoutProps {
  children: ReactNode;
  showBack?: boolean;
  backPath?: string;
}

export function PageLayout({ children, showBack = false, backPath }: PageLayoutProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backPath) {
      router.push(backPath);
    } else {
      router.back();
    }
  };

  return (
    <div className={styles.layout}>
      <Header showBack={showBack} onBack={showBack ? handleBack : undefined} />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}