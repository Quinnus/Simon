import { useCallback, useEffect, useRef } from 'react';

const FREQUENCIES = { green: 415, red: 310, yellow: 252, blue: 209 };
const TONE_VOLUME = 0.7;
const WRONG_VOLUME = 0.6;

export default function useGameSounds() {
    const audioSourceRef = useRef(null);
    const unlockedRef = useRef(false);

    // Created on first use, and resumed if the browser has paused it.
    // Call from a click handler first: Safari only allows audio to start inside a user gesture.
    const resumeAudio = useCallback(() => {
        if (audioSourceRef.current == null) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            audioSourceRef.current = new AudioContextClass();
        }
        const context = audioSourceRef.current;
        // Safari can also report a non-standard 'interrupted' state
        if (context.state !== 'running') {
            context.resume().catch((error) => console.warn('Audio could not resume:', error));
        }
        // Safari unlocks audio once a sound has actually started inside a gesture
        if (!unlockedRef.current) {
            const silence = context.createBufferSource();
            silence.buffer = context.createBuffer(1, 1, context.sampleRate);
            silence.connect(context.destination);
            silence.start(0);
            unlockedRef.current = true;
        }
    }, []);

    // Safari pauses audio when the tab or app loses focus, and only lets it restart
    // during a user gesture, so wake it on every tap and key press
    useEffect(() => {
        const wake = () => {
            const context = audioSourceRef.current;
            if (context && context.state !== 'running') {
                context.resume().catch(() => {});
            }
        };
        const events = ['pointerdown', 'touchend', 'click', 'keydown'];
        events.forEach((name) => document.addEventListener(name, wake, true));
        return () => events.forEach((name) => document.removeEventListener(name, wake, true));
    }, []);

    const createVoice = useCallback(
        (type, frequency, volume) => {
            resumeAudio();
            const context = audioSourceRef.current;
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();
            oscillator.type = type;
            oscillator.frequency.value = frequency;
            oscillator.connect(gainNode);
            gainNode.connect(context.destination);
            gainNode.gain.setValueAtTime(volume, context.currentTime);
            oscillator.start();
            return { context, oscillator, gain: gainNode.gain };
        },
        [resumeAudio],
    );

    // A tone that fades away over toneLength milliseconds
    const playTone = useCallback(
        (button, toneLength) => {
            const { context, oscillator, gain } = createVoice('triangle', FREQUENCIES[button], TONE_VOLUME);
            gain.exponentialRampToValueAtTime(0.001, context.currentTime + toneLength / 1000);
            oscillator.stop(context.currentTime + toneLength / 1000);
        },
        [createVoice],
    );

    const playWrongTone = useCallback(() => {
        const { context, oscillator, gain } = createVoice('sawtooth', 45, WRONG_VOLUME);
        gain.exponentialRampToValueAtTime(0.001, context.currentTime + 1.8);
        oscillator.stop(context.currentTime + 1.8);
    }, [createVoice]);

    return { playTone, playWrongTone, resumeAudio };
}
