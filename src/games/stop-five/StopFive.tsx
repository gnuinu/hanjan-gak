import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameProps } from '../../domain/game';
import { sfx } from '../../ui/feedback';
import {
  REVEAL_MS,
  TARGET_MS,
  TIMEOUT_MS,
  formatGap,
  formatSec,
  isTimeout,
  losers,
  ranking,
  verdictOf,
} from './judge';
import './stop.css';

/** 시작 탭이 튀어서 곧바로 멈춰 버리는 걸 막는다 */
const GUARD_MS = 300;

type Phase = 'brief' | 'run' | 'judged' | 'done';

/**
 * 5초 정지. 운이 아니라 몸속 시계로 겨루는 판이라 한 명씩 돌아가며 한다.
 * 폰을 넘겨 가며 하는 자리를 기준으로 짰고, 마우스·스페이스바로도 된다.
 */
export function StopFive({ players, onFinish }: GameProps) {
  const [turn, setTurn] = useState(0);
  const [phase, setPhase] = useState<Phase>('brief');
  const [stops, setStops] = useState<number[]>([]);
  const [shown, setShown] = useState(0); // 공개 구간 동안만 흐르는 숫자
  const startedAt = useRef(0);

  const record = useCallback((ms: number) => {
    setStops((prev) => [...prev, ms]);
    setPhase('judged');
    sfx.tap();
  }, []);

  useEffect(() => {
    if (phase !== 'run') return;

    // 숫자는 공개 구간까지만 갱신하고, 그 뒤로는 화면이 아무 정보도 주지 않는다.
    let raf = 0;
    const tick = () => {
      const ms = performance.now() - startedAt.current;
      if (ms >= REVEAL_MS) {
        setShown(REVEAL_MS);
        return;
      }
      setShown(ms);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const id = window.setTimeout(() => record(TIMEOUT_MS), TIMEOUT_MS);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(id);
    };
  }, [phase, record]);

  function press() {
    if (phase === 'brief') {
      startedAt.current = performance.now(); // 재는 건 탭한 그 순간부터
      setShown(0);
      setPhase('run');
      sfx.go();
      return;
    }
    if (phase === 'run') {
      const ms = performance.now() - startedAt.current;
      if (ms < GUARD_MS) return;
      record(Math.round(Math.min(ms, TIMEOUT_MS)));
    }
  }

  // 최신 press 를 리스너에 물려둔다 (리스너를 매번 다시 붙이지 않으려고)
  const pressRef = useRef(press);
  useEffect(() => {
    pressRef.current = press;
  });

  useEffect(() => {
    // PC 로 열었을 땐 스페이스바가 제일 편하다. 초점이 어디에 있든 먹혀야 해서
    // 탭 영역이 아니라 창에 건다. 버튼에 걸면 "다음"을 누른 뒤 초점이 날아가서 안 먹는다.
    function onKey(e: KeyboardEvent) {
      if (e.repeat) return;
      if (e.key !== ' ' && e.key !== 'Enter') return;
      if (phase !== 'brief' && phase !== 'run') return;
      e.preventDefault();
      pressRef.current();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase]);

  function next() {
    if (turn + 1 >= players.length) {
      setPhase('done');
      sfx.reveal();
      return;
    }
    setTurn((t) => t + 1);
    setPhase('brief');
  }

  if (phase === 'done') {
    const order = ranking(stops);
    const loserIds = losers(stops).map((i) => players[i].id);
    const loserNames = losers(stops).map((i) => players[i].name);
    return (
      <div className="stage stop stop--done">
        <div className="stage__head">
          <span className="muted">5초에 가장 가까운 순서</span>
        </div>
        <div className="stop__list">
          {order.map((idx, rank) => {
            const ms = stops[idx];
            const lost = loserIds.includes(players[idx].id);
            return (
              <div key={players[idx].id} className={`stop__row ${lost ? 'is-loser' : ''}`}>
                <span className="stop__rank mono">{rank === 0 ? '🎯' : rank + 1}</span>
                <span className="stop__who">
                  {players[idx].emoji} {players[idx].name}
                </span>
                <span className="stop__time mono">
                  {isTimeout(ms) ? '시간 초과' : `${formatSec(ms)}초`}
                </span>
                <span className="stop__gap mono">{isTimeout(ms) ? '—' : formatGap(ms)}</span>
              </div>
            );
          })}
        </div>
        <div className="stage__foot">
          <button className="btn btn--danger btn--lg" onClick={() => onFinish(loserIds)}>
            {loserNames.join(', ')} — 벌칙 뽑기
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'judged') {
    const ms = stops[stops.length - 1];
    const last = turn + 1 >= players.length;
    return (
      <div className="stage stop stop--judged">
        <div className="stop__center">
          <div className="stop__who">
            {players[turn].emoji} {players[turn].name}
          </div>
          <div className="stop__result display mono">
            {isTimeout(ms) ? '시간 초과' : `${formatSec(ms)}초`}
          </div>
          <div className="stop__verdict">
            {!isTimeout(ms) && <span className="stop__gap mono">{formatGap(ms)}</span>}
            <span>{verdictOf(ms)}</span>
          </div>
        </div>
        <div className="stage__foot">
          <button className="btn btn--primary btn--lg" onClick={next}>
            {last ? '결과 보기' : `다음 — ${players[turn + 1].name}`}
          </button>
        </div>
      </div>
    );
  }

  const blind = phase === 'run' && shown >= REVEAL_MS;
  return (
    <button
      className={`stage stop stop--play ${phase === 'run' ? 'is-running' : ''} ${
        blind ? 'is-blind' : ''
      }`}
      onPointerDown={press}
      aria-label={phase === 'brief' ? '탭해서 시작' : '탭해서 정지'}
    >
      <div className="stop__turn muted mono">
        {turn + 1} / {players.length}
      </div>

      <div className="stop__center">
        <div className="stop__who" style={{ color: players[turn].color }}>
          {players[turn].emoji} {players[turn].name}
        </div>

        {phase === 'brief' ? (
          <>
            <div className="stop__cue display">탭하면 시작</div>
            <div className="stop__target mono">{formatSec(TARGET_MS)}초에 다시 탭</div>
          </>
        ) : blind ? (
          <>
            {/* 가린 뒤에는 화면에 아무 박자도 두지 않는다. 깜빡이는 게 하나라도
                있으면 그걸 세면서 맞추게 돼서 게임이 아니게 된다. */}
            <div className="stop__mask display">?</div>
            <div className="stop__target mono">감으로 {formatSec(TARGET_MS)}초</div>
          </>
        ) : (
          <>
            <div className="stop__clock display mono">{formatSec(shown)}</div>
            <div className="stop__target mono">{formatSec(REVEAL_MS)}초까지만 보인다</div>
          </>
        )}
      </div>

      <div className="stop__hint hint">
        {phase === 'brief'
          ? '처음 2초만 보여 주고 나머지는 가린다'
          : '5초라고 생각되면 화면을 누른다'}
      </div>
    </button>
  );
}
