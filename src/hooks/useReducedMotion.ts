import { useEffect, useState } from 'react'
const Q = '(prefers-reduced-motion: reduce)'
export function useReducedMotion() {
  const [r, set] = useState(() => matchMedia(Q).matches)
  useEffect(() => {
    const m = matchMedia(Q), f = () => set(m.matches)
    m.addEventListener('change', f)
    return () => m.removeEventListener('change', f)
  }, [])
  return r
}
