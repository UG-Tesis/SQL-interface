import type { SqlExecutionResult } from '../../domain/models/SqlExecutionResult';
import type { SqlExecutorPort } from '../../domain/ports/SqlExecutorPort';
import { apiRequest } from '../api/apiClient';

export class HttpSqlExecutorAdapter implements SqlExecutorPort {
  execute(sql: string): Promise<SqlExecutionResult> {
    return apiRequest<SqlExecutionResult>('/sql/execute', {
      method: 'POST',
      body: JSON.stringify({ sql }),
    });
  }
}
