import { useEffect, useRef } from 'react'
import { HEART_PATH } from './HeartIcon.jsx'
import { prefersReducedMotion } from '../utils/motion.js'

const COLORS = ['#ff5c8a', '#ff8fb3', '#ff3d77', '#c9a7ff', '#b28dff', '#ffd166', '#ffffff']
const SPAWN_FOR_MS = 2800

/** A one-shot shower of hearts and confetti. Stops itself when it's done. */
export default function Confetti({ active }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!active || prefersReducedMotion()) return undefined
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const heart = new Path2D(HEART_PATH)
    let w = 0
    let h = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const parts = []
    const spawn = (n, burst) => {
      for (let i = 0; i < n; i++) {
        const isHeart = Math.random() < 0.5
        parts.push({
          x: burst ? burst.x : Math.random() * w,
          y: burst ? burst.y : -20,
          vx: burst ? (Math.random() - 0.5) * 13 + burst.dir * 3 : (Math.random() - 0.5) * 1.5,
          vy: burst ? -(Math.random() * 11 + 6) : Math.random() * 1.5 + 1.5,
          size: isHeart ? 10 + Math.random() * 12 : 6 + Math.random() * 7,
          rot: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.2,
          wobble: Math.random() * Math.PI * 2,
          heart: isHeart,
          color: COLORS[(Math.random() * COLORS.length) | 0],
        })
      }
    }
    spawn(70, { x: w * 0.12, y: h * 0.75, dir: 1 })
    spawn(70, { x: w * 0.88, y: h * 0.75, dir: -1 })

    const start = performance.now()
    let lastSpawn = start
    let raf = 0
    const tick = (t) => {
      ctx.clearRect(0, 0, w, h)
      const spawning = t - start < SPAWN_FOR_MS
      if (spawning && t - lastSpawn > 70) {
        spawn(5)
        lastSpawn = t
      }
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]
        p.vy = Math.min(p.vy + (p.heart ? 0.12 : 0.2), p.heart ? 2.4 : 4.2)
        p.vx *= 0.985
        p.x += p.vx + Math.sin(t / 420 + p.wobble) * 0.7
        p.y += p.vy
        p.rot += p.vr
        if (p.y > h + 40) {
          parts.splice(i, 1)
          continue
        }
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.fillStyle = p.color
        if (p.heart) {
          ctx.rotate(Math.sin(p.rot) * 0.4)
          const s = p.size / 24
          ctx.scale(s, s)
          ctx.translate(-12, -12)
          ctx.fill(heart)
        } else {
          ctx.rotate(p.rot)
          ctx.scale(1, Math.cos(t / 180 + p.wobble))
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        }
        ctx.restore()
      }
      if (spawning || parts.length) raf = requestAnimationFrame(tick)
      else ctx.clearRect(0, 0, w, h)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [active])

  return <canvas ref={canvasRef} className="confetti" aria-hidden="true" />
}
