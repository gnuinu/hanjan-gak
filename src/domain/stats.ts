import type { Player, RoundResult } from './types';

export interface SessionStats {
  totalRounds: number;
  /** 많이 걸린 순 */
  byPlayer: { player: Player; count: number }[];
  /** 한 번도 안 걸린 사람 */
  untouched: Player[];
  /** 많이 한 순 */
  byGame: { gameId: string; count: number }[];
  mostBusted: Player | null;
}

/**
 * 이번 자리 통계. 여기 있는 것 이상은 넣지 않는다.
 * (멤버별 장기 누적은 이름만으로 사람을 식별할 수 없어서 별도 과제)
 */
export function computeStats(history: RoundResult[], players: Player[]): SessionStats {
  const counts = new Map<string, number>(players.map((p) => [p.id, 0]));
  const games = new Map<string, number>();

  for (const round of history) {
    games.set(round.gameId, (games.get(round.gameId) ?? 0) + 1);
    for (const id of round.loserIds) {
      if (counts.has(id)) counts.set(id, counts.get(id)! + 1);
    }
  }

  const byPlayer = players
    .map((player) => ({ player, count: counts.get(player.id) ?? 0 }))
    .sort((a, b) => b.count - a.count);

  const byGame = [...games.entries()]
    .map(([gameId, count]) => ({ gameId, count }))
    .sort((a, b) => b.count - a.count);

  const top = byPlayer[0];

  return {
    totalRounds: history.length,
    byPlayer,
    untouched: byPlayer.filter((e) => e.count === 0).map((e) => e.player),
    byGame,
    mostBusted: top && top.count > 0 ? top.player : null,
  };
}
