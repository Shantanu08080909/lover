import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Mascot from './Mascot.jsx'
import RunawayButton from './RunawayButton.jsx'
import Surprise from './Surprise.jsx'
import { ESCAPE_MESSAGES, JUMP_MESSAGES, createMessageBag } from '../utils/messages.js'

// How many escapes before the secret romantic surprise appears.
export const SURPRISE_AFTER = 7

export default function AskScreen({ onYes, onReset, leaving, sound }) {
  const [escapes, setEscapes] = useState(0)
  const [message, setMessage] = useState(null)
  const [laughing, setLaughing] = useState(false)
  const [surpriseOpen, setSurpriseOpen] = useState(false)

  const escapesRef = useRef(0)
  const surpriseShownRef = useRef(false)
  const laughTimer = useRef(0)
  const nextMessage = useMemo(() => createMessageBag(ESCAPE_MESSAGES), [])
  const nextJump = useMemo(() => createMessageBag(JUMP_MESSAGES), [])

  const yesRef = useRef(null)
  const questionRef = useRef(null)
  const toastRef = useRef(null)
  const titleRef = useRef(null)
  const metaRef = useRef(null)
  const hintRef = useRef(null)
  const headerRef = useRef(null)
  useEffect(() => {
    headerRef.current = document.querySelector('.topbar')
  }, [])
  // Most important first: the runaway button relaxes the later ones on tiny screens.
  const avoidRefs = useMemo(() => [yesRef, questionRef, toastRef, hintRef, metaRef, titleRef, headerRef], [])

  const surpriseTimer = useRef(0)
  useEffect(() => () => {
    clearTimeout(laughTimer.current)
    clearTimeout(surpriseTimer.current)
  }, [])

  const { play } = sound
  const handleEscape = useCallback(({ jump }) => {
    const count = escapesRef.current + 1
    escapesRef.current = count
    setEscapes(count)
    const text = jump && Math.random() < 0.5 ? `${nextJump()} ${nextMessage()}` : nextMessage()
    setMessage({ text, id: count })
    play(jump ? 'whoosh' : 'boing')

    setLaughing(true)
    clearTimeout(laughTimer.current)
    laughTimer.current = setTimeout(() => setLaughing(false), 700)

    if (count >= SURPRISE_AFTER && !surpriseShownRef.current) {
      surpriseShownRef.current = true
      // Let this escape land before the surprise pops up.
      surpriseTimer.current = setTimeout(() => {
        setSurpriseOpen(true)
        play('chime')
      }, 650)
    }
  }, [nextJump, nextMessage, play])

  const closeSurprise = useCallback(() => setSurpriseOpen(false), [])

  return (
    <section className={`card ask ${leaving ? 'is-leaving' : 'is-entering'}`} aria-labelledby="ask-title">
      <div ref={titleRef} className="ask-intro">
        <h1 id="ask-title" className="title">
          Let&apos;s see if you&apos;re single... <span className="emoji">👀</span>
        </h1>
        <p className="sub">Be honest. Nobody is judging you. Probably.</p>
      </div>

      <Mascot mood={laughing ? 'laugh' : 'happy'} />

      <h2 ref={questionRef} className="question">
        Are you single?
      </h2>

      <div ref={toastRef} className="toast-slot" aria-live="polite">
        {message ? (
          <p key={message.id} className="toast">
            {message.text}
          </p>
        ) : (
          <p className="toast toast--placeholder">Take your time... 💭</p>
        )}
      </div>

      <div className="choices">
        <button ref={yesRef} type="button" className="btn btn-yes" onClick={onYes} disabled={leaving}>
          <span>YES, I&apos;M SINGLE 😎</span>
        </button>
        <RunawayButton onEscape={handleEscape} avoidRefs={avoidRefs} disabled={leaving || surpriseOpen}>
          NO, I HAVE A BOYFRIEND ❤️
        </RunawayButton>
      </div>

      <p ref={hintRef} className="hint">Choose wisely. One of these buttons has commitment issues. 👀</p>

      <div ref={metaRef} className="meta">
        <span className={`counter ${escapes > 0 ? 'is-active' : ''}`} aria-live="off">
          <span aria-hidden="true">🏃‍♀️</span> NO escaped{' '}
          <b key={escapes} className="counter-num">
            {escapes}
          </b>{' '}
          {escapes === 1 ? 'time' : 'times'}
        </span>
        {escapes > 0 && (
          <button type="button" className="link-btn" onClick={onReset}>
            ↺ Replay the prank
          </button>
        )}
      </div>

      <Surprise open={surpriseOpen} onClose={closeSurprise} />
    </section>
  )
}
