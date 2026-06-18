import type { SqlValidationResult } from '../models/SqlValidationResult';

export interface SqlValidationPort {
  validate(
    sql: string,
    actividadId: number,
    options?: { signal?: AbortSignal },
  ): Promise<SqlValidationResult>;
}
