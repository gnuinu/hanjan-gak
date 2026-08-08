/**
 * 한 키보드에 여러 명이 둘러앉을 때 키를 나눠주는 규칙.
 * 폰을 돌리는 대신 노트북 한 대로 하는 게임들이 같이 쓴다.
 */

const KEY_POOL = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'] as const;

export const MAX_KEYS = KEY_POOL.length;

/**
 * 자리에 앉은 순서대로 키를 나눠준다.
 * 인원이 적을수록 키 사이가 벌어지도록 홈 로우 전체에 고르게 퍼뜨린다
 * (둘이서 하면 A 와 L — 손이 안 부딪히게).
 */
export function assignKeys(count: number): string[] {
  if (count <= 1) return KEY_POOL.slice(0, Math.max(count, 0));
  const span = KEY_POOL.length - 1;
  return Array.from({ length: count }, (_, i) => KEY_POOL[Math.round((i * span) / (count - 1))]);
}

/** 키보드 레이아웃/한글 IME 와 무관하게 물리 키로 잡는다 */
export function keyToCode(key: string): string {
  return `Key${key.toUpperCase()}`;
}

/** 누른 물리 키가 몇 번 자리인지. 배정된 키가 아니면 -1 */
export function seatOfCode(keys: string[], code: string): number {
  return keys.findIndex((k) => keyToCode(k) === code);
}
