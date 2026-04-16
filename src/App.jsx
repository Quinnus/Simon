import './styles.css';
import { useRef, useState } from 'react';
import ConfirmQuitModal from './components/ConfirmQuitModal.jsx';
import GameSummaryModal from './components/GameSummaryModal.jsx';
import useGameSounds from './hooks/useGameSounds.js';

export default function App() {
    let showLit;
    let buttonPause;
    const gameRound = useRef(0);

    if (gameRound.current <= 4) {
        showLit = 600;
        buttonPause = 500;
    } else if (gameRound.current > 8) {
        showLit = 200;
        buttonPause = 100;
    } else if (gameRound.current > 4) {
        showLit = 400;
        buttonPause = 300;
    }

    const BUTTONS = ['green', 'red', 'yellow', 'blue'];
    const [gameScreen, setGameScreen] = useState('idle');
    const [powerOn, setPowerOn] = useState(false);
    const [quitModalVisible, setQuitModalVisible] = useState(false);
    const [gameSummaryVisible, setGameSummaryVisible] = useState(false);
    const [streak, setStreak] = useState(0);
    const tempScreenRegister = useRef(null);
    const { playTone } = useGameSounds(showLit);
    const [simonSequence, setSimonSequence] = useState([]);
    const playerCount = useRef(0);

    function handlePowerClick() {
        if (powerOn) {
            setQuitModalVisible(true);
        } else setQuitModalVisible(false);
        const newPowerOn = !powerOn;
        setPowerOn(newPowerOn);
        if (newPowerOn) {
            setStreak(0);
            playerCount.current = 0;
            const newSequence = [BUTTONS[generateNextColor()]];
            setSimonSequence(newSequence);
            setTimeout(() => {
                startRound(newSequence);
            }, 5000);

            setGameScreen('awake');
        } else {
            setGameScreen('idle');
        }
    }

    function startRound(newSequence) {
        gameRound.current = gameRound.current + 1;
        console.log('Round' + gameRound.current);
        console.log(showLit);
        console.log(buttonPause);

        for (let n = 0; n < newSequence.length; n++) {
            setTimeout(
                () => {
                    showSequence(newSequence[n]);
                },
                (n + 1) * (showLit + buttonPause), // to allow for additional buttons to be displayed, and as n starts at 0, each button gets 800ms to display before moving onto the next color
            );
        }
    } // simonsequence fully shown, now await player input

    const showSequence = (lightUp) => {
        console.log('lightUp:', lightUp);
        setGameScreen(`${lightUp}-lit`);
        playTone(`${lightUp}`);
        setTimeout(() => {
            setGameScreen('awake');
        }, showLit);
    };

    const handleClick = (pressed) => {
        if (powerOn) {
            let tempCount = playerCount.current;
            setGameScreen(`${pressed}-lit`);
            if (pressed === simonSequence[tempCount]) {
                playerCount.current = playerCount.current + 1;
                playTone(`${pressed}`);
                setTimeout(() => {
                    setGameScreen('awake');
                }, 800);
                if (playerCount.current === simonSequence.length) {
                    let newStreak = streak + 1;
                    setStreak(newStreak);
                    let simonNext = BUTTONS[generateNextColor()];
                    let newSimonSequence = [...simonSequence, simonNext];
                    setSimonSequence(newSimonSequence);
                    playerCount.current = 0;
                    startRound(newSimonSequence);
                }
            } else {
                setTimeout(() => {
                    setGameScreen('awake');
                }, 800);
                exitToSummary();
            }
        }
    };

    function generateNextColor() {
        const randomNum = Math.floor(Math.random() * 4);
        console.log(randomNum); //for testing only
        return randomNum;
    }

    function handleResumeGame() {
        setQuitModalVisible(false);
        setGameScreen(tempScreenRegister.current);
    }

    function exitAndShutDown() {
        setQuitModalVisible(false);
        setGameSummaryVisible(false);
        setGameScreen('idle');
        setPowerOn(false);
    }

    function exitToSummary() {
        console.log(simonSequence);
        console.log(playerCount.current);
        setQuitModalVisible(false);
        setGameSummaryVisible(true);
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
                </div>
                {/*<div className="score-div">*/}
                {/*    <p>Streak: {streak}</p>*/}
                {/*</div>*/}
                {quitModalVisible && (
                    <ConfirmQuitModal
                        handleResumeGame={handleResumeGame}
                        exitToSummary={exitToSummary}
                    />
                )}
                {gameSummaryVisible && (
                    <GameSummaryModal exitAndShutDown={exitAndShutDown} streak={streak} />
                )}
                {/*{gameoverModalVisible && <GameOverModal handleGameOver={handleGameOver} />}*/}
            </div>
        </>
    );
}
