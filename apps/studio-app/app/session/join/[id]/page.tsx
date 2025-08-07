'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/Button';
import { Card, CardBody } from '@/components/Card';
import { PageLayout } from '@/components/PageLayout';
import { Toast } from '@/components/Toast';
import { useSocket } from '@/lib/hooks/useSocket';
import { api } from '@/lib/api/client';
import styles from './page.module.css';

interface Photo {
  id: string;
  url: string;
  timestamp: string;
  sessionId: string;
}

interface Session {
  id: string;
  poseName: string;
  status: 'active' | 'review' | 'completed';
  photos: Photo[];
  starredPhotos: string[];
  maxPhotos: number;
}

interface Shoot {
  id: string;
  name: string;
  clientName: string;
  status: 'active' | 'completed';
  currentSessionId?: string;
}

export default function JoinSessionPage() {
  const params = useParams();
  const shootId = params.id as string;
  const { socket, on, off, emit, isConnected } = useSocket();
  
  const [shoot, setShoot] = useState<Shoot | null>(null);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [starredPhotos, setStarredPhotos] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [starringPhoto, setStarringPhoto] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Load initial shoot and session data
  useEffect(() => {
    loadShootData();
  }, [shootId]);

  // Set up WebSocket listeners
  useEffect(() => {
    if (!isConnected) return;

    // Listen for new photos
    const handleNewPhoto = (data: { photo: Photo; sessionId: string }) => {
      console.log('New photo received:', data);
      if (data.sessionId === currentSession?.id || data.sessionId === selectedSessionId) {
        setPhotos(prev => [...prev, data.photo]);
      }
      // Update session photos count
      setSessions(prev => prev.map(session => 
        session.id === data.sessionId 
          ? { ...session, photos: [...session.photos, data.photo] }
          : session
      ));
    };

    // Listen for session status changes
    const handleSessionUpdate = (data: { sessionId: string; status: string; session?: Session }) => {
      console.log('Session update received:', data);
      
      if (data.session) {
        // Update or add session
        setSessions(prev => {
          const exists = prev.find(s => s.id === data.sessionId);
          if (exists) {
            return prev.map(s => s.id === data.sessionId ? data.session! : s);
          } else {
            return [...prev, data.session!];
          }
        });

        // If this is the current session, update it
        if (data.sessionId === currentSession?.id) {
          setCurrentSession(data.session);
          if (data.session.status === 'completed') {
            // Session ended, clear current session
            setCurrentSession(null);
            setPhotos([]);
            setStarredPhotos(new Set());
          }
        }
      }
    };

    // Listen for new session started
    const handleNewSession = (data: { session: Session; shootId: string }) => {
      console.log('New session started:', data);
      if (data.shootId === shootId) {
        setCurrentSession(data.session);
        setSelectedSessionId(data.session.id);
        setPhotos(data.session.photos || []);
        setStarredPhotos(new Set(data.session.starredPhotos || []));
        
        // Add to sessions list
        setSessions(prev => [...prev, data.session]);
      }
    };

    // Listen for shoot status changes
    const handleShootUpdate = (data: { shootId: string; status: string }) => {
      console.log('Shoot update received:', data);
      if (data.shootId === shootId && data.status === 'completed') {
        setShoot(prev => prev ? { ...prev, status: 'completed' } : null);
        setCurrentSession(null);
      }
    };

    // Listen for photo star updates
    const handlePhotoStarred = (data: { photoId: string; starred: boolean; sessionId: string }) => {
      console.log('Photo star update:', data);
      if (data.sessionId === currentSession?.id || data.sessionId === selectedSessionId) {
        setStarredPhotos(prev => {
          const newSet = new Set(prev);
          if (data.starred) {
            newSet.add(data.photoId);
          } else {
            newSet.delete(data.photoId);
          }
          return newSet;
        });
      }
      
      // Update session starred photos
      setSessions(prev => prev.map(session => 
        session.id === data.sessionId 
          ? { 
              ...session, 
              starredPhotos: data.starred 
                ? [...session.starredPhotos, data.photoId]
                : session.starredPhotos.filter(id => id !== data.photoId)
            }
          : session
      ));
    };

    // Join the shoot room (using generic emit since it's not in the typed events)
    if (socket) {
      socket.emit('join-shoot', { shootId });
    }

    // Use the typed events for listening
    on('new-photo', (photo: Photo) => {
      handleNewPhoto({ photo, sessionId: photo.sessionId || '' });
    });
    
    on('photo-starred', handlePhotoStarred as any);
    on('session-updated', (session: PhotoSession) => {
      handleSessionUpdate({ sessionId: session.id, status: session.status, session: session as any });
    });
    on('session-created', (session: PhotoSession) => {
      handleNewSession({ session: session as any, shootId });
    });
    on('session-completed', (data: { sessionId: string }) => {
      handleSessionUpdate({ sessionId: data.sessionId, status: 'completed' });
    });

    // For non-typed events, use socket directly
    if (socket) {
      socket.on('shoot-update', handleShootUpdate);
    }

    return () => {
      off('new-photo');
      off('photo-starred');
      off('session-updated');
      off('session-created');
      off('session-completed');
      
      if (socket) {
        socket.off('shoot-update', handleShootUpdate);
        socket.emit('leave-shoot', { shootId });
      }
    };
  }, [isConnected, shootId, currentSession?.id, selectedSessionId, on, off, socket]);

  const loadShootData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load shoot data
      const shootResponse = await api.shoots.get(shootId);
      setShoot(shootResponse.shoot);

      // Load sessions
      const sessionsResponse = await fetch(`/api/shoots/${shootId}/sessions`);
      const sessionsData = await sessionsResponse.json();
      setSessions(sessionsData.sessions || []);

      // Find active session if any
      const activeSession = sessionsData.sessions.find((s: Session) => 
        s.status === 'active' || s.status === 'review'
      );
      
      if (activeSession) {
        setCurrentSession(activeSession);
        setSelectedSessionId(activeSession.id);
        setPhotos(activeSession.photos || []);
        setStarredPhotos(new Set(activeSession.starredPhotos || []));
      } else if (sessionsData.sessions.length > 0) {
        // Show the most recent session
        const latestSession = sessionsData.sessions[sessionsData.sessions.length - 1];
        setSelectedSessionId(latestSession.id);
        setPhotos(latestSession.photos || []);
        setStarredPhotos(new Set(latestSession.starredPhotos || []));
      }
    } catch (err) {
      console.error('Failed to load shoot data:', err);
      setError('Failed to load session data. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStarPhoto = async (photoId: string, sessionId: string) => {
    if (starringPhoto) return;
    
    const isStarred = starredPhotos.has(photoId);
    const newStarred = !isStarred;
    
    // Optimistic update
    setStarredPhotos(prev => {
      const newSet = new Set(prev);
      if (newStarred) {
        newSet.add(photoId);
      } else {
        newSet.delete(photoId);
      }
      return newSet;
    });

    setStarringPhoto(photoId);
    try {
      await api.photos.star(photoId, newStarred, sessionId);
      
      // Emit to other clients if socket is available
      if (socket) {
        socket.emit('star-photo', { 
          photoId, 
          starred: newStarred, 
          sessionId,
          shootId 
        });
      }
      
      setToast({
        message: newStarred ? 'Photo starred' : 'Photo unstarred',
        type: 'success'
      });
    } catch (error) {
      console.error('Failed to star photo:', error);
      
      // Revert on error
      setStarredPhotos(prev => {
        const newSet = new Set(prev);
        if (newStarred) {
          newSet.delete(photoId);
        } else {
          newSet.add(photoId);
        }
        return newSet;
      });
      
      setToast({
        message: 'Failed to update photo',
        type: 'error'
      });
    } finally {
      setStarringPhoto(null);
    }
  };

  const handleSessionSelect = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setSelectedSessionId(sessionId);
      setPhotos(session.photos || []);
      setStarredPhotos(new Set(session.starredPhotos || []));
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <main className={styles.main}>
          <div className={styles.loading}>Loading session...</div>
        </main>
      </PageLayout>
    );
  }

  if (error || !shoot) {
    return (
      <PageLayout>
        <main className={styles.main}>
          <div className={styles.error}>
            {error || 'Session not found'}
            <Button onClick={loadShootData}>Retry</Button>
          </div>
        </main>
      </PageLayout>
    );
  }

  const selectedSession = sessions.find(s => s.id === selectedSessionId);
  const displayPhotos = selectedSession?.photos || photos;

  return (
    <PageLayout>
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>{shoot.name}</h1>
            <p className={styles.subtitle}>
              Client: {shoot.clientName} • Status: {shoot.status}
            </p>
            {currentSession && (
              <div className={styles.liveIndicator}>
                <span className={styles.liveDot}></span>
                Live Session: {currentSession.poseName}
              </div>
            )}
          </div>

          {/* Session Tabs */}
          {sessions.length > 0 && (
            <div className={styles.sessionTabs}>
              {sessions.map((session, index) => (
                <button
                  key={session.id}
                  className={`${styles.sessionTab} ${
                    selectedSessionId === session.id ? styles.activeTab : ''
                  } ${session.id === currentSession?.id ? styles.liveTab : ''}`}
                  onClick={() => handleSessionSelect(session.id)}
                >
                  <span className={styles.tabLabel}>
                    Session {index + 1}: {session.poseName}
                  </span>
                  <span className={styles.tabCount}>
                    {session.photos.length} photos
                    {session.starredPhotos.length > 0 && (
                      <span className={styles.starCount}>
                        {' '}• {session.starredPhotos.length} ★
                      </span>
                    )}
                  </span>
                  {session.id === currentSession?.id && (
                    <span className={styles.liveLabel}>LIVE</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Photo Grid */}
          <Card>
            <CardBody>
              {displayPhotos.length > 0 ? (
                <>
                  <div className={styles.photoStats}>
                    <h2 className={styles.sectionTitle}>
                      {selectedSession ? selectedSession.poseName : 'Photos'}
                    </h2>
                    <p className={styles.photoCount}>
                      {displayPhotos.length} photos • {starredPhotos.size} starred
                    </p>
                  </div>
                  
                  <div className={styles.photoGrid}>
                    {displayPhotos.map((photo) => {
                      const isStarred = starredPhotos.has(photo.id);
                      return (
                        <div
                          key={photo.id}
                          className={`${styles.photoCard} ${isStarred ? styles.starred : ''}`}
                        >
                          <img
                            src={`/api/photos/${photo.id}`}
                            alt={`Photo ${photo.id}`}
                            className={styles.photo}
                          />
                          <button
                            className={styles.starButton}
                            onClick={() => handleStarPhoto(photo.id, photo.sessionId || selectedSessionId!)}
                            disabled={starringPhoto === photo.id}
                            aria-label={isStarred ? 'Unstar photo' : 'Star photo'}
                          >
                            {isStarred ? '★' : '☆'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📸</div>
                  <h2 className={styles.emptyTitle}>
                    {currentSession 
                      ? 'Waiting for photos...' 
                      : 'No photos yet'}
                  </h2>
                  <p className={styles.emptyMessage}>
                    {currentSession 
                      ? 'Photos will appear here automatically as they are taken.'
                      : 'Start a new session to begin taking photos.'}
                  </p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Connection Status */}
          <div className={styles.connectionStatus}>
            <div className={`${styles.statusIndicator} ${isConnected ? styles.connected : styles.disconnected}`}>
              {isConnected ? '● Connected' : '○ Disconnected'}
            </div>
            {!isConnected && (
              <Button size="small" onClick={loadShootData}>
                Reconnect
              </Button>
            )}
          </div>
        </div>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </main>
    </PageLayout>
  );
}