import { useEffect, useRef } from 'react'
import { gsap } from '../../hooks/useScrollAnimation'
import { frameUrl, SHOT } from '../../data/frames'
import { brand, product } from '../../data/product'

export default function Footer({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.close-img', { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top 90%', end: 'top 20%', scrub: true } })
      gsap.from('.close-copy > *', { y: 36, opacity: 0, stagger: 0.12, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: ref.current, start: 'top 55%' } })
    }, ref)
    return () => ctx.revert()
  }, [reduced])
  return (
    <footer ref={ref} className="closing">
      <div className="close-stage">
        <img className="close-img" src={frameUrl('desktop', SHOT.rest)} alt={product.alt} loading="lazy" />
        <div className="shade" />
        <div className="close-copy">
          <span className="eyebrow">{brand.name}</span>
          <h2>Wear the <em>light.</em></h2>
          <a className="cta-btn" href="/product">Shop the necklace</a>
        </div>
      </div>
      <div className="foot container-fluid d-flex flex-wrap justify-content-between gap-3">
        <span>© {new Date().getFullYear()} {brand.name}</span>
        <span className="d-flex flex-wrap gap-4">
          <a href="/#craft">Craft</a><a href="/products">Products</a><a href="/#contact">Contact</a><a href="/admin/login">Admin</a>
          {brand.email && <a href={`mailto:${brand.email}`}>{brand.email}</a>}
          {brand.phone && <a href={`tel:${brand.phone}`}>{brand.phone}</a>}
          {brand.policies.map(p => <a key={p.label} href={p.href}>{p.label}</a>)}
        </span>
      </div>
    </footer>
  )
}
