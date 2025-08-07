import { Shoot, ShootSummary, PhotoSession } from '@snapstudio/types';
import { readJSON, writeJSON, ensureDir, pathExists } from 'fs-extra';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';

export interface ShootManagerConfig {
  dataDirectory: string;
}

export class ShootManager extends EventEmitter {
  private config: ShootManagerConfig;
  private shootsFile: string;
  private currentShoot: Shoot | null = null;
  private shootCheckInterval: NodeJS.Timeout | null = null;

  constructor(config: ShootManagerConfig) {
    super();
    this.config = config;
    this.shootsFile = join(config.dataDirectory, 'shoots.json');
    this.initialize();
  }

  private async initialize() {
    await ensureDir(this.config.dataDirectory);
    await this.loadCurrentShoot();
    
    // Check shoot status every minute
    this.shootCheckInterval = setInterval(() => {
      this.checkShootStatus();
    }, 60000);
  }

  private async loadCurrentShoot() {
    if (await pathExists(this.shootsFile)) {
      const shoots = await this.getAllShoots();
      // Find active shoot
      this.currentShoot = shoots.find(s => s.status === 'active') || null;
    }
  }

  private async saveShoots(shoots: Shoot[]) {
    await writeJSON(this.shootsFile, shoots, { spaces: 2 });
  }

  async getAllShoots(): Promise<Shoot[]> {
    if (await pathExists(this.shootsFile)) {
      const shoots = await readJSON(this.shootsFile);
      return shoots.map((shoot: any) => this.deserializeShoot(shoot));
    }
    return [];
  }

  private deserializeShoot(data: any): Shoot {
    return {
      ...data,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      createdAt: new Date(data.createdAt),
      activatedAt: data.activatedAt ? new Date(data.activatedAt) : undefined,
      completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
    };
  }

