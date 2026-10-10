import { supabase } from './supabase'

export interface Enquiry {
  id: string
  name: string
  email: string
  subject: string
  message: string
  createdAt: string
  updatedAt: string
}

export type EnquiryInput = Pick<Enquiry, 'name' | 'email' | 'subject' | 'message'>
type EnquiryRow = { id: string; name: string; email: string; subject: string; message: string; created_at: string; updated_at: string }
const fields = 'id,name,email,subject,message,created_at,updated_at'
const mapEnquiry = (row: EnquiryRow): Enquiry => ({ id: row.id, name: row.name, email: row.email, subject: row.subject, message: row.message, createdAt: row.created_at, updatedAt: row.updated_at })
const unwrap = <T,>(result: { data: T | null; error: { message: string } | null }): T => {
  if (result.error) throw new Error(result.error.message)
  if (result.data == null) throw new Error('The database returned no data.')
  return result.data
}

export const submitEnquiry = async (enquiry: EnquiryInput) => {
  const result = await supabase.from('contact_enquiries').insert({ name: enquiry.name.trim(), email: enquiry.email.trim(), subject: enquiry.subject.trim(), message: enquiry.message.trim() })
  if (result.error) throw new Error(result.error.message)
  return { ok: true as const }
}

export const listEnquiries = async (): Promise<Enquiry[]> => {
  const result = await supabase.from('contact_enquiries').select(fields).order('created_at', { ascending: false })
  return unwrap(result).map(mapEnquiry)
}

export const createEnquiry = async (enquiry: EnquiryInput): Promise<Enquiry> => {
  const result = await supabase.from('contact_enquiries').insert({ name: enquiry.name.trim(), email: enquiry.email.trim(), subject: enquiry.subject.trim(), message: enquiry.message.trim() }).select(fields).single()
  return mapEnquiry(unwrap(result))
}

export const updateEnquiry = async (id: string, enquiry: EnquiryInput): Promise<Enquiry> => {
  const result = await supabase.from('contact_enquiries').update({ name: enquiry.name.trim(), email: enquiry.email.trim(), subject: enquiry.subject.trim(), message: enquiry.message.trim(), updated_at: new Date().toISOString() }).eq('id', id).select(fields).single()
  return mapEnquiry(unwrap(result))
}

export const deleteEnquiry = async (id: string) => {
  const result = await supabase.from('contact_enquiries').delete().eq('id', id)
  if (result.error) throw new Error(result.error.message)
  return { ok: true as const }
}
