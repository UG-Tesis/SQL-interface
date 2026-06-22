interface SchemaColumn {
  name: string;
  type: string;
  key?: 'pk' | 'fk';
}

interface SchemaTable {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  columns: SchemaColumn[];
}

const ROW_HEIGHT = 17;
const HEADER_HEIGHT = 28;
const PAD = 8;

const TABLES: SchemaTable[] = [
  {
    id: 'informe',
    label: 'informe_escena_crimen',
    x: 24,
    y: 24,
    width: 200,
    columns: [
      { name: 'fecha', type: 'INT' },
      { name: 'tipo', type: 'TEXT' },
      { name: 'descripcion', type: 'TEXT' },
      { name: 'ciudad', type: 'TEXT' },
    ],
  },
  {
    id: 'licencia',
    label: 'licencia_conducir',
    x: 24,
    y: 160,
    width: 200,
    columns: [
      { name: 'id', type: 'INT', key: 'pk' },
      { name: 'edad', type: 'INT' },
      { name: 'altura', type: 'INT' },
      { name: 'color_ojos', type: 'TEXT' },
      { name: 'color_cabello', type: 'TEXT' },
      { name: 'genero', type: 'TEXT' },
      { name: 'placa', type: 'TEXT' },
      { name: 'marca_auto', type: 'TEXT' },
      { name: 'modelo_auto', type: 'TEXT' },
    ],
  },
  {
    id: 'ingreso',
    label: 'ingreso',
    x: 24,
    y: 360,
    width: 200,
    columns: [
      { name: 'ssn', type: 'CHAR', key: 'pk' },
      { name: 'ingreso_anual', type: 'INT' },
    ],
  },
  {
    id: 'persona',
    label: 'persona',
    x: 300,
    y: 200,
    width: 220,
    columns: [
      { name: 'id', type: 'INT', key: 'pk' },
      { name: 'nombre', type: 'TEXT' },
      { name: 'licencia_id', type: 'INT', key: 'fk' },
      { name: 'numero_direccion', type: 'INT' },
      { name: 'nombre_calle', type: 'TEXT' },
      { name: 'ssn', type: 'CHAR', key: 'fk' },
    ],
  },
  {
    id: 'entrevista',
    label: 'entrevista',
    x: 300,
    y: 380,
    width: 220,
    columns: [
      { name: 'persona_id', type: 'INT', key: 'fk' },
      { name: 'transcripcion', type: 'TEXT' },
    ],
  },
  {
    id: 'registro',
    label: 'registro_evento',
    x: 580,
    y: 24,
    width: 210,
    columns: [
      { name: 'persona_id', type: 'INT', key: 'fk' },
      { name: 'evento_id', type: 'INT' },
      { name: 'nombre_evento', type: 'TEXT' },
      { name: 'fecha', type: 'INT' },
    ],
  },
  {
    id: 'miembro',
    label: 'miembro_gimnasio',
    x: 580,
    y: 200,
    width: 210,
    columns: [
      { name: 'id', type: 'TEXT', key: 'pk' },
      { name: 'persona_id', type: 'INT', key: 'fk' },
      { name: 'nombre', type: 'TEXT' },
      { name: 'fecha_inicio_membresia', type: 'INT' },
      { name: 'estado_membresia', type: 'TEXT' },
    ],
  },
  {
    id: 'asistencia',
    label: 'asistencia_gimnasio',
    x: 580,
    y: 380,
    width: 210,
    columns: [
      { name: 'membresia_id', type: 'TEXT', key: 'fk' },
      { name: 'fecha_entrada', type: 'INT' },
      { name: 'hora_entrada', type: 'INT' },
      { name: 'hora_salida', type: 'INT' },
    ],
  },
  {
    id: 'solucion',
    label: 'solucion',
    x: 820,
    y: 420,
    width: 160,
    columns: [
      { name: 'usuario', type: 'INT' },
      { name: 'valor', type: 'TEXT' },
    ],
  },
];

function tableHeight(table: SchemaTable): number {
  return HEADER_HEIGHT + table.columns.length * ROW_HEIGHT + PAD;
}

function KeyIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`} aria-hidden>
      <circle cx="5" cy="5" r="5" fill="#d97706" />
      <path d="M3 5h4M5 3v4" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
    </g>
  );
}

function FkArrow({ x, y }: { x: number; y: number }) {
  return <path d={`M${x} ${y} l4 -3 l0 6 z`} fill="#2563eb" aria-hidden />;
}

function SchemaTableBox({ table }: { table: SchemaTable }) {
  const height = tableHeight(table);

  return (
    <g>
      <rect
        x={table.x}
        y={table.y}
        width={table.width}
        height={height}
        rx="6"
        className="fill-white stroke-slate-300 dark:fill-slate-900 dark:stroke-slate-600"
        strokeWidth="1.5"
      />
      <rect
        x={table.x}
        y={table.y}
        width={table.width}
        height={HEADER_HEIGHT}
        rx="6"
        className="fill-violet-100 dark:fill-violet-950/80"
      />
      <rect
        x={table.x}
        y={table.y + HEADER_HEIGHT - 6}
        width={table.width}
        height={6}
        className="fill-violet-100 dark:fill-violet-950/80"
      />
      <text
        x={table.x + table.width / 2}
        y={table.y + 18}
        textAnchor="middle"
        className="fill-slate-900 text-[11px] font-bold dark:fill-white"
        style={{ fontFamily: 'ui-monospace, monospace' }}
      >
        {table.label}
      </text>

      {table.columns.map((column, index) => {
        const rowY = table.y + HEADER_HEIGHT + index * ROW_HEIGHT + 13;
        const iconX = table.x + 6;
        const nameX = table.x + (column.key ? 22 : 8);

        return (
          <g key={column.name}>
            {column.key === 'pk' ? <KeyIcon x={iconX} y={rowY - 10} /> : null}
            {column.key === 'fk' ? <FkArrow x={iconX} y={rowY - 6} /> : null}
            <text
              x={nameX}
              y={rowY}
              className="fill-slate-800 text-[10px] dark:fill-slate-200"
              style={{ fontFamily: 'ui-monospace, monospace' }}
            >
              {column.name}
            </text>
            <text
              x={table.x + table.width - 8}
              y={rowY}
              textAnchor="end"
              className="fill-slate-400 text-[9px] uppercase dark:fill-slate-500"
              style={{ fontFamily: 'ui-monospace, monospace' }}
            >
              {column.type}
            </text>
            {index < table.columns.length - 1 ? (
              <line
                x1={table.x + 4}
                x2={table.x + table.width - 4}
                y1={table.y + HEADER_HEIGHT + (index + 1) * ROW_HEIGHT}
                y2={table.y + HEADER_HEIGHT + (index + 1) * ROW_HEIGHT}
                className="stroke-slate-100 dark:stroke-slate-800"
              />
            ) : null}
          </g>
        );
      })}
    </g>
  );
}

interface RelationLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const RELATIONS: RelationLine[] = (() => {
  const byId = Object.fromEntries(TABLES.map((table) => [table.id, table])) as Record<
    string,
    SchemaTable
  >;

  const persona = byId.persona;
  const licencia = byId.licencia;
  const ingreso = byId.ingreso;
  const entrevista = byId.entrevista;
  const registro = byId.registro;
  const miembro = byId.miembro;
  const asistencia = byId.asistencia;

  return [
    {
      x1: licencia.x + licencia.width,
      y1: licencia.y + 50,
      x2: persona.x,
      y2: persona.y + 70,
    },
    {
      x1: ingreso.x + ingreso.width,
      y1: ingreso.y + 30,
      x2: persona.x,
      y2: persona.y + 110,
    },
    {
      x1: persona.x + persona.width / 2,
      y1: persona.y + tableHeight(persona),
      x2: entrevista.x + entrevista.width / 2,
      y2: entrevista.y,
    },
    {
      x1: persona.x + persona.width,
      y1: persona.y + 50,
      x2: registro.x,
      y2: registro.y + 50,
    },
    {
      x1: persona.x + persona.width,
      y1: persona.y + 90,
      x2: miembro.x,
      y2: miembro.y + 50,
    },
    {
      x1: miembro.x + miembro.width / 2,
      y1: miembro.y + tableHeight(miembro),
      x2: asistencia.x + asistencia.width / 2,
      y2: asistencia.y,
    },
  ];
})();

export function MisterioSchemaDiagram() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/80">
      <h3 className="text-base font-bold text-slate-900 dark:text-white">
        Diagrama de la base de datos (ERD)
      </h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Vista general de las tablas del caso y cómo se relacionan. La tabla central es{' '}
        <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">persona</code>: casi todas
        las pistas pasan por ahí.
      </p>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/50 p-2 dark:border-slate-700 dark:bg-slate-950/40">
        <svg
          viewBox="0 0 1000 520"
          className="mx-auto min-w-[720px] max-w-full"
          role="img"
          aria-label="Diagrama entidad-relación de tesis_misterio"
        >
          <defs>
            <marker
              id="relation-arrow"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
            >
              <path d="M0,0 L8,4 L0,8 Z" className="fill-slate-400 dark:fill-slate-500" />
            </marker>
          </defs>

          {RELATIONS.map((line, index) => (
            <line
              key={index}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              className="stroke-slate-300 dark:stroke-slate-600"
              strokeWidth="1.5"
              markerEnd="url(#relation-arrow)"
            />
          ))}

          {TABLES.map((table) => (
            <SchemaTableBox key={table.id} table={table} />
          ))}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-600" />
          Clave primaria (PK) — identificador único
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-0 w-0 border-y-4 border-l-[6px] border-y-transparent border-l-blue-600"
            aria-hidden
          />
          Clave foránea (FK) — enlace a otra tabla
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-px w-5 bg-slate-400" />
          Relación entre tablas
        </span>
      </div>
    </section>
  );
}
