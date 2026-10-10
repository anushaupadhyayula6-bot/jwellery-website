import { useEffect, useRef, useState } from 'react'
import { gsap } from '../../hooks/useScrollAnimation'
import ProductGallery from '../product/ProductGallery'
import { AddToCart } from '../product/AddToCart'
import { product, fmt } from '../../data/product'
import { listProducts, type CatalogProduct } from '../../lib/catalog'
import ProductImage3D from '../product/ProductImage3D'

export default function ProductSection({ reduced, detailsPage = false }: { reduced: boolean; detailsPage?: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const [catalog, setCatalog] = useState<CatalogProduct[]>([])
  useEffect(() => {
    if (!detailsPage) listProducts().then(setCatalog).catch(() => setCatalog([]))
  }, [detailsPage])
  useEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      gsap.from('.info > *', { y: 30, opacity: 0, stagger: 0.1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: ref.current, start: 'top 65%' } })
    }, ref)
    return () => ctx.revert()
  }, [reduced])
  const facts = [['Care', product.care], ['Shipping', product.shipping], ['Returns', product.returns]].filter(([, v]) => v)
  return (
    <section ref={ref} id="product" className={`section product-section${detailsPage ? ' product-page' : ''}`}>
      <div className="container-xl row g-5 mx-auto">
        <div className="col-12 col-lg-7">
          {detailsPage && <p className="product-breadcrumb"><a href="/">Home</a><span>/</span><span>Product details</span></p>}
          <ProductGallery detailsHref={detailsPage ? undefined : '/product'} />
          {!detailsPage && <a className="product-details-link" href="/product">Explore full product details <span aria-hidden="true">↗</span></a>}
        </div>
        <div className="col-12 col-lg-5 info">
          <span className="eyebrow">{detailsPage ? 'Product details' : 'The set'}</span>
          <h2>{detailsPage ? product.name : <a className="product-detail-link" href="/product">{product.name}</a>}</h2>
          <p className="price">{product.price != null ? fmt(product.price) : 'Price to be confirmed'}</p>
          <p>{product.description}</p>
          <AddToCart />
          {facts.length > 0 && <div className="facts">{facts.map(([k, v]) => <details key={k}><summary>{k}</summary><p>{v}</p></details>)}</div>}
        </div>
      </div>
      {!detailsPage && catalog.length > 0 && <div className="home-collection container-xl mx-auto">
        <header className="home-collection-heading"><div><span className="eyebrow">The collection</span><h2>More pieces to discover.</h2></div><a href="/products">View all products <span aria-hidden="true">↗</span></a></header>
        <div className="catalog-grid">
          {catalog.map(item => <article className="catalog-card" key={item.id}>
            <a className="catalog-image" href={`/products?id=${encodeURIComponent(item.id)}`} aria-label={`View ${item.name}`}><ProductImage3D src={item.image} alt={item.name} /></a>
            <div className="catalog-card-copy"><h3><a href={`/products?id=${encodeURIComponent(item.id)}`}>{item.name}</a></h3><p>{item.description}</p>
              <div><span>{item.price == null ? 'Price to be confirmed' : fmt(item.price)}</span><a href={`/products?id=${encodeURIComponent(item.id)}`}>View details ↗</a></div>
            </div>
          </article>)}
        </div>
      </div>}
    </section>
  )
}
