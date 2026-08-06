import { useNavigate } from 'react-router-dom';
import { useSession } from '../store/session';
import { Button } from '../ui/Button';
import { sfx } from '../ui/feedback';
import './home.css';

export function Home() {
  const nav = useNavigate();
  const players = useSession((s) => s.players);
  const settings = useSession((s) => s.settings);
  const seenIntro = useSession((s) => s.seenIntro);
  const markIntroSeen = useSession((s) => s.markIntroSeen);

  const start = () => {
    sfx.tap();
    if (!seenIntro) {
      markIntroSeen();
      nav('/players');
    } else {
      nav('/games');
    }
  };

  return (
    <div className="screen home">
      <div className="screen__body home__body">
        <div className="home__logo display">한잔각</div>
        <div className="home__sub muted">인원수만 정하면 바로 시작</div>

        <div className="home__badges">
          <span className="chip">
            {settings.partyMode === 'couple' ? '💞 커플' : '🍻 친구'}
          </span>
          <span className="chip">{players.length}명</span>
          <span className="chip">벌칙 {['순함', '보통', '매움'][settings.penaltyLevel - 1]}</span>
          {settings.drinkFreeMode && <span className="chip chip--on">🚫 음주 무관</span>}
        </div>
      </div>

      <div className="screen__foot">
        <Button size="lg" onClick={start}>
          시작하기
        </Button>
        <div className="row" style={{ gap: 10 }}>
          <Button variant="ghost" onClick={() => nav('/players')}>
            멤버
          </Button>
          <Button variant="ghost" onClick={() => nav('/settings')}>
            설정
          </Button>
        </div>
        <p className="hint center">
          무리한 음주 강요는 하지 않기. 벌칙은 언제든 거부할 수 있고, 거부하면 대신 한 잔.
        </p>
      </div>
    </div>
  );
}
