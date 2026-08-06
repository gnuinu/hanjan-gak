import { useSession } from '../store/session';

// 사운드 소스를 따로 두지 않고 WebAudio로 직접 만든다.
// 에셋이 없으니 오프라인에서도 그냥 된다.
let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as any).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

type Tone = { freq: number; dur: number; delay?: number; type?: OscillatorType; gain?: number };

function play(tones: Tone[]) {
  if (!useSession.getState().settings.sound) return;
  const ac = audio();
  if (!ac) return;
  for (const t of tones) {
    const start = ac.currentTime + (t.delay ?? 0);
    const osc = ac.createOscillator();
    const amp = ac.createGain();
    osc.type = t.type ?? 'square';
    osc.frequency.setValueAtTime(t.freq, start);
    amp.gain.setValueAtTime(0.0001, start);
    amp.gain.exponentialRampToValueAtTime(t.gain ?? 0.14, start + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, start + t.dur);
    osc.connect(amp).connect(ac.destination);
    osc.start(start);
    osc.stop(start + t.dur + 0.02);
  }
}

function buzz(pattern: number | number[]) {
  if (!useSession.getState().settings.haptics) return;
  navigator.vibrate?.(pattern);
}

export const sfx = {
  /** 버튼/카드 탭 */
  tap() {
    play([{ freq: 660, dur: 0.05, gain: 0.07 }]);
    buzz(8);
  },
  /** 카운트다운 한 칸 */
  tick() {
    play([{ freq: 880, dur: 0.06, gain: 0.09 }]);
    buzz(12);
  },
  /** 출발 신호 */
  go() {
    play([
      { freq: 523, dur: 0.09 },
      { freq: 784, dur: 0.16, delay: 0.1 },
    ]);
    buzz([20, 40, 40]);
  },
  /** 무사 통과 */
  safe() {
    play([
      { freq: 587, dur: 0.08, type: 'triangle' },
      { freq: 880, dur: 0.12, delay: 0.07, type: 'triangle' },
    ]);
    buzz(15);
  },
  /** 걸렸다 */
  bust() {
    play([
      { freq: 220, dur: 0.22, type: 'sawtooth', gain: 0.16 },
      { freq: 165, dur: 0.34, delay: 0.14, type: 'sawtooth', gain: 0.16 },
    ]);
    buzz([60, 50, 140]);
  },
  /** 결과 발표 전광판 */
  reveal() {
    play([
      { freq: 392, dur: 0.1 },
      { freq: 523, dur: 0.1, delay: 0.09 },
      { freq: 784, dur: 0.26, delay: 0.18 },
    ]);
    buzz([30, 30, 30, 30, 90]);
  },
};
