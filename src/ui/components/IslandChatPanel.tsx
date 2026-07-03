import { useEffect, useRef } from 'react';
import { IslandChatMessage, type IslandChatMessageData } from './IslandChatMessage';

interface IslandChatPanelProps {
  messages: IslandChatMessageData[];
  missionLabel: string;
  footer?: React.ReactNode;
  className?: string;
}

export function IslandChatPanel({
  messages,
  missionLabel,
  footer,
  className = '',
}: IslandChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [messages.length, messages[messages.length - 1]?.text]);

  return (
    <section
      className={`relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-amber-200/70 bg-gradient-to-b from-amber-50/95 to-orange-50/90 shadow-sm dark:border-amber-800/30 dark:from-slate-800 dark:to-slate-900 dark:shadow-md ${className}`}
    >
      <div className="pointer-events-none absolute -right-3 top-12 hidden h-0 w-0 border-y-[10px] border-l-[12px] border-y-transparent border-l-orange-50 lg:block dark:border-l-slate-800" aria-hidden />

      <header className="shrink-0 px-3.5 pt-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700/80 dark:text-amber-400/90">
          {missionLabel}
        </p>
      </header>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 basis-0 space-y-4 overflow-y-auto overflow-x-hidden overscroll-contain px-3.5 py-3"
        aria-label="Conversación de la misión"
      >
        {messages.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Iniciando conversación…
          </p>
        ) : (
          messages.map((message) => (
            <IslandChatMessage key={message.id} message={message} />
          ))
        )}
      </div>

      {footer ? (
        <div className="shrink-0 border-t border-amber-200/60 bg-white/60 p-2 dark:border-amber-800/30 dark:bg-slate-900/60">
          {footer}
        </div>
      ) : null}
    </section>
  );
}
