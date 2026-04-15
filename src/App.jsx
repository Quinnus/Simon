import './styles.css';
import { useRef, useState } from 'react';
import ConfirmQuitModal from './components/ConfirmQuitModal.jsx';
import GameSummaryModal from './components/GameSummaryModal.jsx';
import useGameSounds from './hooks/useGameSounds.js';

export default function App() {
    const BUTTONS = ['green', 'red', 'yellow', 'blue'];
    const [gameScreen, setGameScreen] = useState('idle');
    const [powerOn, setPowerOn] = useState(false);
    const [quitModalVisible, setQuitModalVisible] = useState(false);
    const [gameSummaryVisible, setGameSummaryVisible] = useState(false);
    const [streak, setStreak] = useState(0);
    const tempScreenRegister = useRef(null);
    const { playTone } = useGameSounds();
    const [simonSequence, setSimonSequence] = useState([]);
    const [playerSequence, setPlayerSequence] = useState([]);
    let startingSeq;

    function handlePowerClick() {
        if (powerOn) {
            tempScreenRegister.current = gameScreen;
            setQuitModalVisible(true);
        } else setQuitModalVisible(false);
        const newPowerOn = !powerOn;
        setPowerOn(newPowerOn);
        if (newPowerOn) {
            setStreak(0);
            const newSequence = [BUTTONS[generateNextColor()]];
            setSimonSequence(newSequence);
            startRound(newSequence);
        } else {
            setGameScreen('idle');
        }
    }

    function startRound(newSequence) {
        for (let n = 0; n < newSequence.length; n++) {
            setTimeout(
                () => {
                    showSequence(newSequence[n]);
                },
                (n + 1) * 800,
            );
        }
        for (let m = 0; m < newSequence.length; m++) {}
    }

    const showSequence = (lightUp) => {
        console.log('lightUp:', lightUp);
        setGameScreen(`${lightUp}-lit`);
        playTone(`${lightUp}`);
        setTimeout(() => {
            setGameScreen('awake');
        }, 800);
    };

    const handleClick = (pressed) => {
        if (powerOn) {
            let userInput = [];
            setPlayerSequence(userInput);
            setGameScreen(`${pressed}-lit`);
            for (let j = 0; j < playerSequence.length; j++) {
                if (pressed === simonSequence[j]) {
                    playTone(`${pressed}`);
                    setTimeout(
                        () => {
                            setGameScreen('awake');
                        },
                        (j + 1) * 800,
                    );
                } else {
                    setTimeout(() => {
                        setGameScreen('awake');
                    }, 800);
                    exitToSummary();
                }
            }

            let newStreak = streak + 1;
            setStreak(newStreak);
            let simonNext = generateNextColor();
            let newSimonSequence = [...simonSequence, simonNext];
            setSimonSequence(newSimonSequence);
            startRound();
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
    }

    function exitToSummary() {
        console.log(simonSequence);
        console.log(playerSequence);
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
                        style={{ opacity: gameScreen === 'awake' ? 1 : 0 }}
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
                <div className="score-div">
                    <p>Streak: {streak}</p>
                </div>
                {quitModalVisible && (
                    <ConfirmQuitModal
                        handleResumeGame={handleResumeGame}
                        exitToSummary={exitToSummary}
                    />
                )}
                {gameSummaryVisible && <GameSummaryModal exitAndShutDown={exitAndShutDown} />}
            </div>
        </>
    );
}
