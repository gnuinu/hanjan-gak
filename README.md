# 한잔각 (hanjankak)

서버 없이 도는 오프라인 파티 게임 웹앱. 폰 한 대를 돌려가며 하는 pass-and-play 방식.
인원수만 정하면 바로 시작하는 술자리 랜덤 벌칙 미니게임 모음이다.

**친구끼리 / 커플끼리** 두 가지 자리 성격을 지원한다. 커플로 바꾸면 인원이 2명으로
맞춰지고, 커플 전용 게임과 벌칙이 열리며 단체용 벌칙은 덱에서 빠진다.

## 실행

```bash
npm install
npm run dev      # 개발 서버
npm test         # 게임 로직 단위 테스트 (Vitest)
npm run build    # 타입 체크 + 프로덕션 빌드
npm run preview  # 빌드 결과 확인
```

## 게임 8종

| 게임 | 판정 | 인원 |
|---|---|---|
| 🏇 경마 | 꼴찌 1명 (지목 모드 시 1등이 지목) | 2~12 |
| 👆 손가락 룰렛 | 당첨 1명 / 팀 나누기 | 2~10 |
| 💣 폭탄 카드 | 폭탄 뽑은 사람 | 2~12 |
| ⚡ 반응 속도 | 제일 느린 사람, 부정 출발은 즉시 패배 | 2~12 |
| 🎯 룰렛 | 바늘이 가리킨 사람 | 2~12 |
| 🧠 텔레파시 | 소수파 전원. 전원 일치면 벌칙 없음 | 2~12 |
| 👀 눈치게임 | 동시에 누른 사람 전원 / 끝까지 못 부른 한 명 | 3~8 |
| 💞 커플 밸런스 | 읽히면 답한 쪽, 못 읽으면 맞히는 쪽 | 2 (커플 전용) |

반응 속도는 4명까지 화면 분할, 5명 이상이면 한 명씩 순차 플레이로 넘어간다.

## 폰 말고 PC 로 할 때

노트북 한 대를 가운데 놓고 둘러앉는 자리도 있다. 폰을 돌리는 pass-and-play 와 달리
이쪽은 **모두가 같은 화면을 동시에 본다** — 그래서 동시 입력을 받는 게임이 성립한다.

자리마다 키를 하나씩 나눠주는 건 `domain/keys.ts` 가 맡는다. 홈 로우(A~L)에 인원수만큼
고르게 퍼뜨려서, 둘이 하면 A 와 L 처럼 최대한 멀리 떨어진 키가 배정된다. 손이 부딪히면
게임이 아니라 몸싸움이 된다.

- **눈치게임** — 키보드 게임. 게임 목록에 `⌨ PC` 배지가 붙는다. 자리 카드를 마우스로
  눌러도 되지만, 여럿이 동시에 누르려면 키보드가 필요하다.
- **반응 속도(4명 이하 화면 분할)** — 원래 손가락 네 개가 필요해서 PC 에선 반쪽이었다.
  이제 각 칸에 키가 배정되고, 마우스가 있는 화면에서만 키캡이 보인다.

키 판정은 `e.key` 가 아니라 `e.code`(물리 키)로 한다. 한글 IME 가 켜져 있어도 그대로 먹는다.

## 게임 추가하기

게임은 플러그인이다. `GameModule` 하나 만들고 레지스트리에 등록하면 끝이고,
`shell/` 코드는 건드리지 않는다.

```ts
// src/games/my-game/index.ts
export const myGame: GameModule = {
  meta: { id: 'my-game', title: '내 게임', tagline: '한 줄 설명', emoji: '🎲',
          minPlayers: 2, maxPlayers: 12, durationSec: 20,
          audience: 'couple' /* 커플 전용일 때만 */,
          needsKeyboard: true /* 키보드 게임일 때만 — 목록에 PC 배지 */ },
  Component: MyGame,
};

// src/games/registry.ts 의 GAMES 배열에 추가
```

게임 컴포넌트는 승패를 스스로 판정하고 `onFinish(loserIds)`만 호출한다. 벌칙 배정,
기록, 다음 화면 전환은 전부 `shell/PlayScreen.tsx`가 담당한다. `onFinish([])` 로
빈 배열을 넘기면 "이번 판은 벌칙 없음"으로 처리되고 기록에 남지 않는다
(팀 나누기, 텔레파시 성공 등).

