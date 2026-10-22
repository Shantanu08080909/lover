import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { prefersReducedMotion } from '../utils/motion.js'

/**
 * A button that refuses to be pressed.
 *
 * It starts in the normal layout. The first time a pointer gets close, it
 * leaves an invisible placeholder behind (so nothing else shifts) and moves
 * into a fixed-position layer on <body>, from where it keeps dodging.
 *
 * Proximity is measured as the distance from the pointer to the button's
 * *target* rectangle, so it reacts even while it is still animating.
 */

// How close (px) a pointer may get before the button bolts, per input type.
const ZONES = { mouse: 95, pen: 75, touch: 52 }
const EDGE = 12 // never closer than this to the viewport edge
const AVOID_PAD = 14 // breathing room around the elements we must not cover
const COOLDOWN_MS = 90 // ignore duplicate triggers from the same gesture
const JUMP_CHANCE = 0.18 // how often it does a big surprise leap

const distToRect = (px, py, r) => {
  const dx = Math.max(r.left - px, 0, px - r.right)
  const dy = Math.max(r.top - py, 0, py - r.bottom)
  return Math.hypot(dx, dy)
}

const overlaps = (a, b) =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top

const viewport = () => ({
  w: document.documentElement.clientWidth || window.innerWidth,
  h: window.visualViewport?.height || window.innerHeight,
})

