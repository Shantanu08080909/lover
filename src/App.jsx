import { useCallback, useEffect, useRef, useState } from 'react'
import Background from './components/Background.jsx'
import Header from './components/Header.jsx'
import AskScreen from './components/AskScreen.jsx'
import YesScreen from './components/YesScreen.jsx'
import { useSound } from './hooks/useSound.js'
import { prefersReducedMotion } from './utils/motion.js'

const EXIT_MS = 420

export default function App() {
  const [screen, setScreen] = useState('ask')
  const [leaving, setLeaving] = useState(false)
  // Bumping `round` remounts the question screen: button home, counter zeroed.
  const [round, setRound] = useState(0)
  const timer = useRef(0)
  const sound = useSound()

  useEffect(() => () => clearTimeout(timer.current), [])

  const go = useCallback((next) => {
    if (leaving) return
    setLeaving(true)
    timer.current = setTimeout(() => {
      setScreen(next)
      setRound((r) => r + 1)
      setLeaving(false)
      window.scrollTo({ top: 0 })
    }, prefersReducedMotion() ? 0 : EXIT_MS)
  }, [leaving])

  const handleYes = useCallback(() => {
    sound.play('pop')
    go('yes')
  }, [go, sound])

  const replay = useCallback(() => setRound((r) => r + 1), [])

  return (
    <div className="app">
      <Background />
      <Header soundOn={sound.enabled} onToggleSound={sound.toggle} />
      <main className="stage">
        {screen === 'ask' ? (
          <AskScreen key={round} onYes={handleYes} onReset={replay} leaving={leaving} sound={sound} />
        ) : (
          <YesScreen key={round} onBack={() => go('ask')} leaving={leaving} sound={sound} />
        )}
      </main>
      <footer className="footer">Made with ❤️ and absolutely no intention of letting you be single.</footer>
    </div>
  )
}
