// The demo shop's product definition as a graph. Nodes and edges are the real
// output of `prodshape graph --format json` (content/evidence/demo); the text
// shown on hover comes from the artifact Markdown under demo/docs/product/model.

import graph from '../../content/evidence/demo/product-graph.json'
import { COMMANDS } from '../field/system'

export type Kind =
  | 'actor' | 'journey' | 'use-case' | 'business-rule' | 'domain-term' | 'bounded-context'
  | 'functional-requirement' | 'quality-requirement' | 'constraint' | 'structured-behaviour'

export type Node = { id: string; type: Kind; title: string; digest: string; text: string; detail: string[]; x: number; y: number; layer: number }
export type Edge = { from: string; kind: string; to: string }

/** Token, colour and icon per kind. Icons are ProductShape's kind icons (PS src/packages/core/src/snapshot.ts, Apache-2.0), drawn on a 16px grid. */
export const kinds: Record<Kind, { token: string; color: string; hex: string; label: [string, string]; icon: string }> = {
  actor: { token: 'ACT', color: 'var(--k-actor)', hex: '#80a9ff', label: ['Actors', 'Actores'], icon: '<circle cx="8" cy="5" r="2.7"/><path d="M2.8 14c.5-3.1 2.6-4.7 5.2-4.7s4.7 1.6 5.2 4.7"/>' },
  journey: { token: 'JRN', color: 'var(--k-journey)', hex: '#ab8ffa', label: ['Journeys', 'Journeys'], icon: '<circle cx="3" cy="12.8" r="1.5"/><path d="M4.5 12.8h3.2a2.3 2.3 0 0 0 0-4.6H6.3a2.3 2.3 0 0 1 0-4.6h4.2"/><path d="M11.5 1.8v4.4M11.5 2h3l-.9 1.2.9 1.2h-3"/>' },
  'use-case': { token: 'UC', color: 'var(--k-use-case)', hex: '#4fcb8c', label: ['Use cases', 'Casos de uso'], icon: '<ellipse cx="8" cy="8" rx="6.3" ry="4.4"/><path d="M6.9 6.2v3.6L9.9 8z" fill="currentColor" stroke-width="1"/>' },
  'business-rule': { token: 'BR', color: 'var(--k-business-rule)', hex: '#f79c50', label: ['Business rules', 'Reglas de negocio'], icon: '<path d="M8 2.2v11.3M5 13.5h6M3.2 4.6h9.6M8 2.8l-4.8 1.8M8 2.8l4.8 1.8"/><path d="M3.2 4.8L1.5 9a1.8 1.8 0 0 0 3.4 0z"/><path d="M12.8 4.8L11.1 9a1.8 1.8 0 0 0 3.4 0z"/>' },
  'domain-term': { token: 'TERM', color: 'var(--k-domain-term)', hex: '#e3b544', label: ['Domain terms', 'Términos'], icon: '<path d="M2 3.4h4.2A1.8 1.8 0 0 1 8 5.2v8.3a1.6 1.6 0 0 0-1.6-1.4H2z"/><path d="M14 3.4H9.8A1.8 1.8 0 0 0 8 5.2v8.3a1.6 1.6 0 0 1 1.6-1.4H14z"/>' },
  'bounded-context': { token: 'BC', color: 'var(--k-bounded-context)', hex: '#43c4da', label: ['Bounded contexts', 'Bounded contexts'], icon: '<rect x="1.8" y="1.8" width="12.4" height="12.4" rx="2" stroke-dasharray="2.4 1.9"/><circle cx="8" cy="8" r="2"/>' },
  'functional-requirement': { token: 'FR', color: 'var(--k-functional-requirement)', hex: '#f27ec2', label: ['Functional', 'Funcionales'], icon: '<path d="M2 4.4l1.3 1.3L5.6 3.3M2 10.4l1.3 1.3 2.3-2.4M8 4.6h6M8 10.6h6"/>' },
  'quality-requirement': { token: 'QR', color: 'var(--k-quality-requirement)', hex: '#a9b2c5', label: ['Quality', 'Calidad'], icon: '<path d="M2.2 11.8a5.8 5.8 0 1 1 11.6 0"/><path d="M8 11.8l3-3.4"/><circle cx="8" cy="11.8" r="1" fill="currentColor"/><path d="M4.2 7.6l.8.6M8 5.4v1M11.8 7.6l-.8.6"/>' },
  constraint: { token: 'CON', color: 'var(--k-constraint)', hex: '#f7776c', label: ['Constraints', 'Restricciones'], icon: '<rect x="3" y="7" width="10" height="7.2" rx="1.3"/><path d="M5.3 7V5.1a2.7 2.7 0 0 1 5.4 0V7M8 9.8v1.6"/>' },
  'structured-behaviour': { token: 'SB', color: 'var(--k-structured-behaviour)', hex: '#a5d05a', label: ['Behaviour', 'Comportamiento'], icon: '<rect x="1.6" y="1.8" width="5" height="3.8" rx=".7"/><rect x="9.4" y="10.4" width="5" height="3.8" rx=".7"/><path d="M4.1 5.6v4.6a2 2 0 0 0 2 2h3.3M8 10.6l1.5 1.6L8 13.8"/>' },
}

