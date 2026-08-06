import type { GameModule } from '../../domain/game';
import { Telepathy } from './Telepathy';

export const telepathy: GameModule = {
  meta: {
    id: 'telepathy',
    title: '텔레파시',
    tagline: '소수파가 마신다',
    emoji: '🧠',
    minPlayers: 2,
    maxPlayers: 12,
    durationSec: 40,
  },
  Component: Telepathy,
};
