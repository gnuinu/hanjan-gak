import { describe, expect, it } from 'vitest';
import { MAX_KEYS, assignKeys, keyToCode, seatOfCode } from './keys';

describe('assignKeys', () => {
  it('인원수만큼 준다', () => {
    expect(assignKeys(4)).toHaveLength(4);
  });

  it('둘이면 양 끝을 준다 — 손이 부딪히지 않게', () => {
    expect(assignKeys(2)).toEqual(['a', 'l']);
  });

  it('자리 순서대로 왼쪽에서 오른쪽으로 배정한다', () => {
    expect(assignKeys(3)).toEqual(['a', 'g', 'l']);
  });

  it('2명부터 꽉 채울 때까지 키가 겹치지 않는다', () => {
    for (let n = 2; n <= MAX_KEYS; n++) {
      expect(new Set(assignKeys(n)).size).toBe(n);
    }
  });

  it('한 명이면 하나만', () => {
    expect(assignKeys(1)).toEqual(['a']);
  });
});

describe('seatOfCode', () => {
  const keys = assignKeys(3); // a g l

  it('배정된 키면 자리 번호를 준다', () => {
    expect(seatOfCode(keys, keyToCode('g'))).toBe(1);
  });

  it('배정 안 된 키면 -1', () => {
    expect(seatOfCode(keys, 'KeyZ')).toBe(-1);
  });
});
