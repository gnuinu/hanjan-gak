import type { GameModule } from '../domain/game';
import { horseRace } from './horse-race';
import { touchRoulette } from './touch-roulette';
import { bombCard } from './bomb-card';
import { reaction } from './reaction';
import { spinWheel } from './spin-wheel';
import { telepathy } from './telepathy';
import { coupleBalance } from './couple-balance';

// 게임 추가는 여기 한 줄이면 끝난다. 셸 코드는 건드리지 않는다.
export const GAMES: GameModule[] = [
  horseRace,
  touchRoulette,
  bombCard,
  reaction,
  spinWheel,
  telepathy,
  coupleBalance,
];

export function findGame(id: string): GameModule | undefined {
  return GAMES.find((g) => g.meta.id === id);
}
