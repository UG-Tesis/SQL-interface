import {
  MISTERIO_GAME_RULES,
  MISTERIO_INVESTIGATION_PHASES,
  MISTERIO_QUICK_START,
  MISTERIO_SCHEMA_TABLES,
  MISTERIO_TABLE_RELATIONS,
} from '../../domain/config/misterio.config';
import { MisterioSchemaDiagram } from './MisterioSchemaDiagram';

export function MisterioHowToPlay() {
  return (
    <section className="rounded-2xl border border-cyan-200 bg-cyan-50/70 p-5 dark:border-cyan-900/50 dark:bg-cyan-950/20">
      <h3 className="text-base font-bold text-slate-900 dark:text-white">
        ¿Cómo funciona este juego?
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        Eres detective en <strong>Ciudad SQL</strong>. Toda la información del caso está en una base
        de datos: informes policiales, entrevistas, registros del gimnasio, licencias de conducir,
        etc. Tu herramienta es <strong>SQL</strong>: escribes consultas, lees los resultados y vas
        descubriendo pistas hasta encontrar al culpable.
      </p>

      <ol className="mt-4 space-y-3">
        {MISTERIO_GAME_RULES.map((rule, index) => (
          <li key={rule.title} className="flex gap-3 text-sm">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-600 text-xs font-bold text-white">
              {index + 1}
            </span>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">{rule.title}</p>
              <p className="mt-0.5 leading-relaxed text-slate-600 dark:text-slate-400">
                {rule.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function MisterioObjectives() {
  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 dark:border-amber-900/40 dark:bg-amber-950/20">
      <h3 className="text-base font-bold text-slate-900 dark:text-white">Objetivo del misterio</h3>
      <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
        El caso tiene <strong>dos etapas</strong>. Debes completar la primera para entender la
        segunda.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {MISTERIO_INVESTIGATION_PHASES.map((phase) => (
          <article
            key={phase.etapa}
            className="rounded-xl border border-amber-200/80 bg-white/80 p-4 dark:border-amber-900/30 dark:bg-slate-900/60"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Etapa {phase.etapa}
            </p>
            <h4 className="mt-1 font-semibold text-slate-900 dark:text-white">{phase.title}</h4>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {phase.description}
            </p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
              Pista: {phase.hint}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function MisterioQuickStart({ onLoadQuery }: { onLoadQuery: (sql: string) => void }) {
  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/15">
      <h3 className="text-base font-bold text-slate-900 dark:text-white">
        Empieza aquí (primera consulta)
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        {MISTERIO_QUICK_START.explanation}
      </p>
      <button
        type="button"
        onClick={() => onLoadQuery(MISTERIO_QUICK_START.sql)}
        className="mt-3 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
      >
        {MISTERIO_QUICK_START.buttonLabel}
      </button>
      <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
        Después de cargar la consulta, presiona <strong>Ejecutar consulta</strong> (o Shift +
        Enter). Lee la columna <code className="rounded bg-emerald-100 px-1 dark:bg-emerald-900/40">descripcion</code>{' '}
        del resultado: ahí están las primeras pistas.
      </p>
    </section>
  );
}

export function MisterioSchemaGuide() {
  return (
    <div className="space-y-4">
      <MisterioSchemaDiagram />

      <details
        open
        className="rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50"
      >
        <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
          Guía por tabla (¿qué consulto y cuándo?)
        </summary>
        <div className="space-y-4 border-t border-slate-200 px-4 py-4 dark:border-slate-700">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Cada tabla guarda un tipo de dato del caso. Las tablas se conectan entre sí (por ejemplo,
          <code className="mx-1 rounded bg-slate-200 px-1 dark:bg-slate-800">persona</code> con{' '}
          <code className="rounded bg-slate-200 px-1 dark:bg-slate-800">entrevista</code>).
        </p>

        <ul className="space-y-2 text-sm">
          {MISTERIO_SCHEMA_TABLES.map((item) => (
            <li
              key={item.tabla}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900/80"
            >
              <div className="flex flex-wrap items-baseline gap-2">
                <code className="font-mono text-violet-700 dark:text-violet-300">{item.tabla}</code>
                <span className="text-slate-700 dark:text-slate-300">{item.descripcion}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Cuándo usarla: {item.cuandoUsar}
              </p>
            </li>
          ))}
        </ul>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Relaciones importantes
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
            {MISTERIO_TABLE_RELATIONS.map((relation) => (
              <li key={relation} className="flex gap-2">
                <span className="text-violet-500">→</span>
                <span>{relation}</span>
              </li>
            ))}
          </ul>
        </div>
        </div>
      </details>
    </div>
  );
}

export function MisterioVerifyHelp() {
  return (
    <section className="rounded-2xl border border-violet-200 bg-violet-50/40 p-5 dark:border-violet-900/40 dark:bg-violet-950/15">
      <h3 className="text-base font-bold text-slate-900 dark:text-white">
        ¿Cómo entrego mi respuesta?
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        Cuando creas saber quién es el culpable, escribe su nombre completo en la tabla{' '}
        <code className="rounded bg-violet-100 px-1 dark:bg-violet-900/40">solucion</code> y
        ejecuta la consulta. El sistema te dirá si acertaste o debes seguir investigando.
      </p>
      <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-950 p-3 font-mono text-xs leading-relaxed text-emerald-100">
        {`INSERT INTO solucion VALUES (1, 'Nombre Apellido');`}
      </pre>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-slate-600 dark:text-slate-400">
        <li>
          El número <strong>1</strong> indica que estás enviando tu respuesta (no lo cambies).
        </li>
        <li>
          Escribe el nombre <strong>exactamente</strong> como aparece en la tabla{' '}
          <code className="rounded bg-slate-200 px-1 dark:bg-slate-800">persona</code>.
        </li>
        <li>
          Si aciertas al asesino, el mensaje te pedirá investigar más para encontrar a la mente
          criminal.
        </li>
      </ul>
    </section>
  );
}
