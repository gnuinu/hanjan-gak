import { describe, expect, it } from 'vitest';
import { computeStats } from './stats';
import type { Player, RoundResult } from './types';

const players: Player[] = [
  { id: 'a', name: '가', color: '#1', emoji: '🐰' },
  { id: 'b', name: '나', color: '#2', emoji: '🐻' },
  { id: 'c', name: '다', color: '#3', emoji: '🦊' },
];

const penalty = { id: 'p1', text: '한 잔', level: 1 as const, isDrinking: true };
const round = (gameId: string, loserIds: string[]): RoundResult => ({
  gameId,
  loserIds,
  penalty,
  playedAt: 0,
});

describe('computeStats', () => {
  it('빈 기록도 처리한다', () => {
    const s = computeStats([], players);
    expect(s.totalRounds).toBe(0);
    expect(s.mostBusted).toBeNull();
    expect(s.untouched).toHaveLength(3);
  });

  it('가장 많이 걸린 사람을 찾는다', () => {
    const s = computeStats(
      [round('horse-race', ['a']), round('bomb-card', ['a']), round('reaction', ['b'])],
      players,
    );
    expect(s.mostBusted?.id).toBe('a');
    expect(s.byPlayer[0].count).toBe(2);
    expect(s.totalRounds).toBe(3);
  });

  it('한 번도 안 걸린 사람을 추린다', () => {
    const s = computeStats([round('horse-race', ['a'])], players);
    expect(s.untouched.map((p) => p.id).sort()).toEqual(['b', 'c']);
  });

  it('한 판에 여러 명이 걸려도 각각 센다', () => {
    const s = computeStats([round('telepathy', ['a', 'b'])], players);
    expect(s.byPlayer.find((e) => e.player.id === 'a')!.count).toBe(1);
    expect(s.byPlayer.find((e) => e.player.id === 'b')!.count).toBe(1);
    expect(s.totalRounds).toBe(1);
  });

  it('게임별 판 수를 센다', () => {
    const s = computeStats(
      [round('horse-race', ['a']), round('horse-race', ['b']), round('spin-wheel', ['c'])],
      players,
    );
    expect(s.byGame[0]).toEqual({ gameId: 'horse-race', count: 2 });
    expect(s.byGame).toHaveLength(2);
  });

  it('이미 나간 사람의 기록은 무시한다', () => {
    const s = computeStats([round('horse-race', ['zzz'])], players);
    expect(s.mostBusted).toBeNull();
    expect(s.totalRounds).toBe(1);
  });
});
