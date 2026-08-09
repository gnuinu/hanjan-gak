import type { GameModule } from '../domain/game';
import { horseRace } from './horse-race';
import { touchRoulette } from './touch-roulette';
import { bombCard } from './bomb-card';
import { reaction } from './reaction';
import { spinWheel } from './spin-wheel';
import { telepathy } from './telepathy';
import { funnelDrop } from './funnel-drop';
import { coupleBalance } from './couple-balance';
import { nunchi } from './nunchi';
import { stopFive } from './stop-five';

// 게임 추가는 여기 한 줄이면 끝난다. 셸 코드는 건드리지 않는다.
export const GAMES: GameModule[] = [
  horseRace,
  touchRoulette,
  bombCard,
  reaction,
  spinWheel,
  telepathy,
  funnelDrop,
  nunchi,
  stopFive,
  coupleBalance,
];

export function findGame(id: string): GameModule | undefined {
  return GAMES.find((g) => g.meta.id === id);
}
