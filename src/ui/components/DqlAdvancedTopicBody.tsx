import { SqlWorkbenchBlock } from './SqlWorkbenchBlock';

function DqlAdvancedSection({
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

export function DqlAdvancedTopicBody() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-cyan-800 dark:text-cyan-300">
          DQL avanzado
        </h4>
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Sobre la base de <code className="rounded bg-slate-200/80 px-1 font-mono text-[11px] dark:bg-slate-700 dark:text-slate-200">SELECT</code>,{' '}
          <code className="rounded bg-slate-200/80 px-1 font-mono text-[11px] dark:bg-slate-700 dark:text-slate-200">FROM</code> y{' '}
          <code className="rounded bg-slate-200/80 px-1 font-mono text-[11px] dark:bg-slate-700 dark:text-slate-200">WHERE</code>, este módulo
          amplía las consultas para <strong className="font-semibold text-slate-800 dark:text-slate-100">ordenar resultados</strong>,{' '}
          <strong className="font-semibold text-slate-800 dark:text-slate-100">agrupar filas</strong>,{' '}
          <strong className="font-semibold text-slate-800 dark:text-slate-100">limitar cuántas filas se devuelven</strong> y calcular{' '}
          <strong className="font-semibold text-slate-800 dark:text-slate-100">resúmenes numéricos</strong> con funciones de agregación.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        <DqlAdvancedSection
          command="ORDER BY"
          title="Ordenar el resultado"
          definition="Indica en qué orden se muestran las filas devueltas. Se escribe después de FROM y WHERE. Puedes ordenar por una o varias columnas, de forma ascendente (ASC, de menor a mayor) o descendente (DESC, de mayor a menor). Si no indicas ASC ni DESC, el orden por defecto es ascendente."
          example={`USE tienda_curso;

-- Del precio más bajo al más alto
SELECT nombre, precio
FROM producto
ORDER BY precio ASC;

-- Del precio más alto al más bajo
SELECT nombre, precio
FROM producto
ORDER BY precio DESC;`}
        />

        <DqlAdvancedSection
          command="GROUP BY"
          title="Agrupar filas con el mismo valor"
          definition="Reúne filas que comparten el mismo valor en una o más columnas y devuelve una fila por cada grupo. Suele usarse junto a funciones de agregación (COUNT, SUM, AVG, etc.). En el SELECT deben aparecer las columnas del GROUP BY o expresiones agregadas."
          example={`USE tienda_curso;

-- Cuántos productos hay por cada precio
SELECT precio, COUNT(*)
FROM producto
GROUP BY precio;`}
        />

        <DqlAdvancedSection
          command="LIMIT"
          title="Limitar cuántas filas se devuelven"
          definition="Acota el número de filas del resultado. Es útil para ver solo los primeros registros sin cargar toda la tabla. Suele combinarse con ORDER BY para obtener, por ejemplo, los 3 productos más caros o los 5 más baratos."
          example={`USE tienda_curso;

-- Los 3 productos con mayor precio
SELECT nombre, precio
FROM producto
ORDER BY precio DESC
LIMIT 3;`}
        />
      </div>

      <div className="border-t border-cyan-100/80 pt-8 dark:border-slate-700">
        <header className="mb-6 space-y-2">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-cyan-800 dark:text-cyan-300">
            Agregación
          </h4>
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            Las funciones de agregación calculan un <strong className="font-semibold text-slate-800 dark:text-slate-100">único valor</strong> a
            partir de varias filas: contar registros, sumar importes, obtener promedios o localizar el valor máximo y mínimo de una columna.
          </p>
        </header>

        <div className="flex flex-col gap-6">
          <DqlAdvancedSection
            command="COUNT"
            title="Contar filas o valores"
            definition="Devuelve cuántos registros hay. COUNT(*) cuenta todas las filas de la consulta, incluso si alguna columna tiene NULL. COUNT(columna) cuenta solo las filas donde esa columna no es NULL."
            example={`USE tienda_curso;

-- Total de productos en la tabla
SELECT COUNT(*)
FROM producto;

-- Cuántos productos tienen precio registrado
SELECT COUNT(precio)
FROM producto;`}
          />

          <DqlAdvancedSection
            command="SUM"
            title="Sumar valores"
            definition="Suma los valores numéricos de una columna en todas las filas que devuelve la consulta. Ignora los NULL. Sirve para obtener totales, por ejemplo la suma de todos los precios listados."
            example={`USE tienda_curso;

-- Suma de todos los precios de la tabla producto
SELECT SUM(precio)
FROM producto;`}
          />

          <DqlAdvancedSection
            command="AVG"
            title="Promedio de valores"
            definition="Calcula el promedio (media aritmética) de una columna numérica. Solo considera filas con valor no nulo en esa columna. Útil para conocer el precio medio de un conjunto de productos."
            example={`USE tienda_curso;

-- Precio promedio de los productos
SELECT AVG(precio)
FROM producto;`}
          />

          <DqlAdvancedSection
            command="MAX"
            title="Valor máximo"
            definition="Devuelve el valor más alto de la columna indicada entre las filas del resultado. En columnas numéricas encuentra el mayor número; en texto, el valor que va último en orden alfabético."
            example={`USE tienda_curso;

-- Precio más alto registrado
SELECT MAX(precio)
FROM producto;`}
          />

          <DqlAdvancedSection
            command="MIN"
            title="Valor mínimo"
            definition="Devuelve el valor más bajo de la columna indicada entre las filas del resultado. En columnas numéricas encuentra el menor número; en texto, el valor que va primero en orden alfabético."
            example={`USE tienda_curso;

-- Precio más bajo registrado
SELECT MIN(precio)
FROM producto;`}
          />
        </div>
      </div>
    </div>
  );
}
