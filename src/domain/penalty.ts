import { PENALTIES } from '../data/penalties';
import type { PartyMode, Penalty } from './types';

export interface DrawSettings {
  penaltyLevel: 1 | 2 | 3;
  drinkFreeMode: boolean;
  partyMode: PartyMode;
}

/** 지금 설정에서 뽑힐 수 있는 벌칙 전부 */
export function penaltyPool(settings: DrawSettings, custom: Penalty[] = []): Penalty[] {
  return [...PENALTIES, ...custom].filter((p) => {
    if (p.level > settings.penaltyLevel) return false;
    if (settings.drinkFreeMode && p.isDrinking) return false;
    const audience = p.audience ?? 'all';
    if (audience === 'couple' && settings.partyMode !== 'couple') return false;
    if (audience === 'friends' && settings.partyMode !== 'friends') return false;
    return true;
  });
}

const FALLBACK: Penalty = {
  id: 'fallback',
  level: 1,
  isDrinking: false,
  text: '벌칙 면제. 대신 다같이 박수 한 번',
};

/**
 * 설정에 맞는 벌칙 풀에서 하나 뽑는다.
 * 같은 벌칙이 연달아 나오면 김이 새므로 최근 N개는 제외한다.
 */
export function drawPenalty(
  settings: DrawSettings,
  recentIds: string[],
  custom: Penalty[] = [],
  rand: () => number = Math.random,
): Penalty {
  let pool = penaltyPool(settings, custom);
  if (pool.length === 0) return FALLBACK; // 커스텀까지 전부 지운 극단적인 경우

  const fresh = pool.filter((p) => !recentIds.includes(p.id));
  if (fresh.length > 0) pool = fresh;

  return pool[Math.floor(rand() * pool.length)];
}
