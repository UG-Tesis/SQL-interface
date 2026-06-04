import { ApiError } from './apiClient';

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.body && typeof error.body === 'object') {
    const message = (error.body as { message?: string | string[] }).message;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string' && message.trim()) return message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
