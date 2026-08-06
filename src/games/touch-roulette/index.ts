import type { GameModule } from '../../domain/game';
import { TouchRoulette } from './TouchRoulette';

export const touchRoulette: GameModule = {
  meta: {
    id: 'touch-roulette',
    title: '손가락 룰렛',
    tagline: '다같이 손 대고 3초',
    emoji: '👆',
    minPlayers: 2,
    maxPlayers: 10,
    durationSec: 10,
    needsMultiTouch: true,
  },
  Component: TouchRoulette,
};
