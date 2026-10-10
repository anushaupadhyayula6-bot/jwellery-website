/** OWNER-SUPPLIED DATA. Empty values are hidden in the UI; nothing here is invented. */
export const brand = {
  name: 'Maison Élara', // placeholder brand name
  email: '',
  phone: '',
  policies: [] as { label: string; href: string }[], // e.g. { label: 'Privacy', href: '/privacy' }
}
export const product = {
  id: 'verde-necklace',
  name: 'The Verdé Necklace',
  alt: 'Rose-gold necklace with pale green and clear stones, with matching earrings, on dark leather',
  description: 'A rose-gold necklace set with pale green and clear stones, presented with matching drop earrings.',
  price: null as number | null, // e.g. 12500
  currency: 'INR',
  variants: [] as { label: string; options: string[] }[], // e.g. { label: 'Length', options: ['16"', '18"'] }
  care: '',
  shipping: '',
  returns: '',
  checkoutUrl: '', // e.g. a Shopify/Stripe checkout link — see src/lib/checkout.ts
}
export const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: product.currency, maximumFractionDigits: 0 }).format(n)
