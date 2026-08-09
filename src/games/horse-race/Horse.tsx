import { memo, type CSSProperties } from 'react';

/**
 * 옆모습 말 + 기수. 이미지 파일 없이 인라인 SVG 로 그린다
 * (오프라인에서 그냥 돌아야 하고, 색을 플레이어마다 바꿔야 해서).
 *
 * 좌표계는 viewBox 124x86, 발굽이 닿는 바닥이 y=78 이다.
 * 다리는 관절 위쪽을 축으로 돌리고 네 개의 위상을 어긋나게 준다. 무릎을 정확히
 * 접는 것보다 이쪽이 40px 짜리 레인에서 훨씬 잘 읽힌다.
 */

export type HorseState = 'run' | 'boost' | 'stumble' | 'idle' | 'win';

interface Props {
  emoji: string;
  /** 기수 옷 — 플레이어 색 */
  silk: string;
  /** 말 털색 */
  coat: string;
  /** 안장 번호 */
  number: number;
  state: HorseState;
  /** 한 걸음 주기(초). 빠를수록 짧다 */
  gallop: number;
}

/** 밤 경기장에서도 서로 구분되는 털색. 실제 말 모색에서 가져왔다 */
const COATS = ['#9a6239', '#d09a5c', '#4b4038', '#b0a79d', '#7b5230', '#8d7f74'];

export function coatOf(index: number): string {
  return COATS[index % COATS.length];
}

export const Horse = memo(function Horse({ emoji, silk, coat, number, state, gallop }: Props) {
  return (
    <svg
      className={`horse is-${state}`}
      style={{ '--gallop': `${gallop}s`, '--coat': coat, '--silk': silk } as CSSProperties}
      viewBox="0 0 124 86"
      role="img"
      aria-label={`${number}번 말`}
    >
      {/* 먼 쪽 두 다리 — 몸통 뒤에 깔린다 */}
      <g className="horse__legs horse__legs--far">
        <g className="horse__leg horse__leg--hf">
          <path className="horse__thigh" d="M42 42 L34 62" />
          <path className="horse__cannon" d="M34 62 L40 82" />
          <path className="horse__hoof" d="M37 83 L43 83" />
        </g>
        <g className="horse__leg horse__leg--ff">
          <path className="horse__thigh" d="M76 40 L83 62" />
          <path className="horse__cannon" d="M83 62 L79 82" />
          <path className="horse__hoof" d="M76 83 L82 83" />
        </g>
      </g>

      <g className="horse__body">
        {/* 꼬리 */}
        <path
          className="horse__tail"
          d="M31 29 C25 31 18 39 13 52 C11 57 14 59 16 55 C19 49 23 45 27 43 C26 39 27 34 33 34 Z"
        />

        {/* 목 + 머리를 한 path 로 — 따로 그리면 이음매에 홈이 보인다 */}
        <path
          className="horse__neck"
          d="M72 26 C76 16 86 7 96 3 C102 1 107 5 109 9 L117 19 C119 22 117 26 113 25
             L105 23 C99 22 95 22 91 25 C87 31 85 37 84 45 C83 49 76 49 74 44
             C72 38 71 31 72 26 Z"
        />
        {/* 귀 */}
        <path className="horse__ear" d="M95 5 L96 -3 L103 2 Z" />
        {/* 갈기 — 목덜미를 따라 */}
        <path
          className="horse__mane"
          d="M71 30 C75 19 85 9 95 4 L98 8 C89 14 81 24 77 36 Z"
        />
        <circle className="horse__eye" cx="103" cy="12" r="1.9" />
        {/* 콧구멍 */}
        <circle className="horse__nostril" cx="114" cy="21" r="1.3" />

        {/* 몸통 */}
        <path
          className="horse__trunk"
          d="M32 30 C44 23 62 22 76 27 C83 30 87 35 87 42 C87 49 82 53 74 55
             C58 59 42 57 33 52 C27 48 25 40 26 36 C27 32 28 31 32 30 Z"
        />
        {/* 허벅지·어깨 — 근육 덩어리가 있어야 말 실루엣이 된다 */}
        <ellipse className="horse__haunch" cx="40" cy="41" rx="13.5" ry="12" />
        <ellipse className="horse__shoulder" cx="75" cy="39" rx="10" ry="10.5" />

        {/* 안장 번호천 */}
        <g className="horse__cloth">
          <rect x="42" y="28" width="17" height="14" rx="3" />
          <text x="50.5" y="39" textAnchor="middle">
            {number}
          </text>
        </g>

        {/* 기수 — 옷이 플레이어 색이다 */}
        <g className="horse__jockey">
          <path className="horse__boot" d="M63 28 L60 37 L66 39" />
          <path className="horse__torso" d="M57 26 C62 17 70 12 77 12 L80 19 C72 20 66 24 63 30 Z" />
          <path className="horse__arm" d="M75 16 L88 23" />
          <circle className="horse__helmet" cx="75" cy="7" r="8" />
          <text className="horse__face" x="75" y="11" textAnchor="middle">
            {emoji}
          </text>
        </g>

        {/* 고삐 */}
        <path className="horse__rein" d="M88 23 C95 21 103 21 111 22" />
      </g>

      {/* 가까운 쪽 두 다리 — 몸통 위로 */}
      <g className="horse__legs horse__legs--near">
        <g className="horse__leg horse__leg--hn">
          <path className="horse__thigh" d="M47 42 L37 62" />
          <path className="horse__cannon" d="M37 62 L45 82" />
          <path className="horse__hoof" d="M42 83 L48 83" />
        </g>
        <g className="horse__leg horse__leg--fn">
          <path className="horse__thigh" d="M72 40 L79 62" />
          <path className="horse__cannon" d="M79 62 L74 82" />
          <path className="horse__hoof" d="M71 83 L77 83" />
        </g>
      </g>

      {/* 뒷발굽에서 이는 흙먼지 */}
      <g className="horse__dust">
        <circle cx="26" cy="74" r="5" />
        <circle cx="15" cy="70" r="3.5" />
        <circle cx="6" cy="74" r="2.5" />
      </g>
    </svg>
  );
});
