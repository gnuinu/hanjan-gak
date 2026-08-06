interface Props {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

export function TopBar({ title, onBack, right }: Props) {
  return (
    <div className="topbar">
      {onBack && (
        <button className="iconbtn" onClick={onBack} aria-label="뒤로">
          ←
        </button>
      )}
      <span className="topbar__title">{title}</span>
      <span className="topbar__spacer" />
      {right}
    </div>
  );
}
