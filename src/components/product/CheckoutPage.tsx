import { useState } from 'react'
import { fmt } from '../../data/product'
import { cart, useCart } from '../../lib/cart'
import { startCheckout } from '../../lib/checkout'

export default function CheckoutPage() {
  const lines = useCart()
  const [message, setMessage] = useState('')
  const total = lines.length && lines.every(line => line.unitPrice != null)
    ? lines.reduce((sum, line) => sum + line.qty * line.unitPrice!, 0)
    : null

  const continueToPayment = async () => {
    setMessage((await startCheckout(lines)).message)
  }

  return (
    <section className="section checkout-page">
      <div className="container-xl mx-auto">
        <a className="checkout-back" href="/product">← Back to product details</a>
        <span className="eyebrow d-block mt-5">Secure checkout</span>
        <h1>Review your order.</h1>
        {!lines.length ? <div className="checkout-empty">
          <p>Your bag is empty.</p>
          <a className="cta-btn solid" href="/product">Explore the necklace</a>
        </div> : <div className="checkout-layout">
          <div className="checkout-items">
            <h2>Your selection</h2>
            {lines.map(line => <div className="checkout-item" key={line.key}>
              <div><b>{line.label}</b>{line.unitPrice == null ? <span>Price to be confirmed</span> : <span>{fmt(line.unitPrice)} each</span>}</div>
              <div className="qty" role="group" aria-label={`Quantity for ${line.label}`}>
                <button type="button" onClick={() => cart.setQty(line.key, line.qty - 1)} aria-label="Decrease quantity">−</button>
                <output aria-live="polite">{line.qty}</output>
                <button type="button" onClick={() => cart.setQty(line.key, Math.min(9, line.qty + 1))} aria-label="Increase quantity">+</button>
              </div>
            </div>)}
          </div>
          <aside className="checkout-summary">
            <h2>Order summary</h2>
            <p><span>Items</span><span>{lines.reduce((sum, line) => sum + line.qty, 0)}</span></p>
            <p><span>Subtotal</span><b>{total == null ? 'Price to be confirmed' : fmt(total)}</b></p>
            <p className="muted">Shipping and taxes are calculated at checkout.</p>
            <button className="cta-btn solid w-100" type="button" onClick={continueToPayment}>Continue to secure checkout</button>
            {message && <p className="checkout-status" role="status">{message}</p>}
          </aside>
        </div>}
      </div>
    </section>
  )
}
