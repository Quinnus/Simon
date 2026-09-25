function getHeadline(game) {
    if (game.won) {
        return 'You win!';
    }
    if (game.mistakeReason === 'timeout') {
        return 'Too slow!';
    }
    if (game.mistakeReason === 'wrong') {
        return 'Wrong colour!';
    }
    return 'Game stopped';
}

export default function GameSummaryModal({ game, onRestart }) {
    return (
        <div className="modal-overlay">
            <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                <h2 id="modal-title">{getHeadline(game)}</h2>
                {game.won && <p>You beat all {game.settings.level} steps</p>}
                <p>Your Streak was: {game.streak}</p>
                {game.newBest ? (
                    <p className="new-best">New best!</p>
                ) : (
                    <p className="muted">Best: {game.best}</p>
                )}
                <p>Play Again Soon!</p>
                <button className="exit-to-start" onClick={onRestart} autoFocus>
                    <span>Restart</span>
                </button>
            </div>
        </div>
    );
}
