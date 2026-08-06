import { useEffect, useRef, useState } from 'react';
import type { GameProps } from '../../domain/game';
import { mulberry32, shuffle } from '../../domain/rng';
import { sfx } from '../../ui/feedback';
import './touch.css';

const HOLD_MS = 3000;

type Mode = 'one' | 'teams';

interface Dot {
  pointerId: number;
  x: number;
  y: number;
  playerIndex: number;
}

export function TouchRoulette({ players, seed, onFinish }: GameProps) {
  const [mode, setMode] = useState<Mode>('one');
  const [dots, setDots] = useState<Dot[]>([]);
  const [progress, setProgress] = useState(0);
  const [picked, setPicked] = useState<number | null>(null); // playerIndex
  const [teams, setTeams] = useState<number[][] | null>(null);

  const areaRef = useRef<HTMLDivElement>(null);
  const startedAt = useRef(0);
  const raf = useRef(0);
  const done = picked !== null || teams !== null;

  // 손가락이 2개 이상 올라와 있는 동안만 게이지가 찬다.
  useEffect(() => {
    if (done) return;
    if (dots.length < 2) {
      setProgress(0);
      cancelAnimationFrame(raf.current);
      return;
    }
    startedAt.current = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - startedAt.current) / HOLD_MS);
      setProgress(p);
      if (p >= 1) {
        fire();
        return;
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dots.length, done, mode]);

  function fire() {
    const rand = mulberry32(seed + dots.length);
    const indices = dots.map((d) => d.playerIndex);
    if (mode === 'one') {
      const hit = indices[Math.floor(rand() * indices.length)];
      setPicked(hit);
      sfx.bust();
    } else {
      const order = shuffle(indices, rand);
      const half = Math.ceil(order.length / 2);
      setTeams([order.slice(0, half), order.slice(half)]);
      sfx.reveal();
    }
  }

  function freeIndex(current: Dot[]): number | null {
    const used = new Set(current.map((d) => d.playerIndex));
    for (let i = 0; i < players.length; i++) if (!used.has(i)) return i;
    return null; // 인원수보다 손가락이 많으면 무시
  }

  const onDown = (e: React.PointerEvent) => {
    if (done) return;
    try {
      // 손가락이 영역 밖으로 나가도 계속 추적한다. 실패해도 게임은 굴러간다.
      areaRef.current?.setPointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
    setDots((prev) => {
      if (prev.some((d) => d.pointerId === e.pointerId)) return prev;
      const slot = freeIndex(prev);
      if (slot === null) return prev;
      sfx.tap();
      return [...prev, { pointerId: e.pointerId, x: e.clientX, y: e.clientY, playerIndex: slot }];
    });
  };

  const onMove = (e: React.PointerEvent) => {
    setDots((prev) =>
      prev.map((d) => (d.pointerId === e.pointerId ? { ...d, x: e.clientX, y: e.clientY } : d)),
    );
  };

  const onUp = (e: React.PointerEvent) => {
    if (done) return;
    setDots((prev) => prev.filter((d) => d.pointerId !== e.pointerId));
  };

  return (
    <div className="stage">
      <div className="stage__head">
        <span className="muted">👆 손가락 룰렛</span>
        <span className="topbar__spacer" />
        {!done && (
          <div className="seg">
            <button className={mode === 'one' ? 'is-on' : ''} onClick={() => setMode('one')}>
              당첨 1명
            </button>
            <button className={mode === 'teams' ? 'is-on' : ''} onClick={() => setMode('teams')}>
              팀 나누기
            </button>
          </div>
        )}
      </div>

      <div
        className="stage__body touch"
        ref={areaRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        {dots.length === 0 && !done && (
          <div className="touch__guide">
            <div className="display touch__guide-big">다같이 손가락을 대세요</div>
            <div className="muted">2명 이상 3초 유지</div>
          </div>
        )}

        {dots.map((d) => {
          const p = players[d.playerIndex];
          const isHit = picked === d.playerIndex;
          return (
            <div
              key={d.pointerId}
              className={`touch__dot ${isHit ? 'is-hit' : ''} ${picked !== null && !isHit ? 'is-dim' : ''}`}
              style={{
                left: d.x,
                top: d.y,
                borderColor: p.color,
                transform: `translate(-50%,-50%) scale(${1 + progress * 0.18})`,
              }}
            >
              <span className="touch__dot-emoji">{p.emoji}</span>
              <span className="touch__dot-name">{p.name}</span>
            </div>
          );
        })}

        {teams && (
          <div className="touch__teams">
            {teams.map((team, i) => (
              <div className="touch__team" key={i}>
                <div className="touch__team-h display">{i === 0 ? 'A팀' : 'B팀'}</div>
                {team.map((idx) => (
                  <div key={idx} style={{ color: players[idx].color }}>
                    {players[idx].emoji} {players[idx].name}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {!done && dots.length >= 2 && (
          <div className="touch__gauge">
            <div className="touch__gauge-fill" style={{ width: `${progress * 100}%` }} />
          </div>
        )}
      </div>

      <div className="stage__foot stack">
        {picked !== null && (
          <button
            className="btn btn--primary btn--lg"
            onClick={() => onFinish([players[picked].id])}
          >
            당첨: {players[picked].name} — 벌칙 뽑기
          </button>
        )}
        {teams && (
          <button className="btn btn--ghost btn--lg" onClick={() => onFinish([])}>
            팀 확인 완료
          </button>
        )}
        {!done && (
          <button className="btn btn--quiet" onClick={() => setDots([])}>
            손가락 초기화
          </button>
        )}
      </div>
    </div>
  );
}
