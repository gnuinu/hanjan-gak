/**
 * 눈치게임 판정. React 도, 타이머도 모르는 순수 로직.
 *
 * 규칙은 술자리 그대로다.
 * - 아무나 아무 때나 다음 숫자를 외칠 수 있다. 순서는 없다.
 * - 두 명 이상이 같은 순간에 외치면 그 사람들이 전부 걸린다.
 * - 한 명만 남을 때까지 아무도 안 걸리면, 끝까지 못 외치고 남은 사람이 걸린다.
 *
 * "같은 순간"의 폭(충돌 판정 창)은 UI 쪽 관심사라 여기서는 다루지 않는다.
 * 컴포넌트가 창 안에 들어온 입력을 모아서 `applyPresses` 에 한 번에 넘긴다.
 */

export type NunchiStatus = 'playing' | 'collision' | 'left-out';

export interface NunchiState {
  /** 외친 순서대로 쌓이는 플레이어 인덱스. i번째 원소가 숫자 (i+1) 을 외친 사람 */
  called: number[];
  /** 걸린 사람 인덱스. 진행 중이면 빈 배열 */
  losers: number[];
  status: NunchiStatus;
}

export function initialNunchi(): NunchiState {
  return { called: [], losers: [], status: 'playing' };
}

/** 다음에 외쳐야 할 숫자 */
export function nextNumber(state: NunchiState): number {
  return state.called.length + 1;
}

/** 아직 안 외친 사람 */
export function silentPlayers(state: NunchiState, total: number): number[] {
  return range(total).filter((i) => !state.called.includes(i));
}

/**
 * 충돌 판정 창 안에 들어온 입력들을 한꺼번에 적용한다.
 * 이미 외친 사람과 범위 밖 인덱스는 무시하고, 남은 게 없으면 상태를 그대로 돌려준다.
 */
export function applyPresses(state: NunchiState, pressed: number[], total: number): NunchiState {
  if (state.status !== 'playing') return state;

  const fresh = [...new Set(pressed)]
    .filter((i) => Number.isInteger(i) && i >= 0 && i < total && !state.called.includes(i))
    .sort((a, b) => a - b);

  if (fresh.length === 0) return state;

  // 동시에 외쳤다 — 외친 사람 전원이 걸린다
  if (fresh.length > 1) {
    return { called: state.called, losers: fresh, status: 'collision' };
  }

  const called = [...state.called, fresh[0]];

  // 한 명 빼고 다 외쳤다 — 남은 사람이 걸린다
  if (called.length >= total - 1) {
    return { called, losers: silentPlayers({ ...state, called }, total), status: 'left-out' };
  }

  return { called, losers: [], status: 'playing' };
}

function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}