판정 로직은 React 밖 순수 함수로 빼고 테스트를 붙인다
(`simulate.ts` / `judge.ts` + `*.test.ts` 참고).

## 벌칙

- 기본 덱은 `src/data/penalties.ts`. 레벨 1/2/3 각 20개 이상 + 커플 전용 각 10개 이상.
- 앱 안에서도 **설정 → 벌칙 편집**으로 추가/삭제할 수 있다 (localStorage 저장).
- **음주 무관 모드**를 켜면 `isDrinking: true` 항목이 전부 빠진다. 술 안 마시는
  사람이 낀 자리, 회식, 청소년 이용을 한 스위치로 커버한다.
- 레벨 3은 언제든 거부할 수 있고, 거부하면 대신 한 잔. 이 문구는 결과 화면 하단에
  항상 떠 있다. 벌칙 게임이 불편해지는 지점은 대부분 "빠져나갈 방법이 없을 때" 생긴다.

덱을 자기 모임 톤에 맞게 편집하고 쓰는 걸 전제로 만들었다.

## 구조

```
src/
├─ domain/          순수 로직, React 의존 없음
│  ├─ types.ts  game.ts  rng.ts  keys.ts  penalty.ts  stats.ts
├─ games/           게임 플러그인 (registry.ts 에 등록)
├─ shell/           앱 셸 — 홈/멤버/게임선택/결과/기록/설정
├─ store/           zustand (session: persist, round: 휘발)
├─ ui/              공용 컴포넌트 (Button, FlipText, Countdown, TargetPicker …)
├─ data/            벌칙 덱, 텔레파시 주제, 밸런스 질문
└─ styles/          디자인 토큰
```

`players` / `settings` / `customPenalties` 는 localStorage에 남고, `history`는
이번 자리 한정이라 저장하지 않는다 (persist `partialize`).

전역 스타일(`styles/global.css`)은 `main.tsx`에서 **가장 먼저** import 한다.
그래야 화면별 CSS가 뒤에 와서 `.stage` 같은 공용 클래스를 덮어쓸 수 있다.

## 배포

GitHub Pages. `main`에 푸시하면 `.github/workflows/deploy.yml`이 빌드해서
결과물(`dist`)을 **`gh-pages` 브랜치에 직접 푸시**한다.

저장소 Settings → Pages → Source를 **Deploy from a branch**로, 브랜치는
`gh-pages` / 폴더는 `/ (root)`로 설정해야 한다.

- `vite.config.ts`의 `base`는 저장소명(`/hanjankak/`)과 반드시 일치해야 한다.
- 라우터는 `createHashRouter`. BrowserRouter는 GH Pages에서 새로고침 시 404가 난다.
- `dist/.nojekyll`을 만들어 Jekyll 전처리를 끈다. 없으면 `_`로 시작하는 파일이 사라진다.

### actions/deploy-pages 를 안 쓰는 이유

원래 공식 방식(`upload-pages-artifact` + `deploy-pages`)으로 짰는데, 이 저장소에선
배포가 `deployment_queued` 상태에 붙잡힌 채 10분 타임아웃 나는 일이 다섯 번 연속
반복됐다. 빌드·테스트·아티팩트 업로드는 매번 성공했고 막힌 건 deploy 잡뿐이었다.
Pages 소스를 GitHub Actions로 바꾸고, 권한 선언을 고치고, 새 커밋으로 다시
배포해도 같았다. 워크플로에서 손댈 수 있는 지점이 아니라 접었다.

`gh-pages` 브랜치 방식은 그냥 `git push`라서 그 경로를 타지 않는다.

디버깅하며 알게 된 것 두 가지를 남겨둔다:

- **Pages 배포 ID는 커밋 SHA와 같다.** 배포가 한 번 취소(타임아웃 포함)된 커밋은
  Re-run 해도 5초 만에 `Deployment cancelled`로 끝난다. 재실행 말고 새 커밋을 밀어야 한다.
- **`deploy-pages`의 `timeout` 최대값은 600000(10분)이다.** 더 크게 주면 경고만 내고 깎인다.
