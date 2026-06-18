import type { SqlValidationResult } from '../../domain/models/SqlValidationResult';
import type { SqlValidationPort } from '../../domain/ports/SqlValidationPort';
import { apiRequest } from '../api/apiClient';

export class HttpSqlValidationAdapter implements SqlValidationPort {
  validate(
    sql: string,
    actividadId: number,
    options?: { signal?: AbortSignal },
  ): Promise<SqlValidationResult> {
    return apiRequest<SqlValidationResult>('/sql/validate', {
      method: 'POST',
      body: JSON.stringify({ sql, actividadId }),
      signal: options?.signal,
    });
  }
}
