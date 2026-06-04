import type { SqlColumnMeta } from '../../domain/models/SqlExecutionResult';

interface SqlResultsTableProps {
  columns: SqlColumnMeta[];
  rows: Record<string, unknown>[];
  message?: string;
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function SqlResultsTable({ columns, rows, message }: SqlResultsTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-300">
        {message ?? 'La consulta no devolvió registros.'}
      </div>
    );
  }

  const columnNames =
    columns.length > 0 ? columns.map((column) => column.name) : Object.keys(rows[0] ?? {});

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-700">
          <thead className="bg-slate-100 dark:bg-slate-800">
            <tr>
              {columnNames.map((name) => (
                <th
                  key={name}
                  className="px-4 py-3 font-semibold whitespace-nowrap text-slate-700 dark:text-slate-200"
                >
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900/60">
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20">
                {columnNames.map((name) => (
                  <td
                    key={`${rowIndex}-${name}`}
                    className="px-4 py-2.5 font-mono text-xs text-slate-700 dark:text-slate-200"
                  >
                    {formatCell(row[name])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {message ? (
        <p className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
          {message}
        </p>
      ) : null}
    </div>
  );
}
