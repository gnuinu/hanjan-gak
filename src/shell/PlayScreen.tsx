import { useCallback, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { findGame } from '../games/registry';
import { isGamePlayable } from '../domain/game';
import { drawPenalty } from '../domain/penalty';
import { randomSeed } from '../domain/rng';
import { useSession } from '../store/session';
import { useRound } from '../store/round';
import { useWakeLock } from '../ui/useWakeLock';
import './play.css';

/**
 * 게임과 나머지 앱 사이의 유일한 접점.
 * 게임은 onFinish(loserIds)만 부르고, 벌칙 배정·기록·화면 전환은 전부 여기서 한다.
 */
export function PlayScreen() {
  const { gameId = '' } = useParams();
  const nav = useNavigate();
  useWakeLock();

  const players = useSession((s) => s.players);
  const settings = useSession((s) => s.settings);
  const custom = useSession((s) => s.customPenalties);
  const addRound = useSession((s) => s.addRound);
  const recentPenaltyIds = useSession((s) => s.recentPenaltyIds);
  const setLast = useRound((s) => s.setLast);

  const [seed] = useState(randomSeed);
  const game = findGame(gameId);

  const onFinish = useCallback(
    (loserIds: string[]) => {
      // 걸린 사람이 없는 판(팀 나누기, 텔레파시 성공)은 기록하지 않는다
      if (loserIds.length === 0) {
        nav('/games');
        return;
      }
      const penalty = drawPenalty(settings, recentPenaltyIds(), custom);
      const round = { gameId, loserIds, penalty, playedAt: Date.now() };
      addRound(round);
      setLast(round);
      nav('/result');
    },
    [addRound, custom, gameId, nav, recentPenaltyIds, setLast, settings],
  );

  if (!game) return <Navigate to="/games" replace />;
  if (!isGamePlayable(game.meta, players.length, settings.partyMode)) {
    return <Navigate to="/games" replace />;
  }

  const { Component } = game;
  return (
    <>
      <Component players={players} seed={seed} onFinish={onFinish} />
      <button className="bail" onClick={() => nav('/games')} aria-label="그만두기">
        ✕
      </button>
    </>
  );
}
