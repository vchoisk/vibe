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
  const statusCode = isApiError ? error.status : undefined;
  const endpoint = isApiError ? error.endpoint : undefined;
  const method = isApiError ? error.method : undefined;

  // Get user-friendly title based on error code
  const getErrorTitle = () => {
    if (isApiError && statusCode) {
      switch (statusCode) {
        case 400:
          return 'Bad Request';
        case 401:
          return 'Unauthorized';
        case 403:
          return 'Access Denied';
        case 404:
          return 'Not Found';
        case 409:
          return 'Conflict';
        case 500:
          return 'Server Error';
        case 0:
          return 'Connection Failed';
        default:
          return `Error ${statusCode}`;
      }
    }
    
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
      
      {/* Show API endpoint info if available */}
      {isApiError && endpoint && (
        <div className={styles.errorEndpoint}>
          <code>{method} {endpoint}</code>
          {statusCode !== undefined && <span className={styles.statusCode}>Status: {statusCode}</span>}
        </div>
      )}
      
      {/* Show error code if available */}
      {errorCode && errorCode !== 'UNKNOWN_ERROR' && (
        <div className={styles.errorCode}>
          Error Code: <code>{errorCode}</code>
        </div>
      )}
      
      {/* Show detailed error info in development */}
      {(errorDetails || (isApiError && process.env.NODE_ENV === 'development')) && (
        <details className={styles.errorDetails}>
          <summary>Technical Details</summary>
          <pre>{JSON.stringify({
            code: errorCode,
            status: statusCode,
            endpoint: endpoint ? `${method} ${endpoint}` : undefined,
            timestamp: isApiError ? error.timestamp : new Date().toISOString(),
            details: errorDetails,
            ...(process.env.NODE_ENV === 'development' && {
              stack: error.stack?.split('\n').slice(0, 5).join('\n')
            })
          }, null, 2)}</pre>
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