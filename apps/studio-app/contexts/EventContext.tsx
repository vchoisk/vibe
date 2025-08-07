'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Event } from '@snapstudio/types';
import { api } from '@/lib/api/client';
import { io, Socket } from 'socket.io-client';

interface EventContextType {
  event: Event | null;
  remainingMinutes: number;
  isLoading: boolean;
  error: string | null;
  createEvent: (data: {
    name: string;
    clientName: string;
    durationMinutes: number;
    notes?: string;
    pricePackage?: {
      name: string;
      durationMinutes: number;
      price: number;
    };
  }) => Promise<Event>;
  startEvent: (eventId: string) => Promise<Event>;
  completeEvent: (eventId: string, onComplete?: () => void) => Promise<any>;
  refreshCurrentEvent: () => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [event, setEvent] = useState<Event | null>(null);
  const [remainingMinutes, setRemainingMinutes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  const refreshCurrentEvent = useCallback(async () => {
    try {
      const response = await api.events.current();
      if (response.event) {
        // Convert date strings to Date objects
        const event = {
          ...response.event,
          startTime: new Date(response.event.startTime),
          endTime: new Date(response.event.endTime),
          createdAt: new Date(response.event.createdAt),
          activatedAt: response.event.activatedAt ? new Date(response.event.activatedAt) : undefined,
          completedAt: response.event.completedAt ? new Date(response.event.completedAt) : undefined,
        };
        setEvent(event);
        setRemainingMinutes(response.remainingMinutes);
      } else {
        setEvent(null);
        setRemainingMinutes(0);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to fetch current event:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch event');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCurrentEvent();
  }, [refreshCurrentEvent]);

  useEffect(() => {
    const socketInstance = io();
    setSocket(socketInstance);

    socketInstance.on('event-started', (updatedEvent: Event) => {
      console.log('Event started:', updatedEvent);
      setEvent(updatedEvent);
      refreshCurrentEvent();
    });

    socketInstance.on('event-updated', (updatedEvent: Event) => {
      console.log('Event updated:', updatedEvent);
      setEvent(updatedEvent);
    });

    socketInstance.on('event-completed', (summary: any) => {
      console.log('Event completed:', summary);
      setEvent(null);
      setRemainingMinutes(0);
    });

    socketInstance.on('event-overtime', (overtimeEvent: Event) => {
      console.log('Event overtime:', overtimeEvent);
      // Could show a notification here
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [refreshCurrentEvent]);

  // Update remaining time every minute
  useEffect(() => {
    if (!event || event.status !== 'active') return;

    const timer = setInterval(() => {
      const now = new Date();
      const endTime = new Date(event.endTime);
      const remaining = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 60000));
      setRemainingMinutes(remaining);
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [event]);

  const createEvent = async (data: {
    name: string;
    clientName: string;
    durationMinutes: number;
    notes?: string;
    pricePackage?: {
      name: string;
      durationMinutes: number;
      price: number;
    };
  }) => {
    try {
      const response = await api.events.create(data);
      setEvent(response.event);
      return response.event;
    } catch (err) {
      console.error('Failed to create event:', err);
      throw err;
    }
  };

  const startEvent = async (eventId: string) => {
    try {
      const response = await api.events.start(eventId);
      setEvent(response.event);
      await refreshCurrentEvent();
      return response.event;
    } catch (err) {
      console.error('Failed to start event:', err);
      throw err;
    }
  };

  const completeEvent = async (eventId: string, onComplete?: () => void) => {
    try {
      const response = await api.events.complete(eventId);
      
      // Execute navigation callback before clearing event
      if (onComplete) {
        onComplete();
      }
      
      setEvent(null);
      setRemainingMinutes(0);
      return response.summary;
    } catch (err) {
      console.error('Failed to complete event:', err);
      throw err;
    }
  };

  return (
    <EventContext.Provider
      value={{
        event,
        remainingMinutes,
        isLoading,
        error,
        createEvent,
        startEvent,
        completeEvent,
        refreshCurrentEvent,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvent() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
}