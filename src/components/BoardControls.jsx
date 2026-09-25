// Clickable shapes laid over the board image, in units of the board's radius
const PAD_INNER_RADIUS = 0.36;
const PAD_OUTER_RADIUS = 0.98;
const POWER_RADIUS = 0.33;

// Angles run clockwise from 3 o'clock, as in SVG
const PADS = [
    { color: 'green', startAngle: 180, key: 'Q' },
    { color: 'red', startAngle: 270, key: 'W' },
    { color: 'yellow', startAngle: 0, key: 'S' },
    { color: 'blue', startAngle: 90, key: 'A' },
];

// Keycaps sit in the empty corners outside the round board, next to their pad
const KEYCAP_OFFSET = 0.86;
const KEYCAP_SIZE = 0.16;

function pointAt(radius, angle) {
    const radians = (angle * Math.PI) / 180;
    return `${radius * Math.cos(radians)} ${radius * Math.sin(radians)}`;
}

// A quarter of a ring, from startAngle to startAngle + 90
function padPath(startAngle) {
    const endAngle = startAngle + 90;
    return [
        `M ${pointAt(PAD_OUTER_RADIUS, startAngle)}`,
        `A ${PAD_OUTER_RADIUS} ${PAD_OUTER_RADIUS} 0 0 1 ${pointAt(PAD_OUTER_RADIUS, endAngle)}`,
        `L ${pointAt(PAD_INNER_RADIUS, endAngle)}`,
        `A ${PAD_INNER_RADIUS} ${PAD_INNER_RADIUS} 0 0 0 ${pointAt(PAD_INNER_RADIUS, startAngle)}`,
        'Z',
    ].join(' ');
}

export default function BoardControls({ powerOn, onPressStart, onPressEnd, onPower }) {
    return (
        <svg className="board-controls" viewBox="-1 -1 2 2">
            {PADS.map(({ color, startAngle, key }) => (
                <path
                    key={color}
                    className={`pad pad-${color}`}
                    d={padPath(startAngle)}
                    role="button"
                    aria-label={`${color} pad (key ${key})`}
                    onPointerDown={() => onPressStart(color)}
                    onPointerUp={onPressEnd}
                    onPointerLeave={onPressEnd}
                    onPointerCancel={onPressEnd}
                    onContextMenu={(e) => e.preventDefault()}
                />
            ))}
            {PADS.map(({ color, startAngle, key }) => {
                const [x, y] = pointAt(KEYCAP_OFFSET * Math.SQRT2, startAngle + 45).split(' ').map(Number);
                return (
                    <g key={color} className="keycap" aria-hidden="true">
                        <rect
                            x={x - KEYCAP_SIZE / 2}
                            y={y - KEYCAP_SIZE / 2}
                            width={KEYCAP_SIZE}
                            height={KEYCAP_SIZE}
                            rx={0.03}
                        />
                        <text x={x} y={y}>
                            {key}
                        </text>
                    </g>
                );
            })}
            <circle
                className={`power-button${powerOn ? ' on' : ''}`}
                r={POWER_RADIUS}
                role="button"
                tabIndex={0}
                aria-label="Power (Space)"
                aria-pressed={powerOn}
                onClick={onPower}
            />
        </svg>
    );
}
