'use client';

const HEIGHTS = [20, 35, 50, 65, 80, 65, 50, 35, 50, 65, 80, 50];
const DELAYS = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1];

export default function Waveform({ color = 'white' }: { color?: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      height: 90,
    }}>
      {HEIGHTS.map((h, i) => (
        <div
          key={i}
          className="wave-bar"
          style={{
            width: 4,
            height: h,
            background: color,
            borderRadius: 4,
            animationDelay: `${DELAYS[i]}s`,
          }}
        />
      ))}
    </div>
  );
}
