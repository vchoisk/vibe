import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

export interface Camera {
  model: string;
  port: string;
}

export interface CaptureResult {
  success: boolean;
  filename: string;
  path: string;
  timestamp: string;
  error?: string;
}

export interface CameraSetting {
  name: string;
  value: string;
  choices?: string[];
}

class GPhoto2Service {
  private captureDir: string;

  constructor(captureDir?: string) {
    this.captureDir = captureDir || path.join(process.cwd(), 'public', 'captures');
  }

  /**
   * Check if gphoto2 is installed
   */
  async isInstalled(): Promise<boolean> {
    try {
      await execAsync('which gphoto2');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * List all connected cameras
   */
  async listCameras(): Promise<Camera[]> {
    try {
      const { stdout } = await execAsync('gphoto2 --auto-detect');
      const lines = stdout.split('\n').slice(2); // Skip header lines
      
      return lines
        .filter(line => line.trim())
        .map(line => {
          const match = line.match(/^(.+?)\s{2,}(.+)$/);
          return match ? { 
            model: match[1].trim(), 
            port: match[2].trim() 
          } : null;
        })
        .filter((camera): camera is Camera => camera !== null);
    } catch (error: any) {
      console.error('Error listing cameras:', error);
      throw new Error(`Failed to list cameras: ${error.message}`);
    }
  }

  /**
   * Capture a photo and save it to the specified location
   */
  async capturePhoto(
    sessionId: string, 
    poseNumber: number,
    shootId?: string
  ): Promise<CaptureResult> {
    try {
      // Ensure gphoto2 is installed
      if (!(await this.isInstalled())) {
        throw new Error('gphoto2 is not installed. Run: brew install gphoto2 (macOS) or apt-get install gphoto2 (Linux)');
      }

      // Create filename and path
      const filename = `${sessionId}-pose-${poseNumber}.jpg`;
      const captureSubDir = shootId ? path.join(this.captureDir, shootId) : this.captureDir;
      const filepath = path.join(captureSubDir, filename);

      // Ensure capture directory exists
      await fs.mkdir(captureSubDir, { recursive: true });

      // Execute capture command
      const { stdout, stderr } = await execAsync(
        `gphoto2 --capture-image-and-download --filename="${filepath}"`
      );

      console.log('Capture output:', stdout);
      if (stderr && !stderr.includes('New file is in')) {
        console.warn('Capture stderr:', stderr);
      }

      // Verify file was created
      try {
        await fs.access(filepath);
      } catch {
        throw new Error('Photo capture failed - file not created');
      }

      // Get relative path for web access
      const relativePath = shootId 
        ? `/captures/${shootId}/${filename}`
        : `/captures/${filename}`;

      return {
        success: true,
        filename,
        path: relativePath,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      console.error('Capture error:', error);
      
      // Parse specific error types
      if (error.message.includes('command not found') || error.message.includes('gphoto2 is not installed')) {
        return {
          success: false,
          filename: '',
          path: '',
          timestamp: new Date().toISOString(),
          error: 'gphoto2 is not installed on the server'
        };
      }
      
      if (error.message.includes('no camera') || error.message.includes('Could not detect any camera')) {
        return {
          success: false,
          filename: '',
          path: '',
          timestamp: new Date().toISOString(),
          error: 'No camera detected. Please connect a camera via USB.'
        };
      }

      if (error.message.includes('could not claim')) {
        return {
          success: false,
          filename: '',
          path: '',
          timestamp: new Date().toISOString(),
          error: 'Camera is busy or locked by another process'
        };
      }

      return {
        success: false,
        filename: '',
        path: '',
        timestamp: new Date().toISOString(),
        error: `Failed to capture photo: ${error.message}`
      };
    }
  }

  /**
   * Get camera configuration/settings
   */
  async getSettings(): Promise<CameraSetting[]> {
    try {
      const { stdout } = await execAsync('gphoto2 --list-config');
      const configs = stdout.split('\n').filter(line => line.trim());
      
      const settings: CameraSetting[] = [];
      
      // Get first 10 most common settings
      const commonConfigs = [
        '/main/settings/iso',
        '/main/settings/shutterspeed',
        '/main/settings/aperture',
        '/main/settings/whitebalance',
        '/main/settings/focusmode',
        '/main/settings/exposurecompensation'
      ];

      for (const config of commonConfigs) {
        if (configs.includes(config)) {
          try {
            const { stdout: output } = await execAsync(`gphoto2 --get-config ${config}`);
            
            // Parse the output to get current value and choices
            const lines = output.split('\n');
            let name = config.split('/').pop() || config;
            let value = '';
            let choices: string[] = [];
            
            for (const line of lines) {
              if (line.includes('Current:')) {
                value = line.split('Current:')[1].trim();
              } else if (line.includes('Choice:')) {
                const choice = line.split('Choice:')[1].trim().split(' ')[1];
                if (choice) choices.push(choice);
              }
            }
            
            settings.push({ name, value, choices });
          } catch {
            // Skip settings that can't be read
          }
        }
      }
      
      return settings;
    } catch (error: any) {
      console.error('Error getting settings:', error);
      throw new Error(`Failed to get camera settings: ${error.message}`);
    }
  }

  /**
   * Set a camera configuration value
   */
  async setSetting(setting: string, value: string): Promise<void> {
    try {
      const { stderr } = await execAsync(`gphoto2 --set-config ${setting}=${value}`);
      
      if (stderr && !stderr.includes('OK')) {
        throw new Error(stderr);
      }
    } catch (error: any) {
      console.error('Error setting config:', error);
      throw new Error(`Failed to set camera setting: ${error.message}`);
    }
  }

  /**
   * Trigger autofocus
   */
  async triggerAutofocus(): Promise<void> {
    try {
      await execAsync('gphoto2 --set-config autofocusdrive=1');
    } catch (error: any) {
      console.error('Error triggering autofocus:', error);
      throw new Error(`Failed to trigger autofocus: ${error.message}`);
    }
  }

  /**
   * Get camera battery level
   */
  async getBatteryLevel(): Promise<string> {
    try {
      const { stdout } = await execAsync('gphoto2 --get-config /main/status/batterylevel');
      const match = stdout.match(/Current:\s*(.+)/);
      return match ? match[1].trim() : 'Unknown';
    } catch {
      return 'N/A';
    }
  }
}

// Export singleton instance
export const cameraService = new GPhoto2Service();

// Also export class for custom instances
export default GPhoto2Service;