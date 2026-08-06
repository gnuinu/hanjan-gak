import type { GameModule } from '../../domain/game';
import { BombCard } from './BombCard';

export const bombCard: GameModule = {
  meta: {
    id: 'bomb-card',
    title: '폭탄 카드',
    tagline: '한 장씩 뒤집는다',
    emoji: '💣',
    minPlayers: 2,
    maxPlayers: 12,
    durationSec: 25,
  },
  Component: BombCard,
};
