import { useNavigate } from 'react-router-dom';
import { GAMES } from '../games/registry';
import { isGamePlayable } from '../domain/game';
import { useSession } from '../store/session';
import { Button } from '../ui/Button';
import { TopBar } from '../ui/TopBar';
import { sfx } from '../ui/feedback';
import './picker.css';

export function GamePicker() {
  const nav = useNavigate();
  const players = useSession((s) => s.players);
  const partyMode = useSession((s) => s.settings.partyMode);
  const history = useSession((s) => s.history);

  const playable = GAMES.filter((g) => isGamePlayable(g.meta, players.length, partyMode));
  const blocked = GAMES.filter((g) => !isGamePlayable(g.meta, players.length, partyMode));

  const go = (id: string) => {
    sfx.tap();
    nav(`/play/${id}`);
  };

  const random = () => {
    // 방금 한 게임은 피한다
    const lastId = history.at(-1)?.gameId;
    const pool = playable.length > 1 ? playable.filter((g) => g.meta.id !== lastId) : playable;
    go(pool[Math.floor(Math.random() * pool.length)].meta.id);
  };

  return (
    <div className="screen">
      <TopBar
        title="뭐 할까"
        onBack={() => nav('/')}
        right={
          history.length > 0 ? (
            <button className="iconbtn" onClick={() => nav('/stats')} aria-label="오늘의 기록">
              📊
            </button>
          ) : undefined
        }
      />

      <div className="screen__body stack">
        <Button size="lg" onClick={random}>
          🎲 랜덤으로 아무거나
        </Button>

        <div className="grid">
          {playable.map(({ meta }) => (
            <button key={meta.id} className="gamecard" onClick={() => go(meta.id)}>
              <span className="gamecard__emoji">{meta.emoji}</span>
              <span className="gamecard__title">{meta.title}</span>
              <span className="gamecard__tag">{meta.tagline}</span>
              {meta.audience === 'couple' ? (
                <span className="gamecard__badge">커플</span>
              ) : meta.needsKeyboard ? (
                <span className="gamecard__badge gamecard__badge--pc">⌨ PC</span>
              ) : null}
            </button>
          ))}
        </div>

        {blocked.length > 0 && (
          <div className="blocked">
            {blocked.map(({ meta }) => (
              <div key={meta.id} className="blocked__row">
                <span>
                  {meta.emoji} {meta.title}
                </span>
                <span className="hint">
                  {meta.audience === 'couple'
                    ? '커플 모드 전용'
                    : `${meta.minPlayers}~${meta.maxPlayers}명`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="screen__foot">
        <div className="row" style={{ gap: 10 }}>
          <Button variant="ghost" onClick={() => nav('/players')}>
            멤버 {players.length}명
          </Button>
          <Button variant="ghost" onClick={() => nav('/settings')}>
            설정
          </Button>
        </div>
      </div>
    </div>
  );
}
