import type { GameModule } from '../../domain/game';
import { Nunchi } from './Nunchi';

export const nunchi: GameModule = {
  meta: {
    id: 'nunchi',
    title: '눈치게임',
    tagline: '겹치면 같이 죽는다',
    emoji: '👀',
    minPlayers: 3, // 둘이서는 눈치싸움이 안 된다 (먼저 누른 사람이 무조건 산다)
    maxPlayers: 8,
    durationSec: 25,
    needsKeyboard: true,
  },
  Component: Nunchi,
};
