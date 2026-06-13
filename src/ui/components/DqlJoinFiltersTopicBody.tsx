import { SqlWorkbenchBlock } from './SqlWorkbenchBlock';

function DqlJoinFiltersSection({
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

export function DqlJoinFiltersTopicBody() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-cyan-800 dark:text-cyan-300">
          FROM avanzado
        </h4>
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Hasta ahora el <code className="rounded bg-slate-200/80 px-1 font-mono text-[11px] dark:bg-slate-700 dark:text-slate-200">FROM</code> leía
          datos de <strong className="font-semibold text-slate-800 dark:text-slate-100">una sola tabla</strong>. Con{' '}
          <strong className="font-semibold text-slate-800 dark:text-slate-100">JOIN</strong> puedes combinar filas de dos tablas
          relacionadas, por ejemplo clientes y sus pedidos, usando una columna en común.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        <DqlJoinFiltersSection
          command="JOIN"
          title="Unir dos tablas relacionadas"
          definition="Combina filas de dos tablas cuando coinciden en una columna de relación. La condición va después de ON e indica qué columnas enlazar (por ejemplo, el id del cliente en ambas tablas). Solo aparecen las filas que tienen coincidencia en las dos tablas."
          example={`USE tienda_curso;

-- Cliente y fecha de cada pedido que le pertenece
SELECT cliente.nombre, pedido.fecha
FROM cliente
JOIN pedido ON cliente.id_cliente = pedido.id_cliente;`}
        />
      </div>

      <div className="border-t border-cyan-100/80 pt-8 dark:border-slate-700">
        <header className="mb-6 space-y-2">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-cyan-800 dark:text-cyan-300">
            WHERE avanzado
          </h4>
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            El <code className="rounded bg-slate-200/80 px-1 font-mono text-[11px] dark:bg-slate-700 dark:text-slate-200">WHERE</code> filtra
            filas según condiciones. En este módulo verás operadores de comparación, lógicos, de rango, de lista y de patrones
            para construir filtros más precisos.
          </p>
        </header>

        <div className="flex flex-col gap-6">
          <DqlJoinFiltersSection
            command="="
            title="Igual a"
            definition="Compara si el valor de una columna es exactamente igual al valor indicado. Devuelve las filas donde la comparación es verdadera."
            example={`USE tienda_curso;

SELECT nombre, email
FROM cliente
WHERE id_cliente = 1;`}
          />

          <DqlJoinFiltersSection
            command="<"
            title="Menor que"
            definition="Compara si el valor de una columna es menor que el número indicado. Muy usado con columnas numéricas como precio o cantidad."
            example={`USE tienda_curso;

SELECT nombre, precio
FROM producto
WHERE precio < 20;`}
          />

          <DqlJoinFiltersSection
            command=">"
            title="Mayor que"
            definition="Compara si el valor de una columna es mayor que el número indicado. Sirve para listar productos por encima de un precio, por ejemplo."
            example={`USE tienda_curso;

SELECT nombre, precio
FROM producto
WHERE precio > 50;`}
          />

          <DqlJoinFiltersSection
            command="!="
            title="Distinto de"
            definition="Compara si el valor de una columna es diferente al indicado. Devuelve las filas que no tienen exactamente ese valor."
            example={`USE tienda_curso;

SELECT nombre, email
FROM cliente
WHERE id_cliente != 1;`}
          />

          <DqlJoinFiltersSection
            command="AND"
            title="Y lógico"
            definition="Exige que se cumplan todas las condiciones unidas con AND. La fila solo aparece si cada parte de la condición es verdadera."
            example={`USE tienda_curso;

SELECT nombre, precio
FROM producto
WHERE precio > 10
  AND precio < 100;`}
          />

          <DqlJoinFiltersSection
            command="OR"
            title="O lógico"
            definition="Basta con que se cumpla al menos una de las condiciones unidas con OR. La fila aparece si cualquiera de las comparaciones es verdadera."
            example={`USE tienda_curso;

SELECT nombre, email
FROM cliente
WHERE id_cliente = 1
   OR id_cliente = 2;`}
          />

          <DqlJoinFiltersSection
            command="NOT"
            title="Negación"
            definition="Invierte una condición: devuelve las filas donde la expresión que sigue a NOT es falsa. Útil para excluir un valor concreto."
            example={`USE tienda_curso;

SELECT nombre, email
FROM cliente
WHERE NOT id_cliente = 1;`}
          />

          <DqlJoinFiltersSection
            command="BETWEEN"
            title="Entre dos valores"
            definition="Comprueba si un valor está dentro de un rango, incluyendo los extremos. Equivale a usar mayor o igual que el mínimo y menor o igual que el máximo."
            example={`USE tienda_curso;

SELECT nombre, precio
FROM producto
WHERE precio BETWEEN 10 AND 50;`}
          />

          <DqlJoinFiltersSection
            command="IN"
            title="Dentro de una lista"
            definition="Comprueba si el valor de una columna aparece en la lista indicada entre paréntesis. Es una forma compacta de escribir varias comparaciones con OR."
            example={`USE tienda_curso;

SELECT nombre, email
FROM cliente
WHERE id_cliente IN (1, 2, 3);`}
          />

          <DqlJoinFiltersSection
            command="LIKE"
            title="Buscar por patrón de texto"
            definition="Filtra columnas de texto que coinciden con un patrón. El símbolo % representa cualquier cantidad de caracteres (incluso ninguno). El símbolo _ representa exactamente un carácter."
            example={`USE tienda_curso;

-- %: emails que terminan en @ejemplo.com
SELECT nombre, email
FROM cliente
WHERE email LIKE '%@ejemplo.com';

-- _: nombres de tres letras que empiezan con A y terminan con a (por ejemplo, Ana)
SELECT nombre
FROM cliente
WHERE nombre LIKE 'A_a';`}
          />
        </div>
      </div>
    </div>
  );
}
