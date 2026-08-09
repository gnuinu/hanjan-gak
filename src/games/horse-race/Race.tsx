import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { GameProps } from '../../domain/game';
import { NOMINAL_STEP, simulateRace } from './simulate';
import { Horse, coatOf, type HorseState } from './Horse';
import { Grandstand } from './Grandstand';
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

/** 속도를 잴 때 몇 프레임을 되돌아볼지. 틱 단위 흔들림을 눌러 준다 */
const SPEED_WINDOW = 8;

/** 사람이 많아지면 레인을 낮춘다. 12명이 다 들어가야 한다 */
function laneHeight(count: number): number {
  if (count <= 4) return 58;
  if (count <= 6) return 50;
  if (count <= 8) return 42;
  if (count <= 10) return 36;
  return 32;
}

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

  // 말의 실제 속도로 걸음걸이를 돌린다. 넘어지면 발이 멈추고,
  // 스퍼트가 걸리면 눈에 띄게 빨라진다 — 토스트를 못 봐도 몸짓으로 읽힌다.
  const back = race.events[Math.max(0, frame - SPEED_WINDOW)]?.positions ?? positions;
  const span = Math.max(1, Math.min(SPEED_WINDOW, frame));
  const speeds = positions.map((p, i) => (p - back[i]) / span / NOMINAL_STEP);

  const lane = laneHeight(players.length);
  const leaderName = players[positions.indexOf(Math.max(...positions))]?.name;

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

      <div
        className={`stage__body race ${phase === 'done' ? 'is-done' : ''} ${players.length > 8 ? 'race--tight' : ''}`} style={{ '--lane': `${lane}px` } as CSSProperties}>
        {players.length <= 8 && (
          <div className="race__scene">
            <Grandstand leader={phase === 'done' ? players[winnerHorse].name : leaderName} />
          </div>
        )}

        <div className="race__lanes">
          <div className="race__finish" aria-hidden />
          {players.map((p, i) => {
            const state = horseState(speeds[i], phase === 'done', i === winnerHorse);
            return (
              <div className="race__lane" key={p.id}>
                <div className="race__label">
                  <span className="race__gate mono">{i + 1}</span>
                  <span className="race__name">{p.name}</span>
                  {phase === 'done' && (
                    <span className={`race__rank ${rankOf(i) === players.length ? 'is-last' : ''}`}>
                      {rankOf(i)}위
                    </span>
                  )}
                </div>
                <div className="race__track">
                  <div
                    className="race__runner"
                    style={{
                      left: `calc(${positions[i] * 100}% - ${positions[i] * lane * 1.45}px)`,
                      // 속도가 붙을수록 흙먼지가 짙어진다
                      ['--dust' as string]: Math.max(0, Math.min(1, speeds[i] / 1.4)),
                    }}
                  >
                    <Horse
                      emoji={p.emoji}
                      silk={p.color}
                      coat={coatOf(i)}
                      number={i + 1}
                      state={state}
                      gallop={gallopDuration(speeds[i])}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

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

/** 배속을 몸짓으로 옮긴다 */
function horseState(speed: number, done: boolean, isWinner: boolean): HorseState {
  if (done) return isWinner ? 'win' : 'idle';
  if (speed < 0.12) return 'stumble';
  if (speed > 1.7) return 'boost';
  return 'run';
}

/** 한 걸음 주기(초). 빠를수록 짧지만 너무 짧으면 다리가 떨리는 걸로 보인다 */
function gallopDuration(speed: number): number {
  return Math.max(0.16, Math.min(0.85, 0.42 / Math.max(speed, 0.2)));
}
