import { useMemo, useState } from 'react';
import type { GameProps } from '../../domain/game';
import { mulberry32, pick } from '../../domain/rng';
import { BALANCE_QUESTIONS } from '../../data/balance';
import { sfx } from '../../ui/feedback';
import './couple.css';

type Phase = 'handoff-answer' | 'answer' | 'handoff-guess' | 'guess' | 'reveal';

/**
 * 커플 전용. 한 명이 답을 고르고, 다른 한 명이 그 답을 맞힌다.
 *  - 맞히면 → 속마음 들킨 쪽이 마신다 ("그렇게 뻔해?")
 *  - 틀리면 → 못 맞힌 쪽이 마신다 ("이것도 몰라?")
 * 어느 쪽이든 한 명은 마시므로 판이 비지 않는다.
 */
export function CoupleBalance({ players, seed, onFinish }: GameProps) {
  const rand = useMemo(() => mulberry32(seed), [seed]);
  const question = useMemo(() => pick(BALANCE_QUESTIONS, rand), [rand]);
  const answererIdx = useMemo(() => (rand() < 0.5 ? 0 : 1), [rand]);
  const guesserIdx = answererIdx === 0 ? 1 : 0;

  const answerer = players[answererIdx];
  const guesser = players[guesserIdx];

  const [phase, setPhase] = useState<Phase>('handoff-answer');
  const [answer, setAnswer] = useState<'a' | 'b' | null>(null);
  const [guess, setGuess] = useState<'a' | 'b' | null>(null);

  const label = (key: 'a' | 'b') => (key === 'a' ? question.a : question.b);

  if (phase === 'handoff-answer' || phase === 'handoff-guess') {
    const who = phase === 'handoff-answer' ? answerer : guesser;
    const what =
      phase === 'handoff-answer' ? '솔직하게 하나 고르세요' : '상대가 뭘 골랐을지 맞히세요';
    return (
      <button
        className="stage cb cb__handoff"
        onPointerDown={() => setPhase(phase === 'handoff-answer' ? 'answer' : 'guess')}
      >
        <div className="muted">폰을 넘기세요</div>
        <div className="cb__who display" style={{ color: who.color }}>
          {who.emoji} {who.name}
        </div>
        <div className="muted">{what}</div>
        <div className="hint">준비됐으면 탭</div>
      </button>
    );
  }

  if (phase === 'reveal') {
    const hit = answer === guess;
    const loser = hit ? answerer : guesser;
    return (
      <div className="stage cb">
        <div className="stage__head">
          <span className="muted">💞 커플 밸런스</span>
        </div>
        <div className="stage__body cb__reveal">
          <div className="cb__q">{question.q}</div>
          <div className="cb__pair">
            <div className="cb__slot">
              <span className="muted">{answerer.name}의 답</span>
              <b>{label(answer!)}</b>
            </div>
            <div className="cb__slot">
              <span className="muted">{guesser.name}의 예상</span>
              <b>{label(guess!)}</b>
            </div>
          </div>
          <div className={`cb__verdict display ${hit ? 'is-hit' : ''}`}>
            {hit ? '정확히 읽혔다' : '빗나갔다'}
          </div>
          <div className="hint center">
            {hit ? '속마음 들킨 쪽이 마신다' : '못 맞힌 쪽이 마신다'}
          </div>
        </div>
        <div className="stage__foot">
          <button className="btn btn--danger btn--lg" onClick={() => onFinish([loser.id])}>
            {loser.name} — 벌칙 뽑기
          </button>
        </div>
      </div>
    );
  }

  const isAnswering = phase === 'answer';
  const actor = isAnswering ? answerer : guesser;

  const choose = (key: 'a' | 'b') => {
    sfx.tap();
    if (isAnswering) {
      setAnswer(key);
      setPhase('handoff-guess');
    } else {
      setGuess(key);
      setPhase('reveal');
      sfx.reveal();
    }
  };

  return (
    <div className="stage cb">
      <div className="stage__head">
        <span className="muted">💞 커플 밸런스</span>
        <span className="topbar__spacer" />
        <span className="mono muted" style={{ color: actor.color }}>
          {actor.name}
        </span>
      </div>
      <div className="stage__body cb__choose">
        <div className="cb__q">{question.q}</div>
        {!isAnswering && (
          <div className="hint center">{answerer.name}이(가) 고른 답을 맞혀보세요</div>
        )}
        <div className="cb__options">
          <button className="cb__option" onClick={() => choose('a')}>
            {question.a}
          </button>
          <button className="cb__option" onClick={() => choose('b')}>
            {question.b}
          </button>
        </div>
      </div>
    </div>
  );
}
