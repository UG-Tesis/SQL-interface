/**
 * Contenido didáctico: DDL y DCL con ejemplos listos para pegar en MySQL Workbench.
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
    <section className="h-full rounded-lg border border-slate-200/90 bg-slate-50/80 p-5 shadow-sm">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="rounded-md bg-indigo-600 px-2 py-0.5 font-mono text-xs font-semibold uppercase tracking-wide text-white">
          {command}
        </span>
        <h5 className="text-base font-semibold text-slate-800">{title}</h5>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{definition}</p>
      <SqlWorkbenchBlock>{example}</SqlWorkbenchBlock>
    </section>
  );
}

function DclSection({
  command,
  title,
  definition,
}: {
  command: string;
  title: string;
  definition: string;
}) {
  return (
    <section className="h-full rounded-lg border border-slate-200/90 bg-slate-50/80 p-5 shadow-sm">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="rounded-md bg-violet-700 px-2 py-0.5 font-mono text-xs font-semibold uppercase tracking-wide text-white">
          {command}
        </span>
        <h5 className="text-base font-semibold text-slate-800">{title}</h5>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{definition}</p>
    </section>
  );
}

export function DdlTopicBody() {
  return (
    <div className="mt-5 space-y-8 border-t border-slate-200/80 pt-6">
      <header className="space-y-2">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-indigo-700">
          Data Definition Language (DDL)
        </h4>
        <p className="text-sm leading-relaxed text-slate-700">
          El <strong className="font-semibold text-slate-800">DDL</strong> es el subconjunto de SQL
          dedicado a definir y modificar la <strong className="font-semibold text-slate-800">estructura</strong>{' '}
          de la base de datos: tablas, índices, vistas u otros objetos. No opera sobre filas concretas
          de datos (eso corresponde al DML). Las sentencias DDL suelen ejecutarse en el área de consultas
          de <strong className="font-semibold text-slate-800">MySQL Workbench</strong>: escribes el script,
          seleccionas la conexión y el esquema, y ejecutas con el rayo o <kbd className="rounded border border-slate-300 bg-white px-1.5 py-0.5 font-mono text-xs">Ctrl</kbd> +{' '}
          <kbd className="rounded border border-slate-300 bg-white px-1.5 py-0.5 font-mono text-xs">Enter</kbd>.
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

      <div className="border-t border-slate-200/80 pt-8">
        <header className="space-y-2">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-violet-800">
            Data Control Language (DCL)
          </h4>
          <p className="text-sm leading-relaxed text-slate-700">
            El <strong className="font-semibold text-slate-800">DCL</strong> agrupa las sentencias que
            gestionan <strong className="font-semibold text-slate-800">permisos</strong> (privilegios) sobre
            bases, tablas, vistas u otros objetos: quién puede leer, escribir o administrar. En MySQL suele
            ejecutarse conectado como usuario con privilegios administrativos (por ejemplo{' '}
            <code className="rounded bg-slate-200/80 px-1 font-mono text-[11px]">root</code> o un rol con{' '}
            <code className="rounded bg-slate-200/80 px-1 font-mono text-[11px]">GRANT OPTION</code>).
          </p>
        </header>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch lg:gap-x-6 lg:gap-y-6">
          <DclSection
            command="GRANT"
            title="Otorgar privilegios"
            definition="Asigna permisos a un usuario o rol sobre objetos concretos (SELECT, INSERT, UPDATE, etc.) o sobre un esquema completo. En la práctica suele ir después de crear la cuenta de usuario si aún no existe. La forma habitual en MySQL enlaza la lista de privilegios, el objeto (tabla, vista o esquema) y el destino usuario@host; opcionalmente se puede indicar que ese usuario pueda a su vez conceder los mismos permisos a otros. Tras cambiar privilegios conviene aplicar la configuración con FLUSH PRIVILEGES cuando el servidor lo requiera."
          />

          <DclSection
            command="REVOKE"
            title="Quitar privilegios"
            definition="Retira permisos que antes se concedieron con GRANT, sobre el mismo tipo de objeto y para el mismo usuario@host. No borra la cuenta por sí sola: si la persona o aplicación ya no debe existir en el servidor, además se puede eliminar el usuario con la operación correspondiente. Igual que al otorgar permisos, a menudo se finaliza recargando privilegios cuando proceda."
          />
        </div>
      </div>

      <div className="border-t border-indigo-200/70 pt-8">
        <DdlMatchGame />
      </div>
    </div>
  );
}
