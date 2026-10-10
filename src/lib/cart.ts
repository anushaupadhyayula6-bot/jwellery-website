import { useSyncExternalStore } from 'react'
export interface Line { key: string; label: string; qty: number; unitPrice?: number | null }
const KEY = 'cart.v1'
let lines: Line[] = []
try { lines = JSON.parse(localStorage.getItem(KEY) || '[]') } catch { lines = [] }
const subs = new Set<() => void>()
const commit = (l: Line[]) => {
  lines = l.filter(x => x.qty > 0)
  try { localStorage.setItem(KEY, JSON.stringify(lines)) } catch { /* private mode */ }
  subs.forEach(f => f())
}
export const cart = {
  add(key: string, label: string, qty: number, unitPrice: number | null = null) {
    const f = lines.find(l => l.key === key)
    commit(f ? lines.map(l => (l.key === key ? { ...l, qty: l.qty + qty } : l)) : [...lines, { key, label, qty, unitPrice }])
  },
  setQty: (key: string, qty: number) => commit(lines.map(l => (l.key === key ? { ...l, qty } : l))),
  clear: () => commit([]),
}
export const useCart = () =>
  useSyncExternalStore(f => (subs.add(f), () => subs.delete(f)), () => lines)
