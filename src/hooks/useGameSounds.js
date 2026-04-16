import { useRef } from 'react';

export default function useGameSounds(showLit) {
    const audioSourceRef = useRef(null);
    if (!audioSourceRef.current) {
        audioSourceRef.current = new AudioContext();
    }
    const playTone = (button) => {
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
            audioSourceRef.current.currentTime + showLit / 1000,
        );

        oscillator.start();
        oscillator.stop(audioSourceRef.current.currentTime + showLit / 1000);
    };
    return { playTone };
}
