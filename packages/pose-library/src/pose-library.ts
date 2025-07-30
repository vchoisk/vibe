import { Pose } from '@snapstudio/types';
import fs from 'fs-extra';
import path from 'path';
import { defaultPoses } from './default-poses';

export interface PoseLibraryOptions {
  customPosesPath?: string;
  includeDefaults?: boolean;
}

export class PoseLibrary {
  private poses: Map<string, Pose> = new Map();
  private options: Required<PoseLibraryOptions>;

  constructor(options: PoseLibraryOptions = {}) {
    this.options = {
      includeDefaults: true,
      customPosesPath: '',
      ...options,
    };

    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (this.options.includeDefaults) {
      this.loadDefaultPoses();
    }

    if (this.options.customPosesPath) {
      await this.loadCustomPoses();
    }
  }

  private loadDefaultPoses(): void {
    defaultPoses.forEach(pose => {
      this.poses.set(pose.id, pose);
    });
  }

  private async loadCustomPoses(): Promise<void> {
    try {
      if (await fs.pathExists(this.options.customPosesPath)) {
        const customPoses = await fs.readJson(this.options.customPosesPath);
        
        if (Array.isArray(customPoses)) {
          customPoses.forEach(pose => {
            this.poses.set(pose.id, pose);
          });
        }
      }
    } catch (error) {
      console.error('Error loading custom poses:', error);
    }
  }

  getAllPoses(): Pose[] {
    return Array.from(this.poses.values());
  }

  getPoseById(id: string): Pose | undefined {
    return this.poses.get(id);
  }

  getPosesByCategory(category: Pose['category']): Pose[] {
    return this.getAllPoses().filter(pose => pose.category === category);
  }

  getCategories(): Array<{ name: Pose['category']; count: number }> {
    const categories = new Map<Pose['category'], number>();
    
    this.getAllPoses().forEach(pose => {
      const count = categories.get(pose.category) || 0;
      categories.set(pose.category, count + 1);
    });

    return Array.from(categories.entries()).map(([name, count]) => ({
      name,
      count,
    }));
  }

  async addCustomPose(pose: Pose): Promise<void> {
    this.poses.set(pose.id, pose);
    
    if (this.options.customPosesPath) {
      await this.saveCustomPoses();
    }
  }

  async updatePose(id: string, updates: Partial<Pose>): Promise<Pose | null> {
    const existing = this.poses.get(id);
    if (!existing) {
      return null;
    }

    const updated = { ...existing, ...updates, id };
    this.poses.set(id, updated);

    if (this.options.customPosesPath && existing.category === 'custom') {
      await this.saveCustomPoses();
    }

    return updated;
  }

  async removePose(id: string): Promise<boolean> {
    const pose = this.poses.get(id);
    
    if (!pose || pose.category !== 'custom') {
      return false;
    }

    this.poses.delete(id);
    
    if (this.options.customPosesPath) {
      await this.saveCustomPoses();
    }

    return true;
  }

  private async saveCustomPoses(): Promise<void> {
    const customPoses = this.getAllPoses().filter(pose => pose.category === 'custom');
    
    try {
      await fs.ensureDir(path.dirname(this.options.customPosesPath));
      await fs.writeJson(this.options.customPosesPath, customPoses, { spaces: 2 });
    } catch (error) {
      console.error('Error saving custom poses:', error);
      throw error;
    }
  }

  searchPoses(query: string): Pose[] {
    const lowercaseQuery = query.toLowerCase();
    
    return this.getAllPoses().filter(pose => 
      pose.name.toLowerCase().includes(lowercaseQuery) ||
      pose.description.toLowerCase().includes(lowercaseQuery) ||
      pose.category.toLowerCase().includes(lowercaseQuery)
    );
  }

  getRandomPose(category?: Pose['category']): Pose | null {
    const poses = category ? this.getPosesByCategory(category) : this.getAllPoses();
    
    if (poses.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * poses.length);
    return poses[randomIndex];
  }
}