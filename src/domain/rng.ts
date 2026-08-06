/**
 * mulberry32 — 32비트 시드 하나로 재현 가능한 난수열을 만든다.
 * 게임 로직을 순수 함수로 유지하려면 Math.random 대신 이걸 쓴다.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 0xffffffff) >>> 0;
}

export function pick<T>(items: readonly T[], rand: () => number): T {
  return items[Math.floor(rand() * items.length)];
}

/** Fisher–Yates. 원본을 건드리지 않는다. */
export function shuffle<T>(items: readonly T[], rand: () => number): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
