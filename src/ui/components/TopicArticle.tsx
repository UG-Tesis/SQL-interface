import type { ReactNode } from 'react';
import { ModuleHeroDecoration } from './ModuleHeroDecoration';

interface TopicArticleProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/**
 * Bloque de curso con cabecera y cuerpo; un tema puede usar varios article seguidos.
 */
export function TopicArticle({ title, description, children }: TopicArticleProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200/90 bg-[var(--app-surface-elevated)] shadow-[0_4px_24px_-4px_rgba(15,23,42,0.08),0_0_0_1px_rgba(255,255,255,0.8)_inset] dark:border-slate-700/90 dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.35)] dark:ring-1 dark:ring-inset dark:ring-slate-700/50">
      <div className="relative border-b border-slate-100 bg-gradient-to-br from-white via-slate-50/50 to-cyan-50/20 px-5 py-6 dark:border-slate-700/80 dark:from-slate-900 dark:via-slate-900/90 dark:to-cyan-950/20 sm:px-7 sm:py-7">
        <div className="relative z-10 flex flex-col gap-4 pr-0 md:flex-row md:items-start md:justify-between md:pr-36">
          <div className="min-w-0 flex-1 text-left">
            <h4 className="text-xl font-bold tracking-tight text-[var(--app-navy)] dark:text-slate-100 sm:text-2xl md:text-[1.65rem]">
              {title}
            </h4>
            <div className="mt-3 h-1 w-14 rounded-full bg-cyan-500 shadow-sm shadow-cyan-500/30" aria-hidden />
            {description ? (
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-[0.9375rem]">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        <ModuleHeroDecoration className="pointer-events-none absolute right-2 top-2 hidden opacity-[0.92] md:right-6 md:top-6 md:block dark:opacity-75" />
      </div>

      <div className="border-t border-slate-100/80 bg-slate-50/30 px-5 py-6 dark:border-slate-700/80 dark:bg-slate-900/50 sm:px-7 sm:py-7">
        {children}
      </div>
    </article>
  );
}
