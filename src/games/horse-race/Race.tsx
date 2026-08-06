import { useEffect, useMemo, useRef, useState } from 'react';
import type { GameProps } from '../../domain/game';
import { simulateRace } from './simulate';
import { Countdown } from '../../ui/Countdown';
import { TargetPicker } from '../../ui/TargetPicker';
import { sfx } from '../../ui/feedback';
import { useSession } from '../../store/session';
import './race.css';

const EFFECT_LABEL: Record<string, string> = {
  stumble: '넘어졌다!',
  boost: '막판 스퍼트!',
  reverse: '역주행?!',
};

export function Race({ players, seed, onFinish }: GameProps) {
  const targetMode = useSession((s) => s.settings.targetMode);
  const race = useMemo(() => simulateRace(players.length, seed), [players.length, seed]);

  const [phase, setPhase] = useState<'ready' | 'running' | 'done'>('ready');
  const [frame, setFrame] = useState(0);
  const [toast, setToast] = useState<{ horse: number; type: string } | null>(null);
  const raf = useRef(0);

  useEffect(() => {
    if (phase !== 'running') return;
    const startedAt = performance.now();
    const step = (now: number) => {
      const i = Math.floor(((now - startedAt) / 1000) * 60);
      if (i >= race.events.length - 1) {
        setFrame(race.events.length - 1);
        setPhase('done');
        sfx.reveal();
        return;
      }
      setFrame(i);
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [phase, race.events.length]);

  // 이벤트가 터진 틱을 지나갈 때만 토스트를 띄운다
  useEffect(() => {
    if (phase !== 'running') {
      setToast(null); // 레이스가 끝나면 남아 있던 토스트를 치운다
      return;
    }
    const e = race.events[frame]?.effect;
    if (!e) return;
    setToast(e);
    sfx.tap();
    const id = window.setTimeout(() => setToast(null), 900);
    return () => window.clearTimeout(id);
  }, [frame, phase, race.events]);

  const positions = race.events[frame]?.positions ?? new Array(players.length).fill(0);
  const rankOf = (horse: number) => race.ranking.indexOf(horse) + 1;
  const lastHorse = race.ranking.at(-1)!;
  const winnerHorse = race.ranking[0];

  if (phase === 'ready') {
    return <Countdown title="경마" tagline="꼴찌가 마신다" onDone={() => setPhase('running')} />;
  }

  return (
    <div className="stage">
      <div className="stage__head">
        <span className="muted">🏇 경마</span>
        <span className="topbar__spacer" />
        <span className="mono muted">
          {phase === 'done' ? 'FINISH' : `${Math.round((frame / race.events.length) * 100)}%`}
        </span>
      </div>

      <div className="stage__body race">
        {players.map((p, i) => (
          <div className="race__lane" key={p.id}>
            <div className="race__label">
              <span className="race__name">{p.name}</span>
              {phase === 'done' && (
                <span className={`race__rank ${rankOf(i) === players.length ? 'is-last' : ''}`}>
                  {rankOf(i)}위
                </span>
              )}
            </div>
            <div className="race__track">
              <div
                className="race__horse"
                style={{
                  left: `calc(${positions[i] * 100}% - ${positions[i] * 34}px)`,
                  background: p.color,
                }}
              >
                {p.emoji}
              </div>
            </div>
          </div>
        ))}

        {toast && (
          <div className="race__toast">
            <b style={{ color: players[toast.horse].color }}>{players[toast.horse].name}</b>{' '}
            {EFFECT_LABEL[toast.type]}
          </div>
        )}
      </div>

      <div className="stage__foot">
        {phase === 'done' &&
          (targetMode ? (
            <TargetPicker
              players={players}
              title={`1등 ${players[winnerHorse].name} — 마실 사람 지목!`}
              onPick={(id) => onFinish([id])}
            />
          ) : (
            <button className="btn btn--primary btn--lg" onClick={() => onFinish([players[lastHorse].id])}>
              꼴찌: {players[lastHorse].name} — 벌칙 뽑기
            </button>
          ))}
      </div>
    </div>
  );
}
