import { useEffect, useRef } from 'react'
import { gsap } from '../../hooks/useScrollAnimation'
import { frameUrl, SHOT } from '../../data/frames'
import { product } from '../../data/product'

export default function BrandStorySection({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      gsap.timeline({ scrollTrigger: { trigger: ref.current, start: 'top 65%' } })
        .from('.story-img', { clipPath: 'inset(0 100% 0 0)', duration: 1.5, ease: 'power3.inOut' })
        .from('.story-copy > *', { y: 36, opacity: 0, stagger: 0.12, duration: 1, ease: 'power3.out' }, '-=0.9')
      gsap.to('.story-img img', { yPercent: -8, ease: 'none', scrollTrigger: { trigger: ref.current, scrub: true, start: 'top bottom', end: 'bottom top' } })
    }, ref)
    return () => ctx.revert()
  }, [reduced])
  return (
    <section ref={ref} className="section story">
      <div className="container-xl row align-items-center g-5 mx-auto">
        <div className="col-12 col-lg-7">
          <div className="story-img"><img src={frameUrl('desktop', SHOT.reveal)} alt={product.alt} loading="lazy" /></div>
        </div>
        <div className="col-12 col-lg-5 story-copy">
          <span className="eyebrow">The set</span>
          <h2>Necklace and earrings, <em>together.</em></h2>
          <p>Rose-gold settings, pale green stones and clear stones, presented as one matching set.</p>
        </div>
      </div>
    </section>
  )
}