/** The use cases in feature order: the six commands first, then the four queries, as in the code drawing. */
export const features = [
  'UC-ADD-TO-CART', 'UC-CHECKOUT', 'UC-PAY', 'UC-CANCEL-ORDER', 'UC-REQUEST-REFUND', 'UC-APPROVE-REFUND',
  'UC-BROWSE-CATALOG', 'UC-SEARCH-PRODUCTS', 'UC-TRACK-ORDER', 'UC-VIEW-ORDER-HISTORY',
]
if (features.length !== 10 || COMMANDS !== 6) throw new Error('features and the code drawing disagree')

// Columns of the drawing, left to right, as in PDaC-2: actors, journeys, use cases, rules and domain, requirements, behaviour.
const columns: Kind[][] = [['actor'], ['journey'], ['use-case'], ['business-rule', 'domain-term', 'bounded-context'], ['functional-requirement', 'quality-requirement', 'constraint'], ['structured-behaviour']]

/** The full-size drawing area on the sheet, in px. */
export const area = { x: 96, y: 262, w: 1728, h: 700 }
export const BOX = { w: 248, h: 50 }

const sources = import.meta.glob('../../demo/docs/product/model/**/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

// The first body section is the artifact's statement; structured behaviour also shows its given / when / then.
function read(markdown: string) {
  const [, front = '', body = ''] = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/) ?? []
  const id = front.match(/^id: (.+)$/m)?.[1] ?? ''
  const text = body.match(/^## .+\n\n([\s\S]*?)(?=\n## |\s*$)/m)?.[1].trim() ?? ''
  const detail: string[] = []
  for (const key of ['given', 'when', 'then']) {
    const inline = front.match(new RegExp(`^${key}: (.+)$`, 'm'))?.[1]
    if (inline) detail.push(`${key} ${inline}`)
    const list = front.match(new RegExp(`^${key}:\\n((?:  - .+\\n?)+)`, 'm'))?.[1]
    if (list) list.trim().split('\n').forEach(line => detail.push(`${key} ${line.replace(/^\s*- /, '')}`))
  }
  return { id, text, detail }
}

const texts = new Map(Object.values(sources).map(read).map(entry => [entry.id, entry]))

export const edges: Edge[] = graph.edges

const raw = graph.nodes.map(n => ({ id: n.id, type: n.type as Kind, title: n.title, digest: n.digest }))

function neighbours(id: string) {
  return edges.filter(e => e.from === id || e.to === id).map(e => (e.from === id ? e.to : e.from))
}

// Layout: one column per group of kinds. Use cases keep the feature order; every
// other column is sorted by the mean row of its neighbours, so edges cross less.
export const nodes: Node[] = (() => {
  const row = new Map<string, number>()
  features.forEach((id, k) => row.set(id, k / (features.length - 1)))
  const order = [2, 1, 0, 3, 4, 5]
  const placed: Node[] = []
  for (const c of order) {
    const members = raw.filter(n => columns[c].includes(n.type))
    const score = (id: string) => { const near = neighbours(id).filter(n => row.has(n)).map(n => row.get(n)!); return near.length ? near.reduce((a, b) => a + b, 0) / near.length : 0.5 }
    const sorted = c === 2 ? features.map(id => members.find(m => m.id === id)!) : [...members].sort((a, b) => columns[c].indexOf(a.type) - columns[c].indexOf(b.type) || score(a.id) - score(b.id))
    const pitch = Math.min(BOX.h + 20, area.h / sorted.length)
    const top = area.y + (area.h - pitch * sorted.length) / 2
    const x = area.x + (c * (area.w - BOX.w)) / (columns.length - 1)
    sorted.forEach((n, k) => {
      const y = top + k * pitch + (pitch - BOX.h) / 2
      row.set(n.id, (k + 0.5) / sorted.length)
      const t = texts.get(n.id)
      placed.push({ ...n, text: t?.text ?? '', detail: t?.detail ?? [], x, y, layer: Math.min(c, 4) })
    })
  }
  return placed
})()

export const byId = new Map(nodes.map(n => [n.id, n]))

export function related(id: string) {
  return new Set([id, ...neighbours(id)])
}

/** Where the full-size drawing lands when it zooms out to the left half of the sheet (product-code scene). */
export const compact = { x: 96, y: 300, scale: 0.47 }

export function toCompact(x: number, y: number) {
  return { x: compact.x + (x - area.x) * compact.scale, y: compact.y + (y - area.y) * compact.scale }
}
