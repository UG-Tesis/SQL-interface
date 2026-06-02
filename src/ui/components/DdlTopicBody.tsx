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
          El <strong className="font-semibold text-slate-800 dark:text-slate-100">DDL</strong> es el subconjunto de SQL
          dedicado a definir y modificar la <strong className="font-semibold text-slate-800 dark:text-slate-100">estructura</strong>{' '}
          de la base de datos: tablas, índices, vistas u otros objetos. No opera sobre filas concretas
          de datos (eso corresponde al DML). Las sentencias DDL suelen ejecutarse en el área de consultas
          de <strong className="font-semibold text-slate-800 dark:text-slate-100">MySQL Workbench</strong>: escribes el script,
          seleccionas la conexión y el esquema, y ejecutas con el rayo o <kbd className="rounded border border-slate-300 bg-white px-1.5 py-0.5 font-mono text-xs dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">Ctrl</kbd> +{' '}
          <kbd className="rounded border border-slate-300 bg-white px-1.5 py-0.5 font-mono text-xs dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">Enter</kbd>.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch lg:gap-x-6 lg:gap-y-6">
        <DdlSection
          command="CREATE"
          title="Crear objetos en el servidor"
          definition="Crea bases de datos, tablas, índices u otros objetos. En tablas se declaran columnas, tipos de datos y restricciones (clave primaria, no nulo, etc.)."
          example={`-- Crear base de datos (si no existe) y usarla
CREATE DATABASE IF NOT EXISTS tienda_curso
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE tienda_curso;

-- Crear tabla con restricciones típicas
CREATE TABLE IF NOT EXISTS cliente (
  id_cliente INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(80) NOT NULL,
  email VARCHAR(120) NOT NULL,
  fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_cliente),
  UNIQUE KEY uq_cliente_email (email)
) ENGINE=InnoDB;`}
        />

        <DdlSection
          command="ALTER"
          title="Cambiar la estructura de un objeto existente"
          definition="Modifica tablas ya creadas: agregar o eliminar columnas, cambiar tipos, añadir claves o renombrar. Útil cuando el modelo evoluciona sin perder la tabla completa."
          example={`USE tienda_curso;

-- Agregar una columna
ALTER TABLE cliente
  ADD COLUMN telefono VARCHAR(20) NULL AFTER email;

-- Agregar un índice para acelerar búsquedas por nombre
ALTER TABLE cliente
  ADD INDEX idx_cliente_nombre (nombre);

-- Cambiar tipo o tamaño de una columna (ajusta según tus datos)
ALTER TABLE cliente
  MODIFY COLUMN telefono VARCHAR(32) NULL;`}
        />

        <DdlSection
          command="DROP"
          title="Eliminar objetos del servidor"
          definition="Elimina por completo un objeto (tabla, base de datos, índice, vista, etc.). Es una operación destructiva; conviene usar respaldo o entornos de prueba antes de ejecutar en producción."
          example={`USE tienda_curso;

-- Eliminar solo un índice
ALTER TABLE cliente
  DROP INDEX idx_cliente_nombre;

-- Eliminar la tabla completa (y sus datos)
DROP TABLE IF EXISTS cliente;

-- Eliminar la base de datos completa (¡muy destructivo!)
-- DROP DATABASE IF EXISTS tienda_curso;`}
        />

        <DdlSection
          command="TRUNCATE"
          title="Vaciar una tabla rápidamente"
          definition="Elimina todas las filas de la tabla pero conserva la estructura (columnas, índices). En InnoDB suele ser más rápido que DELETE sin WHERE para vaciar todo; reinicia el contador AUTO_INCREMENT. No uses TRUNCATE si necesitas disparadores DELETE por fila o eliminar solo un subconjunto."
          example={`USE tienda_curso;

-- Vaciar la tabla: queda sin filas, la definición se mantiene
TRUNCATE TABLE cliente;

-- Equivalente conceptual a borrar todas las filas (más lento en tablas grandes):
-- DELETE FROM cliente;`}
        />
      </div>

      <div className="border-t border-cyan-100/80 pt-8 dark:border-slate-700">
        <DdlMatchGame />
      </div>
    </div>
  );
}
