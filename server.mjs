import { createServer } from 'node:http'
import { randomBytes, randomUUID, timingSafeEqual } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs'
import { extname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('.', import.meta.url))
const envFile = join(root, '.env')
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
    if (match && process.env[match[1]] == null) process.env[match[1]] = match[2].replace(/^(["'])(.*)\1$/, '$2')
  }
}
const dataDir = process.env.DATA_DIR || join(root, 'data')
const storeFile = join(dataDir, 'products.json')
const enquiriesFile = join(dataDir, 'enquiries.json')
const distDir = join(root, 'dist')
const port = Number(process.env.PORT || 4174)
const sessionMs = 8 * 60 * 60 * 1000
const sessions = new Map()
const loginAttempts = new Map()
const seed = [{
  id: 'verde-necklace',
  name: 'The Verdé Necklace',
  description: 'A rose-gold necklace set with pale green and clear stones, presented with matching drop earrings.',
  price: null,
  image: '/frames/desktop/064.webp',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}]

const equalSecret = (input, expected) => {
  const a = Buffer.from(String(input || ''))
  const b = Buffer.from(String(expected || ''))
  return a.length === b.length && timingSafeEqual(a, b)
}
const send = (res, status, body, headers = {}) => {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers })
  res.end(JSON.stringify(body))
}
const readBody = req => new Promise((resolveBody, reject) => {
  let raw = ''
  req.on('data', chunk => {
    raw += chunk
    if (raw.length > 1024 * 1024) { reject(new Error('Request is too large.')); req.destroy() }
  })
  req.on('end', () => {
    try { resolveBody(JSON.parse(raw || '{}')) } catch { reject(new Error('Invalid JSON request.')) }
  })
  req.on('error', reject)
})
const readProducts = () => {
  mkdirSync(dataDir, { recursive: true })
  if (!existsSync(storeFile)) writeFileSync(storeFile, JSON.stringify(seed, null, 2))
  return JSON.parse(readFileSync(storeFile, 'utf8'))
}
const saveProducts = products => {
  const temp = `${storeFile}.${randomUUID()}.tmp`
  writeFileSync(temp, JSON.stringify(products, null, 2), { mode: 0o600 })
  renameSync(temp, storeFile)
}
const readEnquiries = () => {
  mkdirSync(dataDir, { recursive: true })
  if (!existsSync(enquiriesFile)) writeFileSync(enquiriesFile, '[]\n', { mode: 0o600 })
  return JSON.parse(readFileSync(enquiriesFile, 'utf8'))
}
const saveEnquiries = enquiries => {
  const temp = `${enquiriesFile}.${randomUUID()}.tmp`
  writeFileSync(temp, JSON.stringify(enquiries, null, 2), { mode: 0o600 })
  renameSync(temp, enquiriesFile)
}
const cookies = req => Object.fromEntries((req.headers.cookie || '').split(';').map(x => x.trim().split('=').map(decodeURIComponent)).filter(x => x.length === 2))
const authenticated = req => {
  const token = cookies(req).admin_session
  const expiry = sessions.get(token)
  if (!expiry || expiry < Date.now()) { sessions.delete(token); return false }
  sessions.set(token, Date.now() + sessionMs)
  return true
}
const cleanProduct = body => {
  const name = String(body.name || '').trim().slice(0, 120)
  const description = String(body.description || '').trim().slice(0, 2000)
  const image = String(body.image || '').trim().slice(0, 1000)
  const price = body.price === '' || body.price == null ? null : Number(body.price)
  if (!name) throw new Error('Product name is required.')
  if (!description) throw new Error('Product description is required.')
  if (price !== null && (!Number.isFinite(price) || price < 0)) throw new Error('Enter a valid price, or leave it blank.')
  if (image && !image.startsWith('/') && !/^https:\/\//i.test(image)) throw new Error('Image must use a site path or an HTTPS URL.')
  return { name, description, price, image: image || '/frames/desktop/064.webp' }
}
const cleanEnquiry = body => {
  const name = String(body.name || '').trim().slice(0, 120)
  const email = String(body.email || '').trim().slice(0, 254)
  const subject = String(body.subject || '').trim().slice(0, 180)
  const message = String(body.message || '').trim().slice(0, 5000)
  if (!name || !subject || !message) throw new Error('Name, subject, and message are required.')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.')
  return { name, email, subject, message }
}
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))
const seoHtml = (html, req, url) => {
  let title = 'The Verdé Necklace | Maison Élara'
  let description = 'A rose-gold necklace with pale green and clear stones, with matching earrings.'
  let image = '/frames/desktop/000.webp'
  let noIndex = false
  if (url.pathname === '/product') { title = 'The Necklace | Maison Élara'; image = '/frames/desktop/064.webp' }
  else if (url.pathname === '/products') {
    title = 'Jewellery Collection | Maison Élara'; description = 'Explore the complete jewellery collection, product details, and gemstone designs.'; image = '/frames/desktop/092.webp'
    const selected = url.searchParams.get('id')
    if (selected) {
      const item = readProducts().find(product => product.id === selected)
      if (item) { title = `${item.name} | Maison Élara`; description = item.description; image = item.image }
    }
  } else if (url.pathname === '/checkout') { title = 'Checkout | Maison Élara'; description = 'Review your jewellery order and continue to checkout.'; image = '/frames/desktop/120.webp'; noIndex = true }
  else if (url.pathname.startsWith('/admin')) { title = 'Admin | Maison Élara'; description = 'Store administration sign in.'; image = '/frames/desktop/030.webp'; noIndex = true }
  const protocol = String(req.headers['x-forwarded-proto'] || (process.env.NODE_ENV === 'production' ? 'https' : 'http')).split(',')[0].trim()
  const origin = `${protocol}://${req.headers.host || 'localhost'}`
  const canonical = `${origin}${url.pathname}${url.searchParams.has('id') ? `?id=${encodeURIComponent(url.searchParams.get('id'))}` : ''}`
  const imageUrl = /^https:\/\//i.test(image) ? image : new URL(image, origin).href
  const setMeta = (source, attr, name, value) => {
    const tag = `<meta ${attr}="${name}" content="${escapeHtml(value)}" />`
    const pattern = new RegExp(`<meta\\s+${attr}="${name}"\\s+content="[^"]*"\\s*\\/?\\s*>`, 'i')
    return pattern.test(source) ? source.replace(pattern, tag) : source.replace('</head>', '  ' + tag + String.fromCharCode(10) + '</head>')
  }
  let result = html.replace(new RegExp('<title>[^<]*</title>', 'i'), `<title>${escapeHtml(title)}</title>`)
  result = setMeta(result, 'name', 'description', description)
  result = setMeta(result, 'property', 'og:title', title)
  result = setMeta(result, 'property', 'og:description', description)
  result = setMeta(result, 'property', 'og:image', imageUrl)
  result = setMeta(result, 'property', 'og:url', canonical)
  result = setMeta(result, 'name', 'twitter:title', title)
  result = setMeta(result, 'name', 'twitter:description', description)
  result = setMeta(result, 'name', 'twitter:image', imageUrl)
  result = setMeta(result, 'name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow')
  return result
}

