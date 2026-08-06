export interface TelepathyVerdict {
  /** 걸린 사람의 인덱스. 전원 일치면 빈 배열 */
  loserIndices: number[];
  /** 전원이 같은 답을 골랐는가 */
  synced: boolean;
}

/**
 * 소수파가 마신다.
 * - 전원 같은 답 → 통했다. 아무도 안 마신다.
 * - 아니면 가장 적게 선택된 답을 고른 사람들이 전부 걸린다.
 * - 모든 답이 제각각(그룹 크기가 전부 같음)이면 전원 걸린다.
 */
export function judgeTelepathy(answers: number[]): TelepathyVerdict {
  const groups = new Map<number, number[]>();
  answers.forEach((a, i) => {
    const g = groups.get(a) ?? [];
    g.push(i);
    groups.set(a, g);
  });

  if (groups.size === 1) return { loserIndices: [], synced: true };

  const sizes = [...groups.values()].map((g) => g.length);
  const min = Math.min(...sizes);
  const losers = [...groups.values()].filter((g) => g.length === min).flat();

  return { loserIndices: losers.sort((a, b) => a - b), synced: false };
}
