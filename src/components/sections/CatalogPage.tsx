import { useEffect, useState } from 'react'
import { fmt } from '../../data/product'
import { cart } from '../../lib/cart'
import { listProducts, type CatalogProduct } from '../../lib/catalog'
import ProductImage3D from '../product/ProductImage3D'

export default function CatalogPage() {
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [added, setAdded] = useState(false)
  const selectedId = new URLSearchParams(window.location.search).get('id')

  useEffect(() => {
    listProducts().then(setProducts).catch(err => setError(err.message)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="route-loading">Loading products…</div>
  if (error) return <section className="section catalog-page"><div className="container-xl mx-auto"><h1>Products</h1><p className="catalog-error">{error}. Check that the Supabase database setup has been completed.</p></div></section>

  const selected = selectedId ? products.find(item => item.id === selectedId) : undefined
  if (selectedId && !selected) return <section className="section catalog-page"><div className="container-xl mx-auto"><a href="/products">← All products</a><h1>Product not found.</h1></div></section>

  if (selected) return <section className="section catalog-page">
    <div className="container-xl mx-auto">
      <a className="catalog-back" href="/products">← All products</a>
      <div className="catalog-detail">
        <ProductImage3D src={selected.image} alt={selected.name} className="catalog-detail-image" />
        <div><span className="eyebrow">Maison Élara · Product</span><h1>{selected.name}</h1>
          <p className="price">{selected.price == null ? 'Price to be confirmed' : fmt(selected.price)}</p>
          <p>{selected.description}</p>
          <button className="cta-btn solid" type="button" onClick={() => { cart.add(selected.id, selected.name, 1, selected.price); setAdded(true) }}>{added ? 'Added to bag' : 'Add to bag'}</button>
          {added && <a className="catalog-checkout-link" href="/checkout">Continue to checkout →</a>}
        </div>
      </div>
    </div>
  </section>

  return <section className="section catalog-page">
    <div className="container-xl mx-auto">
      <div className="catalog-heading"><span className="eyebrow">Maison Élara</span><h1>The collection.</h1><p>Explore the pieces in the collection.</p></div>
      {!products.length ? <p>No products have been added yet.</p> : <div className="catalog-grid">
        {products.map(item => <article className="catalog-card" key={item.id}>
          <a className="catalog-image" href={`/products?id=${encodeURIComponent(item.id)}`} aria-label={`View ${item.name}`}><ProductImage3D src={item.image} alt={item.name} /></a>
          <div className="catalog-card-copy"><h2><a href={`/products?id=${encodeURIComponent(item.id)}`}>{item.name}</a></h2><p>{item.description}</p>
            <div><span>{item.price == null ? 'Price to be confirmed' : fmt(item.price)}</span><a href={`/products?id=${encodeURIComponent(item.id)}`}>View details ↗</a></div>
          </div>
        </article>)}
      </div>}
    </div>
  </section>
}
