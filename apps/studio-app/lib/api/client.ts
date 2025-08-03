const API_BASE = '/api';

export interface ErrorDetails {
  message: string;
  code: string;
  details?: any;
  timestamp: string;
  path?: string;
}

export class ApiClientError extends Error {
  public code: string;
  public details?: any;
  public timestamp: string;

  constructor(
    public status: number, 
    errorData: ErrorDetails | string
  ) {
    const isErrorObject = typeof errorData === 'object';
    super(isErrorObject ? errorData.message : errorData);
    
    this.name = 'ApiClientError';
    this.code = isErrorObject ? errorData.code : 'UNKNOWN_ERROR';
    this.details = isErrorObject ? errorData.details : undefined;
    this.timestamp = isErrorObject ? errorData.timestamp : new Date().toISOString();
  }
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}${path}`;
  
  try {
    console.log(`[API Request] ${options?.method || 'GET'} ${url}`);
    const response = await fetch(url, options);
    
    if (!response.ok) {
      let errorData: ErrorDetails | string = 'Unknown error occurred';
      
      try {
        const json = await response.json();
        errorData = json.error || json.message || JSON.stringify(json);
      } catch (e) {
        try {
          errorData = await response.text();
        } catch (textError) {
          errorData = `${response.status} ${response.statusText}`;
        }
      }
      
      console.error(`[API Error] ${url}:`, {
        status: response.status,
        error: errorData,
      });
      
      throw new ApiClientError(response.status, errorData);
    }
    
    const data = await response.json();
    console.log(`[API Response] ${url}:`, data);
    return data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    
    console.error(`[API Network Error] ${url}:`, error);
    throw new ApiClientError(0, {
      message: 'Network error: Unable to connect to server',
      code: 'NETWORK_ERROR',
      details: { originalError: error instanceof Error ? error.message : String(error) },
      timestamp: new Date().toISOString(),
      path: url,
    });
  }
}

export const api = {
  // Health
  health: () => 
    request<{
      status: string;
      version: string;
      timestamp: string;
      directories: Record<string, boolean>;
    }>('/health'),

  // Config
  config: {
    get: () => 
      request<{ config: any }>('/config'),
    
    update: (config: any) =>
      request<{ config: any; message: string }>('/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      }),
  },

  // Poses
  poses: {
    list: (params?: { category?: string; q?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.category) searchParams.set('category', params.category);
      if (params?.q) searchParams.set('q', params.q);
      const query = searchParams.toString();
      return request<{ poses: any[]; categories: any[]; total: number }>(
        `/poses${query ? `?${query}` : ''}`
      );
    },
  },

  // Sessions
  sessions: {
    list: () => 
      request<{ sessions: any[]; total: number }>('/sessions'),
    
    current: () =>
      request<{ session: any }>('/sessions/current'),
    
    create: (poseId: string, outputDirectory?: string) =>
      request<{ session: any }>('/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poseId, outputDirectory }),
      }),
    
    updateStatus: (status: string) =>
      request<{ session: any }>('/sessions/current', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }),
    
    complete: () =>
      request<{ 
        session: any; 
        outputDirectory?: string; 
        starredCount: number 
      }>('/sessions/current/complete', {
        method: 'POST',
      }),
  },

  // Photos
  photos: {
    list: (sessionId?: string) => {
      const query = sessionId ? `?sessionId=${sessionId}` : '';
      return request<{ photos: any[]; total: number }>(`/photos${query}`);
    },
    
    star: (photoId: string, starred: boolean) =>
      request<{ 
        success: boolean; 
        session: any; 
        starredCount: number 
      }>('/photos/star', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId, starred }),
      }),
  },
  
  test: {
    createPhoto: () =>
      request<{ success: boolean; filename: string; message: string }>('/test/photo', {
        method: 'POST',
      }),
  },
};