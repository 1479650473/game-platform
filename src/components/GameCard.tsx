import type { GameEntry } from '../types';

interface GameCardGridProps {
  games: GameEntry[];
  onPlay: (gameId: string) => void;
  onDelete: (gameId: string) => void;
  onAdd: () => void;
}

export function GameCardGrid({ games, onPlay, onDelete, onAdd }: GameCardGridProps) {
  return (
    <div className="game-grid">
      {games.map((game) => (
        <GameCard key={game.id} game={game} onPlay={onPlay} onDelete={onDelete} />
      ))}
      <button className="game-card game-card-add" onClick={onAdd} title="添加游戏">
        <div className="game-card-icon-wrapper add-icon-wrapper">
          <span className="add-icon">+</span>
        </div>
        <div className="game-card-info">
          <span className="game-card-name">添加游戏</span>
        </div>
      </button>
    </div>
  );
}

interface GameCardProps {
  game: GameEntry;
  onPlay: (gameId: string) => void;
  onDelete: (gameId: string) => void;
}

function GameCard({ game, onPlay, onDelete }: GameCardProps) {
  return (
    <div
      className="game-card"
      onDoubleClick={() => onPlay(game.id)}
      title={`双击启动 ${game.name}`}
    >
      <button
        className="game-card-delete-btn"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(game.id);
        }}
        title="删除游戏"
      >
        &times;
      </button>
      <div className="game-card-icon-wrapper">
        {game.iconData ? (
          <img className="game-card-icon" src={game.iconData} alt={game.name} />
        ) : (
          <span className="game-card-icon-fallback">
            {game.name.charAt(0)}
          </span>
        )}
      </div>
      <div className="game-card-info">
        <span className="game-card-name">{game.name}</span>
        {game.description && (
          <span className="game-card-desc">{game.description}</span>
        )}
      </div>
      <div className="game-card-play-hint">双击启动</div>
    </div>
  );
}
