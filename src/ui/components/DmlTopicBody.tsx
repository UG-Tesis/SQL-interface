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
    <section className="h-full rounded-lg border border-slate-200/90 bg-slate-50/80 p-5 shadow-sm">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="rounded-md bg-teal-600 px-2 py-0.5 font-mono text-xs font-semibold uppercase tracking-wide text-white">
          {command}
        </span>
        <h5 className="text-base font-semibold text-slate-800">{title}</h5>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{definition}</p>
      <SqlWorkbenchBlock>{example}</SqlWorkbenchBlock>
    </section>
  );
}

export function DmlTopicBody() {
  return (
    <div className="mt-5 space-y-8 border-t border-slate-200/80 pt-6">
      <header className="space-y-2">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-teal-800">
          Data Manipulation Language (DML)
        </h4>
        <p className="text-sm leading-relaxed text-slate-700">
          El <strong className="font-semibold text-slate-800">DML</strong> permite{' '}
          <strong className="font-semibold text-slate-800">añadir, modificar y borrar filas</strong> dentro
          de tablas ya existentes. Opera sobre los datos, no sobre la definición de la tabla (eso es DDL).
          En <strong className="font-semibold text-slate-800">MySQL Workbench</strong> escribes las
          sentencias en el editor SQL, eliges el esquema y ejecutas como en el resto del curso.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-stretch lg:gap-x-6 lg:gap-y-6">
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
          definition="Cambia valores de columnas en las filas que cumplan una condición. Casi siempre debe ir acompañado de WHERE para no actualizar toda la tabla por error."
          example={`USE tienda_curso;

-- Corregir un teléfono para un cliente concreto
UPDATE cliente
SET telefono = '0991111222'
WHERE id_cliente = 1;

-- Actualizar varias filas que cumplan el filtro
UPDATE cliente
SET email = LOWER(TRIM(email))
WHERE email IS NOT NULL;`}
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

      <div className="border-t border-slate-200/80 pt-8">
        <DmlPracticeGame />
      </div>
    </div>
  );
}
