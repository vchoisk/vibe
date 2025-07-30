const API_BASE = '/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new ApiError(response.status, error.error || response.statusText);
  }
  return response.json();
}

export const api = {
  // Health
  health: () => 
    fetch(`${API_BASE}/health`).then(handleResponse<{
      status: string;
      version: string;
      timestamp: string;
      directories: Record<string, boolean>;
    }>),

  // Config
  config: {
    get: () => 
      fetch(`${API_BASE}/config`).then(handleResponse<{ config: any }>),
    update: (config: any) =>
      fetch(`${API_BASE}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      }).then(handleResponse<{ config: any; message: string }>),
  },

  // Poses
  poses: {
    list: (params?: { category?: string; q?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.category) searchParams.set('category', params.category);
      if (params?.q) searchParams.set('q', params.q);
      const query = searchParams.toString();
      return fetch(`${API_BASE}/poses${query ? `?${query}` : ''}`).then(
        handleResponse<{ poses: any[]; categories: any[]; total: number }>
      );
    },
  },

  // Sessions
  sessions: {
    list: () => 
      fetch(`${API_BASE}/sessions`).then(
        handleResponse<{ sessions: any[]; total: number }>
      ),
    current: () =>
      fetch(`${API_BASE}/sessions/current`).then(
        handleResponse<{ session: any }>
      ),
    create: (poseId: string, outputDirectory?: string) =>
      fetch(`${API_BASE}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poseId, outputDirectory }),
      }).then(handleResponse<{ session: any }>),
    updateStatus: (status: string) =>
      fetch(`${API_BASE}/sessions/current`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }).then(handleResponse<{ session: any }>),
    complete: () =>
      fetch(`${API_BASE}/sessions/current/complete`, {
        method: 'POST',
      }).then(handleResponse<{ 
        session: any; 
        outputDirectory?: string; 
        starredCount: number;
      }>),
  },

  // Photos
  photos: {
    list: (sessionId?: string) => {
      const query = sessionId ? `?sessionId=${sessionId}` : '';
      return fetch(`${API_BASE}/photos${query}`).then(
        handleResponse<{ photos: any[]; total: number }>
      );
    },
    star: (photoId: string, starred: boolean) =>
      fetch(`${API_BASE}/photos/star`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId, starred }),
      }).then(handleResponse<{ 
        success: boolean; 
        session: any; 
        starredCount: number;
      }>),
  },
};