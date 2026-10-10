import { useState } from 'react'
import { product, fmt } from '../../data/product'
import { cart, useCart } from '../../lib/cart'

export function AddToCart() {
  const [qty, setQty] = useState(1)
  const [pick, setPick] = useState<Record<string, string>>(() => Object.fromEntries(product.variants.map(v => [v.label, v.options[0]])))
  const [added, setAdded] = useState(false)
  const add = () => {
    const opts = Object.values(pick)
    cart.add([product.id, ...opts].join('|'), [product.name, ...opts].join(' · '), qty, product.price)
    setAdded(true); setTimeout(() => setAdded(false), 1800)
  }
  const buyNow = () => {
    add()
    window.location.assign('/checkout')
  }
  return (
    <div className="buy">
      {product.variants.map(v => (
        <label key={v.label} className="field"><span>{v.label}</span>
          <select value={pick[v.label]} onChange={e => setPick({ ...pick, [v.label]: e.target.value })}>
            {v.options.map(o => <option key={o}>{o}</option>)}
          </select>
        </label>
      ))}
      <div className="d-flex gap-3 align-items-stretch flex-wrap">
        <div className="qty" role="group" aria-label="Quantity">
          <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity">−</button>
          <output aria-live="polite">{qty}</output>
          <button onClick={() => setQty(Math.min(9, qty + 1))} aria-label="Increase quantity">+</button>
        </div>
        <button className="cta-btn solid flex-grow-1" onClick={add}>{added ? 'Added to bag' : 'Add to bag'}</button>
      </div>
      <button className="cta-btn w-100" type="button" onClick={buyNow}>Buy now</button>
    </div>
  )
}

export function CartDrawer({ open, onClose, onCheckout }: { open: boolean; onClose: () => void; onCheckout: () => void }) {
  const lines = useCart()
  const total = lines.length && lines.every(line => line.unitPrice != null)
    ? lines.reduce((sum, line) => sum + line.qty * line.unitPrice!, 0)
    : null
  return (
    <aside className={`drawer${open ? ' open' : ''}`} aria-hidden={!open} aria-label="Shopping bag">
      <div className="drawer-head"><h3>Your bag</h3><button className="bare" onClick={onClose} aria-label="Close bag">Close</button></div>
      {!lines.length ? <p className="muted">Your bag is empty.</p> : lines.map(l => (
        <div className="line-item" key={l.key}>
          <span>{l.label}</span>
          <span className="qty sm">
            <button onClick={() => cart.setQty(l.key, l.qty - 1)} aria-label="Decrease">−</button>
            <output>{l.qty}</output>
            <button onClick={() => cart.setQty(l.key, Math.min(9, l.qty + 1))} aria-label="Increase">+</button>
          </span>
        </div>
      ))}
      {total != null && lines.length > 0 && <p className="d-flex justify-content-between mt-4"><span>Subtotal</span><b>{fmt(total)}</b></p>}
      <button className="cta-btn solid w-100 mt-4" disabled={!lines.length} onClick={onCheckout}>Continue to checkout</button>
    </aside>
  )
}
