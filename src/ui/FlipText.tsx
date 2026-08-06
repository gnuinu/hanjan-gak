import { useEffect, useState } from 'react';
import './flip.css';

const GLYPHS = '가나다라마바사아자차카타파하강진운수대통령각한잔';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

interface Props {
  text: string;
  /** 글자 하나가 멈추기까지의 간격(ms) */
  stagger?: number;
  className?: string;
  onSettled?: () => void;
}

/**
 * 공항 전광판 스플릿플랩. 글자가 드르륵 돌다가 왼쪽부터 하나씩 멈춘다.
 * 이 앱의 시그니처 연출이므로 여기 말고 다른 데선 아껴 쓴다.
 */
export function FlipText({ text, stagger = 90, className = '', onSettled }: Props) {
  const chars = [...text];
  const [settled, setSettled] = useState(() => (prefersReducedMotion() ? chars.length : 0));
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setSettled(chars.length);
      onSettled?.();
      return;
    }
    setSettled(0);
    const spin = window.setInterval(() => setTick((t) => t + 1), 55);
    let landed = 0;
    const land = window.setInterval(() => {
      landed += 1;
      setSettled(landed);
      if (landed >= chars.length) {
        window.clearInterval(land);
        window.clearInterval(spin);
        onSettled?.();
      }
    }, stagger);
    return () => {
      window.clearInterval(spin);
      window.clearInterval(land);
    };
    // text 가 바뀔 때만 다시 돌린다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <span className={`flip ${className}`} aria-label={text}>
      {chars.map((ch, i) => (
        <span key={i} className={`flip__cell ${i < settled ? 'is-settled' : ''}`} aria-hidden>
          {i < settled ? ch : GLYPHS[(tick * 7 + i * 3) % GLYPHS.length]}
        </span>
      ))}
    </span>
  );
}
