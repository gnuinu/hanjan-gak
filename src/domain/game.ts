import type { ComponentType } from 'react';
import type { Audience, Player } from './types';

export interface GameMeta {
  id: string;
  title: string; // "경마"
  tagline: string; // "꼴찌 말에 건 사람이 마신다"
  emoji: string;
  minPlayers: number;
  maxPlayers: number;
  durationSec: number; // 대략적 소요 시간 (랜덤 추천에 사용)
  needsMultiTouch?: boolean;
  /** 한 키보드에 둘러앉아 하는 게임. 게임 목록에 PC 배지가 붙는다 */
  needsKeyboard?: boolean;
  audience?: Audience; // 생략하면 'all'
}

export interface GameProps {
  players: Player[];
  seed: number;
  onFinish: (loserIds: string[]) => void;
}

export interface GameModule {
  meta: GameMeta;
  Component: ComponentType<GameProps>;
}

/** 지금 설정에서 이 게임을 고를 수 있는가 */
export function isGamePlayable(
  meta: GameMeta,
  playerCount: number,
  partyMode: 'friends' | 'couple',
): boolean {
  if (playerCount < meta.minPlayers || playerCount > meta.maxPlayers) return false;
  const audience = meta.audience ?? 'all';
  if (audience === 'couple' && partyMode !== 'couple') return false;
  if (audience === 'friends' && partyMode !== 'friends') return false;
  return true;
}
