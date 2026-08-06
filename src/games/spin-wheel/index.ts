import type { GameModule } from '../../domain/game';
import { SpinWheel } from './SpinWheel';

export const spinWheel: GameModule = {
  meta: {
    id: 'spin-wheel',
    title: '룰렛',
    tagline: '그냥 아무나 정해줘',
    emoji: '🎯',
    minPlayers: 2,
    maxPlayers: 12,
    durationSec: 8,
  },
  Component: SpinWheel,
};
