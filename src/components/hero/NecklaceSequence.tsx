import { useEffect, useMemo, useRef } from 'react'
import { gsap } from '../../hooks/useScrollAnimation'
import { useImageSequence } from '../../hooks/useImageSequence'
import { frames, frameUrl } from '../../data/frames'
import { brand, product } from '../../data/product'
import ScrollProgress from './ScrollProgress'
import SequenceLoader from './SequenceLoader'

const CHAPTERS = [
  { at: 0, out: 0.14, eyebrow: brand.name, lines: ['Light, set', 'with intention.'], body: 'A rose-gold necklace with pale green and clear stones.' },
  { at: 0.2, out: 0.38, eyebrow: 'I — Form', lines: ['Drawn from', 'a single leaf.'], body: 'Leaf-shaped stones follow the line of the collar.' },
  { at: 0.46, out: 0.68, eyebrow: 'II — Movement', lines: ['Every drop,', 'a quiet fire.'], body: 'Teardrop stones catch the light as the piece opens.' },
  { at: 0.78, out: 1, eyebrow: 'III — Yours', lines: ['The Verdé', 'Necklace.'], body: 'With matching drop earrings.', cta: true },
]

export default function NecklaceSequence({ reduced }: { reduced: boolean }) {
  const root = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const mobile = useMemo(() => matchMedia('(max-width: 767px)').matches, [])
  const set = mobile ? frames.mobile : frames.desktop
  const urls = useMemo(() => Array.from({ length: set.count }, (_, i) => frameUrl(mobile ? 'mobile' : 'desktop', i)), [set, mobile])
  const { ready, setProgress } = useImageSequence(canvas, urls)

  useEffect(() => {
    if (!ready || !root.current) return
    if (reduced) { setProgress(0.5); return }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root.current, start: 'top top', pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
          end: () => `+=${innerHeight * (mobile ? 3.2 : 4.4)}`,
          onUpdate: s => { setProgress(s.progress); if (bar.current) gsap.set(bar.current, { scaleY: s.progress }) },
        },
      })
      tl.to({}, { duration: 1 }, 0)
      gsap.utils.toArray<HTMLElement>('.chapter').forEach((el, i) => {
        const c = CHAPTERS[i]
        if (i > 0) tl.fromTo(el, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.05 }, c.at)
        if (c.out < 1) tl.to(el, { autoAlpha: 0, y: -40, duration: 0.05 }, c.out - 0.05)
      })
      setProgress(tl.scrollTrigger!.progress)
      // opening: mask reveal, light sweep, line-by-line headline
      gsap.fromTo('.hero-media', { clipPath: 'inset(46% 0 46% 0)' }, { clipPath: 'inset(0% 0 0% 0)', duration: 1.6, ease: 'power4.out' })
      gsap.fromTo('.sweep', { xPercent: -120 }, { xPercent: 120, duration: 2.6, ease: 'power2.inOut', delay: 0.4 })
      gsap.from('.chapter-0 .line', { yPercent: 110, duration: 1.1, stagger: 0.12, ease: 'power3.out', delay: 0.3 })
    }, root)
    return () => ctx.revert()
  }, [ready, reduced, mobile, setProgress])

  return (
    <section ref={root} className={`hero${reduced ? ' reduced' : ''}`} id="top" aria-label="The Verdé Necklace">
      <div className="hero-stage">
        <div className="hero-media"><canvas ref={canvas} role="img" aria-label={product.alt} /></div>
        <div className="shade" /><div className="sweep" />
        {CHAPTERS.map((c, i) => (
          <div className={`chapter${i === 0 ? ' chapter-0' : ''}`} key={i}>
            <span className="eyebrow">{c.eyebrow}</span>
            {i === 0 ? <h1>{c.lines.map(l => <span className="mask" key={l}><span className="line">{l}</span></span>)}</h1>
              : <h2>{c.lines.map(l => <span className="mask" key={l}><span className="line">{l}</span></span>)}</h2>}
            <p>{c.body}</p>
            {c.cta && <a className="cta-btn" href="/product">Discover the piece</a>}
          </div>
        ))}
        {!reduced && <div className="cue" aria-hidden="true">Scroll<i /></div>}
        {!reduced && <ScrollProgress ref={bar} />}
        <SequenceLoader show={!ready} />
      </div>
    </section>
  )
}
