import type { SqlExecutionResult } from './SqlExecutionResult';

export interface IslandMissionProgress {
  missionId: number;
  missionTitle: string;
  missionIndex: number;
  stepInMission: number;
  stepsInMission: number;
  totalMissions: number;
  currentStep: number;
  totalSteps: number;
}

export interface IslandActionResult extends SqlExecutionResult {
  code: -1 | 0 | 1;
  stepComplete: boolean;
  gameComplete: boolean;
  narrative?: string;
  answer?: string;
  followUp?: string;
  hint?: string;
  demoSql?: string;
  progress: IslandMissionProgress | null;
  nextStepIndex: number | null;
}
