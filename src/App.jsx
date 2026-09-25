import './styles.css';
import { useCallback, useEffect, useEffectEvent, useReducer, useRef, useState } from 'react';
import BoardControls from './components/BoardControls.jsx';
import GameSettings from './components/GameSettings.jsx';
import GameSummaryModal from './components/GameSummaryModal.jsx';
import StatusBar from './components/StatusBar.jsx';
import useGameSounds from './hooks/useGameSounds.js';
import { loadValue, saveValue } from './storage.js';
import {
    BUTTONS,
    defaultSettings,
    gameReducer,
    getRoundTiming,
    initialState,
    isCorrectPress,
    randomColor,
} from './gameReducer.js';

const BOARD_LIGHTS = ['all', 'blue', 'red', 'yellow', 'green'];
const SIMON_LEAD_IN = 800; // pause after the player lets go before Simon plays
const PLAYER_TIME_LIMIT = 3000; // per press, like the original toy

// Laid out like the pads: Q W on top, A S below
const KEY_COLORS = { q: 'green', w: 'red', a: 'blue', s: 'yellow' };

function createTimers() {
    const ids = [];
    return {
        at(delay, callback) {
            ids.push(setTimeout(callback, delay));
        },
        clear() {
            ids.forEach(clearTimeout);
        },
    };
}

function loadInitialState() {
    return {
        ...initialState,
        best: loadValue('simon-best', 0),
    };
}

function keyColor(key) {
    return KEY_COLORS[key.toLowerCase()];
}

