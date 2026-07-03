import { useEffect, useRef } from 'react';
import { TypewriterText } from './TypewriterText';

export interface IslandChatMessageData {
  id: string;
  side: 'player' | 'other';
  speakerName?: string;
  text: string;
  animate?: boolean;
  onAnimateComplete?: () => void;
}

interface IslandChatMessageProps {
  message: IslandChatMessageData;
}

export function IslandChatMessage({ message }: IslandChatMessageProps) {
  const isPlayer = message.side === 'player';
  const label = isPlayer ? 'Tú' : message.speakerName ?? 'Isla';
  const completedRef = useRef(false);

  const fireComplete = () => {
    if (completedRef.current || !message.onAnimateComplete) return;
    completedRef.current = true;
    message.onAnimateComplete();
  };

  useEffect(() => {
    if (message.animate) return;
    fireComplete();
  }, [message.animate, message.id]);

  return (
    <div
      className={`flex w-full ${isPlayer ? 'justify-end' : 'justify-start'}`}
      data-testid={`chat-${message.side}`}
    >
      <div className={`max-w-[92%] ${isPlayer ? 'text-right' : 'text-left'}`}>
        <p
          className={`mb-1 px-0.5 text-[10px] font-bold uppercase tracking-wide ${
            isPlayer
              ? 'text-amber-700/90 dark:text-amber-400/90'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          {label}
        </p>
        <div
          className={`rounded-xl px-3 py-2.5 text-sm leading-relaxed ${
            isPlayer
              ? 'bg-white/90 text-slate-800 shadow-sm ring-1 ring-amber-200/80 dark:bg-slate-800/90 dark:text-slate-100 dark:ring-amber-700/40'
              : 'border border-amber-200/50 bg-white/80 text-slate-800 dark:border-amber-800/30 dark:bg-slate-900/50 dark:text-slate-100'
          }`}
        >
          {message.animate ? (
            <TypewriterText
              key={message.id}
              text={message.text}
              speed={18}
              sentencePauseMs={320}
              onComplete={fireComplete}
            />
          ) : (
            <span className="font-medium">{message.text}</span>
          )}
        </div>
      </div>
    </div>
  );
}
