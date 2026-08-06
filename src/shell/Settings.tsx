import { useNavigate } from 'react-router-dom';
import { useSession } from '../store/session';
import { penaltyPool } from '../domain/penalty';
import { TopBar } from '../ui/TopBar';
import { sfx } from '../ui/feedback';
import './settings.css';

const LEVELS = [
  { value: 1, label: '순함' },
  { value: 2, label: '보통' },
  { value: 3, label: '매움' },
] as const;

export function Settings() {
  const nav = useNavigate();
  const settings = useSession((s) => s.settings);
  const update = useSession((s) => s.updateSettings);
  const setPartyMode = useSession((s) => s.setPartyMode);
  const custom = useSession((s) => s.customPenalties);

  const poolSize = penaltyPool(settings, custom).length;

  return (
    <div className="screen">
      <TopBar title="설정" onBack={() => nav(-1)} />

      <div className="screen__body stack">
        <section className="set">
          <div className="set__label">자리 성격</div>
          <div className="seg seg--wide">
            <button
              className={settings.partyMode === 'friends' ? 'is-on' : ''}
              onClick={() => setPartyMode('friends')}
            >
              🍻 친구끼리
            </button>
            <button
              className={settings.partyMode === 'couple' ? 'is-on' : ''}
              onClick={() => setPartyMode('couple')}
            >
              💞 커플끼리
            </button>
          </div>
          <p className="hint">
            커플로 바꾸면 인원이 2명으로 맞춰지고, 커플 전용 게임과 벌칙이 열립니다.
          </p>
        </section>

        <section className="set">
          <div className="set__label">벌칙 수위</div>
          <div className="seg seg--wide">
            {LEVELS.map((l) => (
              <button
                key={l.value}
                className={settings.penaltyLevel === l.value ? 'is-on' : ''}
                onClick={() => {
                  sfx.tap();
                  update({ penaltyLevel: l.value });
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
          <p className="hint">지금 덱에 {poolSize}개. 매움은 언제든 거부 가능(대신 한 잔).</p>
        </section>

        <Toggle
          label="음주 무관 모드"
          desc="술 관련 벌칙을 전부 빼고 순수 벌칙만"
          on={settings.drinkFreeMode}
          onChange={(v) => update({ drinkFreeMode: v })}
        />
        <Toggle
          label="경마 지목 모드"
          desc="꼴찌 대신 1등이 마실 사람을 지목"
          on={settings.targetMode}
          onChange={(v) => update({ targetMode: v })}
        />
        <Toggle
          label="소리"
          on={settings.sound}
          onChange={(v) => update({ sound: v })}
        />
        <Toggle
          label="진동"
          on={settings.haptics}
          onChange={(v) => update({ haptics: v })}
        />
        <Toggle
          label="화면 안 꺼지게"
          desc="게임 중에만 적용"
          on={settings.keepScreenAwake}
          onChange={(v) => update({ keepScreenAwake: v })}
        />

        <button className="set__link" onClick={() => nav('/settings/penalties')}>
          <span>벌칙 편집</span>
          <span className="muted">내가 추가한 것 {custom.length}개 →</span>
        </button>
      </div>
    </div>
  );
}

function Toggle({
  label,
  desc,
  on,
  onChange,
}: {
  label: string;
  desc?: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      className="toggle"
      onClick={() => {
        sfx.tap();
        onChange(!on);
      }}
      role="switch"
      aria-checked={on}
    >
      <span className="toggle__text">
        <span className="toggle__label">{label}</span>
        {desc && <span className="hint">{desc}</span>}
      </span>
      <span className={`toggle__track ${on ? 'is-on' : ''}`}>
        <span className="toggle__knob" />
      </span>
    </button>
  );
}
