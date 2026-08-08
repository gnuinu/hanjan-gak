import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { GameProps } from '../../domain/game';
import { Countdown } from '../../ui/Countdown';
import { sfx } from '../../ui/feedback';
import { assignKeys, seatOfCode } from '../../domain/keys';
import {
  applyPresses,
  initialNunchi,
  nextNumber,
  silentPlayers,
  type NunchiState,
} from './judge';
import './nunchi.css';

/**
 * 이 안에 들어온 입력은 "동시에 외쳤다"로 본다.
 * 짧으면 명백한 충돌도 놓치고, 길면 눈치싸움이 아니라 순발력 싸움이 된다.
 */
const COLLIDE_MS = 120;

type Phase = 'brief' | 'countdown' | 'play';

export function Nunchi({ players, onFinish }: GameProps) {
  const total = players.length;
  const keys = useMemo(() => assignKeys(total), [total]);

  const [phase, setPhase] = useState<Phase>('brief');
  const [state, setState] = useState<NunchiState>(initialNunchi);
  const [times, setTimes] = useState<number[]>([]);

  // 판정은 이벤트 핸들러 안에서 즉시 해야 해서 상태를 ref 로도 들고 간다
  const stateRef = useRef(state);
  const buffer = useRef<number[]>([]);
  const timer = useRef(0);
  const startedAt = useRef(0);
  const finished = useRef(false);

  // 키보드 단축키와 버튼 클릭이 겹쳐도 벌칙은 한 번만 뽑는다
  const finish = useCallback(
    (losers: number[]) => {
      if (finished.current) return;
      finished.current = true;
      onFinish(losers.map((i) => players[i].id));
    },
    [onFinish, players],
  );

  const flush = useCallback(() => {
    const batch = buffer.current;
    buffer.current = [];
    const prev = stateRef.current;
    const next = applyPresses(prev, batch, total);
    if (next === prev) return;

    stateRef.current = next;
    setState(next);

    if (next.called.length > prev.called.length) {
      setTimes((t) => [...t, performance.now() - startedAt.current]);
    }
    if (next.status === 'playing') sfx.tick();
    else sfx.bust();
  }, [total]);

  const press = useCallback(
    (index: number) => {
      if (stateRef.current.status !== 'playing') return;
      buffer.current.push(index);
      if (timer.current) return; // 이미 열린 충돌 창에 합류
      timer.current = window.setTimeout(() => {
        timer.current = 0;
        flush();
      }, COLLIDE_MS);
    },
    [flush],
  );

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // ─── 키보드 ────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.repeat) return;

      if (phase === 'brief') {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          setPhase('countdown');
        }
        return;
      }
      if (phase !== 'play') return;

      if (state.status !== 'playing') {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          finish(state.losers);
        }
        return;
      }

      const seat = seatOfCode(keys, e.code);
      if (seat < 0) return;
      e.preventDefault();
      press(seat);
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [finish, keys, phase, press, state.losers, state.status]);

  if (phase === 'brief') {
    return <Brief players={players} keys={keys} onStart={() => setPhase('countdown')} />;
  }
  if (phase === 'countdown') {
    return (
      <Countdown
        title="눈치게임"
        tagline="아무나, 아무 때나. 겹치면 같이 죽는다"
        onDone={() => {
          startedAt.current = performance.now();
          setPhase('play');
        }}
      />
    );
  }

  const over = state.status !== 'playing';
  const left = silentPlayers(state, total);

  return (
    <div className={`stage nunchi ${over ? 'is-over' : ''}`}>
      <div className="stage__head">
        <span className="muted">눈치게임</span>
        <span className="nc-left mono">{left.length}명 남음</span>
      </div>

      <div className="nc-board">
        {over ? (
          <div className="nc-verdict">
            <div className="nc-verdict__label display">
              {state.status === 'collision' ? '동시에 외쳤다' : '혼자 남았다'}
            </div>
            <div className="nc-verdict__who display">
              {state.losers.map((i) => players[i].name).join(' · ')}
            </div>
            <div className="hint">
              {state.status === 'collision'
                ? `${nextNumber(state)}번을 같이 불렀다`
                : `${total - 1}번까지 나가는 동안 끝내 손이 안 나갔다`}
            </div>
          </div>
        ) : (
          <>
            <div className="nc-next__label muted">다음 숫자</div>
            <div key={state.called.length} className="nc-next display mono">
              {nextNumber(state)}
            </div>
            <div className="nc-tape">
              {state.called.map((p, i) => (
                <span key={i} className="nc-tape__item" style={{ color: players[p].color }}>
                  {i + 1} {players[p].name}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      <div className={`nc-seats n${total}`}>
        {players.map((p, i) => {
          const order = state.called.indexOf(i);
          const lost = state.losers.includes(i);
          return (
            <button
              key={p.id}
              className={`nc-seat ${order >= 0 ? 'is-called' : ''} ${lost ? 'is-loser' : ''}`}
              style={{ '--seat': p.color } as CSSProperties}
              onPointerDown={() => press(i)}
              disabled={over}
            >
              <span className="nc-seat__key mono">{keys[i].toUpperCase()}</span>
              <span className="nc-seat__name">
                {p.emoji} {p.name}
              </span>
              <span className="nc-seat__state mono">
                {lost ? '걸림' : order >= 0 ? `${order + 1} · ${fmt(times[order])}` : '…'}
              </span>
            </button>
          );
        })}
      </div>

      {over && (
        <div className="stage__foot">
          <button className="btn btn--danger btn--lg" onClick={() => finish(state.losers)}>
            {state.losers.map((i) => players[i].name).join(' · ')} — 벌칙 뽑기
          </button>
        </div>
      )}
    </div>
  );
}

function fmt(ms: number | undefined): string {
  return ms === undefined ? '' : `${(ms / 1000).toFixed(1)}s`;
}

// ─── 시작 전 안내 ────────────────────────────────────────────
function Brief({
  players,
  keys,
  onStart,
}: {
  players: GameProps['players'];
  keys: string[];
  onStart: () => void;
}) {
  return (
    <div className="stage nunchi-brief">
      <div className="nc-brief__title display">눈치게임</div>
      <ol className="nc-brief__rules">
        <li>순서 없이, 아무나 다음 숫자를 외친다 — 자기 키를 누르면 외친 거다.</li>
        <li>두 명 이상이 동시에 누르면 그 사람들이 전부 걸린다.</li>
        <li>
          <b>{players.length - 1}</b>번까지 나가면, 끝까지 안 누른 한 명이 걸린다.
        </li>
      </ol>

      <div className="nc-brief__keys">
        {players.map((p, i) => (
          <div key={p.id} className="nc-brief__row">
            <span className="nc-brief__cap mono" style={{ borderColor: p.color, color: p.color }}>
              {keys[i].toUpperCase()}
            </span>
            <span>
              {p.emoji} {p.name}
            </span>
          </div>
        ))}
      </div>

      <div className="hint center">키보드 앞에 둘러앉아 각자 자기 키에 손가락을 올린다.</div>

      <div className="stage__foot">
        <button className="btn btn--primary btn--lg" onClick={onStart}>
          시작 <span className="nc-brief__space mono">Space</span>
        </button>
      </div>
    </div>
  );
}
