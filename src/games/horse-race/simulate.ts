import { mulberry32 } from '../../domain/rng';

export interface RaceEvent {
  tick: number;
  positions: number[]; // 0~1 진행률
  effect?: { horse: number; type: 'stumble' | 'boost' | 'reverse' };
}

export interface RaceResult {
  events: RaceEvent[];
  ranking: number[]; // 1등부터
}

const MAX_TICKS = 900;
const AVG_TICKS = 400; // 60틱/초 기준 약 6.7초
/** 한 틱에 나아가는 기준 거리. UI 가 속도를 배속으로 환산할 때도 쓴다 */
export const NOMINAL_STEP = 1 / AVG_TICKS;
const BASE = NOMINAL_STEP;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * 레이스 전체를 미리 계산한다. UI는 이 로그를 재생만 한다.
 * 결과가 이미 정해져 있어도 보는 쪽은 모르니 긴장감은 그대로다.
 */
export function simulateRace(playerCount: number, seed: number): RaceResult {
  const n = Math.max(2, playerCount);
  const rand = mulberry32(seed);

  const pos = new Array<number>(n).fill(0);
  const form = Array.from({ length: n }, () => 0.9 + rand() * 0.2);
  const stun = new Array<number>(n).fill(0);
  const boost = new Array<number>(n).fill(0);
  const finish = new Array<number>(n).fill(-1);
  const events: RaceEvent[] = [];

  for (let t = 1; t <= MAX_TICKS; t++) {
    const leader = Math.max(...pos);
    let effect: RaceEvent['effect'];

    for (let i = 0; i < n; i++) {
      if (finish[i] >= 0) continue;

      // 컨디션은 천천히 흔들린다. 이게 순위를 뒤집는 주된 힘.
      form[i] = clamp(form[i] + (rand() - 0.5) * 0.07, 0.7, 1.35);

      // 돌발 이벤트는 한 틱에 하나만. 화면에서 뭐가 터졌는지 읽혀야 한다.
      if (!effect && stun[i] === 0 && boost[i] === 0 && t > 40 && rand() < 0.0018) {
        const roll = rand();
        if (roll < 0.45) {
          stun[i] = 22;
          effect = { horse: i, type: 'stumble' };
        } else if (roll < 0.9) {
          boost[i] = 30;
          effect = { horse: i, type: 'boost' };
        } else {
          stun[i] = 14;
          pos[i] = Math.max(0, pos[i] - 0.05);
          effect = { horse: i, type: 'reverse' };
        }
      }

      let mult = form[i] * (0.75 + rand() * 0.5);
      if (stun[i] > 0) {
        mult *= 0.25;
        stun[i] -= 1;
      }
      if (boost[i] > 0) {
        mult *= 1.9;
        boost[i] -= 1;
      }
      // 뒤처진 말에 약한 보정. 일방적인 레이스는 20초가 지루하다.
      mult *= 1 + (leader - pos[i]) * 0.6;

      pos[i] = Math.min(1, pos[i] + BASE * mult);
      if (pos[i] >= 1) finish[i] = t;
    }

    events.push({ tick: t, positions: pos.slice(), effect });
    if (finish.every((f) => f >= 0)) break;
  }

  const ranking = Array.from({ length: n }, (_, i) => i).sort((a, b) => {
    const fa = finish[a] >= 0 ? finish[a] : Infinity;
    const fb = finish[b] >= 0 ? finish[b] : Infinity;
    if (fa !== fb) return fa - fb;
    if (pos[a] !== pos[b]) return pos[b] - pos[a];
    return a - b;
  });

  return { events, ranking };
}
