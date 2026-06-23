import { forwardRef, useState } from 'react';
import {
  MISTERIO_EXPERT_BLOCKS,
  MISTERIO_INVESTIGATION_FLOW,
  MISTERIO_INVESTIGATION_PHASES,
  MISTERIO_SCHEMA_TABLES,
  MISTERIO_TABLE_RELATIONS,
} from '../../domain/config/misterio.config';
import type { MisterioHelpTab } from './MisterioCaseHeader';
import { MisterioSchemaDiagram } from './MisterioSchemaDiagram';

const TABS: { id: MisterioHelpTab; label: string }[] = [
  { id: 'caso', label: 'Caso' },
  { id: 'objetivos', label: 'Objetivos' },
  { id: 'tablas', label: 'Tablas' },
  { id: 'ayuda', label: 'Ayuda' },
  { id: 'entregar', label: 'Entregar respuesta' },
];

interface MisterioHelpPanelProps {
  open: boolean;
  activeTab: MisterioHelpTab;
  onTabChange: (tab: MisterioHelpTab) => void;
  onToggle: () => void;
  onLoadQuery: (sql: string) => void;
}

function TabCaso() {
  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        Ocurrió un asesinato el <strong>15 de enero de 2018</strong> en{' '}
        <strong>Ciudad SQL</strong>. Toda la evidencia está en la base{' '}
        <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">tesis_misterio</code>.
        Sigue este flujo con consultas SQL:
      </p>

      <div>
        <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Flujo de investigación
        </p>
        <ol className="relative space-y-0 border-l border-slate-200 pl-4 dark:border-slate-700">
          {MISTERIO_INVESTIGATION_FLOW.map((step, index) => (
            <li key={step.step} className={`relative pb-4 ${index === MISTERIO_INVESTIGATION_FLOW.length - 1 ? 'pb-0' : ''}`}>
              <span
                className="absolute -left-[1.35rem] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                aria-hidden
              >
                {step.step}
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{step.label}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                {step.description}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Tabla:{' '}
                <code className="rounded bg-slate-100 px-1 font-mono dark:bg-slate-800">{step.table}</code>
              </p>
            </li>
          ))}
        </ol>
      </div>

      <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        El caso tiene dos etapas: primero encuentra al asesino y luego a quien lo contrató. Revisa la
        pestaña <strong className="text-slate-600 dark:text-slate-300">Objetivos</strong> para más detalle.
      </p>
    </div>
  );
}

function TabObjetivos() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        El caso tiene dos etapas. Completa la primera para desbloquear la segunda.
      </p>
      {MISTERIO_INVESTIGATION_PHASES.map((phase) => (
        <article
          key={phase.etapa}
          className="rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60"
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Etapa {phase.etapa}
          </p>
          <h4 className="mt-0.5 font-semibold text-slate-900 dark:text-white">{phase.title}</h4>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            {phase.description}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            <span className="font-medium text-slate-700 dark:text-slate-300">Pista:</span>{' '}
            {phase.hint}
          </p>
        </article>
      ))}
    </div>
  );
}

