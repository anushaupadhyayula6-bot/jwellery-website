import { RefObject, useCallback, useEffect, useRef, useState } from 'react'
const CAP = 40 // max decoded frames kept in memory
const WIN = 10 // frames decoded around the playhead

/** Canvas image sequence with a bounded ImageBitmap cache. Never draws blank: falls back to the nearest decoded frame. */
export function useImageSequence(canvasRef: RefObject<HTMLCanvasElement | null>, urls: string[]) {
  const cache = useRef(new Map<number, ImageBitmap>())
  const pend = useRef(new Map<number, Promise<void>>())
  const want = useRef(0)
  const alive = useRef(false)
  const warmed = useRef(false)
  const [ready, setReady] = useState(false)
  const n = urls.length

  const draw = useCallback(() => {
    const c = canvasRef.current
    if (!c) return
    let b: ImageBitmap | undefined
    for (let d = 0; d < n && !b; d++) b = cache.current.get(want.current - d) || cache.current.get(want.current + d)
    if (!b) return
    const dpr = Math.min(devicePixelRatio || 1, 2), W = c.clientWidth, H = c.clientHeight
    if (c.width !== Math.round(W * dpr) || c.height !== Math.round(H * dpr)) {
      c.width = Math.round(W * dpr); c.height = Math.round(H * dpr)
    }
    const x = c.getContext('2d', { alpha: false })!
    x.setTransform(dpr, 0, 0, dpr, 0, 0)
    x.fillStyle = '#0b0908'; x.fillRect(0, 0, W, H)
    const land = W / H >= 1.15
    const s = land ? Math.max(W / b.width, H / b.height) : W / b.width // landscape: cover, portrait: fit width (no crop/stretch)
    const w = b.width * s, h = b.height * s
    x.drawImage(b, (W - w) / 2, land ? (H - h) / 2 : (H - h) * 0.4, w, h)
  }, [canvasRef, n])

  const evict = () => {
    const m = cache.current
    while (m.size > CAP) {
      let far = -1, fd = -1
      m.forEach((_, k) => { const d = Math.abs(k - want.current); if (k !== 0 && d > fd) { fd = d; far = k } })
      if (far < 0) break
      m.get(far)?.close(); m.delete(far)
    }
  }

  const load = useCallback((i: number): Promise<void> => {
    if (i < 0 || i >= n || cache.current.has(i)) return Promise.resolve()
    const hit = pend.current.get(i)
    if (hit) return hit
    const p = fetch(urls[i]).then(r => r.blob()).then(b => createImageBitmap(b)).then(bmp => {
      pend.current.delete(i)
      if (!alive.current) { bmp.close(); return }
      cache.current.set(i, bmp); evict()
      if (Math.abs(i - want.current) <= WIN) draw()
    }).catch(() => { pend.current.delete(i) })
    pend.current.set(i, p)
    return p
  }, [urls, n, draw])

  /** progress 0..1 → frame. Direct mapping, no easing, so the image never trails the scroll. */
  const setProgress = useCallback((p: number) => {
    const i = Math.max(0, Math.min(n - 1, Math.round(p * (n - 1))))
    want.current = i
    draw()
    for (let k = 0; k <= WIN; k++) { load(i + k); load(i - k) }
  }, [n, draw, load])

  useEffect(() => {
    alive.current = true
    const m = cache.current
    load(0).then(() => {
      if (!alive.current) return
      setReady(true); draw()
      if (warmed.current) return
      warmed.current = true // warm the HTTP cache (not memory) in coarse-to-fine order
      const order = [...Array(n).keys()].sort((a, b) => (a % 8) - (b % 8) || a - b)
      ;(async () => {
        for (const i of order) {
          if (!alive.current) return
          await fetch(urls[i]).then(r => r.blob()).catch(() => {})
          await new Promise(r => setTimeout(r, 25))
        }
      })()
    })
    addEventListener('resize', draw)
    return () => { alive.current = false; warmed.current = false; removeEventListener('resize', draw); m.forEach(b => b.close()); m.clear() }
  }, [load, draw, n, urls])

  return { ready, setProgress }
}
