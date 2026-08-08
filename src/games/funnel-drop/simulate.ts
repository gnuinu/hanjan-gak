import { mulberry32, shuffle } from '../../domain/rng';

/**
 * 깔때기. 사람마다 공 하나씩 위에서 떨어뜨리고, 좁아지는 벽과 장애물(페그)을
 * 지나며 순서가 뒤섞인다. 출구를 제일 먼저 빠져나온 공이 걸린다.
 *
 * 좌표는 가로를 1 로 정규화. x 는 0(왼쪽)~1(오른쪽), y 는 0(위)~FIELD_H(아래).
 * 경마와 마찬가지로 전체를 먼저 계산하고 UI 는 그 로그를 재생만 한다.
 */

export interface Peg {
  x: number; // 진동의 중심
  y: number;
  r: number;
  amp: number; // 좌우 진폭 (0 이면 고정 페그)
  speed: number;
  phase: number;
}

export interface FunnelFrame {
  balls: { x: number; y: number }[];
  hits: number[]; // 이번 틱에 부딪힌 페그 인덱스
}

export interface FunnelResult {
  pegs: Peg[];
  frames: FunnelFrame[];
  /** 먼저 빠져나온 순. ranking[0] 이 걸린 사람 */
  ranking: number[];
  /** 공별 탈출 프레임. 아직 안 나갔으면 -1 */
  exitAt: number[];
}

export const BALL_R = 0.03;
/**
 * 세로 길이. 가로를 1 로 두고 이 비율만큼 길다.
 * 폰 화면이 세로로 기니까 정사각형이면 위아래가 텅 빈다.
 * 세로 방향 상수들은 전부 여기에 비례시켜서 이 값을 바꿔도 체감 속도가 같게 한다.
 */
export const FIELD_H = 1.7;

const TOP_HALF = 0.46; // 입구 반너비
const BOT_HALF = 0.055; // 출구 반너비. 공 하나가 겨우 지나가야 줄이 선다
const GRAVITY = 0.000045 * FIELD_H;
const MAX_VY = 0.016 * FIELD_H;
const MAX_VX = 0.014;
const WALL_BOUNCE = 0.45;
const PEG_BOUNCE = 0.55;
const MAX_TICKS = 1200;
const STALL_FROM = 420; // 이 틱을 넘기면 서서히 재촉한다
const TAIL_FRAMES = 14; // 첫 탈출 후 여운

/** y 위치에서의 깔때기 반너비 */
export function halfWidthAt(y: number): number {
  const t = Math.min(1, Math.max(0, y / FIELD_H));
  const e = t * t * (3 - 2 * t); // smoothstep — 가운데서 확 좁아진다
  return TOP_HALF + (BOT_HALF - TOP_HALF) * e;
}

/** 페그는 좌우로 흔들린다. UI 도 같은 함수로 그려야 위치가 맞는다 */
export function pegXAt(peg: Peg, tick: number): number {
  if (peg.amp === 0) return peg.x;
  return peg.x + peg.amp * Math.sin(tick * peg.speed + peg.phase);
}

const PEG_R_MAX = 0.028;
const PEG_AMP_MAX = 0.03;
// 페그를 벽에서 이만큼 떨어뜨린다. 벽과 페그 사이 틈이 공 지름보다 좁으면
// 공이 거기 끼어서 판이 멈춘다. 여유를 두고 계산한 값:
//   틈 = INSET/2 - 페그반지름 - 진폭 >= 공지름(0.06)
const PEG_INSET = 0.26;

function buildPegs(rand: () => number): Peg[] {
  const pegs: Peg[] = [];
  const rows = 6;
  for (let r = 0; r < rows; r++) {
    // 0.72 아래로는 두지 않는다. 목이 좁아져서 페그가 출구를 막는다.
    const y = (0.16 + (0.56 * r) / (rows - 1)) * FIELD_H;
    const hw = halfWidthAt(y);
    const count = Math.max(1, Math.round(hw * 7));
    const span = Math.max(0, hw * 2 - PEG_INSET);
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const moving = rand() < 0.35;
      pegs.push({
        x: 0.5 - span / 2 + span * t,
        y: y + (rand() - 0.5) * 0.025 * FIELD_H,
        r: 0.02 + rand() * (PEG_R_MAX - 0.02),
        amp: moving ? 0.015 + rand() * (PEG_AMP_MAX - 0.015) : 0,
        speed: 0.02 + rand() * 0.03,
        phase: rand() * Math.PI * 2,
      });
    }
  }
  return pegs;
}

