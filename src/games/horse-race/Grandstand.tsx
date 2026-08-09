import { memo } from 'react';

/**
 * 트랙 위쪽 배경 — 심야 경마장. 앱 전체 컨셉이 "심야 경마장 전광판"이라
 * 낮 경기장이 아니라 조명탑 켜진 밤 경기장으로 그린다.
 *
 * 관중석 창문과 관중 점은 시드 없이 고정 좌표다. 매번 달라질 이유가 없고
 * 고정이면 렌더가 싸다.
 */

const CROWD_ROWS = [
  { y: 52, from: 26, to: 300, gap: 9 },
  { y: 60, from: 22, to: 304, gap: 9 },
  { y: 68, from: 26, to: 300, gap: 9 },
];

function crowd() {
  const dots = [];
  for (const [r, row] of CROWD_ROWS.entries()) {
    for (let x = row.from; x < row.to; x += row.gap) {
      // 규칙적으로 찍으면 격자처럼 보인다. 좌표를 살짝 흔들어 준다
      const jitter = ((x * 7 + r * 13) % 5) - 2;
      dots.push(<circle key={`${r}-${x}`} cx={x + jitter} cy={row.y + (jitter % 2)} r="2.1" />);
    }
  }
  return dots;
}

export const Grandstand = memo(function Grandstand({ leader }: { leader?: string }) {
  return (
    <svg className="stand" viewBox="0 0 320 116" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a0f1f" />
          <stop offset="100%" stopColor="#161d38" />
        </linearGradient>
        <linearGradient id="beamGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,214,140,0.30)" />
          <stop offset="100%" stopColor="rgba(255,214,140,0)" />
        </linearGradient>
      </defs>

      <rect width="320" height="116" fill="url(#skyGrad)" />

      {/* 별 */}
      <g className="stand__stars">
        <circle cx="30" cy="14" r="1" />
        <circle cx="88" cy="8" r="1.3" />
        <circle cx="150" cy="18" r="0.9" />
        <circle cx="212" cy="10" r="1.1" />
        <circle cx="268" cy="20" r="1" />
        <circle cx="300" cy="9" r="1.2" />
      </g>

      {/* 조명탑 — 불빛이 트랙 쪽으로 쏟아진다 */}
      {[46, 160, 274].map((x) => (
        <g key={x} className="stand__tower">
          <path className="stand__beam" d={`M${x - 26} 116 L${x - 9} 26 L${x + 9} 26 L${x + 26} 116 Z`} fill="url(#beamGrad)" />
          <rect className="stand__mast" x={x - 1.5} y="24" width="3" height="26" />
          <rect className="stand__lamp" x={x - 11} y="16" width="22" height="9" rx="2" />
          <g className="stand__bulbs">
            <circle cx={x - 6} cy="20.5" r="2" />
            <circle cx={x} cy="20.5" r="2" />
            <circle cx={x + 6} cy="20.5" r="2" />
          </g>
        </g>
      ))}

      {/* 관중석 */}
      <path className="stand__roof" d="M8 44 L152 34 L312 44 L312 50 L8 50 Z" />
      <path className="stand__tier" d="M8 50 L312 50 L320 92 L0 92 Z" />
      <g className="stand__crowd">{crowd()}</g>

      {/* 전광판 */}
      <g className="stand__board">
        <rect x="118" y="4" width="84" height="26" rx="4" />
        <text x="160" y="15" textAnchor="middle" className="stand__board-label">
          한잔각 경마장
        </text>
        <text x="160" y="25" textAnchor="middle" className="stand__board-line">
          {leader ? `선두 ${leader}` : 'RACE IN PROGRESS'}
        </text>
      </g>

      {/* 트랙 안쪽 잔디와 흰 펜스 */}
      <rect className="stand__infield" y="92" width="320" height="24" />
      <g className="stand__fence">
        <rect y="93" width="320" height="2.5" />
        {Array.from({ length: 33 }, (_, i) => (
          <rect key={i} x={i * 10} y="93" width="2" height="9" />
        ))}
      </g>
    </svg>
  );
});
