// src/data/penalties.ts
//
// 벌칙 덱. 그대로 쓰지 말고 자기 모임 톤에 맞게 편집할 것.
// (앱 안에서도 설정 → 벌칙 편집으로 추가/삭제할 수 있다)
//
// isDrinking: true  → 음주 무관 모드에서 자동 제외됨
// level: 1 순함 / 2 보통 / 3 매움
// audience: 'all' 아무 자리나 / 'friends' 여럿이서 / 'couple' 둘이서
//
// 규칙 하나: level 3은 언제든 거부할 수 있고, 거부하면 대신 한 잔.
// 이 규칙을 결과 화면 하단에 항상 작게 띄워둘 것. 벌칙 게임이 불편해지는
// 지점은 대부분 "빠져나갈 방법이 없을 때" 생긴다.

import type { Penalty } from '../domain/types';

export const PENALTIES: Penalty[] = [
  // ─── LEVEL 1 : 순함 ────────────────────────────────────────────
  { id: 'l1-01', level: 1, isDrinking: true, text: '한 모금 마시기' },
  { id: 'l1-02', level: 1, isDrinking: true, text: '왼손으로 한 잔 마시기' },
  { id: 'l1-03', level: 1, isDrinking: true, text: '건배사 한 마디 하고 다같이 한 모금' },
  { id: 'l1-04', level: 1, isDrinking: true, text: '가장 오른쪽 사람과 잔 부딪히고 한 모금' },
  { id: 'l1-05', level: 1, isDrinking: false, text: '옆 사람 이름 세 번 크게 외치기' },
  { id: 'l1-06', level: 1, isDrinking: false, text: '지금 표정 그대로 10초 정지' },
  { id: 'l1-07', level: 1, isDrinking: false, text: '자기소개를 뉴스 앵커 톤으로 다시 하기' },
  { id: 'l1-08', level: 1, isDrinking: false, text: '다음 판까지 모든 말끝에 "~다냥" 붙이기' },
  { id: 'l1-09', level: 1, isDrinking: false, text: '3초 안에 과일 이름 세 개' },
  { id: 'l1-10', level: 1, isDrinking: false, text: '옆 사람 칭찬 한 가지, 구체적으로' },
  { id: 'l1-11', level: 1, isDrinking: false, text: '좋아하는 노래 첫 소절만 부르기' },
  { id: 'l1-12', level: 1, isDrinking: false, text: '박수로 리듬 만들고 다같이 따라하게 하기', audience: 'friends' },
  { id: 'l1-13', level: 1, isDrinking: false, text: '지금 기분을 이모지 하나로 말하고 이유 설명' },
  { id: 'l1-14', level: 1, isDrinking: false, text: '다음 판까지 물잔 담당 — 빈 잔 보이면 채우기' },
  { id: 'l1-15', level: 1, isDrinking: false, text: '즉석에서 자기 별명 짓기, 다음 판까지 그 이름으로 불림' },
  { id: 'l1-16', level: 1, isDrinking: false, text: '10초 동안 안 웃기. 웃으면 한 번 더' },
  { id: 'l1-17', level: 1, isDrinking: false, text: '오늘 있었던 일 중 가장 사소한 거 하나 말하기' },
  { id: 'l1-18', level: 1, isDrinking: false, text: '다음 판까지 안주 집게 담당' },
  { id: 'l1-19', level: 1, isDrinking: false, text: '팔짱 끼고 근엄한 목소리로 "다음 판, 시작" 선언' },
  { id: 'l1-20', level: 1, isDrinking: false, text: '지금 입은 옷 중 하나 골라서 30초 자랑' },

  // ─── LEVEL 2 : 보통 ────────────────────────────────────────────
  { id: 'l2-01', level: 2, isDrinking: true, text: '한 잔 마시기' },
  { id: 'l2-02', level: 2, isDrinking: true, text: '옆 사람이 정해주는 만큼 마시기 (반 잔까지)' },
  { id: 'l2-03', level: 2, isDrinking: true, text: '원샷. 대신 다음 판은 면제' },
  { id: 'l2-04', level: 2, isDrinking: true, text: '아무나 지목해서 같이 한 잔' },
  { id: 'l2-05', level: 2, isDrinking: false, text: '성대모사 하나. 못 맞히면 한 번 더' },
  { id: 'l2-06', level: 2, isDrinking: false, text: '눈앞의 사물 하나 골라 30초 홈쇼핑 광고' },
  { id: 'l2-07', level: 2, isDrinking: false, text: '유행하는 춤 하나 15초 재연' },
  { id: 'l2-08', level: 2, isDrinking: false, text: '폰 배경화면 공개' },
  { id: 'l2-09', level: 2, isDrinking: false, text: '노래 한 소절 무반주로. 다들 만족할 때까지' },
  { id: 'l2-10', level: 2, isDrinking: false, text: '몸으로 동물 하나 표현. 못 맞히면 한 번 더' },
  { id: 'l2-11', level: 2, isDrinking: false, text: '다음 판까지 모든 질문에 "네"로만 답하기' },
  { id: 'l2-12', level: 2, isDrinking: false, text: '다음 판까지 리액션 담당. 누가 말하면 무조건 크게 반응' },
  { id: 'l2-13', level: 2, isDrinking: false, text: '이 자리에서 제일 웃긴 사람 지목하고 이유 대기', audience: 'friends' },
  { id: 'l2-14', level: 2, isDrinking: false, text: '자기 MBTI로 30초 자기 변호' },
  { id: 'l2-15', level: 2, isDrinking: false, text: '랜덤 주제 하나 받고 30초 즉석 강연' },
  { id: 'l2-16', level: 2, isDrinking: false, text: '옆 사람 성대모사. 본인이 웃으면 통과' },
  { id: 'l2-17', level: 2, isDrinking: false, text: '단체 사진 한 장. 포즈는 걸린 사람이 지정' },
  { id: 'l2-18', level: 2, isDrinking: false, text: '스쿼트 10개. 세는 건 다같이' },
  { id: 'l2-19', level: 2, isDrinking: false, text: '올해 자기가 제일 잘한 일 자랑하기' },
  { id: 'l2-20', level: 2, isDrinking: false, text: '다음 판까지 3인칭으로 말하기 ("민수는 배고픕니다")' },

  // ─── LEVEL 3 : 매움 ────────────────────────────────────────────
  // 전부 거부 가능. 거부하면 한 잔.
  { id: 'l3-01', level: 3, isDrinking: true, text: '원샷' },
  { id: 'l3-02', level: 3, isDrinking: true, text: '진실 게임: 아무나 질문 하나. 대답 못 하면 한 잔' },
  { id: 'l3-03', level: 3, isDrinking: true, text: '다음 판에 또 걸리면 두 잔. 아니면 통과' },
  { id: 'l3-04', level: 3, isDrinking: false, text: '갤러리 맨 마지막 사진 공개' },
  { id: 'l3-05', level: 3, isDrinking: false, text: '최근 통화 목록 맨 위 이름 공개' },
  { id: 'l3-06', level: 3, isDrinking: false, text: '가장 최근에 보낸 카톡 읽어주기' },
  { id: 'l3-07', level: 3, isDrinking: false, text: '자기 흑역사 하나, 3문장으로' },
  { id: 'l3-08', level: 3, isDrinking: false, text: '이 자리 사람들 첫인상 솔직하게 한 명씩', audience: 'friends' },
  { id: 'l3-09', level: 3, isDrinking: false, text: '이상형 조건 세 개. 구체적으로', audience: 'friends' },
  { id: 'l3-10', level: 3, isDrinking: false, text: '최근 검색 기록 하나 공개' },
  { id: 'l3-11', level: 3, isDrinking: false, text: '지금 제일 후회하는 일 하나' },
  { id: 'l3-12', level: 3, isDrinking: false, text: '오늘 이 자리에서 하고 싶었는데 못 한 말' },
  { id: 'l3-13', level: 3, isDrinking: false, text: '노래 한 곡 후렴 전체. 무반주' },
  { id: 'l3-14', level: 3, isDrinking: false, text: '옆 사람에게 진지하게 사과 한 마디 (없는 일로)' },
  { id: 'l3-15', level: 3, isDrinking: false, text: '자기 인생 최악의 패션 시절 설명' },
  { id: 'l3-16', level: 3, isDrinking: false, text: '지금 제일 갖고 싶은 거 말하고 왜 못 샀는지' },
  { id: 'l3-17', level: 3, isDrinking: false, text: '이 자리에서 나갈 때까지 별명 하나 받기. 정하는 건 다른 사람들', audience: 'friends' },
  { id: 'l3-18', level: 3, isDrinking: false, text: '자기 자랑 30초. 하나도 안 겹치게' },
  { id: 'l3-19', level: 3, isDrinking: false, text: '학창시절 별명 공개' },
  { id: 'l3-20', level: 3, isDrinking: false, text: '다음 판까지 모든 사람 존댓말 + "님" 호칭' },

  // ─── 커플 전용 ─────────────────────────────────────────────────
  // partyMode: 'couple' 일 때만 덱에 들어온다.
  // 톤은 위와 같다. 스킨십 강도가 올라가는 항목은 전부 level 3에 두고,
  // level 3은 언제든 거부 가능하다는 규칙이 여기서 특히 중요하다.

  // 커플 LEVEL 1
  { id: 'c1-01', level: 1, isDrinking: true, audience: 'couple', text: '러브샷으로 한 모금' },
  { id: 'c1-02', level: 1, isDrinking: true, audience: 'couple', text: '상대가 "그만"이라고 할 때까지 마시기 (최대 반 잔)' },
  { id: 'c1-03', level: 1, isDrinking: false, audience: 'couple', text: '상대 칭찬 세 가지. 외모 빼고' },
  { id: 'c1-04', level: 1, isDrinking: false, audience: 'couple', text: '오늘 상대가 제일 예뻐/멋있어 보인 순간 말하기' },
  { id: 'c1-05', level: 1, isDrinking: false, audience: 'couple', text: '10초 동안 눈 안 피하고 마주보기. 먼저 웃으면 한 번 더' },
  { id: 'c1-06', level: 1, isDrinking: false, audience: 'couple', text: '상대를 부르는 새 애칭 하나 짓기. 오늘 하루 그걸로 부름' },
  { id: 'c1-07', level: 1, isDrinking: false, audience: 'couple', text: '처음 만난 날 뭐 입고 있었는지 맞히기. 틀리면 한 번 더' },
  { id: 'c1-08', level: 1, isDrinking: false, audience: 'couple', text: '상대 손 잡고 다음 판까지 유지' },
  { id: 'c1-09', level: 1, isDrinking: false, audience: 'couple', text: '상대 폰 배경화면 맞히기' },
  { id: 'c1-10', level: 1, isDrinking: false, audience: 'couple', text: '다음 판까지 상대 말에 무조건 "역시 우리 자기" 붙이기' },

  // 커플 LEVEL 2
  { id: 'c2-01', level: 2, isDrinking: true, audience: 'couple', text: '러브샷 한 잔' },
  { id: 'c2-02', level: 2, isDrinking: true, audience: 'couple', text: '상대가 잔을 채워주고, 원샷' },
  { id: 'c2-03', level: 2, isDrinking: false, audience: 'couple', text: '상대 자랑 30초. 남한테 소개하듯이' },
  { id: 'c2-04', level: 2, isDrinking: false, audience: 'couple', text: '우리 첫 데이트 코스 순서대로 복기. 틀리면 상대가 정정' },
  { id: 'c2-05', level: 2, isDrinking: false, audience: 'couple', text: '상대 어깨 주무르기 30초' },
  { id: 'c2-06', level: 2, isDrinking: false, audience: 'couple', text: '상대에게 어울리는 노래 한 곡 골라서 첫 소절 부르기' },
  { id: 'c2-07', level: 2, isDrinking: false, audience: 'couple', text: '상대 성대모사. 상대가 웃으면 통과' },
  { id: 'c2-08', level: 2, isDrinking: false, audience: 'couple', text: '지금 찍는 셀카 한 장, 상대가 포즈 지정' },
  { id: 'c2-09', level: 2, isDrinking: false, audience: 'couple', text: '상대에게 고마웠던 일 하나, 구체적으로' },
  { id: 'c2-10', level: 2, isDrinking: false, audience: 'couple', text: '다음 판까지 상대 말 전부 통역하듯 따라 말하기' },
  { id: 'c2-11', level: 2, isDrinking: false, audience: 'couple', text: '상대가 좋아하는 음식 세 개 대기. 하나라도 틀리면 한 번 더' },
  { id: 'c2-12', level: 2, isDrinking: false, audience: 'couple', text: '오늘 상대에게 미안했던 일 하나 사과하기' },

  // 커플 LEVEL 3 — 전부 거부 가능. 거부하면 한 잔.
  { id: 'c3-01', level: 3, isDrinking: true, audience: 'couple', text: '러브샷 원샷' },
  { id: 'c3-02', level: 3, isDrinking: true, audience: 'couple', text: '상대가 질문 하나. 대답 못 하면 한 잔' },
  { id: 'c3-03', level: 3, isDrinking: false, audience: 'couple', text: '볼에 뽀뽀' },
  { id: 'c3-04', level: 3, isDrinking: false, audience: 'couple', text: '10초 포옹' },
  { id: 'c3-05', level: 3, isDrinking: false, audience: 'couple', text: '상대 무릎 베고 30초' },
  { id: 'c3-06', level: 3, isDrinking: false, audience: 'couple', text: '상대 눈 보고 "사랑해" 한 번. 웃지 않고' },
  { id: 'c3-07', level: 3, isDrinking: false, audience: 'couple', text: '상대한테 반한 순간 하나, 솔직하게' },
  { id: 'c3-08', level: 3, isDrinking: false, audience: 'couple', text: '고치고 싶은 내 습관 하나 자백. 상대가 아니라 내 것' },
  { id: 'c3-09', level: 3, isDrinking: false, audience: 'couple', text: '상대에게 서운했던 일 하나. 화내지 말고 담담하게' },
  { id: 'c3-10', level: 3, isDrinking: false, audience: 'couple', text: '갤러리에서 둘이 나온 사진 중 제일 마음에 드는 거 고르고 이유' },
  { id: 'c3-11', level: 3, isDrinking: false, audience: 'couple', text: '1년 뒤 우리는 뭘 하고 있을지 30초 설명' },
  { id: 'c3-12', level: 3, isDrinking: false, audience: 'couple', text: '상대에게 즉석 고백 한 번 더. 처음 고백했을 때처럼' },
  { id: 'c3-13', level: 3, isDrinking: false, audience: 'couple', text: '상대 폰 최근 검색 기록 하나 공개 (고르는 건 본인)' },
  { id: 'c3-14', level: 3, isDrinking: false, audience: 'couple', text: '연애 전 흑역사 하나, 3문장으로' },
  { id: 'c3-15', level: 3, isDrinking: false, audience: 'couple', text: '다음 데이트 계획 지금 정하기. 날짜까지' },
];
