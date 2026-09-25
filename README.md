# Simon

The classic colour-and-sound memory game, built with React and Vite.

Simon plays a sequence of lights and tones; repeat it back, and each round adds one more step and speeds up.

## How to play

1. Press the power button in the middle of the board (or **Space**).
2. Watch the sequence, then repeat it by pressing the pads. Each press sounds just like Simon's.
3. Each press has a 3-second time limit. A wrong press or running out of time ends the game, and Simon flashes the pad you should have pressed.

**Keys:** Q W / A S, laid out like the pads (Q is green, top-left). Space turns the power on and off.

The pace picks up at rounds 5, 9 and 14. Tap any pad during the start-up light show to skip it. Switching tabs pauses the game, and Simon replays the sequence when you come back.

## Settings

Choose these under the board while the power is off. They're remembered between visits, along with your best streak.

- **Length**: win at 8, 14, 20 or 31 steps, or play endlessly (∞)
- **Mode**
  - **Classic**: repeat Simon's sequence
  - **Reverse**: repeat it backwards
  - **Player Adds**: repeat the sequence, then add a colour of your own; Simon never replays it
- **One retry per round**: after a mistake, Simon replays the sequence for one more try

## Development

```bash
pnpm install
pnpm dev       # start the dev server
pnpm build     # production build in dist/
pnpm lint
```

## Project layout

| Path | What it does |
|---|---|
| `src/gameReducer.js` | The game rules: phases, sequence, scoring, modes |
| `src/App.jsx` | Timing (light show, Simon's turn, time limit), input and layout |
| `src/hooks/useGameSounds.js` | Web Audio tones, including Safari's audio unlocking |
| `src/components/BoardControls.jsx` | SVG click areas shaped to match the board artwork |
| `src/components/StatusBar.jsx` | "Watch… / Your turn" status, round, streak and best |
| `src/components/GameSettings.jsx` | Length, mode and retry settings |
| `src/components/GameSummaryModal.jsx` | Game-over and win screen |
| `public/board/` | Board artwork: the unlit and lit board, plus one transparent overlay per lit pad |
