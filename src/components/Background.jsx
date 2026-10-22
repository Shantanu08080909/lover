import HeartIcon from './HeartIcon.jsx'

// Deterministic "random" layout so the background is stable across renders.
const HEARTS = Array.from({ length: 18 }, (_, i) => ({
  left: (i * 53 + 7) % 100,
  size: 12 + ((i * 7) % 24),
  duration: 13 + ((i * 5) % 10),
  delay: -((i * 3.7) % 18),
  sway: 18 + ((i * 11) % 36),
  tone: i % 3,
  opacity: 0.28 + (i % 4) * 0.1,
}))

const SPARKLES = Array.from({ length: 16 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  top: (i * 61 + 7) % 100,
  size: 6 + (i % 3) * 4,
  delay: (i * 0.73) % 5,
}))

export default function Background() {
  return (
    <div className="bg" aria-hidden="true">
      <div className="bg-blob bg-blob--a" />
      <div className="bg-blob bg-blob--b" />
      <div className="bg-blob bg-blob--c" />
      {HEARTS.map((h, i) => (
        <span
          key={`h${i}`}
          className={`float-heart tone-${h.tone}`}
          style={{
            left: `${h.left}%`,
            '--size': `${h.size}px`,
            '--dur': `${h.duration}s`,
            '--delay': `${h.delay}s`,
            '--sway': `${h.sway}px`,
            '--op': h.opacity,
          }}
        >
          <HeartIcon />
        </span>
      ))}
      {SPARKLES.map((s, i) => (
        <span
          key={`s${i}`}
          className="sparkle"
          style={{ left: `${s.left}%`, top: `${s.top}%`, '--size': `${s.size}px`, '--delay': `${s.delay}s` }}
        />
      ))}
    </div>
  )
}
