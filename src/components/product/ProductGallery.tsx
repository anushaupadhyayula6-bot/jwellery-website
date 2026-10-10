import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { product } from '../../data/product'

type Metal = 'rose' | 'yellow' | 'white'
type Gemstone = 'sage' | 'clear' | 'blue'
type Stone = 'marquise' | 'round' | 'pear'

const METALS: Record<Metal, { label: string; base: string; light: string; dark: string }> = {
  rose: { label: 'Rose gold', base: '#b77863', light: '#f2c5a2', dark: '#6e3b32' },
  yellow: { label: 'Yellow gold', base: '#c99a43', light: '#ffe39a', dark: '#765018' },
  white: { label: 'White gold', base: '#b8b6b1', light: '#fffaf0', dark: '#686970' },
}
const GEMS: Record<Gemstone, { label: string; light: string; base: string; dark: string }> = {
  sage: { label: 'Pale green', light: '#f1f6ce', base: '#b7c598', dark: '#65775b' },
  clear: { label: 'Clear', light: '#ffffff', base: '#d8d9d4', dark: '#92979c' },
  blue: { label: 'Blue', light: '#d9f4ff', base: '#6caabd', dark: '#28566d' },
}
const svgImage = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`
const metalImage = (option: Metal) => {
  const color = METALS[option]
  return svgImage(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72"><defs><linearGradient id="m" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${color.light}"/><stop offset=".45" stop-color="${color.base}"/><stop offset="1" stop-color="${color.dark}"/></linearGradient></defs><rect width="72" height="72" rx="12" fill="#17110f"/><path d="M8 38c0-10 15-10 15 0s15 10 15 0 15-10 15 0 11 10 11 0" fill="none" stroke="url(#m)" stroke-width="7"/><path d="M9 34c3-6 9-6 12-2m18 2c3-6 9-6 12-2m13 0c3 2 4 6 2 9" fill="none" stroke="#fff6df" stroke-opacity=".65" stroke-width="1.5"/></svg>`)
}
const gemstoneImage = (option: Gemstone) => {
  const color = GEMS[option]
  return svgImage(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${color.light}"/><stop offset=".52" stop-color="${color.base}"/><stop offset="1" stop-color="${color.dark}"/></linearGradient></defs><rect width="72" height="72" rx="12" fill="#17110f"/><path d="M36 7 59 24 53 51 36 65 19 51 13 24Z" fill="url(#g)" stroke="#fff8e8" stroke-opacity=".8" stroke-width="1.5"/><path d="m36 7 0 58M13 24l23 8 23-8M19 51l17-19 17 19M13 24l6 27m40-27-6 27" fill="none" stroke="#fff" stroke-opacity=".48" stroke-width="1.2"/><path d="m36 7 0 25-23-8Zm0 25 23-8-6 27Zm0 0-17 19-6-27Z" fill="#fff" fill-opacity=".16"/></svg>`)
}

type Point3 = { x: number; y: number; z: number }
type GemDraw = { point: Point3; radius: number; color: typeof GEMS.sage; shape: Stone; angle: number; lift: number }

function drawGem(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, colors: typeof GEMS.sage, shape: Stone, angle: number) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  const path = new Path2D()
  if (shape === 'round') {
    path.moveTo(0, -radius); path.lineTo(radius * .78, -radius * .45); path.lineTo(radius, radius * .2)
    path.lineTo(radius * .52, radius * .86); path.lineTo(-radius * .52, radius * .86); path.lineTo(-radius, radius * .2); path.lineTo(-radius * .78, -radius * .45); path.closePath()
  } else if (shape === 'pear') {
    path.moveTo(0, -radius); path.lineTo(radius * .83, -radius * .05); path.lineTo(radius * .7, radius * .55)
    path.lineTo(0, radius); path.lineTo(-radius * .7, radius * .55); path.lineTo(-radius * .83, -radius * .05); path.closePath()
  } else {
    path.moveTo(0, -radius); path.lineTo(radius * .58, -radius * .2); path.lineTo(radius * .72, radius * .2)
    path.lineTo(0, radius); path.lineTo(-radius * .72, radius * .2); path.lineTo(-radius * .58, -radius * .2); path.closePath()
  }
  const fill = ctx.createLinearGradient(-radius, -radius, radius, radius)
  fill.addColorStop(0, colors.light); fill.addColorStop(.48, colors.base); fill.addColorStop(1, colors.dark)
  ctx.fillStyle = fill; ctx.fill(path)
  ctx.lineWidth = Math.max(1, radius * .06); ctx.strokeStyle = 'rgba(255,255,255,.72)'; ctx.stroke(path)
  ctx.beginPath(); ctx.moveTo(0, -radius * .85); ctx.lineTo(radius * .68, radius * .2); ctx.lineTo(0, radius * .72); ctx.lineTo(-radius * .68, radius * .2); ctx.closePath()
  ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fill()
  ctx.beginPath(); ctx.moveTo(0, -radius * .85); ctx.lineTo(0, radius * .72); ctx.lineTo(-radius * .68, radius * .2); ctx.closePath()
  ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fill()
  ctx.restore()
}

