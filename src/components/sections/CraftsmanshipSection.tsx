import { useEffect, useRef } from 'react'
import { gsap } from '../../hooks/useScrollAnimation'
import { frameUrl, SHOT } from '../../data/frames'

// Crops of the REAL source frame (cx, cy = centre in 0..1, z = zoom). No generated macro imagery.
const CROPS = [
  { t: 'Rose-gold metalwork', d: 'Chain and settings, as photographed.', cx: 0.43, cy: 0.76, z: 2.4 },
  { t: 'Matching earrings', d: 'Pale green and clear stones in a drop form.', cx: 0.5, cy: 0.44, z: 2.4 },
  { t: 'Teardrop stones', d: 'Pear-cut clear stones along the collar.', cx: 0.83, cy: 0.3, z: 2.2 },
]
export default function CraftsmanshipSection({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      gsap.from('.craft-head > *', { y: 40, opacity: 0, stagger: 0.12, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '.craft-head', start: 'top 80%' } })
      gsap.utils.toArray<HTMLElement>('.crop').forEach((fig, i) => {
        const st = { trigger: fig, start: 'top 82%' }
        gsap.fromTo(fig, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.4, ease: 'power3.out', delay: (i % 3) * 0.08, scrollTrigger: st })
        gsap.from(fig.querySelector('img'), { scale: 1.18, duration: 1.8, ease: 'power3.out', scrollTrigger: st })
        gsap.from(fig.nextElementSibling, { y: 20, opacity: 0, duration: 0.9, delay: 0.3, scrollTrigger: st })
      })
      gsap.from('.rule', { scaleX: 0, transformOrigin: 'left', duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: '.rule', start: 'top 90%' } })
    }, ref)
    return () => ctx.revert()
  }, [reduced])
  return (
    <section ref={ref} id="craft" className="section">
      <div className="container-xl">
        <div className="craft-head">
          <span className="eyebrow">The detail</span>
          <h2>Quiet detail, <em>looked at closely.</em></h2>
          <div className="rule" />
        </div>
        <div className="row g-4 mt-4">
          {CROPS.map(c => (
            <div className="col-12 col-md-4" key={c.t}>
              <figure className="crop">
                <img src={frameUrl('desktop', SHOT.reveal)} alt="" loading="lazy"
                  style={{ width: `${c.z * 100}%`, left: `${-(c.cx * c.z - 0.5) * 100}%`, top: `${-(c.cy * c.z - 0.5) * 100}%` }} />
              </figure>
              <figcaption><b>{c.t}</b><span>{c.d}</span></figcaption>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
