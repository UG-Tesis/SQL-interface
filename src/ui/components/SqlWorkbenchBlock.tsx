/** Bloque de código con estilo de pestaña de consultas en MySQL Workbench. */
export function SqlWorkbenchBlock({ children }: { children: string }) {
  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-slate-800 bg-slate-950 shadow-inner">
      <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900/80 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-red-500/90" aria-hidden />
        <span className="h-2 w-2 rounded-full bg-amber-400/90" aria-hidden />
        <span className="h-2 w-2 rounded-full bg-emerald-500/90" aria-hidden />
        <span className="ml-2 text-[10px] font-medium uppercase tracking-wider text-slate-500">
          Script SQL — Workbench
        </span>
      </div>
      <pre className="max-h-[min(28rem,55vh)] overflow-auto p-4 font-mono text-[11px] leading-relaxed text-emerald-100/95 sm:text-xs md:text-sm lg:max-h-[min(24rem,50vh)]">
        <code>{children}</code>
      </pre>
    </div>
  );
}
