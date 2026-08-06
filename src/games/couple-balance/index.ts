import type { GameModule } from '../../domain/game';
import { CoupleBalance } from './CoupleBalance';

export const coupleBalance: GameModule = {
  meta: {
    id: 'couple-balance',
    title: '커플 밸런스',
    tagline: '읽히면 내가, 못 읽으면 네가',
    emoji: '💞',
    minPlayers: 2,
    maxPlayers: 2,
    durationSec: 40,
    audience: 'couple',
  },
  Component: CoupleBalance,
};
