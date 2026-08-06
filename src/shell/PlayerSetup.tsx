import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MAX_PLAYERS, MIN_PLAYERS, useSession } from '../store/session';
import { Button } from '../ui/Button';
import { TopBar } from '../ui/TopBar';
import { sfx } from '../ui/feedback';
import './players.css';

export function PlayerSetup() {
  const nav = useNavigate();
  const players = useSession((s) => s.players);
  const partyMode = useSession((s) => s.settings.partyMode);
  const setPlayerCount = useSession((s) => s.setPlayerCount);
  const renamePlayer = useSession((s) => s.renamePlayer);
  const cycleEmoji = useSession((s) => s.cyclePlayerEmoji);
  const setPartyMode = useSession((s) => s.setPartyMode);

  const [editing, setEditing] = useState<string | null>(null);
  const locked = partyMode === 'couple'; // 커플은 2명 고정

  const bump = (delta: number) => {
    sfx.tap();
    setPlayerCount(players.length + delta);
  };

  return (
    <div className="screen">
      <TopBar title="누가 왔나요" onBack={() => nav('/')} />

      <div className="screen__body stack">
        <div className="seg seg--wide">
          <button
            className={partyMode === 'friends' ? 'is-on' : ''}
            onClick={() => {
              sfx.tap();
              setPartyMode('friends');
            }}
          >
            🍻 친구끼리
          </button>
          <button
            className={partyMode === 'couple' ? 'is-on' : ''}
            onClick={() => {
              sfx.tap();
              setPartyMode('couple');
            }}
          >
            💞 커플끼리
          </button>
        </div>

        {locked ? (
          <p className="hint">
            커플 모드는 2명 고정. 커플 전용 게임과 벌칙이 열리고, 단체용 벌칙은 빠집니다.
          </p>
        ) : (
          <div className="counter">
            <button className="counter__btn" onClick={() => bump(-1)} disabled={players.length <= MIN_PLAYERS}>
              −
            </button>
            <div className="counter__value mono">{players.length}</div>
            <button className="counter__btn" onClick={() => bump(1)} disabled={players.length >= MAX_PLAYERS}>
              +
            </button>
          </div>
        )}

        <div className="players">
          {players.map((p) => (
            <div className="players__row" key={p.id} style={{ borderColor: p.color }}>
              <button
                className="players__emoji"
                onClick={() => {
                  sfx.tap();
                  cycleEmoji(p.id);
                }}
                aria-label="이모지 바꾸기"
              >
                {p.emoji}
              </button>
              {editing === p.id ? (
                <input
                  className="players__input"
                  autoFocus
                  defaultValue={p.name}
                  maxLength={8}
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v) renamePlayer(p.id, v);
                    setEditing(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                  }}
                />
              ) : (
                <button className="players__name" onClick={() => setEditing(p.id)}>
                  {p.name}
                  <span className="players__pencil">✎</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="screen__foot">
        <Button size="lg" onClick={() => nav('/games')}>
          저장하고 시작
        </Button>
        <p className="hint center">이름과 이모지는 다음에 켤 때도 그대로 남습니다.</p>
      </div>
    </div>
  );
}
