import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GameProps } from '../../domain/game';
import { assignKeys, seatOfCode } from '../../domain/keys';
import { mulberry32 } from '../../domain/rng';
import { sfx } from '../../ui/feedback';
import './reaction.css';

const SPLIT_LIMIT = 4; // 5명부터는 화면 분할이 좁아져서 순차 플레이로 폴백

type Phase = 'wait' | 'go' | 'over';

export function Reaction({ players, seed, onFinish }: GameProps) {
  const split = players.length <= SPLIT_LIMIT;
  return split ? (
    <SplitReaction players={players} seed={seed} onFinish={onFinish} />
  ) : (
    <SoloReaction players={players} seed={seed} onFinish={onFinish} />
  );
}

/** 1.4~4.0초 사이 랜덤 대기. 예측이 안 돼야 한다. */
function useGreenLight(seed: number, round: number, onGreen: () => void) {
  useEffect(() => {
    const delay = 1400 + mulberry32(seed + round * 31)() * 2600;
    const id = window.setTimeout(onGreen, delay);
    return () => window.clearTimeout(id);
  }, [seed, round, onGreen]);
}

// ─── 4명 이하: 화면 분할 ──────────────────────────────────────────
function SplitReaction({ players, seed, onFinish }: GameProps) {
  const [phase, setPhase] = useState<Phase>('wait');
  const [times, setTimes] = useState<Record<string, number>>({});
  const [loserId, setLoserId] = useState<string | null>(null);
  const [reason, setReason] = useState<'slow' | 'false-start'>('slow');
  const greenAt = useRef(0);
  // 화면 분할은 손가락이 여러 개라야 되는데 PC 엔 마우스가 하나뿐이다.
  // 자리마다 키를 하나씩 줘서 키보드로도 같이 할 수 있게 한다.
  const keys = useMemo(() => assignKeys(players.length), [players.length]);

  const toGreen = useCallback(() => {
    greenAt.current = performance.now();
    setPhase('go');
    sfx.go();
  }, []);
  useGreenLight(seed, 0, toGreen);

  function tap(playerId: string) {
    if (phase === 'over') return;
    if (phase === 'wait') {
      setReason('false-start');
      setLoserId(playerId);
      setPhase('over');
      sfx.bust();
      return;
    }
    if (times[playerId] !== undefined) return;
    const ms = Math.round(performance.now() - greenAt.current);
    const next = { ...times, [playerId]: ms };
    setTimes(next);
    sfx.tap();
    if (Object.keys(next).length === players.length) {
      const slowest = players.reduce((a, b) => (next[a.id] >= next[b.id] ? a : b));
      setReason('slow');
      setLoserId(slowest.id);
      setPhase('over');
      sfx.bust();
    }
  }

  // 최신 tap 을 리스너에 물려둔다 (리스너를 매번 다시 붙이지 않으려고)
  const tapRef = useRef(tap);
  useEffect(() => {
    tapRef.current = tap;
  });

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.repeat) return;
      const seat = seatOfCode(keys, e.code);
      if (seat < 0) return;
      e.preventDefault();
      tapRef.current(players[seat].id);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [keys, players]);

  return (
    <div className={`stage reaction reaction--split n${players.length} ${phase === 'go' ? 'is-go' : ''}`}>
      {players.map((p, i) => (
        <button
          key={p.id}
          className={`rx-zone ${i === 0 && players.length === 2 ? 'is-flipped' : ''} ${
            loserId === p.id ? 'is-loser' : ''
          } ${times[p.id] !== undefined ? 'is-tapped' : ''}`}
          style={{ background: phase === 'go' ? p.color : undefined }}
          onPointerDown={() => tap(p.id)}
        >
          <span className="rx-zone__name">{p.name}</span>
          <span className="rx-zone__key mono">{keys[i].toUpperCase()}</span>
          <span className="rx-zone__state mono">
            {loserId === p.id
              ? reason === 'false-start'
                ? '부정 출발'
                : '꼴찌'
              : times[p.id] !== undefined
                ? `${times[p.id]}ms`
                : phase === 'go'
                  ? '지금!'
                  : '대기'}
          </span>
        </button>
      ))}

      {phase === 'over' && loserId && (
        <div className="rx-result">
          <button className="btn btn--danger btn--lg" onClick={() => onFinish([loserId])}>
            {players.find((p) => p.id === loserId)!.name} — 벌칙 뽑기
          </button>
        </div>
      )}
    </div>
  );
}

// ─── 5명 이상: 한 명씩 순차 ──────────────────────────────────────
function SoloReaction({ players, seed, onFinish }: GameProps) {
  const [turn, setTurn] = useState(0);
  const [phase, setPhase] = useState<'brief' | 'wait' | 'go' | 'done'>('brief');
  const [times, setTimes] = useState<number[]>([]);
  const greenAt = useRef(0);
  const player = players[turn];

  const toGreen = useCallback(() => {
    if (phase !== 'wait') return;
    greenAt.current = performance.now();
    setPhase('go');
    sfx.go();
  }, [phase]);
  useGreenLight(seed, turn, toGreen);

  function advance(ms: number) {
    const next = [...times, ms];
    setTimes(next);
    if (next.length === players.length) setPhase('done');
    else {
      setTurn((t) => t + 1);
      setPhase('brief');
    }
  }

  function tap() {
    if (phase === 'brief') {
      setPhase('wait');
      return;
    }
    if (phase === 'wait') {
      sfx.bust();
      advance(Infinity); // 부정 출발
      return;
    }
    if (phase === 'go') {
      sfx.tap();
      advance(Math.round(performance.now() - greenAt.current));
    }
  }

  if (phase === 'done') {
    const worst = times.reduce((bi, t, i) => (t >= times[bi] ? i : bi), 0);
    const loser = players[worst];
    return (
      <div className="stage reaction reaction--solo">
        <div className="rx-solo__list">
          {players.map((p, i) => (
            <div key={p.id} className={`rx-solo__row ${i === worst ? 'is-loser' : ''}`}>
              <span>
                {p.emoji} {p.name}
              </span>
              <span className="mono">{times[i] === Infinity ? '부정 출발' : `${times[i]}ms`}</span>
            </div>
          ))}
        </div>
        <div className="stage__foot">
          <button className="btn btn--danger btn--lg" onClick={() => onFinish([loser.id])}>
            {loser.name} — 벌칙 뽑기
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      className={`stage reaction reaction--solo ${phase === 'go' ? 'is-go' : ''}`}
      style={{ background: phase === 'go' ? player.color : undefined }}
      onPointerDown={tap}
    >
      <div className="rx-solo__who">
        {player.emoji} {player.name}
      </div>
      <div className="rx-solo__msg display">
        {phase === 'brief' ? '준비되면 탭' : phase === 'wait' ? '초록불 대기…' : '지금!'}
      </div>
      <div className="muted">
        {turn + 1} / {players.length}
      </div>
    </button>
  );
}
