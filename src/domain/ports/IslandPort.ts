import type { IslandActionResult } from '../../domain/models/IslandActionResult';
import type { IslandPort } from '../../domain/ports/IslandPort';

export interface IslandRestartResult {
  success: true;
  message: string;
  sessionId: string;
}

export interface IslandPort {
  restart(sessionId?: string): Promise<IslandRestartResult>;
  closeSession(sessionId: string): Promise<{ success: true; message: string }>;
  continue(sessionId: string, stepIndex: number): Promise<IslandActionResult>;
  executeSql(
    sessionId: string,
    stepIndex: number,
    sql: string,
  ): Promise<IslandActionResult>;
}
