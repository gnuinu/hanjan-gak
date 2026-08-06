import { useEffect, useState } from 'react';
import { sfx } from './feedback';
import './countdown.css';

interface Props {
  title: string;
  tagline?: string;
  from?: number;
  onDone: () => void;
}

/** 게임 시작 전 공통 카운트다운. 폰을 가운데 놓을 시간을 준다. */
export function Countdown({ title, tagline, from = 3, onDone }: Props) {
  const [n, setN] = useState(from);

  useEffect(() => {
    if (n <= 0) {
      sfx.go();
      const id = window.setTimeout(onDone, 450);
      return () => window.clearTimeout(id);
    }
    sfx.tick();
    const id = window.setTimeout(() => setN((v) => v - 1), 750);
    return () => window.clearTimeout(id);
  }, [n, onDone]);

  return (
    <div className="stage countdown">
      <div className="countdown__title display">{title}</div>
      {tagline && <div className="muted">{tagline}</div>}
      <div key={n} className="countdown__num display mono">
        {n > 0 ? n : 'GO'}
      </div>
    </div>
  );
}
