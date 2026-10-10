import { useEffect, useRef, useState } from 'react'
import { brand } from '../../data/product'
import { useCart } from '../../lib/cart'
import { gsap, ScrollTrigger } from '../../hooks/useScrollAnimation'

export default function Navbar({ onCart }: { onCart: () => void }) {
  const home = window.location.pathname === '/' || window.location.pathname.endsWith('/index.html')
  const productAnchor = (id: string) => home ? `#${id}` : `/product#${id}`
  const homeAnchor = (id: string) => home ? `#${id}` : `/#${id}`
  const [solid, setSolid] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const bar = useRef<HTMLDivElement>(null)
  const count = useCart().reduce((s, l) => s + l.qty, 0)
  useEffect(() => {
    const on = () => setSolid(scrollY > 40)
    addEventListener('scroll', on, { passive: true })
    const st = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: s => bar.current && gsap.set(bar.current, { scaleX: s.progress }) })
    return () => { removeEventListener('scroll', on); st.kill() }
  }, [])
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    addEventListener('keydown', closeOnEscape)
    return () => removeEventListener('keydown', closeOnEscape)
  }, [])
  return (
    <header className={`site-nav${solid ? ' solid' : ''}`}>
      <nav className="d-flex justify-content-between align-items-center" aria-label="Primary">
        <a className="wordmark" href="/">{brand.name}</a>
        <div className="d-flex align-items-center gap-4">
          <a className="nav-link-x nav-desktop-link" href={homeAnchor('craft')}>Craft</a>
          <a className="nav-link-x nav-desktop-link" href="/products">Products</a>
          <a className="nav-link-x nav-desktop-link" href={productAnchor('metal')}>Metal</a>
          <a className="nav-link-x nav-desktop-link" href={productAnchor('stone')}>Stone</a>
          <a className="nav-link-x nav-desktop-link" href={productAnchor('gemstone')}>Gemstone</a>
          <a className="nav-link-x nav-desktop-link" href={homeAnchor('contact')}>Contact</a>
          <button className="nav-link-x bare" onClick={onCart} aria-label={`Open bag, ${count} items`}>Bag ({count})</button>
          <button className={`menu-toggle${menuOpen ? ' open' : ''}`} type="button" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(open => !open)}>
            <span /><span />
          </button>
        </div>
      </nav>
      <div id="mobile-navigation" className={`mobile-menu${menuOpen ? ' open' : ''}`} aria-hidden={!menuOpen}>
        <a href={homeAnchor('craft')} tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)}>Craft</a>
        <a href="/products" tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)}>Products</a>
        <a href={productAnchor('metal')} tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)}>Metal</a>
        <a href={productAnchor('stone')} tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)}>Stone</a>
        <a href={productAnchor('gemstone')} tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)}>Gemstone</a>
        <a href={homeAnchor('contact')} tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)}>Contact</a>
      </div>
      <div className="pagebar" ref={bar} aria-hidden="true" />
    </header>
  )
}
