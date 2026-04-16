import './styles.css';
import { useRef, useState } from 'react';
import GameSummaryModal from './components/GameSummaryModal.jsx';
import useGameSounds from './hooks/useGameSounds.js';

export default function App() {
    let showLit;
    let buttonPause;
    const gameRound = useRef(0);

    if (gameRound.current <= 4) {
        showLit = 800;
        buttonPause = 600;
    } else if (gameRound.current > 13) {
        showLit = 100;
        buttonPause = 100;
    } else if (gameRound.current > 8) {
        showLit = 200;
        buttonPause = 150;
    } else if (gameRound.current > 4) {
        showLit = 400;
        buttonPause = 300;
    }

    const BUTTONS = ['green', 'red', 'yellow', 'blue'];
    const [gameScreen, setGameScreen] = useState('idle');
    const [powerOn, setPowerOn] = useState(false);
    const [gameSummaryVisible, setGameSummaryVisible] = useState(false);
    const [streak, setStreak] = useState(0);
    const { playTone, playWrongTone } = useGameSounds();
    const [simonSequence, setSimonSequence] = useState([]);
    const playerCount = useRef(0);
    const [currentPlayer, setCurrentPlayer] = useState('simon');
    const sequenceTimeArray = useRef([]);
    const previousTimeOut = useRef(null);
    const [countdownValue, setCountdownValue] = useState(3);
    const countdownInterval = useRef(null);
    const [countdownVisible, setCountdownVisible] = useState(false);

    function handlePowerClick() {
        if (powerOn) {
            exitToSummary();
            return;
        }
        const newPowerOn = !powerOn;
        setPowerOn(newPowerOn);
        if (newPowerOn) {
            setCountdownValue(3);
            runStartupCycle();
            setStreak(0);
            playerCount.current = 0;
            const newSequence = [BUTTONS[generateNextColor()]];
            setSimonSequence(newSequence);
            setTimeout(() => {
                startRound(newSequence);
            }, 6000);
            setGameScreen('awake');
        }
    }

    function runStartupCycle() {
        for (let r = 0; r < 4; r++) {
            setTimeout(
                () => {
                    playTone(`${BUTTONS[r]}`, 600);
                    setGameScreen(`${BUTTONS[r]}-lit`);
                },
                (r + 1) * 600,
            );
        }
        setTimeout(() => {
            playTone(`green`, 600);
            setGameScreen(`all-lit`);
        }, 3000);
        setTimeout(() => {
            setGameScreen(`all-on`);
        }, 3600);
        setTimeout(() => {
            setCountdownVisible(true);
            playTone(`green`, 600);
            countdownInterval.current = setInterval(() => {
                setCountdownValue((prev) => {
                    if (prev <= 1) {
                        clearInterval(countdownInterval.current);
                        return 0;
                    }
                    playTone(`green`, 600);
                    return prev - 1;
                });
            }, 1000);
        }, 4000);

        setTimeout(() => {
            setCountdownVisible(false);
        }, 8000);
    }

    function startRound(newSequence) {
        gameRound.current = gameRound.current + 1;
        for (let n = 0; n < newSequence.length; n++) {
            sequenceTimeArray.current.push(
                setTimeout(
                    () => {
                        showSequence(newSequence[n]);
                    },
                    (n + 1) * (showLit + buttonPause),
                ),
            );
        }
        sequenceTimeArray.current.push(
            setTimeout(
                () => setCurrentPlayer('player'),
                newSequence.length * (showLit + buttonPause) + showLit,
            ),
        );
    }

    const showSequence = (lightUp) => {
        setGameScreen(`${lightUp}-lit`);
        playTone(`${lightUp}`, showLit);
        setTimeout(() => {
            setGameScreen('awake');
        }, showLit);
    };

    const handleClick = (pressed) => {
        if (powerOn && currentPlayer !== 'simon') {
            clearTimeout(previousTimeOut.current);
            let tempCount = playerCount.current;
            setGameScreen(`${pressed}-lit`);
            if (pressed === simonSequence[tempCount]) {
                playerCount.current = playerCount.current + 1;
                playTone(`${pressed}`, 800);
                previousTimeOut.current = setTimeout(() => {
                    setGameScreen('awake');
                }, 800);
                if (playerCount.current === simonSequence.length) {
                    let newStreak = streak + 1;
                    setStreak(newStreak);
                    let simonNext = BUTTONS[generateNextColor()];
                    let newSimonSequence = [...simonSequence, simonNext];
                    setSimonSequence(newSimonSequence);
                    playerCount.current = 0;
                    setCurrentPlayer('simon');
                    startRound(newSimonSequence);
                }
            } else {
                playWrongTone();
                setTimeout(() => {
                    setGameScreen('awake');
                }, 800);
                exitToSummary();
            }
        }
    };

    function generateNextColor() {
        return Math.floor(Math.random() * 4);
    }

    function exitAndShutDown() {
        setGameSummaryVisible(false);
        setGameScreen('idle');
        setPowerOn(false);
        gameRound.current = 0;
        for (let t = 0; t < sequenceTimeArray.current.length; t++) {
            clearTimeout(sequenceTimeArray.current[t]);
        }
        sequenceTimeArray.current = [];
    }

    function exitToSummary() {
        for (let t = 0; t < sequenceTimeArray.current.length; t++) {
            clearTimeout(sequenceTimeArray.current[t]);
        }
        setGameSummaryVisible(true);
        gameRound.current = 0;
        sequenceTimeArray.current = [];
    }

    return (
        <>
            <div className="app">
                <div className="board-container">
                    <img
                        className="all-dim"
                        src="/all-dim.png"
                        style={{ opacity: gameScreen === 'idle' ? 1 : 0 }}
                        alt=""
                    />
                    <img
                        className="all-on"
                        src="/all-on.png"
                        style={{ opacity: gameScreen !== 'idle' ? 1 : 0 }}
                        alt=""
                    />
                    <img
                        className="all-lit"
                        src="/all-lit.png"
                        style={{ opacity: gameScreen === 'all-lit' ? 1 : 0 }}
                        alt=""
                    />
                    <img
                        className="blue-lit"
                        src="/blue-lit.png"
                        style={{ opacity: gameScreen === 'blue-lit' ? 1 : 0 }}
                        alt=""
                    />
                    <img
                        className="red-lit"
                        src="/red-lit.png"
                        style={{ opacity: gameScreen === 'red-lit' ? 1 : 0 }}
                        alt=""
                    />
                    <img
                        className="yellow-lit"
                        src="/yellow-lit.png"
                        style={{ opacity: gameScreen === 'yellow-lit' ? 1 : 0 }}
                        alt=""
                    />
                    <img
                        className="green-lit"
                        src="/green-lit.png"
                        style={{ opacity: gameScreen === 'green-lit' ? 1 : 0 }}
                        alt=""
                    />
                    <div id="button-grid">
                        <div className="btn-green" onClick={() => handleClick('green')} />
                        <div className="btn-red" onClick={() => handleClick('red')} />
                        <div className="btn-blue" onClick={() => handleClick('blue')} />
                        <div className="btn-yellow" onClick={() => handleClick('yellow')} />
                    </div>
                    <div id="power-grid">
                        <div id="power-button" onClick={handlePowerClick}></div>
                    </div>
                    <div className="score-div">
                        <p>Streak: {streak}</p>
                    </div>
                    {countdownValue > 0 && countdownVisible && powerOn && (
                        <div id="countdown-overlay-grid">
                            <p id="countdown-number">{countdownValue}</p>
                        </div>
                    )}
                </div>

                {gameSummaryVisible && (
                    <GameSummaryModal exitAndShutDown={exitAndShutDown} streak={streak} />
                )}
            </div>
        </>
    );
}
