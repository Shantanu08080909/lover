import { useEffect, useRef, useState } from 'react'
import Confetti from './Confetti.jsx'
import Mascot from './Mascot.jsx'

// When each line appears (ms after the screen opens).
//  1: "Congratulations..."  2: "JUST KIDDING" (1.5s later)  3: "go tell him"  4: note + button
const TIMELINE = [900, 2400, 3200, 3900]

export default function YesScreen({ onBack, leaving, sound }) {
  const [step, setStep] = useState(0)
  const backRef = useRef(null)

  useEffect(() => {
    const timers = TIMELINE.map((ms, i) => setTimeout(() => setStep(i + 1), ms))
    return () => timers.forEach(clearTimeout)
  }, [])

  const { play } = sound
  useEffect(() => {
    if (step === 2) play('tada')
    if (step === 4) backRef.current?.focus({ preventScroll: true })
  }, [step, play])

  const show = (n) => (step >= n ? 'is-in' : '')

  return (
    <section className={`card result ${leaving ? 'is-leaving' : 'is-entering'}`} aria-live="polite">
      <Confetti active={step >= 2} />

      <h1 className="result-shout">OH REALLY?! 👀</h1>

      <p className={`reveal result-congrats ${show(1)} ${step >= 2 ? 'is-struck' : ''}`}>
        <span className="strike">Congratulations! You&apos;re officially single...</span>
      </p>

      <p className={`reveal result-kidding ${show(2)}`} aria-hidden={step < 2}>
        <span className="gradient-text">JUST KIDDING</span> <span className="emoji">😂😂</span>
      </p>

      <div className={`reveal result-mascot ${show(2)}`}>
        <Mascot mood={step >= 2 && step < 3 ? 'laugh' : 'happy'} size="sm" />
      </div>

      <p className={`reveal result-love ${show(3)}`} aria-hidden={step < 3}>
        Now go tell your boyfriend you love him. ❤️
      </p>

      <p className={`reveal result-note ${show(4)}`} aria-hidden={step < 4}>
        Your boyfriend might have questions about this website. 💀
      </p>

      <div className={`reveal result-actions ${show(4)}`}>
        <button
          ref={backRef}
          type="button"
          className="btn btn-yes btn-big"
          onClick={onBack}
          disabled={step < 4 || leaving}
          tabIndex={step >= 4 ? 0 : -1}
        >
          <span>TAKE ME BACK ❤️</span>
        </button>
      </div>
    </section>
  )
}
