import { forwardRef } from 'react'
const ScrollProgress = forwardRef<HTMLDivElement>((_, ref) => (
  <div className="prog" aria-hidden="true"><div ref={ref} /></div>
))
export default ScrollProgress
