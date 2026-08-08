import { useEffect, useMemo, useRef, useState } from 'react';
import type { GameProps } from '../../domain/game';
import { BALL_R, FIELD_H, halfWidthAt, pegXAt, simulateFunnel } from './simulate';
import { Countdown } from '../../ui/Countdown';
import { sfx } from '../../ui/feedback';
import './funnel.css';

// 시뮬레이션 좌표(가로 1, 세로 FIELD_H)를 그대로 100배 해서 그린다.
// x·y 배율이 같아야 공이 타원으로 찌그러지지 않는다.
const S = 100;
const VIEW_H = FIELD_H * S;
const PAD_TOP = 8; // 입구 위에서 떨어지는 공이 보이도록 띄운 여백
const PAD_BOT = 7; // 출구에 멈춰 선 공이 잘리지 않도록
const WALL_STEPS = 60;

/** 깔때기 한쪽 벽을 따라가는 점들 */
function wallPoints(side: -1 | 1): string {
  const pts: string[] = [];
  for (let i = 0; i <= WALL_STEPS; i++) {
    const y = (i / WALL_STEPS) * FIELD_H;
    const x = 0.5 + side * halfWidthAt(y);
    pts.push(`${(x * S).toFixed(2)},${(y * S).toFixed(2)}`);
  }
  return pts.join(' ');
}

export function FunnelDrop({ players, seed, onFinish }: GameProps) {
  const sim = useMemo(() => simulateFunnel(players.length, seed), [players.length, seed]);

  const [phase, setPhase] = useState<'ready' | 'running' | 'done'>('ready');
  const [frame, setFrame] = useState(0);
  const raf = useRef(0);
  const lastHitFrame = useRef(-1);

  useEffect(() => {
    if (phase !== 'running') return;
    const startedAt = performance.now();
    const step = (now: number) => {
      const i = Math.floor(((now - startedAt) / 1000) * 60);
      if (i >= sim.frames.length - 1) {
        setFrame(sim.frames.length - 1);
        setPhase('done');
        sfx.reveal();
        return;
      }
      setFrame(i);
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [phase, sim.frames.length]);

  // 페그에 부딪힐 때 딱딱 소리. 매 프레임 울리면 시끄러우니 솎아낸다.
  useEffect(() => {
    if (phase !== 'running') return;
    if (!sim.frames[frame]?.hits.length) return;
    if (frame - lastHitFrame.current < 8) return;
    lastHitFrame.current = frame;
    sfx.tap();
  }, [frame, phase, sim.frames]);

  const loserIndex = sim.ranking[0];
  const current = sim.frames[frame] ?? sim.frames[0];
  const hitSet = new Set(current.hits);

  if (phase === 'ready') {
    return (
      <Countdown
        title="깔때기"
        tagline="제일 먼저 빠져나오면 걸린다"
        onDone={() => setPhase('running')}
      />
    );
  }

  const walls = { left: wallPoints(-1), right: wallPoints(1) };

  return (
    <div className="stage">
      <div className="stage__head">
        <span className="muted">🫗 깔때기</span>
        <span className="topbar__spacer" />
        <span className="mono muted">
          {phase === 'done'
            ? `${players[loserIndex].name} 탈출!`
            : `${Math.round((frame / sim.frames.length) * 100)}%`}
        </span>
      </div>

      <div className="stage__body fn">
        <svg
          className="fn__svg"
          viewBox={`0 ${-PAD_TOP} ${S} ${VIEW_H + PAD_TOP + PAD_BOT}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="fn-wall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--line)" />
              <stop offset="100%" stopColor="var(--amber)" />
            </linearGradient>
          </defs>

          {/* 깔때기 벽 */}
          <polyline className="fn__wall" points={walls.left} stroke="url(#fn-wall)" />
          <polyline className="fn__wall" points={walls.right} stroke="url(#fn-wall)" />

          {/* 출구 표시 */}
          <line
            className="fn__exit"
            x1={(0.5 - halfWidthAt(FIELD_H)) * S}
            y1={VIEW_H}
            x2={(0.5 + halfWidthAt(FIELD_H)) * S}
            y2={VIEW_H}
          />

          {/* 장애물 */}
          {sim.pegs.map((peg, i) => (
            <circle
              key={i}
              className={`fn__peg ${hitSet.has(i) ? 'is-hit' : ''}`}
              cx={pegXAt(peg, frame) * S}
              cy={peg.y * S}
              r={peg.r * S}
            />
          ))}

          {/* 공 */}
          {players.map((p, i) => {
            const b = current.balls[i];
            const out = sim.exitAt[i] >= 0 && frame >= sim.exitAt[i];
            const isLoser = phase === 'done' && i === loserIndex;
            return (
              <g key={p.id} className={`fn__ball ${isLoser ? 'is-loser' : ''}`}>
                <circle
                  cx={b.x * S}
                  cy={b.y * S}
                  r={BALL_R * S}
                  fill={p.color}
                  opacity={out && !isLoser ? 0.35 : 1}
                />
                <text x={b.x * S} y={b.y * S + 1.4} className="fn__ball-emoji">
                  {p.emoji}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="stage__foot">
        {phase === 'done' && (
          <button
            className="btn btn--danger btn--lg"
            onClick={() => onFinish([players[loserIndex].id])}
          >
            {players[loserIndex].name} — 벌칙 뽑기
          </button>
        )}
      </div>
    </div>
  );
}