export default function RunawayButton({ children, onEscape, avoidRefs = [], disabled = false, className = '' }) {
  const slotRef = useRef(null)
  const btnRef = useRef(null)
  const sizeRef = useRef({ w: 0, h: 0 })
  const posRef = useRef(null) // {x, y} once the button is free
  const lastEscapeRef = useRef(0)
  const onEscapeRef = useRef(onEscape)
  onEscapeRef.current = onEscape

  // pos: {x, y, rot, mode: 'instant' | 'dodge' | 'jump'}
  const [pos, setPos] = useState(null)
  const [slotSize, setSlotSize] = useState(null)

  const measure = useCallback(() => {
    const el = btnRef.current
    if (!el) return
    sizeRef.current = { w: el.offsetWidth, h: el.offsetHeight }
  }, [])

  useLayoutEffect(measure, [measure])

  // Rectangle the button occupies (or is heading to).
  const currentRect = useCallback(() => {
    const { w, h } = sizeRef.current
    if (posRef.current) {
      const { x, y } = posRef.current
      return { left: x, top: y, right: x + w, bottom: y + h }
    }
    return btnRef.current?.getBoundingClientRect() ?? null
  }, [])

  // Pick a new safe spot, away from the pointer and off important content.
  const pickTarget = useCallback((px, py, zone) => {
    const { w, h } = sizeRef.current
    const vp = viewport()
    const maxX = vp.w - w - EDGE
    const maxY = vp.h - h - EDGE
    if (maxX <= EDGE || maxY <= EDGE) {
      return { x: Math.max(0, (vp.w - w) / 2), y: Math.max(0, (vp.h - h) / 2), jump: false }
    }

    const avoid = avoidRefs
      .map((ref) => ref.current?.getBoundingClientRect())
      .map((r) =>
        r && r.width > 0
          ? { left: r.left - AVOID_PAD, top: r.top - AVOID_PAD, right: r.right + AVOID_PAD, bottom: r.bottom + AVOID_PAD }
          : null,
      )

    const cur = currentRect()
    const curCx = cur ? (cur.left + cur.right) / 2 : vp.w / 2
    const curCy = cur ? (cur.top + cur.bottom) / 2 : vp.h / 2
    const awayX = curCx - px
    const awayY = curCy - py
    const awayLen = Math.hypot(awayX, awayY) || 1

    const jump = Math.random() < JUMP_CHANCE
    const desired = 150 + Math.random() * 190

    // Pass 0 avoids everything listed. If there's no room (small phones), later
    // passes give up the least important areas one at a time, from the end.
    const passes = []
    for (let keep = avoid.length; keep >= 0; keep--) passes.push(avoid.slice(0, keep))
    for (let pass = 0; pass < passes.length; pass++) {
      const blockers = passes[pass].filter(Boolean)
      const safeDistance = passes[pass].length >= 2 ? zone * 1.35 : zone * 0.6
      let best = null
      let bestScore = -Infinity
      for (let i = 0; i < 80; i++) {
        const x = EDGE + Math.random() * (maxX - EDGE)
        const y = EDGE + Math.random() * (maxY - EDGE)
        const rect = { left: x, top: y, right: x + w, bottom: y + h }
        if (blockers.some((b) => overlaps(b, rect))) continue
        const d = distToRect(px, py, rect)
        if (d < safeDistance) continue
        const cx = x + w / 2
        const cy = y + h / 2
        if (Math.hypot(cx - curCx, cy - curCy) < 70) continue
        // Prefer heading the same way as "away from the pointer".
        const dirX = cx - px
        const dirY = cy - py
        const cos = (dirX * awayX + dirY * awayY) / ((Math.hypot(dirX, dirY) || 1) * awayLen)
        const score = jump ? d + Math.random() * 60 : -Math.abs(d - desired) + cos * 110 + Math.random() * 45
        if (score > bestScore) {
          bestScore = score
          best = { x, y }
        }
      }
      if (best) return { ...best, jump }
    }

    // Last resort: the corner farthest from the pointer.
    const corners = [
      { x: EDGE, y: EDGE },
      { x: maxX, y: EDGE },
      { x: EDGE, y: maxY },
      { x: maxX, y: maxY },
    ]
    corners.sort((a, b) => Math.hypot(b.x - px, b.y - py) - Math.hypot(a.x - px, a.y - py))
    return { ...corners[0], jump: true }
  }, [avoidRefs, currentRect])

  const escape = useCallback((px, py, zone) => {
    const now = performance.now()
    if (now - lastEscapeRef.current < COOLDOWN_MS) return
    lastEscapeRef.current = now
    measure()

    const target = pickTarget(px, py, zone)
    const rot = (Math.random() - 0.5) * 16
    const mode = target.jump ? 'jump' : 'dodge'

    if (!posRef.current) {
      // First escape: freeze the placeholder, pop the button out exactly where
      // it was, then animate to the target on the next frame.
      const r = btnRef.current.getBoundingClientRect()
      setSlotSize({ w: r.width, h: r.height })
      posRef.current = { x: r.left, y: r.top }
      setPos({ x: r.left, y: r.top, rot: 0, mode: 'instant' })
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          posRef.current = { x: target.x, y: target.y }
          setPos({ x: target.x, y: target.y, rot, mode })
        }),
      )
    } else {
      posRef.current = { x: target.x, y: target.y }
      setPos({ x: target.x, y: target.y, rot, mode })
    }
    onEscapeRef.current?.({ jump: target.jump })
  }, [measure, pickTarget])

  const checkProximity = useCallback((px, py, zone) => {
    const rect = currentRect()
    if (!rect) return
    if (distToRect(px, py, rect) < zone) escape(px, py, zone)
  }, [currentRect, escape])

  // Global pointer tracking — passive, so normal scrolling is never blocked.
  useEffect(() => {
    if (disabled) return undefined
    let raf = 0
    let last = null
    const zoneFor = (e) => ZONES[e.pointerType] ?? ZONES.mouse
    const onMove = (e) => {
      last = e
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        if (last) checkProximity(last.clientX, last.clientY, zoneFor(last))
      })
    }
    const onDown = (e) => checkProximity(e.clientX, e.clientY, zoneFor(e))
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [disabled, checkProximity])

  // Keep the button inside the viewport when the window changes size.
  useEffect(() => {
    const onResize = () => {
      measure()
      if (!posRef.current) return
      const { w, h } = sizeRef.current
      const vp = viewport()
      const x = Math.min(Math.max(EDGE, posRef.current.x), Math.max(EDGE, vp.w - w - EDGE))
      const y = Math.min(Math.max(EDGE, posRef.current.y), Math.max(EDGE, vp.h - h - EDGE))
      posRef.current = { x, y }
      setPos((p) => (p ? { ...p, x, y, mode: 'instant' } : p))
      const btnRect = { left: x, top: y, right: x + w, bottom: y + h }
      const covering = avoidRefs.slice(0, 2).some((ref) => {
        const r = ref.current?.getBoundingClientRect()
        return r && overlaps(r, btnRect)
      })
      if (covering) {
        const t = pickTarget(vp.w / 2, vp.h / 2, ZONES.mouse)
        posRef.current = { x: t.x, y: t.y }
        setPos({ x: t.x, y: t.y, rot: 0, mode: 'instant' })
      }
    }
    window.addEventListener('resize', onResize)
    window.visualViewport?.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      window.visualViewport?.removeEventListener('resize', onResize)
    }
  }, [avoidRefs, measure, pickTarget])

  // Any direct hit (tap, click, Enter/Space) just makes it run again.
  const dodgeFromEvent = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const rect = currentRect()
    const px = e.clientX || (rect ? (rect.left + rect.right) / 2 : 0)
    const py = e.clientY || (rect ? (rect.top + rect.bottom) / 2 : 0)
    escape(px, py, ZONES[e.pointerType] ?? ZONES.mouse)
  }

  const handlers = {
    onPointerDown: (e) => {
      if (e.currentTarget.hasPointerCapture?.(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
      dodgeFromEvent(e)
    },
    onClick: dodgeFromEvent,
    onContextMenu: (e) => e.preventDefault(),
  }

  const label = typeof children === 'string' ? children : undefined

  if (!pos) {
    return (
      <span ref={slotRef} className="no-slot">
        <button ref={btnRef} type="button" className={`btn btn-no ${className}`} {...handlers}>
          {children}
        </button>
      </span>
    )
  }

  const reduced = prefersReducedMotion()
  const style = {
    transform: `translate3d(${pos.x}px, ${pos.y}px, 0) rotate(${reduced ? 0 : pos.rot}deg)`,
  }

  return (
    <>
      <span
        ref={slotRef}
        className="no-slot is-empty"
        style={{ width: slotSize?.w, height: slotSize?.h }}
        aria-hidden="true"
      />
      {createPortal(
        <button
          ref={btnRef}
          type="button"
          aria-label={label}
          className={`btn btn-no is-free is-${pos.mode} ${className}`}
          style={style}
          {...handlers}
        >
          {children}
        </button>,
        document.body,
      )}
    </>
  )
}
