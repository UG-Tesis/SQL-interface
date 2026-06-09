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

      <div className="flex flex-col gap-6">
        <DqlSection
          command="SELECT"
          title="Qué columnas o expresiones devolver"
          definition="Lista las columnas que quieres ver o expresiones calculadas con operadores aritméticos. El resultado es un conjunto de filas (result set) con tantas columnas como expresiones indiques en la lista."
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
          definition="Indica la tabla sobre la que se ejecuta la consulta. SELECT dice qué columnas quieres ver; FROM dice en qué tabla están esas columnas. Si la tabla no existe o el nombre está mal escrito, MySQL devuelve un error. Sin FROM no hay filas que leer. En módulos posteriores verás cómo combinar varias tablas; aquí basta con indicar una."
          example={`USE tienda_curso;

-- Leer columnas de la tabla cliente
SELECT id_cliente, nombre
FROM cliente;

-- Cambiar la tabla en FROM cambia el origen de los datos
SELECT id_producto, nombre, precio
FROM producto;

-- FROM va después de SELECT y antes de WHERE (si lo usas)
SELECT nombre, email
FROM cliente
WHERE id_cliente = 1;`}
        />

        <DqlSection
          command="WHERE"
          title="Filtrar filas por condición"
          definition="Solo se devuelven las filas que cumplen la condición indicada. Puedes usar comparaciones simples (=, menor que, mayor que, distinto, etc.). Sin WHERE, se consideran todas las filas de la tabla indicada en FROM."
          example={`USE tienda_curso;

-- Igualdad
SELECT nombre, email
FROM cliente
WHERE id_cliente = 1;

-- Comparación numérica
SELECT nombre, precio
FROM producto
WHERE precio > 10;`}
        />
      </div>

      <div className="border-t border-cyan-100/80 pt-8 dark:border-slate-700">
        <header className="mb-6 space-y-2">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-cyan-800 dark:text-cyan-300">
            Comandos básicos del SELECT
          </h4>
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            Además de listar columnas tal cual en la tabla, el <strong className="font-semibold text-slate-800 dark:text-slate-100">SELECT</strong> permite
            el comodín <strong className="font-semibold text-slate-800 dark:text-slate-100">*</strong>, elegir columnas concretas y construir valores
            calculados con operadores aritméticos (<strong className="font-semibold text-slate-800 dark:text-slate-100">+</strong>,{' '}
            <strong className="font-semibold text-slate-800 dark:text-slate-100">-</strong>,{' '}
            <strong className="font-semibold text-slate-800 dark:text-slate-100">*</strong>,{' '}
            <strong className="font-semibold text-slate-800 dark:text-slate-100">/</strong>) sobre los datos del{' '}
            <strong className="font-semibold text-slate-800 dark:text-slate-100">FROM</strong>.
          </p>
        </header>

        <div className="flex flex-col gap-6">
          <DqlSection
            command="*"
            title="Comodín universal"
            definition="Sustituye a la lista de todas las columnas de las tablas del FROM en el orden definido en el catálogo. Es cómodo para explorar, pero en producción suele preferirse nombrar columnas explícitas (menos datos transferidos y código más estable si cambia la tabla)."
            example={`USE tienda_curso;

SELECT *
FROM cliente;`}
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
            command="+"
            title="Suma"
            definition="Suma dos valores numéricos. Puedes sumar una columna con un número fijo, dos columnas entre sí o dos números literales. El resultado aparece como una columna nueva en el resultado, sin modificar los datos guardados en la tabla."
            example={`USE tienda_curso;

-- Precio original + costo fijo de envío (5)
SELECT
  nombre,
  precio,
  precio + 5
FROM producto;`}
          />

          <DqlSection
            command="-"
            title="Resta"
            definition="Resta el segundo valor del primero. Sirve para calcular diferencias: por ejemplo, restar un descuento fijo al precio de cada producto. El resultado es una columna calculada que se muestra junto al resto de columnas del SELECT."
            example={`USE tienda_curso;

-- Precio original menos un descuento fijo de 10
SELECT
  nombre,
  precio,
  precio - 10
FROM producto;`}
          />

          <DqlSection
            command="×"
            title="Multiplicación"
            definition="Multiplica dos valores numéricos. En SQL se escribe con el asterisco (*). Es útil para escalar un precio: duplicar el costo de una unidad, calcular el total de varias piezas iguales o aplicar un porcentaje (por ejemplo, multiplicar por 1.15 para sumar un 15 %)."
            example={`USE tienda_curso;

-- Precio de dos unidades del mismo producto
SELECT
  nombre,
  precio,
  precio * 2
FROM producto;`}
          />

          <DqlSection
            command="/"
            title="División"
            definition="Divide el primer valor entre el segundo. Permite repartir un monto en partes iguales o obtener un valor unitario a partir de un total. Si mezclas varias operaciones, usa paréntesis para dejar claro qué se calcula primero."
            example={`USE tienda_curso;

-- Mitad del precio de cada producto
SELECT
  nombre,
  precio,
  precio / 2
FROM producto;`}
          />
        </div>
      </div>
    </div>
  );
}
