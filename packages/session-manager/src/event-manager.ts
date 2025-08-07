import { Event, EventSummary, PhotoSession } from '@snapstudio/types';
import { readJSON, writeJSON, ensureDir, pathExists } from 'fs-extra';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';

export interface EventManagerConfig {
  dataDirectory: string;
}

export class EventManager extends EventEmitter {
  private config: EventManagerConfig;
  private eventsFile: string;
  private currentEvent: Event | null = null;
  private eventCheckInterval: NodeJS.Timeout | null = null;

  constructor(config: EventManagerConfig) {
    super();
    this.config = config;
    this.eventsFile = join(config.dataDirectory, 'events.json');
    this.initialize();
  }

  private async initialize() {
    await ensureDir(this.config.dataDirectory);
    await this.loadCurrentEvent();
    
    // Check event status every minute
    this.eventCheckInterval = setInterval(() => {
      this.checkEventStatus();
    }, 60000);
  }

  private async loadCurrentEvent() {
    if (await pathExists(this.eventsFile)) {
      const events = await this.getAllEvents();
      // Find active event
      this.currentEvent = events.find(e => e.status === 'active') || null;
    }
  }

  private async saveEvents(events: Event[]) {
    await writeJSON(this.eventsFile, events, { spaces: 2 });
  }

  async getAllEvents(): Promise<Event[]> {
    if (await pathExists(this.eventsFile)) {
      const events = await readJSON(this.eventsFile);
      return events.map((event: any) => this.deserializeEvent(event));
    }
    return [];
  }

  private deserializeEvent(data: any): Event {
    return {
      ...data,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      createdAt: new Date(data.createdAt),
      activatedAt: data.activatedAt ? new Date(data.activatedAt) : undefined,
      completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
    };
  }

  async createEvent(data: {
    name: string;
    clientName: string;
    durationMinutes: number;
    startTime?: Date;
    notes?: string;
    pricePackage?: Event['pricePackage'];
  }): Promise<Event> {
    const events = await this.getAllEvents();
    
    // Check if there's already an active event
    const activeEvent = events.find(e => e.status === 'active');
    if (activeEvent) {
      throw new Error('An event is already active. Please complete it before starting a new one.');
    }

    const now = new Date();
    const startTime = data.startTime || now;
    const endTime = new Date(startTime.getTime() + data.durationMinutes * 60000);

    const event: Event = {
      id: `event-${uuidv4()}`,
      name: data.name,
      clientName: data.clientName,
      startTime,
      endTime,
      durationMinutes: data.durationMinutes,
      status: 'scheduled',
      sessions: [],
      totalPhotos: 0,
      totalStarredPhotos: 0,
      createdAt: now,
      notes: data.notes,
      pricePackage: data.pricePackage,
    };

    events.push(event);
    await this.saveEvents(events);

    // Auto-start if scheduled for now
    if (startTime <= now) {
      return this.startEvent(event.id);
    }

    return event;
  }

  async startEvent(eventId: string): Promise<Event> {
    const events = await this.getAllEvents();
    const event = events.find(e => e.id === eventId);
    
    if (!event) {
      throw new Error('Event not found');
    }

    if (event.status === 'active') {
      return event;
    }

    if (event.status === 'completed' || event.status === 'cancelled') {
      throw new Error('Cannot start a completed or cancelled event');
    }

    // Update event status
    event.status = 'active';
    event.activatedAt = new Date();
    
    // Update end time based on activation time
    event.endTime = new Date(event.activatedAt.getTime() + event.durationMinutes * 60000);

    await this.saveEvents(events);
    // Ensure currentEvent has proper Date objects
    this.currentEvent = this.deserializeEvent(event);
    
    this.emit('event-started', this.currentEvent);
    return this.currentEvent;
  }

  async updateEvent(eventId: string, updates: Partial<Event>): Promise<Event> {
    const events = await this.getAllEvents();
    const eventIndex = events.findIndex(e => e.id === eventId);
    
    if (eventIndex === -1) {
      throw new Error('Event not found');
    }

    events[eventIndex] = { ...events[eventIndex], ...updates };
    await this.saveEvents(events);

    const updatedEvent = this.deserializeEvent(events[eventIndex]);
    
    if (this.currentEvent?.id === eventId) {
      this.currentEvent = updatedEvent;
    }

    this.emit('event-updated', updatedEvent);
    return updatedEvent;
  }

