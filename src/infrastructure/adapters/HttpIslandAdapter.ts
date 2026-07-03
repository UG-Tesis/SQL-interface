import type { IslandActionResult } from '../../domain/models/IslandActionResult';
import type {
  IslandPort,
  IslandRestartResult,
  IslandResumeResult,
} from '../../domain/ports/IslandPort';
import { apiRequest } from '../api/apiClient';

export class HttpIslandAdapter implements IslandPort {
  restart(sessionId?: string): Promise<IslandRestartResult> {
    return apiRequest<IslandRestartResult>('/island/restart', {
      method: 'POST',
      body: JSON.stringify(sessionId ? { sessionId } : {}),
    });
  }

  resume(sessionId: string): Promise<IslandResumeResult> {
    return apiRequest<IslandResumeResult>('/island/session/resume', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  }

  closeSession(sessionId: string): Promise<{ success: true; message: string }> {
    return apiRequest('/island/session/close', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  }

  continue(sessionId: string, stepIndex: number): Promise<IslandActionResult> {
    return apiRequest<IslandActionResult>('/island/continue', {
      method: 'POST',
      body: JSON.stringify({ sessionId, stepIndex }),
    });
  }

  executeSql(
    sessionId: string,
    stepIndex: number,
    sql: string,
  ): Promise<IslandActionResult> {
    return apiRequest<IslandActionResult>('/island/sql/execute', {
      method: 'POST',
      body: JSON.stringify({ sessionId, stepIndex, sql }),
    });
  }
}
