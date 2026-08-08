import { describe, expect, it } from 'vitest';
import { BALL_R, FIELD_H, halfWidthAt, pegXAt, simulateFunnel } from './simulate';

describe('halfWidthAt', () => {
  it('아래로 갈수록 좁아진다', () => {
    let prev = halfWidthAt(0);
    for (let y = 0.1; y <= FIELD_H; y += 0.1) {
      const hw = halfWidthAt(y);
      expect(hw).toBeLessThan(prev);
      prev = hw;
    }
  });

  it('출구는 공 하나가 지나갈 만큼은 열려 있다', () => {
    expect(halfWidthAt(FIELD_H)).toBeGreaterThan(BALL_R);
  });

  it('범위를 벗어난 y 도 처리한다', () => {
    expect(halfWidthAt(-1)).toBe(halfWidthAt(0));
    expect(halfWidthAt(FIELD_H + 1)).toBe(halfWidthAt(FIELD_H));
  });
});

describe('simulateFunnel', () => {
  it('같은 시드는 같은 결과를 만든다', () => {
    const a = simulateFunnel(6, 4242);
    const b = simulateFunnel(6, 4242);
    expect(a.ranking).toEqual(b.ranking);
    expect(a.frames.length).toBe(b.frames.length);
    expect(a.frames.at(-1)!.balls).toEqual(b.frames.at(-1)!.balls);
    expect(a.pegs).toEqual(b.pegs);
  });

  it('시드가 다르면 걸리는 사람도 갈린다', () => {
    const firsts = new Set(
      Array.from({ length: 40 }, (_, s) => simulateFunnel(6, s + 1).ranking[0]),
    );
    expect(firsts.size).toBeGreaterThan(1);
  });

  it('ranking 은 전원을 한 번씩 담은 순열이다', () => {
    for (let n = 2; n <= 12; n++) {
      const { ranking } = simulateFunnel(n, n * 913);
      expect(ranking.length).toBe(n);
      expect([...ranking].sort((a, b) => a - b)).toEqual(
        Array.from({ length: n }, (_, i) => i),
      );
    }
  });

  it('항상 누군가는 출구를 빠져나온다', () => {
    for (let n = 2; n <= 12; n++) {
      for (let s = 0; s < 8; s++) {
        const { ranking, exitAt } = simulateFunnel(n, n * 100 + s);
        expect(exitAt[ranking[0]]).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('1등은 실제로 가장 먼저 빠져나온 공이다', () => {
    for (let s = 0; s < 20; s++) {
      const { ranking, exitAt } = simulateFunnel(8, s + 77);
      const first = exitAt[ranking[0]];
      for (const other of ranking.slice(1)) {
        if (exitAt[other] >= 0) expect(exitAt[other]).toBeGreaterThanOrEqual(first);
      }
    }
  });

  it('깔때기 안에 있는 동안 벽을 뚫지 않는다', () => {
    const { frames, exitAt } = simulateFunnel(10, 20260806);
    frames.forEach((f, i) => {
      f.balls.forEach((b, ball) => {
        if (exitAt[ball] >= 0 && i >= exitAt[ball]) return; // 나간 공은 자유낙하
        if (b.y < 0 || b.y > FIELD_H) return; // 입구 위·출구 아래는 벽이 없다
        const hw = halfWidthAt(b.y);
        expect(b.x).toBeGreaterThan(0.5 - hw - 0.02);
        expect(b.x).toBeLessThan(0.5 + hw + 0.02);
      });
    });
  });

  it('판이 3~10초 사이에 끝난다 (60프레임/초)', () => {
    for (let n = 2; n <= 12; n++) {
      for (let s = 0; s < 20; s++) {
        const { frames } = simulateFunnel(n, n * 1000 + s);
        expect(frames.length).toBeGreaterThan(150);
        expect(frames.length).toBeLessThan(600);
      }
    }
  });

  it('아무도 못 빠져나가고 끝나는 판이 없다', () => {
    // 공이 벽과 페그 사이에 끼면 판이 통째로 멈춘다. 넓게 훑어서 확인한다.
    for (let n = 2; n <= 12; n++) {
      for (let s = 0; s < 60; s++) {
        const { ranking, exitAt } = simulateFunnel(n, s * 7919 + n);
        expect(exitAt[ranking[0]]).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('출발 슬롯이 사람마다 섞여서 걸릴 확률이 한쪽으로 쏠리지 않는다', () => {
    const n = 6;
    const N = 900;
    const counts = new Array(n).fill(0);
    for (let s = 0; s < N; s++) counts[simulateFunnel(n, s * 104729 + 11).ranking[0]] += 1;
    const expected = N / n;
    // 기대치의 절반~두 배 안에는 들어와야 한다 (슬롯 셔플 없으면 3배 넘게 벌어진다)
    for (const c of counts) {
      expect(c).toBeGreaterThan(expected * 0.5);
      expect(c).toBeLessThan(expected * 2);
    }
  });

  it('페그에 부딪히는 장면이 실제로 나온다', () => {
    const { frames } = simulateFunnel(8, 31337);
    const total = frames.reduce((sum, f) => sum + f.hits.length, 0);
    expect(total).toBeGreaterThan(10);
  });

  it('출발 순서와 도착 순서가 늘 같지는 않다', () => {
    let shuffled = 0;
    for (let s = 0; s < 30; s++) {
      const { ranking } = simulateFunnel(8, s + 500);
      if (ranking[0] !== 0) shuffled += 1;
    }
    expect(shuffled).toBeGreaterThan(15);
  });
});

describe('pegXAt', () => {
  it('고정 페그는 안 움직인다', () => {
    const peg = { x: 0.4, y: 0.5, r: 0.02, amp: 0, speed: 0.03, phase: 1 };
    expect(pegXAt(peg, 0)).toBe(0.4);
    expect(pegXAt(peg, 500)).toBe(0.4);
  });

  it('움직이는 페그는 진폭 안에서만 흔들린다', () => {
    const peg = { x: 0.4, y: 0.5, r: 0.02, amp: 0.03, speed: 0.05, phase: 0 };
    for (let t = 0; t < 400; t++) {
      const px = pegXAt(peg, t);
      expect(px).toBeGreaterThanOrEqual(0.4 - 0.03 - 1e-9);
      expect(px).toBeLessThanOrEqual(0.4 + 0.03 + 1e-9);
    }
  });
});
