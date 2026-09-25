import { LEVELS, MODES } from '../gameReducer.js';

// Keeps focus off the buttons after a click, so Space still means power
const keepFocus = (e) => e.preventDefault();

export default function GameSettings({ settings, onChange, hidden }) {
    const update = (changes) => onChange((current) => ({ ...current, ...changes }));

    return (
        <div className={`settings${hidden ? ' settings-hidden' : ''}`} inert={hidden}>
            <div className="setting">
                <span className="setting-label">Length</span>
                <div className="segmented">
                    {LEVELS.map((level) => (
                        <button
                            key={level}
                            className={settings.level === level ? 'selected' : ''}
                            aria-pressed={settings.level === level}
                            aria-label={level ? `${level} steps` : 'Endless'}
                            onPointerDown={keepFocus}
                            onClick={() => update({ level })}
                        >
                            {level || '∞'}
                        </button>
                    ))}
                </div>
            </div>
            <div className="setting">
                <span className="setting-label">Mode</span>
                <div className="segmented">
                    {Object.entries(MODES).map(([mode, label]) => (
                        <button
                            key={mode}
                            className={settings.mode === mode ? 'selected' : ''}
                            aria-pressed={settings.mode === mode}
                            onPointerDown={keepFocus}
                            onClick={() => update({ mode })}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>
            <label className="setting toggle">
                <input
                    type="checkbox"
                    checked={settings.forgiving}
                    onChange={(e) => {
                        update({ forgiving: e.target.checked });
                        e.target.blur();
                    }}
                />
                <span>One retry per round</span>
            </label>
        </div>
    );
}
