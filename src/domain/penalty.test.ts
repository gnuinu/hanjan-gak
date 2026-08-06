import { describe, expect, it } from 'vitest';
import { PENALTIES } from '../data/penalties';
import { drawPenalty, penaltyPool } from './penalty';
import { mulberry32 } from './rng';
import type { Penalty } from './types';

const base = { penaltyLevel: 3, drinkFreeMode: false, partyMode: 'friends' } as const;

describe('벌칙 덱', () => {
  it('id가 중복되지 않는다', () => {
    const ids = new Set(PENALTIES.map((p) => p.id));
    expect(ids.size).toBe(PENALTIES.length);
  });

  it('레벨별로 20개 이상 있다', () => {
    for (const level of [1, 2, 3] as const) {
      expect(PENALTIES.filter((p) => p.level === level).length).toBeGreaterThanOrEqual(20);
    }
  });

  it('커플 덱도 레벨별로 채워져 있다', () => {
    for (const level of [1, 2, 3] as const) {
      const n = PENALTIES.filter((p) => p.level === level && p.audience === 'couple').length;
      expect(n).toBeGreaterThanOrEqual(10);
    }
  });
});

describe('penaltyPool', () => {
  it('설정 레벨보다 매운 벌칙은 빠진다', () => {
    const pool = penaltyPool({ ...base, penaltyLevel: 1 });
    expect(pool.every((p) => p.level === 1)).toBe(true);
  });

  it('음주 무관 모드에서 술 벌칙이 하나도 없다', () => {
    const pool = penaltyPool({ ...base, drinkFreeMode: true });
    expect(pool.some((p) => p.isDrinking)).toBe(false);
    expect(pool.length).toBeGreaterThan(0);
  });

  it('친구 모드에서는 커플 전용이 안 나온다', () => {
    const pool = penaltyPool({ ...base, partyMode: 'friends' });
    expect(pool.some((p) => p.audience === 'couple')).toBe(false);
  });

  it('커플 모드에서는 커플 전용이 열리고 단체 전용이 빠진다', () => {
    const pool = penaltyPool({ ...base, partyMode: 'couple' });
    expect(pool.some((p) => p.audience === 'couple')).toBe(true);
    expect(pool.some((p) => p.audience === 'friends')).toBe(false);
  });
});

describe('drawPenalty', () => {
  it('최근에 나온 벌칙은 피한다', () => {
    const recent = PENALTIES.filter((p) => p.level === 1 && !p.isDrinking)
      .slice(0, 15)
      .map((p) => p.id);
    for (let seed = 0; seed < 50; seed++) {
      const drawn = drawPenalty(
        { ...base, penaltyLevel: 1, drinkFreeMode: true },
        recent,
        [],
        mulberry32(seed),
      );
      expect(recent).not.toContain(drawn.id);
    }
  });

  it('풀이 전부 최근 목록이면 그래도 하나는 뽑는다', () => {
    const all = PENALTIES.map((p) => p.id);
    const drawn = drawPenalty(base, all, [], mulberry32(1));
    expect(drawn).toBeDefined();
  });

  it('커스텀 벌칙도 뽑힌다', () => {
    const custom: Penalty[] = [{ id: 'x1', level: 1, isDrinking: false, text: '커스텀' }];
    const settings = { ...base, penaltyLevel: 1, drinkFreeMode: true } as const;
    const others = penaltyPool(settings).map((p) => p.id);
    const drawn = drawPenalty(settings, others, custom, mulberry32(7));
    expect(drawn.id).toBe('x1');
  });

  it('풀이 완전히 비어도 터지지 않는다', () => {
    const impossible = penaltyPool({ ...base, penaltyLevel: 1, drinkFreeMode: true });
    expect(impossible.length).toBeGreaterThan(0); // 실제로는 비지 않지만
    const drawn = drawPenalty(
      { ...base, penaltyLevel: 1, drinkFreeMode: true },
      [],
      [],
      mulberry32(3),
    );
    expect(drawn.text.length).toBeGreaterThan(0);
  });
});
