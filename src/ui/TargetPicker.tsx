import type { Player } from '../domain/types';
import { sfx } from './feedback';
import './targetpicker.css';

interface Props {
  players: Player[];
  title: string;
  exclude?: string[];
  onPick: (playerId: string) => void;
}

/** "네가 마셔" — 지목 모드용 플레이어 버튼 그리드 */
export function TargetPicker({ players, title, exclude = [], onPick }: Props) {
  const options = players.filter((p) => !exclude.includes(p.id));
  return (
    <div className="picker">
      <div className="picker__title">{title}</div>
      <div className="picker__grid">
        {options.map((p) => (
          <button
            key={p.id}
            className="picker__btn"
            style={{ borderColor: p.color }}
            onClick={() => {
              sfx.tap();
              onPick(p.id);
            }}
          >
            <span className="picker__emoji">{p.emoji}</span>
            <span className="picker__name">{p.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
