import { useMemo, useState } from 'react';
import type { GameProps } from '../../domain/game';
import { mulberry32 } from '../../domain/rng';
import { sfx } from '../../ui/feedback';
import './bomb.css';

export function BombCard({ players, seed, onFinish }: GameProps) {
  const count = players.length;
  const bombIndex = useMemo(() => Math.floor(mulberry32(seed)() * count), [seed, count]);

  const [opened, setOpened] = useState<number[]>([]);
  const [turn, setTurn] = useState(0);
  const [boom, setBoom] = useState<number | null>(null);

  const current = players[turn % players.length];
  const left = count - opened.length;

  function flip(i: number) {
    if (opened.includes(i) || boom !== null) return;
    setOpened((prev) => [...prev, i]);
    if (i === bombIndex) {
      setBoom(turn % players.length);
      sfx.bust();
    } else {
      sfx.safe();
      setTurn((t) => t + 1);
    }
  }

  return (
    <div className="stage">
      <div className="stage__head">
        <span className="muted">💣 폭탄 카드</span>
        <span className="topbar__spacer" />
        <span className="mono muted">
          {boom !== null
            ? `${opened.length}장 만에 터짐`
            : `남은 카드 ${left} · 확률 ${Math.round((1 / Math.max(1, left)) * 100)}%`}
        </span>
      </div>

      <div className={`stage__body bomb ${boom !== null ? 'is-boom' : ''}`}>
        <div className="bomb__turn">
          {boom === null ? (
            <>
              <span style={{ color: current.color }}>
                {current.emoji} {current.name}
              </span>
              <span className="muted"> 차례 — 한 장 고르세요</span>
            </>
          ) : (
            <span className="bomb__boom-label display">💥 터졌다</span>
          )}
        </div>

        <div className="bomb__grid" style={{ '--cols': count <= 6 ? 3 : 4 } as React.CSSProperties}>
          {Array.from({ length: count }, (_, i) => {
            const isOpen = opened.includes(i);
            const isBomb = i === bombIndex;
            return (
              <button
                key={i}
                className={`bomb__card ${isOpen ? 'is-open' : ''} ${isOpen && isBomb ? 'is-bomb' : ''}`}
                onClick={() => flip(i)}
                disabled={isOpen || boom !== null}
              >
                {isOpen ? (isBomb ? '💣' : '✓') : i + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div className="stage__foot">
        {boom !== null && (
          <button
            className="btn btn--danger btn--lg"
            onClick={() => onFinish([players[boom].id])}
          >
            {players[boom].name} — 벌칙 뽑기
          </button>
        )}
      </div>
    </div>
  );
}
