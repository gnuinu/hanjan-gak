import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../store/session';
import { PENALTIES } from '../data/penalties';
import { Button } from '../ui/Button';
import { TopBar } from '../ui/TopBar';
import { sfx } from '../ui/feedback';
import type { Audience } from '../domain/types';
import './editor.css';

export function PenaltyEditor() {
  const nav = useNavigate();
  const custom = useSession((s) => s.customPenalties);
  const add = useSession((s) => s.addCustomPenalty);
  const remove = useSession((s) => s.removeCustomPenalty);
  const partyMode = useSession((s) => s.settings.partyMode);

  const [text, setText] = useState('');
  const [level, setLevel] = useState<1 | 2 | 3>(2);
  const [isDrinking, setDrinking] = useState(false);
  const [audience, setAudience] = useState<Audience>('all');

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    sfx.tap();
    add({ text: t, level, isDrinking, audience });
    setText('');
  };

  return (
    <div className="screen">
      <TopBar title="벌칙 편집" onBack={() => nav('/settings')} />

      <div className="screen__body stack">
        <div className="card stack">
          <input
            className="ed__input"
            placeholder="예: 다음 판까지 존댓말"
            value={text}
            maxLength={60}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          <div className="seg seg--wide">
            {([1, 2, 3] as const).map((l) => (
              <button key={l} className={level === l ? 'is-on' : ''} onClick={() => setLevel(l)}>
                {['순함', '보통', '매움'][l - 1]}
              </button>
            ))}
          </div>
          <div className="seg seg--wide">
            <button className={audience === 'all' ? 'is-on' : ''} onClick={() => setAudience('all')}>
              아무 자리나
            </button>
            <button
              className={audience === 'friends' ? 'is-on' : ''}
              onClick={() => setAudience('friends')}
            >
              친구 전용
            </button>
            <button
              className={audience === 'couple' ? 'is-on' : ''}
              onClick={() => setAudience('couple')}
            >
              커플 전용
            </button>
          </div>
          <label className="ed__check">
            <input
              type="checkbox"
              checked={isDrinking}
              onChange={(e) => setDrinking(e.target.checked)}
            />
            <span>술 마시는 벌칙 (음주 무관 모드에서 제외됨)</span>
          </label>
          <Button onClick={submit} disabled={!text.trim()}>
            추가
          </Button>
        </div>

        {custom.length > 0 && (
          <div className="stack" style={{ gap: 6 }}>
            <div className="set__label">내가 추가한 벌칙</div>
            {custom.map((p) => (
              <div className="ed__row" key={p.id}>
                <span className="ed__text">
                  <span className={`ed__lv lv${p.level}`}>{['순', '보', '매'][p.level - 1]}</span>
                  {p.text}
                  {p.audience === 'couple' && <span className="ed__tag">커플</span>}
                  {p.audience === 'friends' && <span className="ed__tag">친구</span>}
                </span>
                <button className="ed__del" onClick={() => remove(p.id)} aria-label="삭제">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <p className="hint">
          기본 덱은 {PENALTIES.length}개(그중 커플 전용{' '}
          {PENALTIES.filter((p) => p.audience === 'couple').length}개)입니다. 지금은{' '}
          {partyMode === 'couple' ? '커플' : '친구'} 자리 기준으로 뽑힙니다. 기본 덱을 고치려면{' '}
          <code>src/data/penalties.ts</code> 를 직접 편집하세요.
        </p>
      </div>
    </div>
  );
}