export default function ProductGallery({ detailsHref }: { detailsHref?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const drag = useRef<{ x: number; y: number; yaw: number; pitch: number; moved: boolean } | null>(null)
  const rotation = useRef({ yaw: -.22, pitch: .7 })
  const [metal, setMetal] = useState<Metal>('rose')
  const [stone, setStone] = useState<Stone>('marquise')
  const [gemstone, setGemstone] = useState<Gemstone>('sage')
  const [zoom, setZoom] = useState(1)
  const [exploded, setExploded] = useState(false)
  const [lightSweep, setLightSweep] = useState(true)

  useEffect(() => {
    const el = canvas.current
    if (!el) return
    const ctx = el.getContext('2d')
    if (!ctx) return
    const metalColor = METALS[metal]
    const gemColor = GEMS[gemstone]
    const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let width = 0, height = 0, dpr = 1
    const startTime = performance.now()
    let lastTime = startTime
    const resize = () => {
      const box = el.getBoundingClientRect()
      dpr = Math.min(devicePixelRatio || 1, 2)
      width = box.width; height = box.height
      el.width = Math.round(width * dpr); el.height = Math.round(height * dpr)
    }
    const observer = new ResizeObserver(resize)
    observer.observe(el); resize()

    const paint = (time: number) => {
      if (!drag.current && !prefersReduced) rotation.current.yaw += .00042 * (time - lastTime)
      lastTime = time
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)
      const bg = ctx.createRadialGradient(width * .5, height * .42, 2, width * .5, height * .5, Math.max(width, height) * .72)
      bg.addColorStop(0, '#38271f'); bg.addColorStop(.58, '#1b1310'); bg.addColorStop(1, '#0b0908')
      ctx.fillStyle = bg; ctx.fillRect(0, 0, width, height)
      const yaw = rotation.current.yaw + (prefersReduced ? 0 : window.scrollY * .00045), pitch = rotation.current.pitch
      const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch)
      const baseScale = Math.min(width / 5.3, height / 3.75) * zoom
      const centerX = width * .5, centerY = height * .54
      const project = (p: Point3) => {
        const rx = p.x * cy + p.z * sy
        const rz = -p.x * sy + p.z * cy
        const py = p.y * cp - rz * sp
        const depth = p.y * sp + rz * cp
        const perspective = 5.2 / (5.2 + depth)
        return { x: centerX + rx * baseScale * perspective, y: centerY - py * baseScale * perspective, scale: perspective, depth }
      }
      const pieces: Array<{ depth: number; paint: () => void }> = []
      const metalLine = (a: Point3, b: Point3, radius = 2.5) => {
        const pa = project(a), pb = project(b)
        pieces.push({ depth: (pa.depth + pb.depth) * .5, paint: () => {
          const grad = ctx.createLinearGradient(pa.x, pa.y, pb.x, pb.y)
          grad.addColorStop(0, metalColor.dark); grad.addColorStop(.5, metalColor.light); grad.addColorStop(1, metalColor.base)
          ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.strokeStyle = grad; ctx.lineWidth = radius * (pa.scale + pb.scale) * .5; ctx.lineCap = 'round'; ctx.stroke()
        } })
      }
      const gems: GemDraw[] = []
      // A continuous collar arc with repeating gold links and individual stones.
      const points: Point3[] = Array.from({ length: 49 }, (_, i) => {
        const t = -2.13 + (4.26 * i) / 48
        return { x: 2.2 * Math.sin(t), y: 0, z: .28 + 1.48 * Math.cos(t) }
      })
      points.forEach((point, i) => {
        if (i < points.length - 1) metalLine(point, points[i + 1], 2.6)
        const tangent = i === points.length - 1 ? points[i].x - points[i - 1].x : points[i + 1].x - point.x
        const angle = Math.atan2(tangent, (i === points.length - 1 ? points[i].z - points[i - 1].z : points[i + 1].z - point.z))
        gems.push({ point, radius: i === 24 ? 14 : 8.4, color: i % 3 === 0 ? GEMS.clear : gemColor, shape: i === 24 ? 'pear' : stone, angle, lift: 0 })
        const side = .105
        for (const direction of [-1, 1]) {
          const bead = { x: point.x + tangent * side * direction, y: .025, z: point.z + .09 }
          const p = project(bead)
          pieces.push({ depth: p.depth + .01, paint: () => { ctx.beginPath(); ctx.arc(p.x, p.y, 2.6 * p.scale, 0, Math.PI * 2); ctx.fillStyle = metalColor.light; ctx.fill() } })
        }
      })
      // The matching drops use linked stones in three dimensions, floating above the collar.
      for (const sign of [-1, 1]) {
        const x = sign * .43
        const earring: Point3[] = [
          { x, y: .1, z: -.26 }, { x, y: -.13, z: -.26 }, { x, y: -.36, z: -.26 }, { x, y: -.58, z: -.26 },
        ]
        earring.slice(0, -1).forEach((p, i) => metalLine(p, earring[i + 1], 3))
        earring.forEach((p, i) => gems.push({ point: p, radius: i === 3 ? 8 : i === 0 ? 9 : 12, color: i === 1 ? gemColor : GEMS.clear, shape: i === 3 ? 'pear' : stone, angle: 0, lift: 0 }))
      }
      gems.forEach(gem => {
        const point = { ...gem.point, y: gem.point.y + (exploded ? .26 : gem.lift) }
        const p = project(point)
        pieces.push({ depth: p.depth + .04, paint: () => {
          const r = gem.radius * p.scale
          ctx.beginPath(); ctx.ellipse(p.x, p.y, r * .83, r * .3, gem.angle, 0, Math.PI * 2)
          ctx.strokeStyle = metalColor.light; ctx.lineWidth = Math.max(1.5, r * .16); ctx.stroke()
          const facetTurn = prefersReduced ? 0 : Math.sin(time * .001 + gem.point.x * 8 + gem.point.z * 4) * .11
          drawGem(ctx, p.x, p.y - (exploded ? 6 * p.scale : 0), r, gem.color, gem.shape, gem.angle + facetTurn)
          if (!prefersReduced) {
            const glint = (Math.sin(time * .003 + gem.point.x * 13 + gem.point.z * 9) + 1) / 2
            if (glint > .82) {
              ctx.save(); ctx.globalAlpha = (glint - .82) * 4
              ctx.strokeStyle = '#fff8df'; ctx.lineWidth = 1
              ctx.beginPath(); ctx.moveTo(p.x - r * .22, p.y); ctx.lineTo(p.x + r * .22, p.y)
              ctx.moveTo(p.x, p.y - r * .22); ctx.lineTo(p.x, p.y + r * .22); ctx.stroke(); ctx.restore()
            }
          }
          if (exploded) {
            ctx.beginPath(); ctx.ellipse(p.x, p.y + 7 * p.scale, r * .96, r * .32, gem.angle, 0, Math.PI * 2)
            ctx.strokeStyle = metalColor.base; ctx.lineWidth = Math.max(1, r * .1); ctx.stroke()
          }
        } })
      })
      pieces.sort((a, b) => b.depth - a.depth).forEach(piece => piece.paint())

      // A narrow moving studio reflection catches the facets without hiding the model.
      const elapsed = (time - startTime) / 1000
      const sweepX = ((elapsed % 5) / 5) * (width + 180) - 90
      const sweep = ctx.createLinearGradient(sweepX - 80, 0, sweepX + 80, 0)
      sweep.addColorStop(0, 'rgba(255,239,203,0)'); sweep.addColorStop(.5, 'rgba(255,239,203,.09)'); sweep.addColorStop(1, 'rgba(255,239,203,0)')
      if (lightSweep && !prefersReduced) { ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = sweep; ctx.fillRect(0, 0, width, height); ctx.globalCompositeOperation = 'source-over' }
      raf = requestAnimationFrame(paint)
    }
    raf = requestAnimationFrame(paint)
    return () => { cancelAnimationFrame(raf); observer.disconnect() }
  }, [metal, stone, gemstone, zoom, exploded, lightSweep])

  const dragStart = (event: PointerEvent<HTMLCanvasElement>) => {
    drag.current = { x: event.clientX, y: event.clientY, ...rotation.current, moved: false }
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const dragMove = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drag.current) return
    const dx = event.clientX - drag.current.x, dy = event.clientY - drag.current.y
    if (!drag.current.moved && Math.hypot(dx, dy) > 5) drag.current.moved = true
    if (!drag.current.moved) return
    rotation.current.yaw = drag.current.yaw + dx * .008
    rotation.current.pitch = Math.max(-.15, Math.min(1.3, drag.current.pitch + dy * .006))
  }
  const dragEnd = (event: PointerEvent<HTMLCanvasElement>) => {
    if (event.type === 'pointerup' && drag.current && !drag.current.moved && detailsHref) window.location.assign(detailsHref)
    drag.current = null
  }

  return (
    <div className="gallery viewer">
      <div className="gallery-main viewer-stage">
        <canvas ref={canvas} role="img" aria-label={`${product.alt}. Interactive 3D preview; ${detailsHref ? 'click for product details or ' : ''}drag to rotate.`} tabIndex={0}
          onPointerDown={dragStart} onPointerMove={dragMove} onPointerUp={dragEnd} onPointerCancel={dragEnd}
          onKeyDown={event => { if (event.key === 'ArrowLeft') rotation.current.yaw -= .12; if (event.key === 'ArrowRight') rotation.current.yaw += .12; if (detailsHref && (event.key === 'Enter' || event.key === ' ')) window.location.assign(detailsHref) }} />
        <span className="viewer-hint" aria-hidden="true">Scroll or drag to rotate</span>
        {exploded && <span className="viewer-mode-label">Exploded setting preview</span>}
      </div>
      <div className="viewer-controls" aria-label="3D product configurator">
        <fieldset className="config-group" id="metal"><legend>Metal <small>Preview</small></legend>
          <div className="config-image-options">{(Object.keys(METALS) as Metal[]).map(option => <button key={option} type="button" className={`config-image-choice${metal === option ? ' selected' : ''}`} onClick={() => setMetal(option)} aria-pressed={metal === option} aria-label={METALS[option].label}>
            <img src={metalImage(option)} alt="" /><span>{METALS[option].label}</span>
          </button>)}</div>
        </fieldset>
        <fieldset className="config-group" id="stone"><legend>Stone cut</legend>
          <div className="config-options">{(['marquise', 'round', 'pear'] as Stone[]).map(option => <button key={option} className={`config-option${stone === option ? ' selected' : ''}`} type="button" onClick={() => setStone(option)} aria-pressed={stone === option}>{option}</button>)}</div>
        </fieldset>
        <fieldset className="config-group" id="gemstone"><legend>Gemstone <small>Preview</small></legend>
          <div className="config-image-options">{(Object.keys(GEMS) as Gemstone[]).map(option => <button key={option} type="button" className={`config-image-choice${gemstone === option ? ' selected' : ''}`} onClick={() => setGemstone(option)} aria-pressed={gemstone === option} aria-label={GEMS[option].label}>
            <img src={gemstoneImage(option)} alt="" /><span>{GEMS[option].label}</span>
          </button>)}</div>
        </fieldset>
        <label className="viewer-control zoom-control"><span>Macro zoom</span><input type="range" min=".75" max="1.65" step=".05" value={zoom} onChange={event => setZoom(Number(event.target.value))} aria-label="Magnify 3D product" /></label>
        <button className={`viewer-action${lightSweep ? ' selected' : ''}`} type="button" aria-pressed={lightSweep} onClick={() => setLightSweep(value => !value)}>Light sweep</button>
        <button className={`viewer-action${exploded ? ' selected' : ''}`} type="button" aria-pressed={exploded} onClick={() => setExploded(value => !value)}>Exploded view</button>
      </div>
      <p className="config-note">Interactive 3D design preview. Metal and gemstone selections are visual only.</p>
    </div>
  )
}