function TabTablas() {
  const [selectedTable, setSelectedTable] = useState<string | null>(
    MISTERIO_SCHEMA_TABLES[0]?.tabla ?? null,
  );
  const active = MISTERIO_SCHEMA_TABLES.find((t) => t.tabla === selectedTable);

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-600 dark:text-slate-400">
        Selecciona una tabla para ver cuándo consultarla. La tabla central del caso es{' '}
        <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">persona</code>.
      </p>

      <div className="flex flex-wrap gap-1.5">
        {MISTERIO_SCHEMA_TABLES.map((item) => {
          const isActive = item.tabla === selectedTable;
          return (
            <button
              key={item.tabla}
              type="button"
              onClick={() => setSelectedTable(item.tabla)}
              className={`rounded-full border px-2.5 py-1 font-mono text-[11px] transition ${
                isActive
                  ? 'border-violet-500 bg-violet-600 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-violet-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {item.tabla}
            </button>
          );
        })}
      </div>

      {active ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/50">
          <p className="font-mono text-sm font-semibold text-violet-700 dark:text-violet-300">
            {active.tabla}
          </p>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{active.descripcion}</p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-600 dark:text-slate-300">Cuándo usarla:</span>{' '}
            {active.cuandoUsar}
          </p>
        </div>
      ) : null}

      <details className="rounded-lg border border-slate-200 dark:border-slate-700">
        <summary className="cursor-pointer px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-200">
          Relaciones entre tablas
        </summary>
        <ul className="space-y-1.5 border-t border-slate-200 px-4 py-3 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-400">
          {MISTERIO_TABLE_RELATIONS.map((relation) => (
            <li key={relation} className="flex gap-2">
              <span className="text-violet-500">→</span>
              <span>{relation}</span>
            </li>
          ))}
        </ul>
      </details>

      <details className="rounded-lg border border-slate-200 dark:border-slate-700">
        <summary className="cursor-pointer px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-200">
          Diagrama de la base de datos (ERD)
        </summary>
        <div className="border-t border-slate-200 p-3 dark:border-slate-700">
          <MisterioSchemaDiagram compact />
        </div>
      </details>
    </div>
  );
}

function TabAyuda({ onLoadQuery }: { onLoadQuery: (sql: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/50">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Cómo funciona</p>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
          Eres detective en Ciudad SQL. Escribe consultas SQL en el editor, pulsa{' '}
          <strong>Ejecutar consulta</strong> (o Shift + Enter) y lee los resultados para seguir las
          pistas. Usa JOIN cuando necesites combinar tablas.
        </p>
      </div>

      {MISTERIO_EXPERT_BLOCKS.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Consultas de apoyo
          </p>
          <ul className="space-y-2">
            {MISTERIO_EXPERT_BLOCKS.map((block) => (
              <li
                key={block.id}
                className="flex flex-col gap-2 rounded-lg border border-slate-200 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{block.title}</p>
                  <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">{block.body}</p>
                </div>
                {block.defaultSql ? (
                  <button
                    type="button"
                    onClick={() => onLoadQuery(block.defaultSql ?? '')}
                    className="shrink-0 rounded-lg border border-violet-300 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-50 dark:border-violet-800 dark:text-violet-300 dark:hover:bg-violet-950/30"
                  >
                    Cargar
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function TabEntregar() {
  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        Cuando creas saber quién es el culpable, escribe su nombre en la tabla{' '}
        <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">solucion</code> y ejecuta la
        consulta.
      </p>
      <pre className="overflow-x-auto rounded-lg bg-slate-950 p-3 font-mono text-xs leading-relaxed text-emerald-100">
        {`INSERT INTO solucion VALUES (1, 'Nombre Apellido');`}
      </pre>
      <ul className="list-disc space-y-1 pl-5 text-xs text-slate-600 dark:text-slate-400">
        <li>
          El número <strong>1</strong> indica tu respuesta (no lo cambies).
        </li>
        <li>
          Usa el nombre <strong>exacto</strong> de la tabla{' '}
          <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">persona</code>.
        </li>
        <li>Si aciertas al asesino, el caso te pedirá encontrar a la mente criminal.</li>
      </ul>
    </div>
  );
}

export const MisterioHelpPanel = forwardRef<HTMLElement, MisterioHelpPanelProps>(
  function MisterioHelpPanel(
    { open, activeTab, onTabChange, onToggle, onLoadQuery },
    ref,
  ) {
  return (
    <section
      ref={ref}
      className="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/80"
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-slate-900 dark:text-white">
          Panel de investigación
        </span>
        <span className="text-xs text-slate-500">{open ? 'Ocultar' : 'Mostrar ayuda'}</span>
      </button>

      {open ? (
        <div className="border-t border-slate-200 dark:border-slate-700">
          <div
            className="flex gap-1 overflow-x-auto border-b border-slate-200 px-3 py-2 dark:border-slate-700"
            role="tablist"
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="max-h-[28rem] overflow-y-auto p-4">
            {activeTab === 'caso' ? <TabCaso /> : null}
            {activeTab === 'objetivos' ? <TabObjetivos /> : null}
            {activeTab === 'tablas' ? <TabTablas /> : null}
            {activeTab === 'ayuda' ? <TabAyuda onLoadQuery={onLoadQuery} /> : null}
            {activeTab === 'entregar' ? <TabEntregar /> : null}
          </div>
        </div>
      ) : null}
    </section>
  );
  },
);
