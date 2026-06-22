import type { MisterioExecutionResult } from '../models/MisterioExecutionResult';
import type { MisterioSolutionCheck } from '../models/MisterioExecutionResult';

export interface MisterioPort {
  executeSql(sql: string): Promise<MisterioExecutionResult>;
  verificarSolucion(nombre: string): Promise<MisterioSolutionCheck>;
}
