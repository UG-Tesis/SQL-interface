import { translateSqlError } from '../sql/translateSqlError';
import { ApiError } from './apiClient';

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.body && typeof error.body === 'object') {
    const message = (error.body as { message?: string | string[] }).message;
    if (Array.isArray(message)) return translateSqlError(message.join(', '));
    if (typeof message === 'string' && message.trim()) return translateSqlError(message);
  }
  if (error instanceof Error && error.message) return translateSqlError(error.message);
  return fallback;
}
