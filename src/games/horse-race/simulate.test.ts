import { describe, expect, it } from 'vitest';
import { simulateRace } from './simulate';

describe('simulateRace', () => {
  it('같은 시드는 같은 레이스를 만든다', () => {
    const a = simulateRace(5, 12345);
    const b = simulateRace(5, 12345);
    expect(a.ranking).toEqual(b.ranking);
    expect(a.events.length).toBe(b.events.length);
    expect(a.events.at(-1)!.positions).toEqual(b.events.at(-1)!.positions);
  });

  it('다른 시드는 다른 레이스를 만든다', () => {
    const rankings = new Set(
      Array.from({ length: 20 }, (_, s) => simulateRace(6, s + 1).ranking.join()),
    );
    expect(rankings.size).toBeGreaterThan(1);
  });

  it('ranking 은 전원을 한 번씩 담은 순열이다', () => {
    for (let n = 2; n <= 12; n++) {
      const { ranking } = simulateRace(n, n * 77);
      expect(ranking.length).toBe(n);
      expect([...ranking].sort((a, b) => a - b)).toEqual(
        Array.from({ length: n }, (_, i) => i),
      );
    }
  });

  it('모든 말이 결승선에 들어온다', () => {
    for (let s = 0; s < 30; s++) {
      const { events } = simulateRace(8, s);
      const last = events.at(-1)!;
      expect(Math.min(...last.positions)).toBeGreaterThanOrEqual(1);
    }
  });

  it('진행률은 0~1 안에 머문다', () => {
    const { events } = simulateRace(12, 999);
    for (const e of events) {
      for (const p of e.positions) {
        expect(p).toBeGreaterThanOrEqual(0);
        expect(p).toBeLessThanOrEqual(1);
      }
    }
  });

  it('레이스 길이가 5~12초 사이다 (60틱/초)', () => {
    for (let s = 0; s < 30; s++) {
      const { events } = simulateRace(6, s);
      expect(events.length).toBeGreaterThan(300);
      expect(events.length).toBeLessThan(720);
    }
  });

  it('꼴찌는 결승선에 가장 늦게 들어온 말이다', () => {
    const { events, ranking } = simulateRace(7, 4242);
    const last = ranking.at(-1)!;
    const firstReach = (horse: number) =>
      events.findIndex((e) => e.positions[horse] >= 1);
    for (const other of ranking.slice(0, -1)) {
      expect(firstReach(other)).toBeLessThanOrEqual(firstReach(last));
    }
  });

  it('순위가 중간에 한 번은 뒤집힌다', () => {
    const { events } = simulateRace(5, 2024);
    const leaderAt = (e: (typeof events)[number]) =>
      e.positions.indexOf(Math.max(...e.positions));
    const leaders = new Set(events.filter((_, i) => i % 20 === 0).map(leaderAt));
    expect(leaders.size).toBeGreaterThan(1);
  });
});
