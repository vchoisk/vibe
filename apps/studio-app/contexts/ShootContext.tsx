'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Shoot } from '@snapstudio/types';
import { api } from '@/lib/api/client';
import { io, Socket } from 'socket.io-client';

interface ShootContextType {
  shoot: Shoot | null;
  remainingMinutes: number;
  isLoading: boolean;
  error: string | null;
  createShoot: (data: {
    name: string;
    clientName: string;
    durationMinutes: number;
    notes?: string;
    pricePackage?: {
      name: string;
      durationMinutes: number;
      price: number;
    };
  }) => Promise<Shoot>;
  startShoot: (shootId: string) => Promise<Shoot>;
  completeShoot: (shootId: string, onComplete?: () => void) => Promise<any>;
  refreshCurrentShoot: () => Promise<void>;
}

const ShootContext = createContext<ShootContextType | undefined>(undefined);

export function ShootProvider({ children }: { children: React.ReactNode }) {
  const [shoot, setShoot] = useState<Shoot | null>(null);
  const [remainingMinutes, setRemainingMinutes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  const refreshCurrentShoot = useCallback(async () => {
    try {
      const response = await api.shoots.current();
      if (response.shoot) {
        // Convert date strings to Date objects
        const shoot = {
          ...response.shoot,
          startTime: new Date(response.shoot.startTime),
          endTime: new Date(response.shoot.endTime),
          createdAt: new Date(response.shoot.createdAt),
          activatedAt: response.shoot.activatedAt ? new Date(response.shoot.activatedAt) : undefined,
          completedAt: response.shoot.completedAt ? new Date(response.shoot.completedAt) : undefined,
        };
        setShoot(shoot);
        setRemainingMinutes(response.remainingMinutes);
      } else {
        setShoot(null);
        setRemainingMinutes(0);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to fetch current shoot:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch shoot');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCurrentShoot();
  }, [refreshCurrentShoot]);

  useEffect(() => {
    const socketInstance = io();
    setSocket(socketInstance);

    socketInstance.on('shoot-started', (updatedShoot: Shoot) => {
      console.log('Shoot started:', updatedShoot);
      setShoot(updatedShoot);
      refreshCurrentShoot();
    });

    socketInstance.on('shoot-updated', (updatedShoot: Shoot) => {
      console.log('Shoot updated:', updatedShoot);
      setShoot(updatedShoot);
      refreshCurrentShoot();
    });

    socketInstance.on('shoot-completed', () => {
      console.log('Shoot completed');
      setShoot(null);
      setRemainingMinutes(0);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [refreshCurrentShoot]);

  // Update remaining time every minute
  useEffect(() => {
    if (!shoot || shoot.status !== 'active') return;

    const updateRemainingTime = () => {
      const now = new Date();
      const endTime = new Date(shoot.endTime);
      const remaining = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 60000));
      setRemainingMinutes(remaining);
    };

    updateRemainingTime();
    const interval = setInterval(updateRemainingTime, 60000);

    return () => clearInterval(interval);
  }, [shoot]);

  const createShoot = async (data: Parameters<ShootContextType['createShoot']>[0]) => {
    try {
      const response = await api.shoots.create(data);
      setShoot(response.shoot);
      return response.shoot;
    } catch (err) {
      console.error('Failed to create shoot:', err);
      throw err;
    }
  };

  const startShoot = async (shootId: string) => {
    try {
      const response = await api.shoots.start(shootId);
      setShoot(response.shoot);
      setRemainingMinutes(response.shoot.durationMinutes);
      return response.shoot;
    } catch (err) {
      console.error('Failed to start shoot:', err);
      throw err;
    }
  };

  const completeShoot = async (shootId: string, onComplete?: () => void) => {
    try {
      const response = await api.shoots.complete(shootId);
      
      // Call the onComplete callback if provided
      if (onComplete) {
        onComplete();
      }
      
      // Clear the shoot state
      setShoot(null);
      setRemainingMinutes(0);
      
      return response.summary;
    } catch (err) {
      console.error('Failed to complete shoot:', err);
      throw err;
    }
  };

  return (
    <ShootContext.Provider
      value={{
        shoot,
        remainingMinutes,
        isLoading,
        error,
        createShoot,
        startShoot,
        completeShoot,
        refreshCurrentShoot,
      }}
    >
      {children}
    </ShootContext.Provider>
  );
}

export function useShoot() {
  const context = useContext(ShootContext);
  if (context === undefined) {
    throw new Error('useShoot must be used within a ShootProvider');
  }
  return context;
}