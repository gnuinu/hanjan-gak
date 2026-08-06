import { useMemo, useState } from 'react';
import type { GameProps } from '../../domain/game';
import { mulberry32, pick } from '../../domain/rng';
import { TOPICS } from '../../data/topics';
import { judgeTelepathy } from './judge';
import { sfx } from '../../ui/feedback';
import './telepathy.css';

type Phase = 'handoff' | 'answer' | 'reveal';

export function Telepathy({ players, seed, onFinish }: GameProps) {
  const topic = useMemo(() => pick(TOPICS, mulberry32(seed)), [seed]);
  const [turn, setTurn] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [phase, setPhase] = useState<Phase>('handoff');

  const player = players[turn];

  function choose(optionIndex: number) {
    sfx.tap();
    const next = [...answers, optionIndex];
    setAnswers(next);
    if (next.length === players.length) {
      setPhase('reveal');
      sfx.reveal();
    } else {
      setTurn((t) => t + 1);
      setPhase('handoff');
    }
  }

  if (phase === 'reveal') {
    const verdict = judgeTelepathy(answers);
    return (
      <div className="stage tp">
        <div className="stage__head">
          <span className="muted">🧠 텔레파시</span>
        </div>
        <div className="stage__body tp__reveal">
          <div className="tp__q">{topic.q}</div>
          <div className="tp__answers">
            {players.map((p, i) => (
              <div
                key={p.id}
                className={`tp__answer ${verdict.loserIndices.includes(i) ? 'is-loser' : ''}`}
              >
                <span>
                  {p.emoji} {p.name}
                </span>
                <b>{topic.options[answers[i]]}</b>
              </div>
            ))}
          </div>
          <div className={`tp__verdict display ${verdict.synced ? 'is-good' : ''}`}>
            {verdict.synced ? '텔레파시 성공' : '통하지 않았다'}
          </div>
        </div>
        <div className="stage__foot">
          <button
            className={`btn btn--lg ${verdict.synced ? 'btn--ghost' : 'btn--danger'}`}
            onClick={() => onFinish(verdict.loserIndices.map((i) => players[i].id))}
          >
            {verdict.synced
              ? '통과 — 벌칙 없음'
              : `${verdict.loserIndices.map((i) => players[i].name).join(', ')} — 벌칙 뽑기`}
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'handoff') {
    return (
      <button className="stage tp tp__handoff" onPointerDown={() => setPhase('answer')}>
        <div className="muted">폰을 넘기세요</div>
        <div className="tp__who display" style={{ color: player.color }}>
          {player.emoji} {player.name}
        </div>
        <div className="muted">준비됐으면 탭 · 남들이 못 보게</div>
        <div className="mono muted">
          {turn + 1} / {players.length}
        </div>
      </button>
    );
  }

  return (
    <div className="stage tp">
      <div className="stage__head">
        <span className="muted">🧠 텔레파시</span>
        <span className="topbar__spacer" />
        <span className="mono muted" style={{ color: player.color }}>
          {player.name}
        </span>
      </div>
      <div className="stage__body tp__choose">
        <div className="tp__q">{topic.q}</div>
        <div className="tp__options">
          {topic.options.map((opt, i) => (
            <button key={opt} className="tp__option" onClick={() => choose(i)}>
              {opt}
            </button>
          ))}
        </div>
        <div className="hint center">같은 답을 고른 다수가 산다. 소수파가 마신다.</div>
      </div>
    </div>
  );
}
