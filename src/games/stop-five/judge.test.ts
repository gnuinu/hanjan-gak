import { describe, expect, it } from 'vitest';
import {
  TARGET_MS,
  TIMEOUT_MS,
  errorOf,
  formatGap,
  formatSec,
  isTimeout,
  losers,
  ranking,
  verdictOf,
} from './judge';

describe('errorOf', () => {
  it('5초에 맞추면 오차가 없다', () => {
    expect(errorOf(TARGET_MS)).toBe(0);
  });

  it('빨라도 늦어도 어긋난 만큼만 센다', () => {
    expect(errorOf(4800)).toBe(200);
    expect(errorOf(5200)).toBe(200);
  });
});

describe('losers', () => {
  it('가장 많이 어긋난 사람이 걸린다', () => {
    expect(losers([4950, 5300, 4990])).toEqual([1]);
  });

  it('빠른 쪽으로 어긋나도 똑같이 센다', () => {
    expect(losers([3500, 5400, 5100])).toEqual([0]);
  });

  it('오차가 같으면 둘 다 걸린다', () => {
    expect(losers([4700, 5300, 5000])).toEqual([0, 1]);
  });

  it('시간 초과는 대체로 꼴찌다', () => {
    expect(losers([TIMEOUT_MS, 5600, 4400])).toEqual([0]);
  });

  it('아무도 안 했으면 걸린 사람도 없다', () => {
    expect(losers([])).toEqual([]);
  });

  it('혼자면 혼자 걸린다', () => {
    expect(losers([5000])).toEqual([0]);
  });
});

describe('ranking', () => {
  it('정확한 순서대로 준다', () => {
    expect(ranking([5300, 4990, 5100])).toEqual([1, 2, 0]);
  });

  it('오차가 같으면 먼저 한 사람이 앞선다', () => {
    expect(ranking([5200, 4800])).toEqual([0, 1]);
  });

  it('걸린 사람은 항상 맨 뒤에 있다', () => {
    const stops = [4900, 5800, 5050, 4300];
    expect(losers(stops)).toEqual([1]);
    expect(ranking(stops).at(-1)).toBe(1);
  });
});

describe('formatSec / formatGap', () => {
  it('초를 소수 둘째 자리까지 보여 준다', () => {
    expect(formatSec(4870)).toBe('4.87');
    expect(formatSec(5000)).toBe('5.00');
  });

  it('빗나간 방향을 부호로 보여 준다', () => {
    expect(formatGap(5130)).toBe('+0.13');
    expect(formatGap(4870)).toBe('-0.13');
  });

  it('정확히 맞으면 부호는 +', () => {
    expect(formatGap(5000)).toBe('+0.00');
  });
});

describe('verdictOf', () => {
  it('안 누르면 포기', () => {
    expect(verdictOf(TIMEOUT_MS)).toBe('포기');
    expect(isTimeout(TIMEOUT_MS)).toBe(true);
  });

  it('딱 맞으면 완벽', () => {
    expect(verdictOf(5000)).toBe('완벽');
  });

  it('오차가 커질수록 말이 박해진다', () => {
    expect(verdictOf(5040)).toBe('칼 같다');
    expect(verdictOf(4850)).toBe('거의 정확');
    expect(verdictOf(5400)).toBe('무난');
    expect(verdictOf(4100)).toBe('아쉽다');
    expect(verdictOf(6500)).toBe('엉망');
  });

  it('시간 초과 전까지는 그냥 엉망이다', () => {
    expect(isTimeout(TIMEOUT_MS - 1)).toBe(false);
    expect(verdictOf(TIMEOUT_MS - 1)).toBe('엉망');
  });
});
