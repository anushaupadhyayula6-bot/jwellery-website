import { lazy, Suspense, useEffect, useState } from 'react'
import Navbar from './components/layout/Navbar'
import Seo from './components/layout/Seo'
import NecklaceSequence from './components/hero/NecklaceSequence'
import { CartDrawer } from './components/product/AddToCart'
import { useReducedMotion } from './hooks/useReducedMotion'
import { ScrollTrigger, useSmoothScroll } from './hooks/useScrollAnimation'
const Craft = lazy(() => import('./components/sections/CraftsmanshipSection'))
const Story = lazy(() => import('./components/sections/BrandStorySection'))
const Product = lazy(() => import('./components/sections/ProductSection'))
const Checkout = lazy(() => import('./components/product/CheckoutPage'))
const Catalog = lazy(() => import('./components/sections/CatalogPage'))
const AdminLogin = lazy(() => import('./components/admin/AdminLoginPage'))
const Admin = lazy(() => import('./components/admin/AdminPanel'))
const Contact = lazy(() => import('./components/sections/ContactSection'))
const Footer = lazy(() => import('./components/layout/Footer'))

export default function App() {
  const reduced = useReducedMotion()
  const [bag, setBag] = useState(false)
  const [pathname, setPathname] = useState(() => window.location.pathname.replace(/\/$/, '') || '/')
  useSmoothScroll(!reduced && matchMedia('(pointer: fine)').matches)
  useEffect(() => {
    history.scrollRestoration = 'manual'
    document.fonts.ready.then(() => ScrollTrigger.refresh())
    const r = () => ScrollTrigger.refresh()
    addEventListener('load', r); addEventListener('pageshow', r)
    return () => { removeEventListener('load', r); removeEventListener('pageshow', r) }
  }, [])
  useEffect(() => {
    const updatePath = () => setPathname(window.location.pathname.replace(/\/$/, '') || '/')
    addEventListener('popstate', updatePath)
    return () => removeEventListener('popstate', updatePath)
  }, [])
  const productPage = pathname === '/product'
  const checkoutPage = pathname === '/checkout'
  const catalogPage = pathname === '/products'
  const adminLoginPage = pathname === '/admin/login'
  const adminPage = pathname === '/admin'
  return (
    <>
      <Seo path={pathname} />
      <Navbar onCart={() => setBag(true)} />
      <main>
        {adminLoginPage ? <Suspense fallback={<div className="route-loading">Loading sign in…</div>}><AdminLogin /></Suspense>
          : adminPage ? <Suspense fallback={<div className="route-loading">Loading admin…</div>}><Admin /></Suspense>
            : catalogPage ? <Suspense fallback={<div className="route-loading">Loading products…</div>}><Catalog /></Suspense>
              : productPage ? <Suspense fallback={<div className="route-loading">Loading product…</div>}><Product reduced={reduced} detailsPage /></Suspense>
          : checkoutPage ? <Suspense fallback={<div className="route-loading">Loading checkout…</div>}><Checkout /></Suspense>
            : <>
              <NecklaceSequence reduced={reduced} />
              <Suspense fallback={null}>
                <Craft reduced={reduced} /><Story reduced={reduced} /><Product reduced={reduced} /><Contact reduced={reduced} />
              </Suspense>
            </>}
      </main>
      {!adminLoginPage && !adminPage && <Suspense fallback={null}><Footer reduced={reduced} /></Suspense>}
      <CartDrawer open={bag} onClose={() => setBag(false)} onCheckout={() => window.location.assign('/checkout')} />
      <div className="grain" aria-hidden="true" />
    </>
  )
}
