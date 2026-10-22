import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/**
 * Tiny synthesized sound effects (Web Audio, no files).
 * Off by default; the AudioContext is only created after the visitor
 * turns sound on, so nothing ever autoplays.
 */
export function useSound() {
  const [enabled, setEnabled] = useState(false)
  const enabledRef = useRef(false)
  const ctxRef = useRef(null)

  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

  useEffect(() => () => ctxRef.current?.close?.(), [])

  const getCtx = () => {
    if (!ctxRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext
      if (!Ctx) return null
      ctxRef.current = new Ctx()
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume()
    return ctxRef.current
  }

  const playNow = useCallback((name) => {
    const ctx = getCtx()
    if (!ctx) return
    const t0 = ctx.currentTime
    const tone = (from, to, start, dur, type = 'sine', vol = 0.12) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(from, t0 + start)
      osc.frequency.exponentialRampToValueAtTime(to, t0 + start + dur)
      gain.gain.setValueAtTime(0.0001, t0 + start)
      gain.gain.exponentialRampToValueAtTime(vol, t0 + start + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + start + dur)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t0 + start)
      osc.stop(t0 + start + dur + 0.03)
    }
    switch (name) {
      case 'boing':
        tone(300, 780, 0, 0.16, 'triangle', 0.1)
        tone(780, 420, 0.12, 0.14, 'sine', 0.06)
        break
      case 'whoosh':
        tone(900, 160, 0, 0.32, 'sawtooth', 0.035)
        break
      case 'tada':
        ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, f * 1.002, i * 0.09, 0.34, 'triangle', 0.09))
        break
      case 'chime':
        ;[880, 1108.73, 1318.51].forEach((f, i) => tone(f, f, i * 0.14, 0.6, 'sine', 0.07))
        break
      default:
        tone(620, 920, 0, 0.08, 'sine', 0.08)
    }
  }, [])

  const play = useCallback((name) => {
    if (enabledRef.current) playNow(name)
  }, [playNow])

  const toggle = useCallback(() => {
    const next = !enabledRef.current
    enabledRef.current = next
    setEnabled(next)
    if (next) playNow('pop') // confirms it's on — triggered by the click itself
  }, [playNow])

  return useMemo(() => ({ enabled, toggle, play }), [enabled, toggle, play])
}
