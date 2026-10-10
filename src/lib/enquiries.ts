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

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body && !headers.has('content-type')) headers.set('content-type', 'application/json')
  const response = await fetch(path, { ...init, credentials: 'same-origin', headers })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error || `Request failed (${response.status}).`)
  return body as T
}

export const submitEnquiry = (enquiry: EnquiryInput) => request<{ ok: true }>('/api/enquiries', { method: 'POST', body: JSON.stringify(enquiry) })
export const listEnquiries = () => request<Enquiry[]>('/api/admin/enquiries')
export const createEnquiry = (enquiry: EnquiryInput) => request<Enquiry>('/api/admin/enquiries', { method: 'POST', body: JSON.stringify(enquiry) })
export const updateEnquiry = (id: string, enquiry: EnquiryInput) => request<Enquiry>(`/api/admin/enquiries/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(enquiry) })
export const deleteEnquiry = (id: string) => request<{ ok: true }>(`/api/admin/enquiries/${encodeURIComponent(id)}`, { method: 'DELETE' })
