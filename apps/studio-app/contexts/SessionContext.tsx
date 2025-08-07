'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PhotoSession } from '@snapstudio/types';
import { api } from '@/lib/api/client';
import { useSocket } from '@/lib/hooks/useSocket';

interface SessionContextType {
  session: PhotoSession | null;
  isLoading: boolean;
  error: Error | null;
  refreshSession: () => Promise<void>;
  updateSessionStatus: (status: PhotoSession['status']) => Promise<void>;
  clearSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { on, off, isConnected } = useSocket();
  const [session, setSession] = useState<PhotoSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // Load session only once on mount
  const loadSession = useCallback(async () => {
    if (hasInitialLoad) return; // Prevent multiple initial loads
    
    try {
      setError(null);
      setIsLoading(true);
      console.log('[SessionContext] Loading initial session...');
      
      const response = await api.sessions.current();
      
      if (response.session) {
        console.log('[SessionContext] Initial session loaded:', response.session.id);
        setSession(response.session);
      } else {
        console.log('[SessionContext] No active session');
        setSession(null);
      }
      
      setHasInitialLoad(true);
    } catch (err) {
      console.error('[SessionContext] Failed to load session:', err);
      setError(err as Error);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, [hasInitialLoad]);

  // Manual refresh function (rarely needed)
  const refreshSession = useCallback(async () => {
    try {
      setError(null);
      console.log('[SessionContext] Manual refresh requested');
      
      const response = await api.sessions.current();
      
      if (response.session) {
        setSession(response.session);
      } else {
        setSession(null);
      }
    } catch (err) {
      console.error('[SessionContext] Failed to refresh session:', err);
      setError(err as Error);
    }
  }, []);

  // Update session status
  const updateSessionStatus = useCallback(async (status: PhotoSession['status']) => {
    try {
      setError(null);
      await api.sessions.updateStatus(status);
      // The WebSocket will emit session-updated event
    } catch (err) {
      console.error('[SessionContext] Failed to update session status:', err);
      setError(err as Error);
      throw err;
    }
  }, []);

  // Clear session state
  const clearSession = useCallback(() => {
    console.log('[SessionContext] Clearing session state');
    setSession(null);
    setError(null);
    setHasInitialLoad(false);
  }, []);

  // Set up WebSocket listeners
  useEffect(() => {
    // Listen for session creation via WebSocket
    const handleSessionCreated = (newSession: PhotoSession) => {
      console.log('[SessionContext] Session created via WebSocket:', newSession.id);
      setSession(newSession);
      setError(null);
      setIsLoading(false);
    };

    // Listen for session updates via WebSocket
    const handleSessionUpdate = (updatedSession: PhotoSession) => {
      console.log('[SessionContext] Session updated via WebSocket:', updatedSession.id, updatedSession.status);
      setSession(updatedSession);
      setError(null);
    };

    const handleSessionCompleted = ({ sessionId }: { sessionId: string }) => {
      console.log('[SessionContext] Session completed:', sessionId);
      setSession(null);
      setError(null);
      // Reset the initial load flag to allow checking for new sessions
      setHasInitialLoad(false);
    };

    on('session-created', handleSessionCreated);
    on('session-updated', handleSessionUpdate);
    on('session-completed', handleSessionCompleted);

    return () => {
      off('session-created', handleSessionCreated);
      off('session-updated', handleSessionUpdate);
      off('session-completed', handleSessionCompleted);
    };
  }, [on, off]);

  // Load session on mount only
  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // Handle connection state
  useEffect(() => {
    if (isConnected && !hasInitialLoad) {
      console.log('[SessionContext] WebSocket connected, loading session...');
      loadSession();
    }
  }, [isConnected, hasInitialLoad, loadSession]);

  const value: SessionContextType = {
    session,
    isLoading,
    error,
    refreshSession,
    updateSessionStatus,
    clearSession,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}