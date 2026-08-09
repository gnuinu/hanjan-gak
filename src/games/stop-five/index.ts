import type { GameModule } from '../../domain/game';
import { StopFive } from './StopFive';

export const stopFive: GameModule = {
  meta: {
    id: 'stop-five',
    title: '5초 정지',
    tagline: '제일 많이 빗나간 사람이 마신다',
    emoji: '⏱️',
    minPlayers: 2,
    maxPlayers: 12,
    durationSec: 45, // 한 명씩 도는 게임이라 인원만큼 길어진다
  },
  Component: StopFive,
};
