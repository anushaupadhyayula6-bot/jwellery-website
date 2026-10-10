import { useEffect } from 'react'
import { product, brand } from '../../data/product'
import { listProducts } from '../../lib/catalog'

type SeoData = { title: string; description: string; image: string; noIndex?: boolean }

const pageSeo = (path: string): SeoData => {
  if (path === '/product') return { title: `${product.name} | ${brand.name}`, description: product.description, image: '/frames/desktop/064.webp' }
  if (path === '/products') return { title: `Jewellery Collection | ${brand.name}`, description: 'Explore the complete jewellery collection, product details, and gemstone designs.', image: '/frames/desktop/092.webp' }
  if (path === '/checkout') return { title: `Checkout | ${brand.name}`, description: 'Review your jewellery order and continue to checkout.', image: '/frames/desktop/120.webp', noIndex: true }
  if (path === '/admin' || path === '/admin/login') return { title: `Admin | ${brand.name}`, description: 'Store administration sign in.', image: '/frames/desktop/030.webp', noIndex: true }
  return { title: `${product.name} | ${brand.name}`, description: product.description, image: '/frames/desktop/000.webp' }
}

function setMeta(attribute: string, key: string, value: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (!element) { element = document.createElement('meta'); element.setAttribute(attribute, key); document.head.append(element) }
  element.content = value
}

export default function Seo({ path }: { path: string }) {
  useEffect(() => {
    let cancelled = false
    const selectedId = path === '/products' ? new URLSearchParams(window.location.search).get('id') : null
    const apply = (data: SeoData) => {
      if (cancelled) return
      const url = new URL(window.location.href)
      const canonical = `${url.origin}${url.pathname}${selectedId ? `?id=${encodeURIComponent(selectedId)}` : ''}`
      document.title = data.title
      setMeta('name', 'description', data.description)
      setMeta('name', 'robots', data.noIndex ? 'noindex, nofollow' : 'index, follow')
      setMeta('property', 'og:type', 'website')
      setMeta('property', 'og:title', data.title)
      setMeta('property', 'og:description', data.description)
      setMeta('property', 'og:url', canonical)
      setMeta('property', 'og:image', new URL(data.image, url.origin).href)
      setMeta('name', 'twitter:card', 'summary_large_image')
      setMeta('name', 'twitter:title', data.title)
      setMeta('name', 'twitter:description', data.description)
      setMeta('name', 'twitter:image', new URL(data.image, url.origin).href)
      let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
      if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.append(link) }
      link.href = canonical
    }
    apply(pageSeo(path))
    if (selectedId) listProducts().then(items => {
      const item = items.find(productItem => productItem.id === selectedId)
      if (item) apply({ title: `${item.name} | ${brand.name}`, description: item.description, image: item.image })
    }).catch(() => {})
    return () => { cancelled = true }
  }, [path])
  return null
}
