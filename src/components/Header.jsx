export default function Header({ soundOn, onToggleSound }) {
  return (
    <header className="topbar">
      <a className="logo" href="./" aria-label="TryToBeSingle.com home">
        <span className="logo-heart" aria-hidden="true">💗</span>
        <span>
          TryToBeSingle<span className="logo-tld">.com</span>
        </span>
      </a>
      <button
        type="button"
        className={`sound-toggle ${soundOn ? 'is-on' : ''}`}
        onClick={onToggleSound}
        aria-pressed={soundOn}
        aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}
        title={soundOn ? 'Sound on' : 'Sound off'}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5 6 9H2v6h4l5 4V5z" />
          {soundOn ? (
            <>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </>
          ) : (
            <>
              <line x1="22" y1="9" x2="16" y2="15" />
              <line x1="16" y1="9" x2="22" y2="15" />
            </>
          )}
        </svg>
        <span className="sound-label">{soundOn ? 'Sound on' : 'Sound off'}</span>
      </button>
    </header>
  )
}
