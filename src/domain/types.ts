export interface Player {
  id: string; // nanoid
  name: string; // 기본값 "1번", "2번" ... 수정 가능
  color: string; // 팔레트에서 자동 배정
  emoji: string; // 아바타 대용
}

/**
 * 모임 성격. 벌칙 덱과 게임 목록을 동시에 가른다.
 * - friends: 여럿이서. 커플 전용 항목은 전부 숨김
 * - couple:  둘이서. 커플 전용 항목이 열리고, "옆 사람" 류 단체 벌칙은 빠짐
 */
export type PartyMode = 'friends' | 'couple';

/** 벌칙이 어떤 자리에서 어울리는지. 기본값은 'all' */
export type Audience = 'all' | 'friends' | 'couple';

export interface Penalty {
  id: string;
  text: string; // "원샷", "옆 사람이 지목한 사람과 러브샷"
  level: 1 | 2 | 3; // 순함 / 보통 / 매움
  isDrinking: boolean; // 음주 무관 모드에서 필터링용
  audience?: Audience; // 생략하면 'all'
}

export interface RoundResult {
  gameId: string;
  loserIds: string[]; // 걸린 사람 (복수 가능)
  penalty: Penalty;
  playedAt: number;
}

export interface Settings {
  penaltyLevel: 1 | 2 | 3;
  drinkFreeMode: boolean; // 술 없이 벌칙만
  partyMode: PartyMode;
  targetMode: boolean; // 경마: 꼴찌 대신 1등이 지목
  sound: boolean;
  haptics: boolean;
  keepScreenAwake: boolean;
}

export interface Session {
  players: Player[];
  history: RoundResult[]; // 이번 술자리 누적 (persist 제외)
  settings: Settings;
}
