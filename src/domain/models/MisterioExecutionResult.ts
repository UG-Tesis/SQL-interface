import type { SqlExecutionResult } from './SqlExecutionResult';

export interface MisterioSolutionCheck {
  correct: boolean;
  etapa: 1 | 2 | null;
  mensaje: string;
}

export interface MisterioExecutionResult extends SqlExecutionResult {
  solutionCheck?: MisterioSolutionCheck;
}
