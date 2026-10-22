export const ESCAPE_MESSAGES = [
  'Nice try 😂',
  'You have a boyfriend, remember? ❤️',
  'Nope. Not today!',
  'Girl, be serious 😭',
  'Your boyfriend would like a word.',
  'Commitment detected. Escaping...',
  'Why are you running? 💀',
  'Access denied: Too much love ❤️',
  'The universe said NO.',
  'Mission impossible: Be single.',
]

export const JUMP_MESSAGES = ['WHOOSH 💨', 'Byeee 👋', 'Long-distance escape! ✈️']

/**
 * A shuffled "bag" of messages: every message shows up once per cycle,
 * in a random order, and never twice in a row across cycles.
 */
export function createMessageBag(items) {
  let bag = []
  let last = null
  const refill = () => {
    bag = [...items]
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[bag[i], bag[j]] = [bag[j], bag[i]]
    }
    if (bag.length > 1 && bag[bag.length - 1] === last) {
      ;[bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]]
    }
  }
  return () => {
    if (bag.length === 0) refill()
    last = bag.pop()
    return last
  }
}
