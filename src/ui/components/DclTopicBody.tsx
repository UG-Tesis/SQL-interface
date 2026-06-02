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
    <section className="h-full rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm shadow-slate-200/40 dark:border-slate-600 dark:bg-slate-900/95 dark:shadow-none">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="rounded-md bg-cyan-600 px-2 py-0.5 font-mono text-xs font-semibold uppercase tracking-wide text-white">
          {command}
        </span>
        <h5 className="text-base font-semibold text-slate-800 dark:text-slate-100">{title}</h5>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{definition}</p>
    </section>
  );
}

export function DclTopicBody() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-cyan-800 dark:text-cyan-300">
          Data Control Language (DCL)
        </h4>
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          El <strong className="font-semibold text-slate-800 dark:text-slate-100">DCL</strong> agrupa las sentencias que
          gestionan <strong className="font-semibold text-slate-800 dark:text-slate-100">permisos</strong> (privilegios) sobre
          bases, tablas, vistas u otros objetos: quién puede leer, escribir o administrar. En MySQL suele
          ejecutarse conectado como usuario con privilegios administrativos (por ejemplo{' '}
          <code className="rounded bg-slate-200/80 px-1 font-mono text-[11px] dark:bg-slate-700 dark:text-slate-200">root</code> o un rol con{' '}
          <code className="rounded bg-slate-200/80 px-1 font-mono text-[11px] dark:bg-slate-700 dark:text-slate-200">GRANT OPTION</code>).
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch lg:gap-x-6 lg:gap-y-6">
        <DclSection
          command="GRANT"
          title="Otorgar privilegios"
          definition="Asigna permisos a un usuario o rol sobre objetos concretos (SELECT, INSERT, UPDATE, etc.) o sobre un esquema completo. En la práctica suele ir después de crear la cuenta de usuario si aún no existe. La forma habitual en MySQL enlaza la lista de privilegios, el objeto (tabla, vista o esquema) y el destino usuario@host; opcionalmente se puede indicar que ese usuario pueda a su vez conceder los mismos permisos a otros. Con GRANT y REVOKE el servidor actualiza los privilegios al instante; FLUSH PRIVILEGES solo hace falta si se modificaron las tablas del sistema a mano, no tras estas sentencias."
        />

        <DclSection
          command="REVOKE"
          title="Quitar privilegios"
          definition="Retira permisos que antes se concedieron con GRANT, sobre el mismo tipo de objeto y para el mismo usuario@host. No borra la cuenta por sí sola: si la persona o aplicación ya no debe existir en el servidor, además se puede eliminar el usuario con la operación correspondiente. Al igual que GRANT, el cambio se aplica directamente sin necesidad de FLUSH PRIVILEGES."
        />
      </div>
    </div>
  );
}
