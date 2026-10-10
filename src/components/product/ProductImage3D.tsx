import { useRef, type PointerEvent, type ReactNode } from 'react'

type Props = { src: string; alt: string; className?: string; children?: ReactNode }

/** Gives every catalog image a lightweight interactive 3D product-card presentation. */
export default function ProductImage3D({ src, alt, className = '', children }: Props) {
  const stage = useRef<HTMLSpanElement>(null)

  const move = (event: PointerEvent<HTMLSpanElement>) => {
    if (event.pointerType === 'touch' || !stage.current) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height
    stage.current.style.setProperty('--tilt-x', `${(0.5 - y) * 12}deg`)
    stage.current.style.setProperty('--tilt-y', `${(x - 0.5) * 16}deg`)
    stage.current.style.setProperty('--shine-x', `${x * 100}%`)
    stage.current.style.setProperty('--shine-y', `${y * 100}%`)
  }

  const reset = () => {
    stage.current?.style.setProperty('--tilt-x', '0deg')
    stage.current?.style.setProperty('--tilt-y', '0deg')
    stage.current?.style.setProperty('--shine-x', '50%')
    stage.current?.style.setProperty('--shine-y', '50%')
  }

  return <span ref={stage} className={`product-image-3d ${className}`} onPointerMove={move} onPointerLeave={reset}>
    <img src={src} alt={alt} loading="lazy" />
    <span className="product-image-3d-shine" aria-hidden="true" />
    {children}
  </span>
}
