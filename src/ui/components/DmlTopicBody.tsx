import { DmlPracticeGame } from './DmlPracticeGame';
import { SqlWorkbenchBlock } from './SqlWorkbenchBlock';

function DmlSection({
  command,
  title,
  definition,
  example,
}: {
  command: string;
  title: string;
  definition: string;
  example: string;
}) {
  return (
    <section className="h-full rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm shadow-slate-200/40 dark:border-slate-600 dark:bg-slate-900/95 dark:shadow-none">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="rounded-md bg-cyan-600 px-2 py-0.5 font-mono text-xs font-semibold uppercase tracking-wide text-white">
          {command}
        </span>
        <h5 className="text-base font-semibold text-slate-800 dark:text-slate-100">{title}</h5>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{definition}</p>
      <SqlWorkbenchBlock>{example}</SqlWorkbenchBlock>
    </section>
  );
}

export function DmlTopicBody() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-cyan-800 dark:text-cyan-300">
          Data Manipulation Language (DML)
        </h4>
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          El <strong className="font-semibold text-slate-800 dark:text-slate-100">DML</strong> permite{' '}
          <strong className="font-semibold text-slate-800 dark:text-slate-100">añadir, modificar y borrar filas</strong> dentro
          de tablas ya existentes. Opera sobre los datos, no sobre la definición de la tabla (eso es DDL).
          En <strong className="font-semibold text-slate-800 dark:text-slate-100">MySQL Workbench</strong> escribes las
          sentencias en el editor SQL, eliges el esquema y ejecutas como en el resto del curso.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        <DmlSection
          command="INSERT"
          title="Insertar filas nuevas"
          definition="Agrega uno o varios registros a una tabla. Puedes listar las columnas a llenar y los valores en el mismo orden, o insertar filas múltiples en una sola sentencia."
          example={`USE tienda_curso;

-- Una fila: columnas explícitas (recomendado)
INSERT INTO cliente (nombre, email, telefono)
VALUES ('María López', 'maria@ejemplo.com', '0990000000');

-- Varias filas en un solo INSERT
INSERT INTO cliente (nombre, email)
VALUES
  ('Ana Ruiz', 'ana@ejemplo.com'),
  ('Luis Paz', 'luis@ejemplo.com');`}
        />

        <DmlSection
          command="UPDATE"
          title="Modificar filas existentes"
          definition="Cambia el valor de una columna en una fila que ya existe. Indicas qué columna modificas con SET y qué fila tocar con WHERE, normalmente usando el id del registro."
          example={`USE tienda_curso;

-- Cambiar el teléfono del cliente 1
UPDATE cliente
SET telefono = '0991111222'
WHERE id_cliente = 1;

-- Cambiar el email del cliente 2
UPDATE cliente
SET email = 'nuevo@ejemplo.com'
WHERE id_cliente = 2;`}
        />

        <DmlSection
          command="DELETE"
          title="Eliminar filas"
          definition="Quita filas que cumplan la condición indicada. Sin WHERE, la sentencia borraría todas las filas de la tabla (riesgo alto); úsalo solo cuando sea intencional."
          example={`USE tienda_curso;

-- Borrar un registro por clave
DELETE FROM cliente
WHERE id_cliente = 99;

-- ¡Cuidado! Sin WHERE se vacía la tabla de filas:
-- DELETE FROM cliente;`}
        />
      </div>

      <div className="border-t border-cyan-100/80 pt-8 dark:border-slate-700">
        <DmlPracticeGame />
      </div>
    </div>
  );
}
