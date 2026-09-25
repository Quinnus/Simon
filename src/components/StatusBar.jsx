import { isSpeedUpRound } from '../gameReducer.js';

function getStatus(game) {
    const lastChance = game.settings.forgiving && !game.retryAvailable;
    switch (game.phase) {
        case 'off':
            return { text: 'Press power to start' };
        case 'startup':
            return { text: game.paused ? 'Paused' : 'Get ready… tap a pad to skip' };
        case 'simonTurn':
            if (game.paused) {
                return { text: 'Paused' };
            }
            if (lastChance) {
                return { text: 'Last chance – watch…', tone: 'warning' };
            }
            if (isSpeedUpRound(game.sequence.length)) {
                return { text: 'Speed up!', tone: 'speed-up' };
            }
            return { text: 'Watch…' };
        case 'playerTurn':
            return {
                text: game.settings.mode === 'reverse' ? 'Your turn – backwards!' : 'Your turn',
                tone: 'go',
            };
        case 'playerAdd':
            return { text: 'Add a colour', tone: 'go' };
        case 'mistake':
            return { text: game.mistakeReason === 'timeout' ? 'Too slow!' : 'Wrong!', tone: 'error' };
        case 'won':
            return { text: 'You win!', tone: 'go' };
        default:
            return { text: 'Game over' };
    }
}

export default function StatusBar({ game }) {
    const { text, tone } = getStatus(game);
    const inGame = game.phase !== 'off';
    return (
        <div className="status-bar">
            <p className={`status${tone ? ` status-${tone}` : ''}`} aria-live="polite">
                {text}
            </p>
            <p className="stats">
                {inGame && <span>Round {game.sequence.length}</span>}
                <span>Streak {game.streak}</span>
                <span>Best {game.best}</span>
            </p>
        </div>
    );
}