export default function App() {
    const [game, dispatch] = useReducer(gameReducer, undefined, loadInitialState);
    const [settings, setSettings] = useState(() => ({
        ...defaultSettings,
        ...loadValue('simon-settings', {}),
    }));
    const { playTone, playWrongTone, resumeAudio } = useGameSounds();

    // The pad the player is holding down, if any
    const [pressed, setPressed] = useState(null);
    const heldPress = useRef(null);
    const releaseTimer = useRef(null);

    useEffect(() => saveValue('simon-best', game.best), [game.best]);
    useEffect(() => saveValue('simon-settings', settings), [settings]);

    // Startup light show and 3-2-1 countdown
    useEffect(() => {
        if (game.phase !== 'startup' || game.paused) {
            return;
        }
        const timers = createTimers();
        BUTTONS.forEach((color, i) => {
            timers.at((i + 1) * 600, () => {
                playTone(color, 600);
                dispatch({ type: 'LIGHT', lit: color });
            });
        });
        timers.at(3000, () => {
            playTone('green', 600);
            dispatch({ type: 'LIGHT', lit: 'all' });
        });
        timers.at(3600, () => dispatch({ type: 'LIGHT', lit: null }));
        [3, 2, 1].forEach((value, i) => {
            timers.at(4000 + i * 1000, () => {
                playTone('green', 600);
                dispatch({ type: 'COUNTDOWN', value });
            });
        });
        timers.at(7000, () => dispatch({ type: 'START_SIMON_TURN' }));
        return timers.clear;
    }, [game.phase, game.paused, playTone]);

    // Simon plays the sequence once the player has let go, then hands over
    useEffect(() => {
        if (game.phase !== 'simonTurn' || game.paused || pressed) {
            return;
        }
        const { showLit, buttonPause } = getRoundTiming(game.sequence.length);
        const step = showLit + buttonPause;
        const timers = createTimers();
        game.sequence.forEach((color, n) => {
            const start = SIMON_LEAD_IN + n * step;
            timers.at(start, () => {
                playTone(color, showLit);
                dispatch({ type: 'LIGHT', lit: color });
            });
            timers.at(start + showLit, () => dispatch({ type: 'LIGHT', lit: null }));
        });
        timers.at(SIMON_LEAD_IN + game.sequence.length * step - buttonPause, () =>
            dispatch({ type: 'START_PLAYER_TURN' }),
        );
        return timers.clear;
    }, [game.phase, game.sequence, game.paused, pressed, playTone]);

    // The player has a few seconds for each press; the clock waits while a pad is held
    useEffect(() => {
        const waiting = game.phase === 'playerTurn' || game.phase === 'playerAdd';
        if (!waiting || game.paused || pressed) {
            return;
        }
        const timer = setTimeout(() => dispatch({ type: 'TIMEOUT' }), PLAYER_TIME_LIMIT);
        return () => clearTimeout(timer);
    }, [game.phase, game.playerIndex, game.paused, pressed]);

    // Buzz and flash the pad that should have been pressed
    useEffect(() => {
        if (game.phase !== 'mistake') {
            return;
        }
        const timers = createTimers();
        timers.at(0, playWrongTone);
        if (game.missed) {
            for (let i = 0; i < 3; i++) {
                timers.at(i * 600, () => dispatch({ type: 'LIGHT', lit: game.missed }));
                timers.at(i * 600 + 350, () => dispatch({ type: 'LIGHT', lit: null }));
            }
        }
        timers.at(1900, () => dispatch({ type: 'MISTAKE_DONE' }));
        return timers.clear;
    }, [game.phase, game.missed, playWrongTone]);

    // Victory lap: spin round the pads, then flash everything
    useEffect(() => {
        if (game.phase !== 'won') {
            return;
        }
        const timers = createTimers();
        for (let i = 0; i < 12; i++) {
            const color = ['green', 'red', 'yellow', 'blue'][i % 4];
            timers.at(600 + i * 120, () => {
                playTone(color, 120);
                dispatch({ type: 'LIGHT', lit: color });
            });
        }
        for (let i = 0; i < 3; i++) {
            timers.at(2100 + i * 400, () => {
                playTone('green', 250);
                dispatch({ type: 'LIGHT', lit: 'all' });
            });
            timers.at(2300 + i * 400, () => dispatch({ type: 'LIGHT', lit: null }));
        }
        timers.at(3600, () => dispatch({ type: 'WIN_DONE' }));
        return timers.clear;
    }, [game.phase, playTone]);

    const releaseHeldPress = useCallback(() => {
        clearTimeout(releaseTimer.current);
        heldPress.current = null;
        setPressed(null);
    }, []);

    // Pause when the tab is hidden, since browsers slow timers down in background tabs
    useEffect(() => {
        function handleVisibilityChange() {
            if (document.hidden) {
                releaseHeldPress();
                dispatch({ type: 'PAUSE' });
            } else {
                dispatch({ type: 'RESUME' });
            }
        }
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [releaseHeldPress]);

    function handlePowerClick() {
        resumeAudio();
        releaseHeldPress();
        if (game.phase === 'off') {
            dispatch({ type: 'POWER_ON', firstColor: randomColor(), settings });
        } else {
            dispatch({ type: 'STOP' });
        }
    }

    function handlePressStart(color) {
        // Any pad skips the intro
        if (game.phase === 'startup') {
            dispatch({ type: 'START_SIMON_TURN' });
            return;
        }
        const waiting = game.phase === 'playerTurn' || game.phase === 'playerAdd';
        if (!waiting || game.paused) {
            return;
        }
        releaseHeldPress();
        if (isCorrectPress(game, color)) {
            // Same tone and length Simon uses this round, so the player's presses echo Simon's
            const { showLit } = getRoundTiming(game.sequence.length);
            playTone(color, showLit);
            heldPress.current = { color, startedAt: performance.now(), minLength: showLit };
            setPressed(color);
        }
        dispatch({ type: 'PRESS', color, nextColor: randomColor() });
    }

    function handlePressEnd() {
        if (!heldPress.current) {
            return;
        }
        const heldFor = performance.now() - heldPress.current.startedAt;
        clearTimeout(releaseTimer.current);
        // A quick tap stays lit as long as Simon's light would
        releaseTimer.current = setTimeout(
            releaseHeldPress,
            Math.max(0, heldPress.current.minLength - heldFor),
        );
    }

    const handleKeyDown = useEffectEvent((e) => {
        if (e.repeat || e.metaKey || e.ctrlKey || e.altKey || game.phase === 'gameOver') {
            return;
        }
        if (['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) {
            return;
        }
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handlePowerClick();
            return;
        }
        const color = keyColor(e.key);
        if (color) {
            e.preventDefault();
            handlePressStart(color);
        }
    });

    const handleKeyUp = useEffectEvent((e) => {
        if (heldPress.current && heldPress.current.color === keyColor(e.key)) {
            handlePressEnd();
        }
    });

    useEffect(() => {
        const onKeyDown = (e) => handleKeyDown(e);
        const onKeyUp = (e) => handleKeyUp(e);
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
        };
    }, []);

    const shownLight = pressed ?? game.lit;

    return (
        <div className="app">
            <div className="board-container">
                <img
                    className="all-dim"
                    src="/board/all-dim.webp"
                    style={{ opacity: game.phase === 'off' ? 1 : 0 }}
                    alt=""
                />
                <img
                    className="all-on"
                    src="/board/all-on.webp"
                    style={{ opacity: game.phase !== 'off' ? 1 : 0 }}
                    alt=""
                />
                {BOARD_LIGHTS.map((light) => (
                    <img
                        key={light}
                        className={`${light}-lit`}
                        src={`/board/${light}-lit.webp`}
                        style={{ opacity: shownLight === light ? 1 : 0 }}
                        alt=""
                    />
                ))}
                <BoardControls
                    powerOn={game.phase !== 'off'}
                    onPressStart={handlePressStart}
                    onPressEnd={handlePressEnd}
                    onPower={handlePowerClick}
                />
                {game.countdown !== null && (
                    <div id="countdown-overlay-grid">
                        <p id="countdown-number">{game.countdown}</p>
                    </div>
                )}
            </div>

            <StatusBar game={game} />

            {/* Hidden rather than removed during a game, so the board doesn't jump */}
            <GameSettings
                settings={settings}
                onChange={setSettings}
                hidden={game.phase !== 'off'}
            />

            <p className="key-hint">Keys: Q W A S (shown by each pad) · Space for power</p>

            {game.phase === 'gameOver' && (
                <GameSummaryModal game={game} onRestart={() => dispatch({ type: 'RESET' })} />
            )}
        </div>
    );
}
