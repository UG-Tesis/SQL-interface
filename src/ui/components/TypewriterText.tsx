import { useEffect, useRef, useState } from 'react';

interface TypewriterTextProps {
  text: string;
  /** Milisegundos entre cada carácter. */
  speed?: number;
  /** Pausa extra tras signos de cierre de oración. */
  sentencePauseMs?: number;
  className?: string;
  showCursor?: boolean;
  onComplete?: () => void;
}

function isSentenceEnd(char: string): boolean {
  return /[.!?…]/.test(char);
}

function TypewriterTextAnimator({
  text,
  speed = 20,
  sentencePauseMs = 320,
  className = '',
  showCursor = true,
  onComplete,
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!text) {
      onCompleteRef.current?.();
      return;
    }

    let index = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    const tick = () => {
      index += 1;
      const next = text.slice(0, index);
      setDisplayed(next);

      if (index >= text.length) {
        setDone(true);
        onCompleteRef.current?.();
        return;
      }

      const char = text[index - 1];
      const delay = isSentenceEnd(char) ? speed + sentencePauseMs : speed;
      timeoutId = setTimeout(tick, delay);
    };

    timeoutId = setTimeout(tick, speed);
    return () => clearTimeout(timeoutId);
  }, [text, speed, sentencePauseMs]);

  return (
    <span className={className}>
      {displayed}
      {showCursor && !done && text ? (
        <span
          className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-current opacity-70"
          aria-hidden
        />
      ) : null}
    </span>
  );
}

/**
 * Revela el texto carácter a carácter, con pausa breve al terminar cada oración.
 */
export function TypewriterText(props: TypewriterTextProps) {
  const { text, ...rest } = props;
  return <TypewriterTextAnimator key={text} text={text} {...rest} />;
}
