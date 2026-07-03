import type { IslandActionResult } from '../models/IslandActionResult';

export interface IslandRestartResult {
  success: true;
  message: string;
  sessionId: string;
}

export interface IslandResumeResult {
  success: true;
  sessionId: string;
}

export interface IslandPort {
  restart(sessionId?: string): Promise<IslandRestartResult>;
  resume(sessionId: string): Promise<IslandResumeResult>;
  closeSession(sessionId: string): Promise<{ success: true; message: string }>;
  continue(sessionId: string, stepIndex: number): Promise<IslandActionResult>;
  executeSql(
    sessionId: string,
    stepIndex: number,
    sql: string,
  ): Promise<IslandActionResult>;
}
