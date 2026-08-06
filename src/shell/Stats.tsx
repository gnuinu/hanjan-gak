import { useNavigate } from 'react-router-dom';
import { computeStats } from '../domain/stats';
import { findGame } from '../games/registry';
import { useSession } from '../store/session';
import { Button } from '../ui/Button';
import { TopBar } from '../ui/TopBar';
import './stats.css';

export function Stats() {
  const nav = useNavigate();
  const history = useSession((s) => s.history);
  const players = useSession((s) => s.players);
  const newParty = useSession((s) => s.newParty);

  const stats = computeStats(history, players);
  const max = Math.max(1, ...stats.byPlayer.map((e) => e.count));

  return (
    <div className="screen">
      <TopBar title="오늘의 기록" onBack={() => nav('/games')} />

      <div className="screen__body stack">
        {stats.totalRounds === 0 ? (
          <p className="hint center" style={{ paddingTop: 40 }}>
            아직 한 판도 안 했습니다.
          </p>
        ) : (
          <>
            <div className="stats__head card">
              <div>
                <div className="stats__big mono">{stats.totalRounds}</div>
                <div className="hint">총 판 수</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="stats__big">
                  {stats.mostBusted ? `${stats.mostBusted.emoji} ${stats.mostBusted.name}` : '-'}
                </div>
                <div className="hint">오늘의 제물</div>
              </div>
            </div>

            <div className="stack">
              {stats.byPlayer.map(({ player, count }) => (
                <div className="stats__row" key={player.id}>
                  <span className="stats__name">
                    {player.emoji} {player.name}
                  </span>
                  <span className="stats__bar">
                    <span
                      style={{
                        width: `${(count / max) * 100}%`,
                        background: player.color,
                      }}
                    />
                  </span>
                  <span className="mono stats__count">{count}</span>
                </div>
              ))}
            </div>

            {stats.untouched.length > 0 && (
              <p className="hint">
                한 번도 안 걸린 사람: {stats.untouched.map((p) => p.name).join(', ')}
              </p>
            )}

            <div className="card stack" style={{ gap: 6 }}>
              {stats.byGame.map(({ gameId, count }) => (
                <div className="row" key={gameId} style={{ justifyContent: 'space-between' }}>
                  <span>
                    {findGame(gameId)?.meta.emoji} {findGame(gameId)?.meta.title ?? gameId}
                  </span>
                  <span className="mono muted">{count}판</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="screen__foot">
        <Button size="lg" onClick={() => nav('/games')}>
          계속하기
        </Button>
        <Button
          variant="quiet"
          onClick={() => {
            if (confirm('기록을 지우고 새 자리를 시작할까요?')) {
              newParty();
              nav('/games');
            }
          }}
        >
          새 자리 시작 (기록 초기화)
        </Button>
      </div>
    </div>
  );
}
