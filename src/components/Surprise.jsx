import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import HeartIcon from './HeartIcon.jsx'

export default function Surprise({ open, onClose }) {
  const [stage, setStage] = useState(0)
  const closeRef = useRef(null)

  useEffect(() => {
    if (!open) {
      setStage(0)
      return undefined
    }
    const t = setTimeout(() => setStage(1), 1500)
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  useEffect(() => {
    if (stage === 1) closeRef.current?.focus({ preventScroll: true })
  }, [stage])

  if (!open) return null

  return createPortal(
    <div className="surprise-backdrop" role="dialog" aria-modal="true" aria-labelledby="surprise-line">
      <div className="surprise-card">
        <p id="surprise-line" className="surprise-line">
          Okay, okay... we know the truth. ❤️
        </p>
        <div className={`surprise-reveal ${stage >= 1 ? 'is-in' : ''}`} aria-hidden={stage < 1}>
          <div className="pulse-heart" aria-hidden="true">
            <span className="pulse-ring" />
            <span className="pulse-ring pulse-ring--late" />
            <HeartIcon className="pulse-heart-icon" />
          </div>
          <p className="surprise-text">Someone is already lucky enough to have your heart.</p>
          <button ref={closeRef} type="button" className="btn btn-yes btn-small" onClick={onClose} tabIndex={stage >= 1 ? 0 : -1}>
            Aww, okay 🥹
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
