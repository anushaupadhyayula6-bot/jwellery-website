import { supabase } from './supabase'

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
type ProductRow = { id: string; name: string; description: string; price: number | null; image: string; created_at: string; updated_at: string }
const productFields = 'id,name,description,price,image,created_at,updated_at'
const mapProduct = (row: ProductRow): CatalogProduct => ({ id: row.id, name: row.name, description: row.description, price: row.price, image: row.image, createdAt: row.created_at, updatedAt: row.updated_at })
const unwrap = <T,>(result: { data: T | null; error: { message: string } | null }): T => {
  if (result.error) throw new Error(result.error.message)
  if (result.data == null) throw new Error('The database returned no data.')
  return result.data
}

export const listProducts = async (): Promise<CatalogProduct[]> => {
  const result = await supabase.from('products').select(productFields).order('created_at', { ascending: false })
  return unwrap(result).map(mapProduct)
}

export const adminSession = async () => {
  const result = await supabase.auth.getSession()
  if (result.error) throw new Error(result.error.message)
  return { authenticated: Boolean(result.data.session) }
}

export const adminLogin = async (email: string, password: string) => {
  const result = await supabase.auth.signInWithPassword({ email, password })
  if (result.error) throw new Error(result.error.message)
  return { authenticated: Boolean(result.data.session) }
}

export const adminLogout = async () => {
  const result = await supabase.auth.signOut()
  if (result.error) throw new Error(result.error.message)
  return { ok: true }
}

export const createProduct = async (product: ProductInput): Promise<CatalogProduct> => {
  const result = await supabase.from('products').insert({ name: product.name.trim(), description: product.description.trim(), price: product.price, image: product.image.trim() || '/frames/desktop/064.webp' }).select(productFields).single()
  return mapProduct(unwrap(result))
}

export const updateProduct = async (id: string, product: ProductInput): Promise<CatalogProduct> => {
  const result = await supabase.from('products').update({ name: product.name.trim(), description: product.description.trim(), price: product.price, image: product.image.trim() || '/frames/desktop/064.webp', updated_at: new Date().toISOString() }).eq('id', id).select(productFields).single()
  return mapProduct(unwrap(result))
}

export const deleteProduct = async (id: string) => {
  const result = await supabase.from('products').delete().eq('id', id)
  if (result.error) throw new Error(result.error.message)
  return { ok: true }
}
