import { SqlWorkbenchBlock } from './SqlWorkbenchBlock';

function DqlSection({
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

export function DqlTopicBody() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-cyan-800 dark:text-cyan-300">
          Data Query Language (DQL)
        </h4>
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          El <strong className="font-semibold text-slate-800 dark:text-slate-100">DQL</strong> es el subconjunto de SQL dedicado a{' '}
          <strong className="font-semibold text-slate-800 dark:text-slate-100">consultar y leer datos</strong> sin modificarlos.
          La forma habitual es la sentencia <code className="rounded bg-slate-200/80 px-1 font-mono text-[11px] dark:bg-slate-700 dark:text-slate-200">SELECT</code>, que
          indica qué columnas o expresiones mostrar; <code className="rounded bg-slate-200/80 px-1 font-mono text-[11px] dark:bg-slate-700 dark:text-slate-200">FROM</code>{' '}
          indica de qué tabla (o tablas) provienen las filas; y <code className="rounded bg-slate-200/80 px-1 font-mono text-[11px] dark:bg-slate-700 dark:text-slate-200">WHERE</code>{' '}
          filtra las filas que cumplen una condición. En <strong className="font-semibold text-slate-800 dark:text-slate-100">MySQL Workbench</strong> se
          ejecuta igual que el resto del curso: eliges el esquema, escribes la consulta y ejecutas.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-stretch lg:gap-x-6 lg:gap-y-6">
        <DqlSection
          command="SELECT"
          title="Qué columnas o expresiones devolver"
          definition="Lista las columnas que quieres ver, expresiones calculadas o funciones aplicadas a los datos. El resultado es un conjunto de filas (result set) con tantas columnas como expresiones indiques en la lista."
          example={`USE tienda_curso;

-- Todas las columnas de la tabla cliente
SELECT *
FROM cliente;

-- Solo algunas columnas (orden personalizado)
SELECT nombre, email, fecha_registro
FROM cliente;`}
        />

        <DqlSection
          command="FROM"
          title="De dónde salen las filas"
          definition="Indica la tabla (o, en temas avanzados, varias tablas unidas) sobre la que se evalúa la consulta. Sin FROM válido no hay filas que recorrer; es el origen del dataset antes de filtrar con WHERE."
          example={`USE tienda_curso;

-- Mínimo habitual: una tabla en FROM
SELECT id_cliente, nombre
FROM cliente;

-- Alias de tabla: útil en consultas más largas (c = cliente)
SELECT c.nombre, c.email
FROM cliente AS c;`}
        />

        <DqlSection
          command="WHERE"
          title="Filtrar filas por condición"
          definition="Solo se devuelven las filas que cumplen la condición booleana. Combina comparaciones (=, menor que, mayor que, distinto, etc.) y operadores lógicos (AND, OR, NOT). Sin WHERE, se consideran todas las filas de la tabla indicada en FROM."
          example={`USE tienda_curso;

-- Un criterio
SELECT nombre, email
FROM cliente
WHERE id_cliente = 1;

-- Varios criterios a la vez
SELECT nombre, telefono
FROM cliente
WHERE email LIKE '%@ejemplo.com'
  AND telefono IS NOT NULL;`}
        />
      </div>

      <div className="border-t border-cyan-100/80 pt-8 dark:border-slate-700">
        <header className="mb-6 space-y-2">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-cyan-800 dark:text-cyan-300">
            Comandos básicos del SELECT
          </h4>
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            Además de listar columnas tal cual en la tabla, el <strong className="font-semibold text-slate-800 dark:text-slate-100">SELECT</strong> permite
            el comodín <strong className="font-semibold text-slate-800 dark:text-slate-100">*</strong>, elegir columnas concretas, renombrar resultados con{' '}
            <strong className="font-semibold text-slate-800 dark:text-slate-100">AS</strong> y construir valores calculados con operadores aritméticos.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch lg:gap-x-6 lg:gap-y-6">
          <DqlSection
            command="*"
            title="Comodín universal"
            definition="Sustituye a la lista de todas las columnas de las tablas del FROM en el orden definido en el catálogo. Es cómodo para explorar, pero en producción suele preferirse nombrar columnas explícitas (menos datos transferidos y código más estable si cambia la tabla)."
            example={`USE tienda_curso;

SELECT *
FROM cliente
LIMIT 10;`}
          />

          <DqlSection
            command="columnas"
            title="Columnas específicas"
            definition="Indicas exactamente qué campos necesitas, en el orden en que quieres verlos en el resultado. Puedes repetir lógica en expresiones o combinar columnas de la misma fila."
            example={`USE tienda_curso;

SELECT
  id_cliente,
  nombre,
  email,
  fecha_registro
FROM cliente;`}
          />

          <DqlSection
            command="AS"
            title="Alias de columna o de tabla"
            definition="AS asigna un nombre alternativo a una columna del resultado (alias visible en el encabezado) o a la tabla en FROM para acortar referencias. La palabra AS es opcional en muchos casos, pero dejarla explícita mejora la lectura."
            example={`USE tienda_curso;

SELECT
  nombre AS nombre_cliente,
  email AS correo
FROM cliente AS c
WHERE c.id_cliente > 0;`}
          />

          <DqlSection
            command="+, -, *, /"
            title="Operadores matemáticos"
            definition="En la lista del SELECT puedes usar +, -, * y / sobre valores numéricos o columnas numéricas para obtener columnas calculadas. Respeta la precedencia de operadores y usa paréntesis cuando mezcles operaciones."
            example={`USE tienda_curso;

SELECT
  id_cliente,
  id_cliente * 10 AS id_x_10,
  (100 + 25) / 5 AS literal_calculado,
  CHAR_LENGTH(nombre) + CHAR_LENGTH(IFNULL(telefono, '')) AS longitud_textos
FROM cliente;`}
          />
        </div>
      </div>
    </div>
  );
}