export function simulateFunnel(playerCount: number, seed: number): FunnelResult {
  const n = Math.max(2, playerCount);
  const rand = mulberry32(seed);
  const pegs = buildPegs(rand);

  const x = new Array<number>(n);
  const y = new Array<number>(n);
  const vx = new Array<number>(n);
  const vy = new Array<number>(n);
  const exitAt = new Array<number>(n).fill(-1);

  // 입구에 나란히 세우되 살짝 어긋나게. 완전히 같은 높이면 초반이 밋밋하다.
  //
  // 출발 슬롯은 물리적으로 유불리가 다르다(가운데가 출구에 가깝다). 슬롯을
  // 사람에게 무작위로 배정해서 그 유불리가 특정 사람에게 붙지 않게 한다.
  // 이게 없으면 6인 기준으로 걸릴 확률이 사람마다 3배 넘게 벌어진다.
  const slotOf = shuffle(
    Array.from({ length: n }, (_, i) => i),
    rand,
  );
  const hw0 = halfWidthAt(0);
  const usable = (hw0 - BALL_R) * 2;
  for (let i = 0; i < n; i++) {
    const slot = slotOf[i];
    const t = n === 1 ? 0.5 : slot / (n - 1);
    x[i] = 0.5 - usable / 2 + usable * t + (rand() - 0.5) * 0.02;
    y[i] = (-0.02 - (slot % 3) * 0.05) * FIELD_H;
    vx[i] = (rand() - 0.5) * 0.004;
    vy[i] = 0;
  }

  const frames: FunnelFrame[] = [];
  const stallTicks = new Array<number>(n).fill(0);
  const prevY = y.slice();
  let firstExitFrame = -1;

  for (let tick = 0; tick < MAX_TICKS; tick++) {
    const hits: number[] = [];

    // 드물게 공들이 서로 맞물려 안 내려가는 판이 생긴다. 오래 끌수록
    // 중력과 흔들림을 키워서 반드시 흘려보낸다. 판이 20초씩 가면 안 된다.
    const urgency = Math.max(0, tick - STALL_FROM) / 600;
    const gravity = GRAVITY * (1 + urgency * 5);
    const capVy = MAX_VY * (1 + urgency * 1.5);

    for (let i = 0; i < n; i++) {
      // 빠져나온 공은 출구에 세워둔다. 계속 떨어뜨리면 화면 밖으로 사라져서
      // 정작 누가 걸렸는지 결과 화면에서 안 보인다.
      if (exitAt[i] >= 0) continue;

      vy[i] = Math.min(capVy, vy[i] + gravity);
      x[i] += vx[i];
      y[i] += vy[i];

      if (y[i] > FIELD_H + 0.05) {
        y[i] = FIELD_H + BALL_R;
        x[i] = 0.5;
        vx[i] = 0;
        vy[i] = 0;
        exitAt[i] = frames.length;
        if (firstExitFrame < 0) firstExitFrame = frames.length;
        continue;
      }

      // 깔때기 벽
      const hw = halfWidthAt(y[i]);
      const left = 0.5 - hw + BALL_R;
      const right = 0.5 + hw - BALL_R;
      if (x[i] < left) {
        x[i] = left;
        vx[i] = Math.abs(vx[i]) * WALL_BOUNCE + rand() * 0.002;
      } else if (x[i] > right) {
        x[i] = right;
        vx[i] = -Math.abs(vx[i]) * WALL_BOUNCE - rand() * 0.002;
      }

      // 페그
      for (let p = 0; p < pegs.length; p++) {
        const peg = pegs[p];
        const px = pegXAt(peg, tick);
        const dx = x[i] - px;
        const dy = y[i] - peg.y;
        const d = Math.hypot(dx, dy);
        const minD = peg.r + BALL_R;
        if (d >= minD || d === 0) continue;

        const nx = dx / d;
        const ny = dy / d;
        const overlap = minD - d;
        x[i] += nx * overlap;
        y[i] += ny * overlap;

        const dot = vx[i] * nx + vy[i] * ny;
        vx[i] = (vx[i] - 2 * dot * nx) * PEG_BOUNCE;
        vy[i] = (vy[i] - 2 * dot * ny) * PEG_BOUNCE;
        // 순서가 뒤집히는 주된 힘. 방향은 랜덤이되 세기는 0 이 되지 않게 —
        // 그래야 페그 꼭대기에 얹혀서 멈추는 일이 없다.
        vx[i] += (rand() < 0.5 ? -1 : 1) * (0.004 + rand() * 0.008);
        if (vy[i] < 0) vy[i] *= 0.3; // 위로 크게 튀면 답답해진다
        vy[i] = Math.max(vy[i], 0.0012 * FIELD_H); // 항상 조금은 내려간다
        hits.push(p);
      }

      // 미세 진동. 벽이나 다른 공에 끼어 굳어버리는 걸 막는다.
      vx[i] += (rand() - 0.5) * (0.0008 + urgency * 0.004);
      vx[i] = Math.max(-MAX_VX, Math.min(MAX_VX, vx[i]));
    }

    // 공끼리 밀어내기. 출구가 좁아 줄이 서고, 거기서 순위가 또 바뀐다.
    for (let i = 0; i < n; i++) {
      if (exitAt[i] >= 0) continue;
      for (let j = i + 1; j < n; j++) {
        if (exitAt[j] >= 0) continue;
        const dx = x[j] - x[i];
        const dy = y[j] - y[i];
        const d = Math.hypot(dx, dy);
        const minD = BALL_R * 2;
        if (d >= minD || d === 0) continue;

        const nx = dx / d;
        const ny = dy / d;
        const push = (minD - d) / 2;
        x[i] -= nx * push;
        y[i] -= ny * push;
        x[j] += nx * push;
        y[j] += ny * push;

        const rel = (vx[j] - vx[i]) * nx + (vy[j] - vy[i]) * ny;
        if (rel < 0) {
          const imp = rel * 0.5;
          vx[i] += imp * nx;
          vy[i] += imp * ny;
          vx[j] -= imp * nx;
          vy[j] -= imp * ny;
        }
      }
    }

    // 안전장치: 그래도 어딘가에 낀 공은 가운데로 밀어 흘려보낸다.
    // 깔때기 한가운데는 언제나 열려 있으므로 거기로 보내면 반드시 빠져나간다.
    for (let i = 0; i < n; i++) {
      if (exitAt[i] >= 0) continue;
      if (y[i] - prevY[i] < 0.0004 * FIELD_H) stallTicks[i] += 1;
      else stallTicks[i] = 0;
      prevY[i] = y[i];

      if (stallTicks[i] > 45) {
        vy[i] += 0.004 * FIELD_H;
        vx[i] += (0.5 - x[i]) * 0.03;
        stallTicks[i] = 20;
      }
    }

    frames.push({
      balls: Array.from({ length: n }, (_, i) => ({ x: x[i], y: y[i] })),
      hits,
    });

    if (firstExitFrame >= 0 && frames.length - firstExitFrame >= TAIL_FRAMES) break;
  }

  // 먼저 나온 순 → 아직 안 나온 공은 출구에 가까운 순
  const ranking = Array.from({ length: n }, (_, i) => i).sort((a, b) => {
    const ea = exitAt[a] >= 0 ? exitAt[a] : Infinity;
    const eb = exitAt[b] >= 0 ? exitAt[b] : Infinity;
    if (ea !== eb) return ea - eb;
    if (y[a] !== y[b]) return y[b] - y[a];
    return a - b;
  });

  return { pegs, frames, ranking, exitAt };
}
