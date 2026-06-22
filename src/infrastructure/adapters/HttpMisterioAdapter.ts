import type {
  MisterioExecutionResult,
  MisterioSolutionCheck,
} from '../../domain/models/MisterioExecutionResult';
import type { MisterioPort } from '../../domain/ports/MisterioPort';
import { apiRequest } from '../api/apiClient';

export class HttpMisterioAdapter implements MisterioPort {
  executeSql(sql: string): Promise<MisterioExecutionResult> {
    return apiRequest<MisterioExecutionResult>('/misterio/sql/execute', {
      method: 'POST',
      body: JSON.stringify({ sql }),
    });
  }

  verificarSolucion(nombre: string): Promise<MisterioSolutionCheck> {
    return apiRequest<MisterioSolutionCheck>('/misterio/solucion/verificar', {
      method: 'POST',
      body: JSON.stringify({ nombre }),
    });
  }
}