  async createShoot(data: {
    name: string;
    clientName: string;
    durationMinutes: number;
    startTime?: Date;
    notes?: string;
    pricePackage?: Shoot['pricePackage'];
  }): Promise<Shoot> {
    const shoots = await this.getAllShoots();
    
    // Check if there's already an active shoot
    const activeShoot = shoots.find(s => s.status === 'active');
    if (activeShoot) {
      throw new Error('A shoot is already active. Please complete it before starting a new one.');
    }

    const now = new Date();
    const startTime = data.startTime || now;
    const endTime = new Date(startTime.getTime() + data.durationMinutes * 60000);

    const shoot: Shoot = {
      id: `shoot-${uuidv4()}`,
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

    shoots.push(shoot);
    await this.saveShoots(shoots);

    // Auto-start if scheduled for now
    if (startTime <= now) {
      return this.startShoot(shoot.id);
    }

    return shoot;
  }

  async startShoot(shootId: string): Promise<Shoot> {
    const shoots = await this.getAllShoots();
    const shoot = shoots.find(s => s.id === shootId);
    
    if (!shoot) {
      throw new Error('Shoot not found');
    }

    if (shoot.status === 'active') {
      return shoot;
    }

    if (shoot.status === 'completed' || shoot.status === 'cancelled') {
      throw new Error('Cannot start a completed or cancelled shoot');
    }

    // Update shoot status
    shoot.status = 'active';
    shoot.activatedAt = new Date();
    
    // Update end time based on activation time
    shoot.endTime = new Date(shoot.activatedAt.getTime() + shoot.durationMinutes * 60000);

    await this.saveShoots(shoots);
    // Ensure currentShoot has proper Date objects
    this.currentShoot = this.deserializeShoot(shoot);
    
    this.emit('shoot-started', this.currentShoot);
    return this.currentShoot;
  }

  async updateShoot(shootId: string, updates: Partial<Shoot>): Promise<Shoot> {
    const shoots = await this.getAllShoots();
    const shootIndex = shoots.findIndex(s => s.id === shootId);
    
    if (shootIndex === -1) {
      throw new Error('Shoot not found');
    }

    shoots[shootIndex] = { ...shoots[shootIndex], ...updates };
    await this.saveShoots(shoots);

    const updatedShoot = this.deserializeShoot(shoots[shootIndex]);
    
    if (this.currentShoot?.id === shootId) {
      this.currentShoot = updatedShoot;
    }

    this.emit('shoot-updated', updatedShoot);
    return updatedShoot;
  }

  async addSessionToShoot(shootId: string, sessionId: string): Promise<Shoot> {
    const shoots = await this.getAllShoots();
    const shoot = shoots.find(s => s.id === shootId);
    
    if (!shoot) {
      throw new Error('Shoot not found');
    }

    if (!shoot.sessions.includes(sessionId)) {
      shoot.sessions.push(sessionId);
      await this.saveShoots(shoots);
      
      const updatedShoot = this.deserializeShoot(shoot);
      
      if (this.currentShoot?.id === shootId) {
        this.currentShoot = updatedShoot;
      }
      
      this.emit('shoot-updated', updatedShoot);
      return updatedShoot;
    }

    return this.deserializeShoot(shoot);
  }

  async completeShoot(shootId: string, sessionManager: any): Promise<ShootSummary> {
    const shoots = await this.getAllShoots();
    const shoot = shoots.find(s => s.id === shootId);
    
    if (!shoot) {
      throw new Error('Shoot not found');
    }

    if (shoot.status === 'completed') {
      throw new Error('Shoot is already completed');
    }

    if (shoot.status !== 'active') {
      throw new Error(`Cannot complete shoot with status: ${shoot.status}. Shoot must be active.`);
    }

    // Debug logging
    console.log('[ShootManager] Completing shoot:', {
      shootId,
      status: shoot.status,
      activatedAt: shoot.activatedAt,
      activatedAtType: typeof shoot.activatedAt,
      activatedAtIsDate: shoot.activatedAt instanceof Date,
    });

    // Get all sessions for this shoot
    const sessionDetails: PhotoSession[] = [];
    let totalPhotos = 0;
    let totalStarredPhotos = 0;
    const allPhotos: any[] = [];

    for (const sessionId of shoot.sessions) {
      const session = await sessionManager.getSession(sessionId);
      if (session) {
        sessionDetails.push(session);
        totalPhotos += session.photos.length;
        totalStarredPhotos += session.starredPhotos.length;
        allPhotos.push(...session.photos);
      }
    }

    // Update shoot
    shoot.status = 'completed';
    shoot.completedAt = new Date();
    shoot.totalPhotos = totalPhotos;
    shoot.totalStarredPhotos = totalStarredPhotos;

    await this.saveShoots(shoots);

    if (this.currentShoot?.id === shootId) {
      this.currentShoot = null;
    }

    // Ensure we have a completedAt date
    if (!shoot.completedAt) {
      throw new Error('Shoot completedAt date is missing');
    }
    
    // Ensure dates are Date objects (handle both Date and string)
    const activatedAt = shoot.activatedAt 
      ? (shoot.activatedAt instanceof Date ? shoot.activatedAt : new Date(shoot.activatedAt))
      : null;
    const completedAt = shoot.completedAt instanceof Date 
      ? shoot.completedAt 
      : new Date(shoot.completedAt);
    
    const summary: ShootSummary = {
      shootId: shoot.id,
      totalSessions: shoot.sessions.length,
      totalPhotos,
      totalStarredPhotos,
      allPhotos,
      sessionDetails,
      duration: {
        scheduled: shoot.durationMinutes,
        actual: activatedAt 
          ? Math.floor((completedAt.getTime() - activatedAt.getTime()) / 60000)
          : 0,
      },
    };

    this.emit('shoot-completed', summary);
    return summary;
  }

  private async checkShootStatus() {
    if (!this.currentShoot || this.currentShoot.status !== 'active') {
      return;
    }

    const now = new Date();
    const endTime = new Date(this.currentShoot.endTime);
    if (now >= endTime) {
      console.log(`Shoot ${this.currentShoot.id} has exceeded its scheduled time`);
      this.emit('shoot-overtime', this.currentShoot);
    }
  }

  getCurrentShoot(): Shoot | null {
    return this.currentShoot;
  }

  async getShoot(shootId: string): Promise<Shoot | null> {
    const shoots = await this.getAllShoots();
    return shoots.find(s => s.id === shootId) || null;
  }

  getRemainingTime(): number {
    if (!this.currentShoot || this.currentShoot.status !== 'active') {
      return 0;
    }

    const now = new Date();
    const endTime = new Date(this.currentShoot.endTime);
    const remaining = endTime.getTime() - now.getTime();
    return Math.max(0, Math.floor(remaining / 60000)); // Return minutes
  }

  destroy() {
    if (this.shootCheckInterval) {
      clearInterval(this.shootCheckInterval);
    }
  }
}