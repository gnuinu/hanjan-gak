import type { GameModule } from '../../domain/game';
import { Reaction } from './Reaction';

export const reaction: GameModule = {
  meta: {
    id: 'reaction',
    title: '반응 속도',
    tagline: '제일 느린 사람이 마신다',
    emoji: '⚡',
    minPlayers: 2,
    maxPlayers: 12,
    durationSec: 20,
    needsMultiTouch: true,
  },
  Component: Reaction,
};
