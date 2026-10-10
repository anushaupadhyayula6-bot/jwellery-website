export interface CatalogProduct {
  id: string
  name: string
  description: string
  price: number | null
  image: string
  createdAt: string
  updatedAt: string
}

export type ProductInput = Pick<CatalogProduct, 'name' | 'description' | 'price' | 'image'>

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body && !headers.has('content-type')) headers.set('content-type', 'application/json')
  const response = await fetch(path, {
    ...init,
    credentials: 'same-origin',
    headers,
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error || `Request failed (${response.status}).`)
  return body as T
}

export const listProducts = () => request<CatalogProduct[]>('/api/products')
export const adminSession = () => request<{ authenticated: boolean }>('/api/admin/session')
export const adminLogin = (username: string, password: string) => request<{ authenticated: boolean }>('/api/admin/login', { method: 'POST', body: JSON.stringify({ username, password }) })
export const adminLogout = () => request<{ ok: boolean }>('/api/admin/logout', { method: 'POST' })
export const createProduct = (product: ProductInput) => request<CatalogProduct>('/api/admin/products', { method: 'POST', body: JSON.stringify(product) })
export const updateProduct = (id: string, product: ProductInput) => request<CatalogProduct>(`/api/admin/products/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(product) })
export const deleteProduct = (id: string) => request<{ ok: boolean }>(`/api/admin/products/${encodeURIComponent(id)}`, { method: 'DELETE' })
