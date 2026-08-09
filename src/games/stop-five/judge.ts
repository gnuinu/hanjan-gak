/**
 * 5초 정지 판정. React 도, 타이머도 모르는 순수 로직.
 *
 * 규칙.
 * - 한 명씩 돌아가며 시계를 돌리고, 정확히 5.00초에 멈춘다.
 * - 처음 2초는 숫자가 보이고, 그 뒤로는 가려진다. 나머지는 감으로 센다.
 * - 5초에서 가장 많이 어긋난 사람이 걸린다. 똑같이 어긋났으면 그 사람들이 다 걸린다.
 *
 * 밀리초를 어떻게 재는지(성능 타이머, 시작 신호, 오조작 방지)는 UI 쪽 관심사라
 * 여기서는 다루지 않는다. 컴포넌트가 사람 순서대로 잰 시간을 넘겨준다.
 */

/** 맞춰야 하는 시간 */
export const TARGET_MS = 5000;

/** 이 시간까지는 숫자를 보여 준다. 다 같은 지점에서 출발해야 실력 싸움이 된다 */
export const REVEAL_MS = 2000;

/** 안 누르고 버티면 여기서 끊는다. 기록은 이 값으로 남는다 */
export const TIMEOUT_MS = 9000;

/** 5초에서 얼마나 어긋났나 */
export function errorOf(ms: number): number {
  return Math.abs(ms - TARGET_MS);
}

/** 안 누르고 넘어간 판 */
export function isTimeout(ms: number): boolean {
  return ms >= TIMEOUT_MS;
}

/**
 * 걸린 사람의 인덱스. 가장 많이 어긋난 사람이고,
 * 오차가 똑같으면 그 사람들이 전부 걸린다.
 */
export function losers(stops: readonly number[]): number[] {
  if (stops.length === 0) return [];
  const worst = Math.max(...stops.map(errorOf));
  return stops.reduce<number[]>((out, ms, i) => (errorOf(ms) === worst ? [...out, i] : out), []);
}

/** 정확한 순서대로 정렬한 인덱스. 오차가 같으면 먼저 한 사람이 앞 */
export function ranking(stops: readonly number[]): number[] {
  return stops
    .map((ms, i) => ({ i, err: errorOf(ms) }))
    .sort((a, b) => a.err - b.err || a.i - b.i)
    .map((r) => r.i);
}

/** "4.87" */
export function formatSec(ms: number): string {
  return (ms / 1000).toFixed(2);
}

/** 5초 대비 얼마나 빗나갔는지. "+0.13" / "-0.13" */
export function formatGap(ms: number): string {
  const gap = ms - TARGET_MS;
  return `${gap < 0 ? '-' : '+'}${(Math.abs(gap) / 1000).toFixed(2)}`;
}

/** 결과 화면에 띄울 한마디 */
export function verdictOf(ms: number): string {
  if (isTimeout(ms)) return '포기';
  const err = errorOf(ms);
  if (err === 0) return '완벽';
  if (err <= 50) return '칼 같다';
  if (err <= 200) return '거의 정확';
  if (err <= 500) return '무난';
  if (err <= 1200) return '아쉽다';
  return '엉망';
}
