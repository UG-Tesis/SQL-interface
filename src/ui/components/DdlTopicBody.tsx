/**
 * Contenido didáctico: DDL con ejemplos listos para pegar en MySQL Workbench.
 */
import { DdlMatchGame } from './DdlMatchGame';
import { SqlWorkbenchBlock } from './SqlWorkbenchBlock';

function DdlSection({
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

export function DdlTopicBody() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-cyan-800 dark:text-cyan-300">
          Data Definition Language (DDL)
        </h4>
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          El <strong className="font-semibold text-slate-800 dark:text-slate-100">DDL</strong> define la{' '}
          <strong className="font-semibold text-slate-800 dark:text-slate-100">estructura</strong> de la base de datos:
          bases de datos, tablas y columnas. No inserta ni modifica filas de datos; eso lo hace el DML. En este módulo
          trabajarás con cuatro comandos: <strong className="font-semibold text-slate-800 dark:text-slate-100">CREATE</strong>,{' '}
          <strong className="font-semibold text-slate-800 dark:text-slate-100">ALTER</strong>,{' '}
          <strong className="font-semibold text-slate-800 dark:text-slate-100">DROP</strong> y{' '}
          <strong className="font-semibold text-slate-800 dark:text-slate-100">TRUNCATE</strong>.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        <DdlSection
          command="CREATE"
          title="Crear base de datos y tablas"
          definition="Sirve para crear objetos nuevos. Con CREATE DATABASE defines el esquema donde guardarás tus tablas. Con CREATE TABLE defines el nombre de la tabla y sus columnas con su tipo de dato."
          example={`-- Crear la base de datos
CREATE DATABASE tienda_curso;

USE tienda_curso;

-- Crear la tabla cliente
CREATE TABLE cliente (
  id_cliente INT,
  nombre VARCHAR(80),
  email VARCHAR(120)
);`}
        />

        <DdlSection
          command="ALTER"
          title="Modificar una tabla existente"
          definition="Cambia la estructura de una tabla que ya existe, sin borrarla. El uso más común es agregar una columna nueva con ADD COLUMN."
          example={`USE tienda_curso;

-- Agregar la columna telefono a la tabla cliente
ALTER TABLE cliente
ADD COLUMN telefono VARCHAR(20);`}
        />

        <DdlSection
          command="DROP"
          title="Eliminar una tabla"
          definition="Borra por completo una tabla del servidor, incluyendo su estructura y todos los datos que tenía. Úsalo solo cuando ya no necesites esa tabla."
          example={`USE tienda_curso;

-- Eliminar la tabla cliente
DROP TABLE cliente;`}
        />

        <DdlSection
          command="TRUNCATE"
          title="Vaciar una tabla"
          definition="Elimina todas las filas de una tabla, pero deja la tabla creada con sus columnas. La estructura se mantiene; solo queda vacía de datos."
          example={`USE tienda_curso;

-- Borrar todas las filas de cliente, la tabla sigue existiendo
TRUNCATE TABLE cliente;`}
        />
      </div>

      <div className="border-t border-cyan-100/80 pt-8 dark:border-slate-700">
        <DdlMatchGame />
      </div>
    </div>
  );
}
