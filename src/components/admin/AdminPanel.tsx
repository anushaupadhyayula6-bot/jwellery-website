import { useEffect, useState, type FormEvent } from 'react'
import { adminLogout, adminSession, createProduct, deleteProduct, listProducts, updateProduct, type CatalogProduct, type ProductInput } from '../../lib/catalog'
import { fmt } from '../../data/product'
import { createEnquiry, deleteEnquiry, listEnquiries, updateEnquiry, type Enquiry, type EnquiryInput } from '../../lib/enquiries'

const blank: ProductInput = { name: '', description: '', price: null, image: '' }

export default function AdminPanel() {
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [activeTab, setActiveTab] = useState<'products' | 'enquiries'>('products')
  const [editingEnquiry, setEditingEnquiry] = useState<string | null>(null)
  const [showNewEnquiry, setShowNewEnquiry] = useState(false)
  const [enquiryForm, setEnquiryForm] = useState<EnquiryInput>({ name: '', email: '', subject: '', message: '' })
  const [form, setForm] = useState<ProductInput>(blank)
  const [editing, setEditing] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const reload = async () => setProducts(await listProducts())
  const reloadEnquiries = async () => setEnquiries(await listEnquiries())
  useEffect(() => {
    adminSession().then(session => {
      if (!session.authenticated) { window.location.replace('/admin/login'); return }
      return Promise.all([reload(), reloadEnquiries()])
    }).catch(err => setError(err.message)).finally(() => setLoading(false))
  }, [])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError(''); setMessage('')
    try {
      const value = { ...form, price: form.price == null ? null : Number(form.price) }
      if (editing) {
        await updateProduct(editing, value)
        await reload(); setMessage('Product updated.'); setEditing(null); setForm(blank)
      } else {
        await createProduct(value)
        window.location.assign('/products')
      }
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to save the product.') }
    finally { setBusy(false) }
  }

  const edit = (item: CatalogProduct) => {
    setEditing(item.id)
    setForm({ name: item.name, description: item.description, price: item.price, image: item.image })
    setMessage(''); setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const remove = async (item: CatalogProduct) => {
    if (!window.confirm(`Delete “${item.name}”? This cannot be undone.`)) return
    setError(''); setMessage('')
    try { await deleteProduct(item.id); await reload(); setMessage('Product deleted.') }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to delete the product.') }
  }

  const editEnquiry = (item: Enquiry) => {
    setEditingEnquiry(item.id)
    setEnquiryForm({ name: item.name, email: item.email, subject: item.subject, message: item.message })
    setMessage(''); setError('')
  }

  const saveEnquiry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true); setError(''); setMessage('')
    try {
      if (editingEnquiry) await updateEnquiry(editingEnquiry, enquiryForm)
      else await createEnquiry(enquiryForm)
      await reloadEnquiries(); setEditingEnquiry(null); setShowNewEnquiry(false); setMessage(editingEnquiry ? 'Enquiry updated.' : 'Enquiry created.')
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to update enquiry.') }
    finally { setBusy(false) }
  }

  const removeEnquiry = async (item: Enquiry) => {
    if (!window.confirm(`Delete the enquiry from ${item.name}? This cannot be undone.`)) return
    setError(''); setMessage('')
    try { await deleteEnquiry(item.id); await reloadEnquiries(); setMessage('Enquiry deleted.') }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to delete enquiry.') }
  }

  const logout = async () => {
    try { await adminLogout() } finally { window.location.replace('/admin/login') }
  }

  if (loading) return <div className="route-loading">Loading admin…</div>

  return <main className="admin-page section">
    <div className="container-xl mx-auto">
      <header className="admin-header"><div><span className="eyebrow">Maison Élara · Administration</span><h1>Products.</h1></div><div><a className="admin-public-link" href="/products">View products ↗</a><button className="viewer-action" type="button" onClick={logout}>Sign out</button></div></header>
      <nav className="admin-tabs" aria-label="Admin sections">
        <button type="button" className={activeTab === 'products' ? 'active' : ''} onClick={() => { setActiveTab('products'); setError(''); setMessage('') }}>Products <span>{products.length}</span></button>
        <button type="button" className={activeTab === 'enquiries' ? 'active' : ''} onClick={() => { setActiveTab('enquiries'); setError(''); setMessage('') }}>Contact enquiries <span>{enquiries.length}</span></button>
      </nav>
      {error && <p className="admin-error admin-feedback" role="alert">{error}</p>}
      {message && <p className="admin-success admin-feedback" role="status">{message}</p>}
      {activeTab === 'products' ? <div className="admin-grid">
        <form className="admin-form admin-product-form" onSubmit={submit}>
          <h2>{editing ? 'Edit product' : 'Add a product'}</h2>
          <label className="field"><span>Product name</span><input value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} maxLength={120} required /></label>
          <label className="field"><span>Description</span><textarea rows={4} value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} maxLength={2000} required /></label>
          <label className="field"><span>Price · INR</span><input type="number" min="0" step="1" value={form.price ?? ''} onChange={event => setForm({ ...form, price: event.target.value === '' ? null : Number(event.target.value) })} placeholder="Leave blank to confirm later" /></label>
          <label className="field"><span>Image path or HTTPS URL</span><input type="text" value={form.image} onChange={event => setForm({ ...form, image: event.target.value })} placeholder="/frames/desktop/064.webp" /></label>
          <div className="admin-form-actions"><button className="cta-btn solid" type="submit" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Add product'}</button>
            {editing && <button className="viewer-action" type="button" onClick={() => { setEditing(null); setForm(blank); setMessage(''); setError('') }}>Cancel edit</button>}
          </div>
          {!editing && <p className="admin-help">After a new product is saved, you’ll go to the public products page.</p>}
        </form>
        <section className="admin-list">
          <div className="admin-list-head"><h2>Current products</h2><span>{products.length} total</span></div>
          {products.map(item => <article className="admin-product-row" key={item.id}>
            <img src={item.image} alt="" />
            <div className="admin-product-copy"><b>{item.name}</b><span>{item.price == null ? 'Price to be confirmed' : fmt(item.price)}</span></div>
            <div className="admin-row-actions"><button type="button" onClick={() => edit(item)}>Edit</button><button type="button" className="danger" onClick={() => remove(item)}>Delete</button></div>
          </article>)}
        </section>
      </div> : <section className="admin-enquiries">
        <div className="admin-list-head"><h2>Received messages</h2><span>{enquiries.length} total <button className="admin-inline-action" type="button" onClick={() => { setEditingEnquiry(null); setEnquiryForm({ name: '', email: '', subject: '', message: '' }); setShowNewEnquiry(true); setError(''); setMessage('') }}>Add enquiry</button></span></div>
        {showNewEnquiry && <article className="admin-enquiry"><form className="admin-form admin-enquiry-edit" onSubmit={saveEnquiry}>
          <label className="field"><span>Name</span><input value={enquiryForm.name} onChange={event => setEnquiryForm({ ...enquiryForm, name: event.target.value })} maxLength={120} required /></label>
          <label className="field"><span>Email</span><input type="email" value={enquiryForm.email} onChange={event => setEnquiryForm({ ...enquiryForm, email: event.target.value })} maxLength={254} required /></label>
          <label className="field"><span>Subject</span><input value={enquiryForm.subject} onChange={event => setEnquiryForm({ ...enquiryForm, subject: event.target.value })} maxLength={180} required /></label>
          <label className="field"><span>Message</span><textarea rows={5} value={enquiryForm.message} onChange={event => setEnquiryForm({ ...enquiryForm, message: event.target.value })} maxLength={5000} required /></label>
          <div className="admin-form-actions"><button className="cta-btn solid" type="submit" disabled={busy}>{busy ? 'Saving...' : 'Create enquiry'}</button><button className="viewer-action" type="button" onClick={() => setShowNewEnquiry(false)}>Cancel</button></div>
        </form></article>}
        {enquiries.length === 0 ? <p className="admin-empty">No contact enquiries yet. Messages sent through the contact form will appear here.</p> : enquiries.map(item => <article className="admin-enquiry" key={item.id}>
          {editingEnquiry === item.id ? <form className="admin-form admin-enquiry-edit" onSubmit={saveEnquiry}>
            <label className="field"><span>Name</span><input value={enquiryForm.name} onChange={event => setEnquiryForm({ ...enquiryForm, name: event.target.value })} maxLength={120} required /></label>
            <label className="field"><span>Email</span><input type="email" value={enquiryForm.email} onChange={event => setEnquiryForm({ ...enquiryForm, email: event.target.value })} maxLength={254} required /></label>
            <label className="field"><span>Subject</span><input value={enquiryForm.subject} onChange={event => setEnquiryForm({ ...enquiryForm, subject: event.target.value })} maxLength={180} required /></label>
            <label className="field"><span>Message</span><textarea rows={5} value={enquiryForm.message} onChange={event => setEnquiryForm({ ...enquiryForm, message: event.target.value })} maxLength={5000} required /></label>
            <div className="admin-form-actions"><button className="cta-btn solid" type="submit" disabled={busy}>{busy ? 'Saving...' : 'Save changes'}</button><button className="viewer-action" type="button" onClick={() => setEditingEnquiry(null)}>Cancel</button></div>
          </form> : <>
            <div className="admin-enquiry-head"><div><h3>{item.subject}</h3><b>{item.name}</b> · <a href={`mailto:${item.email}`}>{item.email}</a></div><time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString()}</time></div>
            <p className="admin-enquiry-message">{item.message}</p>
            <div className="admin-row-actions"><button type="button" onClick={() => editEnquiry(item)}>Edit</button><button type="button" className="danger" onClick={() => removeEnquiry(item)}>Delete</button></div>
          </>}
        </article>)}
      </section>}
    </div>
  </main>
}
