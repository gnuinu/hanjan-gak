import { describe, expect, it } from 'vitest';
import { applyPresses, initialNunchi, nextNumber, silentPlayers } from './judge';

/** 한 명씩 차례로 눌러서 상태를 굴린다 */
function callAll(order: number[], total: number) {
  return order.reduce((s, i) => applyPresses(s, [i], total), initialNunchi());
}

describe('applyPresses', () => {
  it('혼자 누르면 숫자가 하나 올라간다', () => {
    const s = applyPresses(initialNunchi(), [2], 5);
    expect(s.status).toBe('playing');
    expect(s.called).toEqual([2]);
    expect(nextNumber(s)).toBe(2);
  });

  it('같은 순간에 둘이 누르면 둘 다 걸린다', () => {
    const s = applyPresses(initialNunchi(), [3, 1], 5);
    expect(s.status).toBe('collision');
    expect(s.losers).toEqual([1, 3]);
    expect(s.called).toEqual([]);
  });

  it('셋이 겹쳐도 전원 걸린다', () => {
    expect(applyPresses(initialNunchi(), [0, 2, 4], 5).losers).toEqual([0, 2, 4]);
  });

  it('마지막 한 명이 남으면 그 사람이 걸린다', () => {
    const s = callAll([0, 3, 1], 4); // 2번만 안 외쳤다
    expect(s.status).toBe('left-out');
    expect(s.losers).toEqual([2]);
  });

  it('아직 두 명 넘게 남았으면 안 끝난다', () => {
    expect(callAll([0, 3, 1], 5).status).toBe('playing');
  });

  it('이미 외친 사람이 또 눌러도 무시한다', () => {
    const s = applyPresses(applyPresses(initialNunchi(), [1], 5), [1], 5);
    expect(s.called).toEqual([1]);
    expect(s.status).toBe('playing');
  });

  it('이미 외친 사람이 낀 동시 입력은 나머지 한 명만 인정한다', () => {
    const first = applyPresses(initialNunchi(), [1], 5);
    const s = applyPresses(first, [1, 4], 5);
    expect(s.status).toBe('playing');
    expect(s.called).toEqual([1, 4]);
  });

  it('범위 밖 인덱스는 무시한다', () => {
    expect(applyPresses(initialNunchi(), [9, -1], 5)).toEqual(initialNunchi());
  });

  it('끝난 판은 더 이상 안 움직인다', () => {
    const done = applyPresses(initialNunchi(), [0, 1], 5);
    expect(applyPresses(done, [2], 5)).toBe(done);
  });

  it('3명이면 두 명만 외쳐도 끝난다', () => {
    const s = callAll([2, 0], 3);
    expect(s.status).toBe('left-out');
    expect(s.losers).toEqual([1]);
  });

  it('첫 입력부터 충돌이면 아무도 못 외친 채 끝난다', () => {
    const s = applyPresses(initialNunchi(), [0, 1], 3);
    expect(nextNumber(s)).toBe(1);
  });
});

describe('silentPlayers', () => {
  it('아직 안 외친 사람을 순서대로 준다', () => {
    expect(silentPlayers(callAll([3, 0], 5), 5)).toEqual([1, 2, 4]);
  });
});
