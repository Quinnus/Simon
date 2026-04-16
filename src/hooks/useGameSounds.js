import { useRef } from 'react';

export default function useGameSounds() {
    const audioSourceRef = useRef(null);

    if (!audioSourceRef.current) {
        audioSourceRef.current = new AudioContext();
    }
    const playTone = (button, toneLength) => {
        const oscillator = audioSourceRef.current.createOscillator();
        const gainNode = audioSourceRef.current.createGain();
        const frequencies = { green: 415, red: 310, yellow: 252, blue: 209 };
        oscillator.type = 'triangle';
        oscillator.frequency.value = frequencies[button];

        oscillator.connect(gainNode);
        gainNode.connect(audioSourceRef.current.destination);

        gainNode.gain.setValueAtTime(1, audioSourceRef.current.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
            0.001,
            audioSourceRef.current.currentTime + toneLength / 1000,
        );

        oscillator.start();
        oscillator.stop(audioSourceRef.current.currentTime + toneLength / 1000);
    };

    const playWrongTone = () => {
        const oscillator = audioSourceRef.current.createOscillator();
        const gainNode = audioSourceRef.current.createGain();

        oscillator.type = 'sawtooth';
        oscillator.frequency.value = 45;

        oscillator.connect(gainNode);
        gainNode.connect(audioSourceRef.current.destination);

        gainNode.gain.setValueAtTime(1, audioSourceRef.current.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioSourceRef.current.currentTime + 1.8);
        oscillator.start();
        oscillator.stop(audioSourceRef.current.currentTime + 1.8);
    };
    return { playTone, playWrongTone };
}