  async addSessionToEvent(eventId: string, sessionId: string): Promise<Event> {
    const events = await this.getAllEvents();
    const event = events.find(e => e.id === eventId);
    
    if (!event) {
      throw new Error('Event not found');
    }

    if (!event.sessions.includes(sessionId)) {
      event.sessions.push(sessionId);
      await this.saveEvents(events);
      
      const updatedEvent = this.deserializeEvent(event);
      
      if (this.currentEvent?.id === eventId) {
        this.currentEvent = updatedEvent;
      }
      
      this.emit('event-updated', updatedEvent);
      return updatedEvent;
    }

    return this.deserializeEvent(event);
  }

  async completeEvent(eventId: string, sessionManager: any): Promise<EventSummary> {
    const events = await this.getAllEvents();
    const event = events.find(e => e.id === eventId);
    
    if (!event) {
      throw new Error('Event not found');
    }

    if (event.status === 'completed') {
      throw new Error('Event is already completed');
    }

    if (event.status !== 'active') {
      throw new Error(`Cannot complete event with status: ${event.status}. Event must be active.`);
    }

    // Debug logging
    console.log('[EventManager] Completing event:', {
      eventId,
      status: event.status,
      activatedAt: event.activatedAt,
      activatedAtType: typeof event.activatedAt,
      activatedAtIsDate: event.activatedAt instanceof Date,
    });

    // Get all sessions for this event
    const sessionDetails: PhotoSession[] = [];
    let totalPhotos = 0;
    let totalStarredPhotos = 0;
    const allPhotos: any[] = [];

    for (const sessionId of event.sessions) {
      const session = await sessionManager.getSession(sessionId);
      if (session) {
        sessionDetails.push(session);
        totalPhotos += session.photos.length;
        totalStarredPhotos += session.starredPhotos.length;
        allPhotos.push(...session.photos);
      }
    }

    // Update event
    event.status = 'completed';
    event.completedAt = new Date();
    event.totalPhotos = totalPhotos;
    event.totalStarredPhotos = totalStarredPhotos;

    await this.saveEvents(events);

    if (this.currentEvent?.id === eventId) {
      this.currentEvent = null;
    }

    // Ensure we have a completedAt date
    if (!event.completedAt) {
      throw new Error('Event completedAt date is missing');
    }
    
    // Ensure dates are Date objects (handle both Date and string)
    const activatedAt = event.activatedAt 
      ? (event.activatedAt instanceof Date ? event.activatedAt : new Date(event.activatedAt))
      : null;
    const completedAt = event.completedAt instanceof Date 
      ? event.completedAt 
      : new Date(event.completedAt);
    
    const summary: EventSummary = {
      eventId: event.id,
      totalSessions: event.sessions.length,
      totalPhotos,
      totalStarredPhotos,
      allPhotos,
      sessionDetails,
      duration: {
        scheduled: event.durationMinutes,
        actual: activatedAt 
          ? Math.floor((completedAt.getTime() - activatedAt.getTime()) / 60000)
          : 0,
      },
    };

    this.emit('event-completed', summary);
    return summary;
  }

  private async checkEventStatus() {
    if (!this.currentEvent || this.currentEvent.status !== 'active') {
      return;
    }

    const now = new Date();
    const endTime = new Date(this.currentEvent.endTime);
    if (now >= endTime) {
      console.log(`Event ${this.currentEvent.id} has exceeded its scheduled time`);
      this.emit('event-overtime', this.currentEvent);
    }
  }

  getCurrentEvent(): Event | null {
    return this.currentEvent;
  }

  async getEvent(eventId: string): Promise<Event | null> {
    const events = await this.getAllEvents();
    return events.find(e => e.id === eventId) || null;
  }

  getRemainingTime(): number {
    if (!this.currentEvent || this.currentEvent.status !== 'active') {
      return 0;
    }

    const now = new Date();
    const endTime = new Date(this.currentEvent.endTime);
    const remaining = endTime.getTime() - now.getTime();
    return Math.max(0, Math.floor(remaining / 60000)); // Return minutes
  }

  destroy() {
    if (this.eventCheckInterval) {
      clearInterval(this.eventCheckInterval);
    }
  }
}