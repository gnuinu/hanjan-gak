import type { GameModule } from '../../domain/game';
import { FunnelDrop } from './Funnel';

export const funnelDrop: GameModule = {
  meta: {
    id: 'funnel-drop',
    title: '깔때기',
    tagline: '제일 먼저 빠져나오면 걸린다',
    emoji: '🫗',
    minPlayers: 2,
    maxPlayers: 12,
    durationSec: 15,
  },
  Component: FunnelDrop,
};
