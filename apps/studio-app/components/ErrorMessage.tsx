import { ApiClientError } from '@/lib/api/client';
import styles from './ErrorMessage.module.css';

interface ErrorMessageProps {
  error: Error | ApiClientError | null;
  onRetry?: () => void;
}

export function ErrorMessage({ error, onRetry }: ErrorMessageProps) {
  if (!error) return null;

  const isApiError = error instanceof ApiClientError;
  const errorCode = isApiError ? error.code : 'UNKNOWN_ERROR';
  const errorDetails = isApiError ? error.details : undefined;

  // Get user-friendly title based on error code
  const getErrorTitle = () => {
    switch (errorCode) {
      case 'NO_ACTIVE_SESSION':
        return 'No Active Session';
      case 'SESSION_FULL':
        return 'Session Full';
      case 'NOT_FOUND':
        return 'Not Found';
      case 'NETWORK_ERROR':
        return 'Connection Error';
      case 'PERMISSION_DENIED':
        return 'Permission Denied';
      default:
        return 'Something went wrong';
    }
  };

  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorIcon}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      
      <h3 className={styles.errorTitle}>{getErrorTitle()}</h3>
      <p className={styles.errorMessage}>{error.message}</p>
      
      {errorDetails && process.env.NODE_ENV === 'development' && (
        <details className={styles.errorDetails}>
          <summary>Technical Details</summary>
          <pre>{JSON.stringify(errorDetails, null, 2)}</pre>
        </details>
      )}
      
      {onRetry && (
        <button 
          className={styles.retryButton}
          onClick={onRetry}
        >
          Try Again
        </button>
      )}
    </div>
  );
}