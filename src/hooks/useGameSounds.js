export default function useGameSounds() {
    const playTone = (button) => {
        const audioSource = new AudioContext();
        const oscillator = audioSource.createOscillator();
        const gainNode = audioSource.createGain();

        const frequencies = { green: 415, red: 310, yellow: 252, blue: 209 };
        oscillator.type = 'triangle';
        oscillator.frequency.value = frequencies[button];

        oscillator.connect(gainNode);
        gainNode.connect(audioSource.destination);

        gainNode.gain.setValueAtTime(1, audioSource.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioSource.currentTime + 0.8);

        oscillator.start();
        oscillator.stop(audioSource.currentTime + 0.8);
    };
    return { playTone };
}
