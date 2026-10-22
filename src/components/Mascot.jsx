import { useEffect, useRef } from 'react'

/**
 * The cartoon heart. Its eyes follow the pointer, it beats gently,
 * and it laughs (`mood="laugh"`) every time the NO button escapes.
 */
export default function Mascot({ mood = 'happy', size = 'md' }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    let raf = 0
    const onMove = (e) => {
      if (raf) return
      const { clientX, clientY } = e
      raf = requestAnimationFrame(() => {
        raf = 0
        const r = el.getBoundingClientRect()
        const dx = clientX - (r.left + r.width / 2)
        const dy = clientY - (r.top + r.height * 0.42)
        const len = Math.hypot(dx, dy) || 1
        const reach = Math.min(1, len / 240) * 4.5
        el.style.setProperty('--px', `${((dx / len) * reach).toFixed(2)}px`)
        el.style.setProperty('--py', `${((dy / len) * reach).toFixed(2)}px`)
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return (
    <div className={`mascot mascot--${size} is-${mood}`} ref={ref} aria-hidden="true">
      <span className="mascot-orbit mascot-orbit--1">💗</span>
      <span className="mascot-orbit mascot-orbit--2">✨</span>
      <span className="mascot-orbit mascot-orbit--3">💕</span>
      <svg className="mascot-svg" viewBox="0 0 200 190">
        <defs>
          <linearGradient id="mascotFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff9fc0" />
            <stop offset="55%" stopColor="#ff5c8a" />
            <stop offset="100%" stopColor="#e8457d" />
          </linearGradient>
          <radialGradient id="mascotShine" cx="0.3" cy="0.25" r="0.5">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse className="mascot-shadow" cx="100" cy="182" rx="46" ry="6" />
        <g className="mascot-body">
          <path
            d="M100 172 C 40 128, 10 96, 10 60 C 10 32, 32 12, 58 12 C 76 12, 92 22, 100 38 C 108 22, 124 12, 142 12 C 168 12, 190 32, 190 60 C 190 96, 160 128, 100 172 Z"
            fill="url(#mascotFill)"
          />
          <path
            d="M100 172 C 40 128, 10 96, 10 60 C 10 32, 32 12, 58 12 C 76 12, 92 22, 100 38 C 108 22, 124 12, 142 12 C 168 12, 190 32, 190 60 C 190 96, 160 128, 100 172 Z"
            fill="url(#mascotShine)"
          />
          <ellipse cx="52" cy="44" rx="14" ry="8" fill="#fff" opacity="0.55" transform="rotate(-28 52 44)" />

          {/* eyes */}
          <g className="mascot-eyes">
            <ellipse cx="74" cy="78" rx="13" ry="15" fill="#fff" />
            <ellipse cx="126" cy="78" rx="13" ry="15" fill="#fff" />
            <g className="mascot-pupils">
              <circle cx="74" cy="80" r="7.5" fill="#3b1730" />
              <circle cx="126" cy="80" r="7.5" fill="#3b1730" />
              <circle cx="77" cy="76" r="2.6" fill="#fff" />
              <circle cx="129" cy="76" r="2.6" fill="#fff" />
            </g>
          </g>
          {/* laughing squint eyes */}
          <g className="mascot-squint" fill="none" stroke="#3b1730" strokeWidth="5" strokeLinecap="round">
            <path d="M62 82 Q74 68 86 82" />
            <path d="M114 82 Q126 68 138 82" />
          </g>

          <ellipse cx="56" cy="106" rx="12" ry="7" fill="#ff2f6d" opacity="0.35" />
          <ellipse cx="144" cy="106" rx="12" ry="7" fill="#ff2f6d" opacity="0.35" />

          <path className="mascot-smile" d="M86 104 Q100 118 114 104" fill="none" stroke="#3b1730" strokeWidth="5" strokeLinecap="round" />
          <g className="mascot-laugh">
            <path d="M82 100 Q100 132 118 100 Z" fill="#3b1730" />
            <path d="M90 114 Q100 126 110 114 Q100 110 90 114 Z" fill="#ff7aa2" />
          </g>
        </g>
      </svg>
    </div>
  )
}
