import type { Line } from './cart'
import { product } from '../data/product'
/** CHECKOUT INTEGRATION POINT. No payment backend ships with this project.
 *  Replace the body with your provider (Stripe Checkout session, Shopify cart permalink, etc.). */
export async function startCheckout(lines: Line[]): Promise<{ ok: boolean; message: string }> {
  if (!lines.length) return { ok: false, message: 'Your bag is empty.' }
  if (!product.checkoutUrl)
    return { ok: false, message: 'The checkout page is ready, but online payment is not connected yet.' }
  window.location.href = product.checkoutUrl
  return { ok: true, message: 'Redirecting to secure checkout…' }
}
