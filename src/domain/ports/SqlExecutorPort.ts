import type { SqlExecutionResult } from '../models/SqlExecutionResult';

export interface SqlExecutorPort {
  execute(sql: string): Promise<SqlExecutionResult>;
}