const server = createServer(async (req, res) => {
  res.setHeader('x-content-type-options', 'nosniff')
  res.setHeader('x-frame-options', 'DENY')
  res.setHeader('referrer-policy', 'same-origin')
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
  const path = url.pathname

  try {
    if (path === '/api/products' && req.method === 'GET') return send(res, 200, readProducts())

    if (path === '/api/enquiries' && req.method === 'POST') {
      const body = await readBody(req)
      const item = { id: randomUUID(), ...cleanEnquiry(body), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      const enquiries = readEnquiries(); enquiries.unshift(item); saveEnquiries(enquiries)
      return send(res, 201, { ok: true })
    }

    if (path === '/api/admin/session' && req.method === 'GET') return send(res, 200, { authenticated: authenticated(req) })

    if (path === '/api/admin/login' && req.method === 'POST') {
      const ip = req.socket.remoteAddress || 'unknown'
      const attempts = loginAttempts.get(ip) || { count: 0, until: 0 }
      if (attempts.until > Date.now()) return send(res, 429, { error: 'Too many login attempts. Try again later.' })
      if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) return send(res, 503, { error: 'Admin credentials are not configured on the server.' })
      const body = await readBody(req)
      if (!equalSecret(body.username, process.env.ADMIN_USERNAME) || !equalSecret(body.password, process.env.ADMIN_PASSWORD)) {
        attempts.count += 1
        if (attempts.count >= 5) { attempts.count = 0; attempts.until = Date.now() + 15 * 60 * 1000 }
        loginAttempts.set(ip, attempts)
        return send(res, 401, { error: 'Username or password is incorrect.' })
      }
      loginAttempts.delete(ip)
      const token = randomBytes(32).toString('base64url')
      sessions.set(token, Date.now() + sessionMs)
      const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
      return send(res, 200, { authenticated: true }, { 'set-cookie': `admin_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${sessionMs / 1000}${secure}` })
    }

    if (path === '/api/admin/logout' && req.method === 'POST') {
      const token = cookies(req).admin_session
      sessions.delete(token)
      return send(res, 200, { ok: true }, { 'set-cookie': 'admin_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0' })
    }

    if (path.startsWith('/api/admin/products')) {
      if (!authenticated(req)) return send(res, 401, { error: 'Please sign in again.' })
      const id = path.split('/').filter(Boolean)[3]
      if (req.method === 'POST' && path === '/api/admin/products') {
        const body = await readBody(req)
        const item = { id: randomUUID(), ...cleanProduct(body), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        const products = readProducts(); products.unshift(item); saveProducts(products)
        return send(res, 201, item)
      }
      if ((req.method === 'PUT' || req.method === 'PATCH') && id) {
        const body = await readBody(req), products = readProducts(), index = products.findIndex(item => item.id === id)
        if (index < 0) return send(res, 404, { error: 'Product not found.' })
        products[index] = { ...products[index], ...cleanProduct(body), updatedAt: new Date().toISOString() }
        saveProducts(products)
        return send(res, 200, products[index])
      }
      if (req.method === 'DELETE' && id) {
        const products = readProducts(), filtered = products.filter(item => item.id !== id)
        if (filtered.length === products.length) return send(res, 404, { error: 'Product not found.' })
        saveProducts(filtered)
        return send(res, 200, { ok: true })
      }
      return send(res, 405, { error: 'Method not allowed.' })
    }

    if (path.startsWith('/api/admin/enquiries')) {
      if (!authenticated(req)) return send(res, 401, { error: 'Please sign in again.' })
      const id = path.split('/').filter(Boolean)[3]
      if (req.method === 'GET' && path === '/api/admin/enquiries') return send(res, 200, readEnquiries())
      if (req.method === 'POST' && path === '/api/admin/enquiries') {
        const body = await readBody(req)
        const item = { id: randomUUID(), ...cleanEnquiry(body), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        const enquiries = readEnquiries(); enquiries.unshift(item); saveEnquiries(enquiries)
        return send(res, 201, item)
      }
      if (req.method === 'PUT' && id) {
        const body = await readBody(req), enquiries = readEnquiries(), index = enquiries.findIndex(item => item.id === id)
        if (index < 0) return send(res, 404, { error: 'Enquiry not found.' })
        enquiries[index] = { ...enquiries[index], ...cleanEnquiry(body), updatedAt: new Date().toISOString() }
        saveEnquiries(enquiries)
        return send(res, 200, enquiries[index])
      }
      if (req.method === 'DELETE' && id) {
        const enquiries = readEnquiries(), filtered = enquiries.filter(item => item.id !== id)
        if (filtered.length === enquiries.length) return send(res, 404, { error: 'Enquiry not found.' })
        saveEnquiries(filtered)
        return send(res, 200, { ok: true })
      }
      return send(res, 405, { error: 'Method not allowed.' })
    }

    if (path.startsWith('/api/')) return send(res, 404, { error: 'API route not found.' })

    if (req.method === 'GET' && existsSync(join(distDir, 'index.html'))) {
      const file = resolve(distDir, `.${decodeURIComponent(path)}`)
      const rel = relative(resolve(distDir), file)
      const inside = rel === '' || (rel !== '..' && !rel.startsWith(`..${sep}`) && !rel.startsWith(sep))
      const safe = inside && existsSync(file) && statSync(file).isFile() ? file : join(distDir, 'index.html')
      const contentTypes = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' }
      res.writeHead(200, { 'content-type': contentTypes[extname(safe)] || 'application/octet-stream' })
      const content = extname(safe) === '.html' ? seoHtml(readFileSync(safe, 'utf8'), req, url) : readFileSync(safe)
      return res.end(content)
    }
    return send(res, 404, { error: 'Not found.' })
  } catch (error) {
    const status = error.message === 'Product name is required.' || error.message === 'Product description is required.' || error.message.startsWith('Enter a valid') || error.message.startsWith('Image must') || error.message === 'Invalid JSON request.' || error.message === 'Name, subject, and message are required.' ? 400 : 500
    return send(res, status, { error: status === 500 ? 'Server error.' : error.message })
  }
})

server.listen(port, () => console.log(`Admin API listening on http://localhost:${port}`))
