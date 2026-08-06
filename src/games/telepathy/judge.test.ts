import { describe, expect, it } from 'vitest';
import { judgeTelepathy } from './judge';

describe('judgeTelepathy', () => {
  it('전원 일치면 아무도 안 걸린다', () => {
    expect(judgeTelepathy([2, 2, 2, 2])).toEqual({ loserIndices: [], synced: true });
  });

  it('혼자 다른 답을 고른 사람이 걸린다', () => {
    expect(judgeTelepathy([1, 1, 1, 0]).loserIndices).toEqual([3]);
  });

  it('소수파 전원이 걸린다', () => {
    expect(judgeTelepathy([0, 0, 0, 1, 1]).loserIndices).toEqual([3, 4]);
  });

  it('둘이서 답이 갈리면 둘 다 걸린다', () => {
    expect(judgeTelepathy([0, 1]).loserIndices).toEqual([0, 1]);
  });

  it('전부 제각각이면 전원 걸린다', () => {
    expect(judgeTelepathy([0, 1, 2]).loserIndices).toEqual([0, 1, 2]);
  });

  it('동점인 소수파가 여럿이면 다 걸린다', () => {
    // 0번 답 3명, 1번 답 1명, 2번 답 1명
    expect(judgeTelepathy([0, 0, 0, 1, 2]).loserIndices).toEqual([3, 4]);
  });
});
