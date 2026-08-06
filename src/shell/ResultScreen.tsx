import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useRound } from '../store/round';
import { useSession } from '../store/session';
import { drawPenalty } from '../domain/penalty';
import { findGame } from '../games/registry';
import { Button } from '../ui/Button';
import { FlipText } from '../ui/FlipText';
import { sfx } from '../ui/feedback';
import './result.css';

export function ResultScreen() {
  const nav = useNavigate();
  const last = useRound((s) => s.last);
  const replacePenalty = useRound((s) => s.replacePenalty);
  const players = useSession((s) => s.players);
  const settings = useSession((s) => s.settings);
  const custom = useSession((s) => s.customPenalties);
  const recentPenaltyIds = useSession((s) => s.recentPenaltyIds);
  const replaceLastPenalty = useSession((s) => s.replaceLastPenalty);

  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (revealed) sfx.reveal();
  }, [revealed]);

  if (!last) return <Navigate to="/games" replace />;

  const losers = last.loserIds
    .map((id) => players.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const game = findGame(last.gameId);

  const reroll = () => {
    sfx.tap();
    const penalty = drawPenalty(settings, [...recentPenaltyIds(), last.penalty.id], custom);
    replacePenalty(penalty);
    replaceLastPenalty(penalty);
  };

  return (
    <div className="screen result">
      <div className="screen__body result__body">
        <div className="result__label muted">{game?.meta.emoji} 걸렸습니다</div>

        <div className="result__names">
          {losers.map((p) => (
            <FlipText key={p.id} text={p.name} className="result__name" />
          ))}
          {losers.length === 0 && <span className="result__name display">???</span>}
        </div>

        <motion.button
          className="penalty"
          onClick={() => !revealed && setRevealed(true)}
          initial={false}
          animate={{ rotateY: revealed ? 0 : 180 }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {revealed ? (
            <div className="penalty__face">
              <span className={`penalty__level lv${last.penalty.level}`}>
                {['순함', '보통', '매움'][last.penalty.level - 1]}
                {last.penalty.isDrinking ? ' · 음주' : ''}
              </span>
              <span className="penalty__text">{last.penalty.text}</span>
            </div>
          ) : (
            <div className="penalty__back" style={{ transform: 'rotateY(180deg)' }}>
              <span className="display">벌칙</span>
              <span className="hint">탭해서 뒤집기</span>
            </div>
          )}
        </motion.button>
      </div>

      <div className="screen__foot">
        <Button size="lg" onClick={() => nav(`/play/${last.gameId}`)}>
          한 판 더
        </Button>
        <div className="row" style={{ gap: 10 }}>
          <Button variant="ghost" onClick={() => nav('/games')}>
            다른 게임
          </Button>
          <Button variant="ghost" onClick={() => nav('/stats')}>
            오늘의 기록
          </Button>
        </div>
        <button className="btn btn--quiet" onClick={reroll}>
          벌칙 다시 뽑기
        </button>
        <p className="hint center">
          매움(레벨 3) 벌칙은 언제든 거부 가능. 거부하면 대신 한 잔.
        </p>
      </div>
    </div>
  );
}
