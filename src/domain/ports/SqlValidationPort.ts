import type { SqlValidationResult } from '../models/SqlValidationResult';

export interface SqlValidationPort {
  validate(sql: string, actividadId: number): Promise<SqlValidationResult>;
}
