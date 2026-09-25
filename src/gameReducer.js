export const BUTTONS = ['green', 'red', 'yellow', 'blue'];

// Sequence lengths that win the game; 0 means endless
export const LEVELS = [8, 14, 20, 31, 0];

export const MODES = {
    classic: 'Classic',
    reverse: 'Reverse',
    playerAdds: 'Player Adds',
};

export const defaultSettings = { level: 0, mode: 'classic', forgiving: false };

// Phases: off → startup → simonTurn ⇄ playerTurn → mistake → gameOver → off
// Player Adds mode goes playerTurn → playerAdd → playerTurn without Simon replaying,
// and a completed final level goes to 'won' before gameOver.
export const initialState = {
    phase: 'off',
    settings: defaultSettings,
    sequence: [],
    playerIndex: 0,
    streak: 0,
    best: 0,
    newBest: false,
    won: false,
    lit: null, // which light Simon is showing: a colour, 'all' or null
    countdown: null,
    missed: null, // the colour that should have been pressed
    mistakeReason: null, // 'wrong' or 'timeout'
    retryAvailable: true,
    paused: false,
};

export function randomColor() {
    return BUTTONS[Math.floor(Math.random() * BUTTONS.length)];
}

export function getRoundTiming(round) {
    if (round > 13) {
        return { showLit: 100, buttonPause: 100 };
    } else if (round > 8) {
        return { showLit: 200, buttonPause: 150 };
    } else if (round > 4) {
        return { showLit: 400, buttonPause: 300 };
    }
    return { showLit: 800, buttonPause: 600 };
}

export function isSpeedUpRound(round) {
    return round > 1 && getRoundTiming(round).showLit !== getRoundTiming(round - 1).showLit;
}

export function expectedColor(state) {
    const index =
        state.settings.mode === 'reverse'
            ? state.sequence.length - 1 - state.playerIndex
            : state.playerIndex;
    return state.sequence[index];
}

export function isCorrectPress(state, color) {
    return state.phase === 'playerAdd' || color === expectedColor(state);
}

function mistake(state, reason) {
    return {
        ...state,
        phase: 'mistake',
        missed: state.phase === 'playerTurn' ? expectedColor(state) : null,
        mistakeReason: reason,
        lit: null,
    };
}

function endGame(state, won = false) {
    return {
        ...state,
        phase: 'gameOver',
        won,
        lit: null,
        countdown: null,
        paused: false,
        best: Math.max(state.best, state.streak),
        newBest: state.streak > state.best,
    };
}

function completeSequence(state, nextColor) {
    const done = { ...state, streak: state.streak + 1, playerIndex: 0, retryAvailable: true };
    if (state.settings.level && state.sequence.length >= state.settings.level) {
        return { ...done, phase: 'won' };
    }
    if (state.settings.mode === 'playerAdds') {
        return { ...done, phase: 'playerAdd' };
    }
    return { ...done, phase: 'simonTurn', sequence: [...state.sequence, nextColor] };
}

export function gameReducer(state, action) {
    switch (action.type) {
        case 'POWER_ON':
            return {
                ...initialState,
                best: state.best,
                settings: action.settings,
                phase: 'startup',
                sequence: [action.firstColor],
            };

        case 'LIGHT':
            return { ...state, lit: action.lit };

        case 'COUNTDOWN':
            return { ...state, countdown: action.value };

        // Also used to skip the intro
        case 'START_SIMON_TURN':
            if (state.phase !== 'startup') {
                return state;
            }
            return { ...state, phase: 'simonTurn', playerIndex: 0, lit: null, countdown: null };

        case 'START_PLAYER_TURN':
            if (state.phase !== 'simonTurn') {
                return state;
            }
            return { ...state, phase: 'playerTurn' };

        case 'PRESS': {
            if (state.phase === 'playerAdd') {
                return {
                    ...state,
                    phase: 'playerTurn',
                    playerIndex: 0,
                    sequence: [...state.sequence, action.color],
                };
            }
            if (state.phase !== 'playerTurn') {
                return state;
            }
            if (!isCorrectPress(state, action.color)) {
                return mistake(state, 'wrong');
            }
            const playerIndex = state.playerIndex + 1;
            if (playerIndex < state.sequence.length) {
                return { ...state, playerIndex };
            }
            return completeSequence(state, action.nextColor);
        }

        case 'TIMEOUT':
            if (state.phase !== 'playerTurn' && state.phase !== 'playerAdd') {
                return state;
            }
            return mistake(state, 'timeout');

        case 'MISTAKE_DONE':
            if (state.phase !== 'mistake') {
                return state;
            }
            if (state.settings.forgiving && state.retryAvailable) {
                // Simon replays the same sequence for one more try
                return { ...state, phase: 'simonTurn', playerIndex: 0, retryAvailable: false, lit: null };
            }
            return endGame(state);

        case 'WIN_DONE':
            return state.phase === 'won' ? endGame(state, true) : state;

        case 'STOP':
            if (state.phase === 'off' || state.phase === 'gameOver') {
                return state;
            }
            return endGame(state);

        // Tab hidden: stop the clock, and replay the sequence when the player comes back
        case 'PAUSE':
            if (!['startup', 'simonTurn', 'playerTurn', 'playerAdd'].includes(state.phase)) {
                return state;
            }
            return {
                ...state,
                paused: true,
                phase: state.phase === 'playerTurn' ? 'simonTurn' : state.phase,
                playerIndex: 0,
                lit: null,
                countdown: null,
            };

        case 'RESUME':
            return { ...state, paused: false };

        case 'RESET':
            return { ...initialState, best: state.best, streak: state.streak, settings: state.settings };

        default:
            return state;
    }
}
