import type { GameModule } from '../../domain/game';
import { Race } from './Race';

export const horseRace: GameModule = {
  meta: {
    id: 'horse-race',
    title: '경마',
    tagline: '꼴찌 말이 마신다',
    emoji: '🏇',
    minPlayers: 2,
    maxPlayers: 12,
    durationSec: 15,
  },
  Component: Race,
};
