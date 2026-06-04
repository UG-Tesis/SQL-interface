export interface SqlColumnMeta {
  name: string;
  type: string;
}

export interface SqlExecutionResult {
  success: boolean;
  rows: Record<string, unknown>[];
  rowCount: number;
  columns: SqlColumnMeta[];
  affectedRows?: number;
  insertId?: number;
  message: string;
}
