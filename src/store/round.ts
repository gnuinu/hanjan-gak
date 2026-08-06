import { create } from 'zustand';
import type { RoundResult } from '../domain/types';

/**
 * 방금 끝난 판. 결과 화면이 읽어간다.
 * 새로고침하면 사라져도 되는 값이라 persist 하지 않는다.
 */
interface RoundState {
  last: RoundResult | null;
  setLast: (round: RoundResult) => void;
  replacePenalty: (penalty: RoundResult['penalty']) => void;
}

export const useRound = create<RoundState>((set) => ({
  last: null,
  setLast: (round) => set({ last: round }),
  replacePenalty: (penalty) =>
    set((s) => (s.last ? { last: { ...s.last, penalty } } : s)),
}));
