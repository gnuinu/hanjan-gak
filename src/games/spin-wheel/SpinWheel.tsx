import { useMemo, useState } from 'react';
import type { GameProps } from '../../domain/game';
import { mulberry32 } from '../../domain/rng';
import { sfx } from '../../ui/feedback';
import './wheel.css';

const SPIN_MS = 4200;

export function SpinWheel({ players, seed, onFinish }: GameProps) {
  const n = players.length;
  const seg = 360 / n;

  const target = useMemo(() => Math.floor(mulberry32(seed)() * n), [seed, n]);
  const [angle, setAngle] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'done'>('idle');

  // 슬라이스 i 는 12시부터 시계방향 [i*seg, (i+1)*seg).
  // 바늘(12시) 아래에 target 이 오려면 원판을 -중심각만큼 돌리면 된다.
  const gradient = players
    .map((p, i) => `${p.color} ${i * seg}deg ${(i + 1) * seg}deg`)
    .join(', ');

  function spin() {
    if (phase !== 'idle') return;
    sfx.go();
    const turns = 5;
    setAngle(360 * turns - (target + 0.5) * seg);
    setPhase('spinning');
    window.setTimeout(() => {
      setPhase('done');
      sfx.bust();
    }, SPIN_MS);
  }

  return (
    <div className="stage">
      <div className="stage__head">
        <span className="muted">🎯 룰렛</span>
      </div>

      <div className="stage__body wheel">
        <div className="wheel__needle" />
        <div
          className="wheel__disc"
          style={{
            background: `conic-gradient(${gradient})`,
            transform: `rotate(${angle}deg)`,
            transitionDuration: `${SPIN_MS}ms`,
          }}
        >
          {players.map((p, i) => (
            <span
              key={p.id}
              className="wheel__label"
              style={{ transform: `rotate(${(i + 0.5) * seg}deg)` }}
            >
              <span className="wheel__label-inner">{p.name}</span>
            </span>
          ))}
        </div>
        <div className="wheel__hub">{phase === 'done' ? players[target].emoji : '한잔각'}</div>
      </div>

      <div className="stage__foot">
        {phase === 'idle' && (
          <button className="btn btn--primary btn--lg" onClick={spin}>
            돌리기
          </button>
        )}
        {phase === 'spinning' && (
          <button className="btn btn--ghost btn--lg" disabled>
            돌아가는 중…
          </button>
        )}
        {phase === 'done' && (
          <button
            className="btn btn--primary btn--lg"
            onClick={() => onFinish([players[target].id])}
          >
            당첨: {players[target].name} — 벌칙 뽑기
          </button>
        )}
      </div>
    </div>
  );
}
