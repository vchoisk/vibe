import { NextResponse } from 'next/server';

export interface ApiErrorResponse {
  error: {
    message: string;
    code: string;
    details?: any;
    timestamp: string;
    path?: string;
  };
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function createErrorResponse(
  error: unknown,
  statusCode: number = 500,
  path?: string
): NextResponse<ApiErrorResponse> {
  // Enhanced error logging with stack trace
  console.error(`[API Error] ${path || 'Unknown path'}:`, {
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error,
    statusCode,
    timestamp: new Date().toISOString()
  });

  // Handle known API errors
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          message: error.message,
          code: error.code,
          details: {
            ...error.details,
            statusCode: error.statusCode,
            // Include stack trace in development
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
          },
          timestamp: new Date().toISOString(),
          path,
        },
      },
      { status: error.statusCode }
    );
  }

  // Handle standard errors
  if (error instanceof Error) {
    // Provide more user-friendly messages for common errors
    let message = error.message;
    let code = 'INTERNAL_ERROR';
    let details = undefined;

    if (error.message.includes('ENOENT')) {
      message = 'The requested file or directory was not found';
      code = 'FILE_NOT_FOUND';
      details = { originalError: error.message };
    } else if (error.message.includes('EACCES')) {
      message = 'Permission denied accessing the file or directory';
      code = 'PERMISSION_DENIED';
      details = { originalError: error.message };
    } else if (error.message.includes('No active session')) {
      message = 'No active photo session found. Please start a new session.';
      code = 'NO_ACTIVE_SESSION';
      statusCode = 404;
    } else if (error.message.includes('Session already has maximum photos')) {
      message = 'This session has reached the maximum number of photos';
      code = 'SESSION_FULL';
      statusCode = 400;
    }

    return NextResponse.json(
      {
        error: {
          message,
          code,
          details: {
            ...details,
            // Include original error info in development
            ...(process.env.NODE_ENV === 'development' && {
              originalError: error.message,
              stack: error.stack,
              name: error.name
            })
          },
          timestamp: new Date().toISOString(),
          path,
        },
      },
      { status: statusCode }
    );
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      error: {
        message: 'An unexpected error occurred. Please try again.',
        code: 'UNKNOWN_ERROR',
        details: process.env.NODE_ENV === 'development' ? { 
          error: String(error),
          type: typeof error,
          value: error
        } : undefined,
        timestamp: new Date().toISOString(),
        path,
      },
    },
    { status: 500 }
  );
}

// Common error creators
export const errors = {
  notFound: (resource: string) => 
    new ApiError(404, 'NOT_FOUND', `${resource} not found`),
  
  badRequest: (message: string, details?: any) => 
    new ApiError(400, 'BAD_REQUEST', message, details),
  
  unauthorized: (message = 'Unauthorized') => 
    new ApiError(401, 'UNAUTHORIZED', message),
  
  forbidden: (message = 'Forbidden') => 
    new ApiError(403, 'FORBIDDEN', message),
  
  conflict: (message: string, details?: any) => 
    new ApiError(409, 'CONFLICT', message, details),
  
  internal: (message = 'Internal server error', details?: any) => 
    new ApiError(500, 'INTERNAL_ERROR', message, details),
};