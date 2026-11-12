// Constellation: a proof of concept for juangcarmona/productshape#312.
// One compiled product graph, three ways to look at it:
//   overview: one tile per artifact kind, each a compact grid of chips; hover lights the relations, click focuses
//   focus:    one artifact in the middle, its neighbours grouped by kind around it, the rest of the model faded behind
//   columns:  the deck's layout, one column per stage (actors, journeys, use cases, rules and domain, requirements, behaviour)
// Domain terms and use cases are grouped by their bounded context (each has exactly one in the ProductShape model).
// Drag to pan, wheel to zoom. Disposable: nothing here is part of the deck.
import data from './product-graph.json'

type Kind = 'actor' | 'journey' | 'use-case' | 'business-rule' | 'domain-term' | 'bounded-context' | 'functional-requirement' | 'quality-requirement' | 'constraint' | 'structured-behaviour'
type Mode = 'overview' | 'focus' | 'columns'
type Raw = { id: string; type: string; title: string; status: string; path: string; text?: string }
type Edge = { from: string; kind: string; to: string }
type Item = Raw & { type: Kind; col: number; x: number; y: number }
type Rect = { x: number; y: number; w: number; h: number }

// Token and icon per kind: ProductShape's kind icons (src/packages/core/src/snapshot.ts, Apache-2.0), on a 16px grid.
const KINDS: Record<Kind, { token: string; label: string; icon: string }> = {
  actor: { token: 'ACT', label: 'Actors', icon: '<circle cx="8" cy="5" r="2.7"/><path d="M2.8 14c.5-3.1 2.6-4.7 5.2-4.7s4.7 1.6 5.2 4.7"/>' },
  journey: { token: 'JRN', label: 'Journeys', icon: '<circle cx="3" cy="12.8" r="1.5"/><path d="M4.5 12.8h3.2a2.3 2.3 0 0 0 0-4.6H6.3a2.3 2.3 0 0 1 0-4.6h4.2"/><path d="M11.5 1.8v4.4M11.5 2h3l-.9 1.2.9 1.2h-3"/>' },
  'use-case': { token: 'UC', label: 'Use cases', icon: '<ellipse cx="8" cy="8" rx="6.3" ry="4.4"/><path d="M6.9 6.2v3.6L9.9 8z" fill="currentColor" stroke-width="1"/>' },
  'business-rule': { token: 'BR', label: 'Business rules', icon: '<path d="M8 2.2v11.3M5 13.5h6M3.2 4.6h9.6M8 2.8l-4.8 1.8M8 2.8l4.8 1.8"/><path d="M3.2 4.8L1.5 9a1.8 1.8 0 0 0 3.4 0z"/><path d="M12.8 4.8L11.1 9a1.8 1.8 0 0 0 3.4 0z"/>' },
  'domain-term': { token: 'TERM', label: 'Domain terms', icon: '<path d="M2 3.4h4.2A1.8 1.8 0 0 1 8 5.2v8.3a1.6 1.6 0 0 0-1.6-1.4H2z"/><path d="M14 3.4H9.8A1.8 1.8 0 0 0 8 5.2v8.3a1.6 1.6 0 0 1 1.6-1.4H14z"/>' },
  'bounded-context': { token: 'BC', label: 'Contexts', icon: '<rect x="1.8" y="1.8" width="12.4" height="12.4" rx="2" stroke-dasharray="2.4 1.9"/><circle cx="8" cy="8" r="2"/>' },
  'functional-requirement': { token: 'FR', label: 'Functional', icon: '<path d="M2 4.4l1.3 1.3L5.6 3.3M2 10.4l1.3 1.3 2.3-2.4M8 4.6h6M8 10.6h6"/>' },
  'quality-requirement': { token: 'QR', label: 'Quality', icon: '<path d="M2.2 11.8a5.8 5.8 0 1 1 11.6 0"/><path d="M8 11.8l3-3.4"/><circle cx="8" cy="11.8" r="1" fill="currentColor"/><path d="M4.2 7.6l.8.6M8 5.4v1M11.8 7.6l-.8.6"/>' },
  constraint: { token: 'CON', label: 'Constraints', icon: '<rect x="3" y="7" width="10" height="7.2" rx="1.3"/><path d="M5.3 7V5.1a2.7 2.7 0 0 1 5.4 0V7M8 9.8v1.6"/>' },
  'structured-behaviour': { token: 'SB', label: 'Behaviour', icon: '<rect x="1.6" y="1.8" width="5" height="3.8" rx=".7"/><rect x="9.4" y="10.4" width="5" height="3.8" rx=".7"/><path d="M4.1 5.6v4.6a2 2 0 0 0 2 2h3.3M8 10.6l1.5 1.6L8 13.8"/>' },
}
// The deck's columns, left to right. The focus view also uses their order to put a neighbour on the left or the right.
const COLUMNS: { label: string; kinds: Kind[] }[] = [
  { label: 'Actors', kinds: ['actor'] },
  { label: 'Journeys', kinds: ['journey'] },
  { label: 'Use cases', kinds: ['use-case'] },
  { label: 'Bounded contexts', kinds: ['bounded-context'] },
  { label: 'Business rules', kinds: ['business-rule'] },
  { label: 'Domain terms', kinds: ['domain-term'] },
  { label: 'Functional', kinds: ['functional-requirement'] },
  { label: 'Quality', kinds: ['quality-requirement'] },
  { label: 'Constraints', kinds: ['constraint'] },
  { label: 'Behaviour', kinds: ['structured-behaviour'] },
]
const KIND_ORDER = COLUMNS.flatMap(c => c.kinds)
const colOf = (k: Kind) => COLUMNS.findIndex(c => c.kinds.includes(k))
const cssColor = (k: Kind) => `var(--k-${k})`
const REPO = `https://github.com/${data.source}/blob/${data.revision}/`
const params = new URLSearchParams(location.search)
const synthetic = Number(params.get('synthetic') || 0)

// ---- data ----
function seeded(seed: number) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }
function synth(n: number): { nodes: Raw[]; edges: Edge[] } {
  const r = seeded(17), nodes: Raw[] = [], edges: Edge[] = []
  for (let i = 0; i < n; i++) {
    nodes.push({ id: `SYN-${String(i).padStart(4, '0')}`, type: KIND_ORDER[Math.floor(Math.pow(r(), 1.5) * KIND_ORDER.length)], title: 'Synthetic artifact', status: 'active', path: '' })
    if (i) for (let j = 0; j < 2; j++) edges.push({ from: nodes[i].id, kind: 'derived-from', to: nodes[Math.floor(r() * i)].id })
  }
  return { nodes, edges }
}
const graph = synthetic ? synth(synthetic) : { nodes: data.nodes as Raw[], edges: data.edges as Edge[] }
const items: Item[] = graph.nodes.map(n => ({ ...n, type: n.type as Kind, col: colOf(n.type as Kind), x: 0, y: 0 }))
const byId = new Map(items.map(i => [i.id, i]))
const edges = graph.edges.filter(e => byId.has(e.from) && byId.has(e.to))
const nbrs = new Map<string, Set<string>>(items.map(i => [i.id, new Set<string>()]))
edges.forEach(e => { nbrs.get(e.from)!.add(e.to); nbrs.get(e.to)!.add(e.from) })
const touching = (id: string) => edges.filter(e => e.from === id || e.to === id)
// A domain term is defined in exactly one bounded context, and so is a use case (checked on the ProductShape model: 11 of 11, 17 of 17).
const bcOf = new Map<string, string>()
edges.forEach(e => { if (e.kind === 'defined-in' || e.kind === 'bounded-context') bcOf.set(e.from, e.to) })
const bcName = (id: string) => (bcOf.get(id) ?? '').replace(/^BC-/, '')

// Inside each kind, artifacts group by bounded context, then sort by the mean row of their neighbours (a few sweeps, no clock).
const groupKinds = (c: number) => COLUMNS[c].kinds.filter(k => items.some(i => i.type === k))
const order = new Map<Kind, Item[]>()
COLUMNS.forEach((_, c) => groupKinds(c).forEach(k => order.set(k, items.filter(i => i.type === k).sort((a, b) => (bcName(a.id) < bcName(b.id) ? -1 : bcName(a.id) > bcName(b.id) ? 1 : a.id < b.id ? -1 : 1)))))
function rowOf() {
  const row = new Map<string, number>()
  COLUMNS.forEach((_, c) => { const list = groupKinds(c).flatMap(k => order.get(k)!); list.forEach((m, k) => row.set(m.id, (k + 0.5) / list.length)) })
  return row
}
for (let pass = 0; pass < 8; pass++) {
  const row = rowOf()
  for (const c of pass % 2 ? COLUMNS.map((_, i) => COLUMNS.length - 1 - i) : COLUMNS.map((_, i) => i)) groupKinds(c).forEach(kind => {
    const key = new Map(order.get(kind)!.map(m => {
      const near = [...nbrs.get(m.id)!].filter(id => byId.get(id)!.col !== c).map(id => row.get(id)!)
      return [m.id, near.length ? near.reduce((a, b) => a + b, 0) / near.length : row.get(m.id)!] as const
    }))
    order.get(kind)!.sort((a, b) => (bcName(a.id) < bcName(b.id) ? -1 : bcName(a.id) > bcName(b.id) ? 1 : key.get(a.id)! - key.get(b.id)! || (a.id < b.id ? -1 : 1)))
  })
}
/** Consecutive artifacts of one kind that share a bounded context (one block when the kind has none). */
function blocksOf(k: Kind) {
  const out: { bc: string; list: Item[] }[] = []
  order.get(k)!.forEach(m => { const bc = bcName(m.id), last = out[out.length - 1]; if (last && last.bc === bc) last.list.push(m); else out.push({ bc, list: [m] }) })
  return out
}

// ---- shared DOM ----
const NS = 'http://www.w3.org/2000/svg'
const view = document.getElementById('view')!
const plane = document.getElementById('plane')!
const panel = document.getElementById('panel')!
const trailEl = document.getElementById('trail')!
const iconSvg = (k: Kind) => `<svg class="kind-icon" viewBox="0 0 16 16" aria-hidden="true">${KINDS[k].icon}</svg>`
const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)
const short = (id: string) => { const s = id.replace(/^[A-Z]+-/, '').replace(/-001$/, ''); return s.length > 11 ? s.slice(0, 10) + '…' : s }
function button(cls: string, rect: Rect, kind: Kind, html: string, label: string) {
  const b = document.createElement('button'); b.type = 'button'; b.className = cls
  b.style.cssText = `left:${rect.x}px;top:${rect.y}px;width:${rect.w}px;height:${rect.h}px;--c:${cssColor(kind)}`
  b.innerHTML = html; b.setAttribute('aria-label', label)
  return b
}
function label(x: number, y: number, text: string) {
  const d = document.createElement('div'); d.className = 'bc-label'; d.style.cssText = `left:${x}px;top:${y}px`; d.textContent = text; plane.appendChild(d)
}
function curve(a: Rect, b: Rect) {
  const [from, to] = a.x <= b.x ? [a, b] : [b, a]
  const x1 = from.x + from.w, y1 = from.y + from.h / 2, x2 = to.x, y2 = to.y + to.h / 2
  if (from.x === to.x) return `M${x1} ${y1} C${x1 + 70} ${y1}, ${x1 + 70} ${y2}, ${x1} ${y2}`
  const mid = (x1 + x2) / 2
  return `M${x1} ${y1} C${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`
}
function newSvg(w: number, h: number) {
  const s = document.createElementNS(NS, 'svg'); s.id = 'edges'; s.setAttribute('width', String(w)); s.setAttribute('height', String(h)); s.setAttribute('aria-hidden', 'true')
  plane.appendChild(s); return s
}
function path(svg: SVGSVGElement, d: string, kind: Kind) {
  const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.style.setProperty('--c', cssColor(kind)); svg.appendChild(p); return p
}

// ---- state ----
let mode: Mode = 'overview'
let focusId: string | null = null, lastFocus: string | null = null
let hover: string | null = null, pinned: string | null = null
let dragging = false, dragged = false
const trail: string[] = []
const cam = { x: 0, y: 0, k: 1 }
function apply() { plane.style.transform = `translate(${cam.x}px, ${cam.y}px) scale(${cam.k})` }
function setCam(target: { x: number; y: number; k: number }, animate: boolean) {
  if (animate) { // start a little zoomed out around the centre of the window, then ease in
    const cx = innerWidth / 2, cy = innerHeight / 2, s = 0.85
    plane.classList.remove('smooth'); cam.k = target.k * s; cam.x = cx - (cx - target.x) * s; cam.y = cy - (cy - target.y) * s; apply()
    void plane.offsetWidth
    plane.classList.add('smooth'); setTimeout(() => plane.classList.remove('smooth'), 520)
  }
  cam.k = target.k; cam.x = target.x; cam.y = target.y; apply()
}
function fit(w: number, h: number, maxK: number) {
  const availW = innerWidth - 60, availH = innerHeight - 118
  const k = Math.min(maxK, availW / w, availH / h)
  return { k, x: (innerWidth - w * k) / 2, y: 78 + (availH - h * k) / 2 }
}
function zoomAt(px: number, py: number, factor: number) {
  const wx = (px - cam.x) / cam.k, wy = (py - cam.y) / cam.k
  cam.k = Math.max(0.2, Math.min(3, cam.k * factor)); cam.x = px - wx * cam.k; cam.y = py - wy * cam.k; apply()
}

// ---- panel (the hovered artifact, or the focused one) ----
function showPanel(id: string | null, clickable: boolean) {
  if (!id) { panel.style.display = 'none'; return }
  const m = byId.get(id)!
  const mine = touching(id)
  const rel = mine.slice(0, 14).map(e => e.from === id ? `<li><button data-id="${esc(e.to)}">${esc(e.kind)} → ${esc(e.to)}</button></li>` : `<li><button data-id="${esc(e.from)}">${esc(e.from)} → ${esc(e.kind)}</button></li>`).join('')
  panel.style.setProperty('--c', cssColor(m.type))
  panel.innerHTML = `<header>${iconSvg(m.type)}<span>${KINDS[m.type].token}</span><code>${esc(m.id)}</code>${mode === 'columns' && clickable ? `<button class="go" data-id="${esc(m.id)}">Focus ›</button>` : ''}</header><strong>${esc(m.title)}</strong>${m.text ? `<p>${esc(m.text)}</p>` : ''}${m.path ? `<a href="${REPO}${m.path}" target="_blank" rel="noreferrer">${esc(m.path)}</a>` : ''}<ul>${rel}${mine.length > 14 ? `<li>… and ${mine.length - 14} more</li>` : ''}</ul>`
  panel.style.pointerEvents = clickable ? 'auto' : 'none'
  panel.style.display = 'block'
  panel.querySelectorAll('button').forEach(b => b.addEventListener('click', () => navigate((b as HTMLElement).dataset.id!)))
}

// ============ overview: one tile per kind ============
const TILE_ROWS: Kind[][] = [['actor', 'journey', 'use-case', 'structured-behaviour'], ['business-rule', 'domain-term', 'bounded-context', 'quality-requirement'], ['functional-requirement', 'constraint']]
const TILE_COLS: Record<Kind, number> = { actor: 2, journey: 1, 'use-case': 4, 'structured-behaviour': 2, 'business-rule': 2, 'domain-term': 3, 'bounded-context': 2, 'quality-requirement': 2, 'functional-requirement': 6, constraint: 2 }
const CHIP = { w: 92, h: 30, px: 98, py: 36, bc: 18 }
const chipEls = new Map<string, HTMLElement>(), chipRect = new Map<string, Rect>()
let ovSvg: SVGSVGElement

function renderOverview() {
  chipEls.clear(); chipRect.clear()
  let y = 8, maxW = 0
  const tiles: { kind: Kind; x: number; y: number; w: number; h: number }[] = []
  const labels: { x: number; y: number; text: string }[] = []
  TILE_ROWS.forEach(row => {
    const kinds = row.filter(k => order.get(k)?.length)
    const dims = kinds.map(k => {
      const n = order.get(k)!.length, cols = synthetic ? Math.max(TILE_COLS[k], Math.ceil(Math.sqrt(n * 1.6))) : TILE_COLS[k]
      const blocks = blocksOf(k), withBc = blocks.some(b => b.bc)
      return { kind: k, cols, blocks, withBc, h: 36 + blocks.reduce((s, b) => s + (withBc ? CHIP.bc : 0) + Math.ceil(b.list.length / cols) * CHIP.py, 0) }
    })
    const h = Math.max(...dims.map(d => d.h))
    let x = 8
    dims.forEach(d => {
      const w = d.cols * CHIP.px + 8; tiles.push({ kind: d.kind, x, y, w, h })
      let cy = y + 32
      d.blocks.forEach(b => {
        if (d.withBc) { labels.push({ x: x + 10, y: cy, text: b.bc.toLowerCase() }); cy += CHIP.bc }
        b.list.forEach((m, i) => chipRect.set(m.id, { x: x + 8 + (i % d.cols) * CHIP.px, y: cy + Math.floor(i / d.cols) * CHIP.py, w: CHIP.w, h: CHIP.h }))
        cy += Math.ceil(b.list.length / d.cols) * CHIP.py
      })
      x += w + 14
    })
    maxW = Math.max(maxW, x); y += h + 18
  })
  ovSvg = newSvg(maxW, y)
  tiles.forEach(t => {
    const d = document.createElement('div'); d.className = 'tile'; d.style.cssText = `left:${t.x}px;top:${t.y}px;width:${t.w}px;height:${t.h}px;--c:${cssColor(t.kind)}`
    d.innerHTML = `<span class="tile-h">${esc(KINDS[t.kind].label)} · ${order.get(t.kind)!.length}</span>`
    plane.appendChild(d)
  })
  labels.forEach(l => label(l.x, l.y, l.text))
  items.forEach(m => {
    const b = button('chip', chipRect.get(m.id)!, m.type, esc(short(m.id)), `${m.id} · ${m.title}`)
    b.title = `${m.id} · ${m.title}`
    b.addEventListener('pointerenter', () => { if (!dragging) { hover = m.id; refresh() } })
    b.addEventListener('pointerleave', () => { if (hover === m.id) { hover = null; refresh() } })
    b.addEventListener('focus', () => { hover = m.id; refresh() })
    b.addEventListener('blur', () => { if (hover === m.id) { hover = null; refresh() } })
    b.addEventListener('click', () => { if (!dragged) navigate(m.id) })
    plane.appendChild(b); chipEls.set(m.id, b)
  })
  return fit(maxW, y, 2.2)
}
function refreshOverview() {
  const near = hover ? new Set([hover, ...nbrs.get(hover)!]) : null
  view.classList.toggle('focus', !!near)
  chipEls.forEach((el, id) => { el.classList.toggle('lit', !!near && near.has(id)); el.classList.toggle('faded', !!near && !near.has(id)) })
  ovSvg.replaceChildren()
  if (hover) touching(hover).forEach(e => path(ovSvg, curve(chipRect.get(e.from)!, chipRect.get(e.to)!), byId.get(e.from)!.type).classList.add('lit'))
  showPanel(hover, false)
}

// ============ focus: one artifact, its neighbours around it ============
const BOX = { w: 230, h: 66, gap: 8, head: 26, groupGap: 16 }
const CENTER = { w: 260, h: 96 }
const fcollapsed = new Set<Kind>()
let fSvg: SVGSVGElement
const fBoxes = new Map<string, HTMLElement>(), fEdges = new Map<string, SVGPathElement>()
type Rel = { other: Item; label: string }

function relsOf(id: string): Rel[] {
  const by = new Map<string, string[]>()
  touching(id).forEach(e => { const out = e.from === id, other = out ? e.to : e.from; const l = out ? `${e.kind} →` : `← ${e.kind}`; by.set(other, [...(by.get(other) ?? []), l]) })
  return [...by].map(([other, labels]) => ({ other: byId.get(other)!, label: [...new Set(labels)].join(', ') }))
}

function renderFocus(id: string) {
  fBoxes.clear(); fEdges.clear()
  const c = byId.get(id)!, rels = relsOf(id)
  const side = (r: Rel) => (r.other.col < c.col ? 'left' : 'right')
  const stacks = (s: 'left' | 'right') => KIND_ORDER.map(kind => ({ kind, list: rels.filter(r => side(r) === s && r.other.type === kind) })).filter(g => g.list.length)
  const left = stacks('left'), right = stacks('right')
  const height = (gs: typeof left) => gs.reduce((h, g) => h + BOX.head + 6 + (fcollapsed.has(g.kind) ? 0 : g.list.length * (BOX.h + BOX.gap)) + BOX.groupGap, 0) - (gs.length ? BOX.groupGap : 0)
  const H = Math.max(height(left), height(right), CENTER.h + 40)
  const LX = 0, CX = BOX.w + 150, RX = CX + CENTER.w + 150, W = RX + BOX.w
  fSvg = newSvg(W, H)
  const cRect = { x: CX, y: (H - CENTER.h) / 2, w: CENTER.w, h: CENTER.h }
  const placed: { rel: Rel; rect: Rect; side: 'left' | 'right'; box: boolean }[] = []
  ;([['left', left, LX], ['right', right, RX]] as const).forEach(([s, groups, x]) => {
    let y = (H - height(groups)) / 2
    groups.forEach(g => {
      const hr = { x, y, w: BOX.w, h: BOX.head }
      const head = button(`group ${fcollapsed.has(g.kind) ? 'collapsed' : ''}`, hr, g.kind, `${fcollapsed.has(g.kind) ? '▸' : '▾'} ${esc(KINDS[g.kind].label)}<span class="n">${g.list.length}</span>`, KINDS[g.kind].label)
      head.setAttribute('aria-expanded', String(!fcollapsed.has(g.kind)))
      head.addEventListener('click', () => { if (fcollapsed.has(g.kind)) fcollapsed.delete(g.kind); else fcollapsed.add(g.kind); const keep = { ...cam }; draw(false); cam.x = keep.x; cam.y = keep.y; cam.k = keep.k; apply() })
      plane.appendChild(head)
      y += BOX.head + 6
      g.list.forEach(r => {
        if (fcollapsed.has(g.kind)) { placed.push({ rel: r, rect: hr, side: s, box: false }); return }
        placed.push({ rel: r, rect: { x, y, w: BOX.w, h: BOX.h }, side: s, box: true }); y += BOX.h + BOX.gap
      })
      y += BOX.groupGap
    })
  })
  // edges first, so the boxes sit on top
  placed.forEach(p => {
    const a = p.side === 'left' ? p.rect : cRect, b = p.side === 'left' ? cRect : p.rect
    fEdges.set(p.rel.other.id, path(fSvg, curve(a, b), p.rel.other.type))
  })
  // the rest of the model, faded behind, around the content (deterministic positions)
  const around = new Set([id, ...rels.map(r => r.other.id)])
  const rnd = seeded(7)
  items.filter(m => !around.has(m.id)).forEach(m => {
    for (let t = 0; t < 12; t++) {
      const x = -420 + rnd() * (W + 840), y = -320 + rnd() * (H + 640)
      if (x > -50 && x < W + 50 && y > -50 && y < H + 50) continue
      const b = button('dot', { x, y, w: 22, h: 12 }, m.type, '', `${m.id} · ${m.title}`); b.title = `${m.id} · ${m.title}`
      b.addEventListener('click', () => { if (!dragged) navigate(m.id) }); plane.appendChild(b); break
    }
  })
  // neighbours as boxes, then the artifact itself
  placed.filter(p => p.box).forEach(p => {
    const o = p.rel.other, more = nbrs.get(o.id)!.size - 1
    const b = button('box', p.rect, o.type, `${iconSvg(o.type)}<span class="box-id">${esc(o.id)}</span><span class="box-title">${esc(o.title)}</span><span class="rel">${esc(p.rel.label)}</span>${more > 0 ? `<span class="more">+${more}</span>` : ''}`, `${o.id} · ${o.title}`)
    b.addEventListener('pointerenter', () => { if (!dragging) { hover = o.id; refresh() } })
    b.addEventListener('pointerleave', () => { if (hover === o.id) { hover = null; refresh() } })
    b.addEventListener('focus', () => { hover = o.id; refresh() })
    b.addEventListener('blur', () => { if (hover === o.id) { hover = null; refresh() } })
    b.addEventListener('click', () => { if (!dragged) navigate(o.id) })
    plane.appendChild(b); fBoxes.set(o.id, b)
  })
  const cb = button('box center', cRect, c.type, `${iconSvg(c.type)}<span class="box-id">${esc(c.id)}</span><span class="box-title">${esc(c.title)}</span>`, `${c.id} · ${c.title} (focused)`)
  plane.appendChild(cb); fBoxes.set(c.id, cb)
  return fit(W, H, 1.3)
}
function refreshFocus() {
  const id = focusId!
  const near = hover ? new Set([hover, id]) : null
  view.classList.toggle('focus', !!near)
  fBoxes.forEach((el, k) => { el.classList.toggle('lit', !!near && near.has(k)); el.classList.toggle('faded', !!near && !near.has(k)) })
  fEdges.forEach((p, k) => p.classList.toggle('lit', hover === k))
  showPanel(hover ?? id, hover === null)
}

// ============ columns: one column per kind, left to right ============
const BX = { w: 250, h: 50 }, PITCH = 62, COL_PITCH = 340, LEFT = 40, TOP = 76
const bcLabels: { x: number; y: number; text: string }[] = []
const boxEls = new Map<string, HTMLElement>(), edgeEls: SVGPathElement[] = []
let planeH = 0

function place() {
  bcLabels.length = 0; planeH = 0
  COLUMNS.forEach((_, c) => {
    let y = TOP
    groupKinds(c).forEach(kind => {
      const blocks = blocksOf(kind), withBc = blocks.some(b => b.bc)
      blocks.forEach(b => {
        if (withBc) { bcLabels.push({ x: LEFT + c * COL_PITCH + 4, y, text: b.bc.toLowerCase() }); y += 18 }
        b.list.forEach(m => { m.x = LEFT + c * COL_PITCH; m.y = y; y += PITCH })
      })
    })
    planeH = Math.max(planeH, y)
  })
}
const anchor = (m: Item): Rect => ({ x: m.x, y: m.y, w: BX.w, h: BX.h })

function renderColumns() {
  place(); boxEls.clear(); edgeEls.length = 0
  const svg = newSvg(LEFT * 2 + COLUMNS.length * COL_PITCH, planeH + 40)
  edges.forEach(e => { const a = byId.get(e.from)!, b = byId.get(e.to)!; edgeEls.push(path(svg, curve(anchor(a), anchor(b)), a.type)) })
  COLUMNS.forEach((c, k) => { const l = document.createElement('div'); l.className = 'col-label'; l.style.left = LEFT + k * COL_PITCH + 'px'; l.style.top = '40px'; l.style.color = cssColor(c.kinds[0]); l.textContent = `${c.label} · ${order.get(c.kinds[0])?.length ?? 0}`; plane.appendChild(l) })
  bcLabels.forEach(l => label(l.x, l.y, l.text))
  items.forEach(m => {
    const b = button('box', { x: m.x, y: m.y, w: BX.w, h: BX.h }, m.type, `${iconSvg(m.type)}<span class="box-id">${esc(m.id)}</span><span class="box-title">${esc(m.title)}</span>`, `${m.id} · ${m.title}`)
    b.addEventListener('pointerenter', () => { if (!dragging) { hover = m.id; refresh() } })
    b.addEventListener('pointerleave', () => { if (hover === m.id) { hover = null; refresh() } })
    b.addEventListener('focus', () => { hover = m.id; refresh() })
    b.addEventListener('blur', () => { if (hover === m.id) { hover = null; refresh() } })
    b.addEventListener('click', () => { if (dragged) return; pinned = pinned === m.id ? null : m.id; refresh() })
    b.addEventListener('dblclick', () => { if (!dragged) { pinned = m.id; navigate(m.id) } })
    plane.appendChild(b); boxEls.set(m.id, b)
  })
  return { k: Math.min(1, Math.max(0.5, innerWidth / (LEFT * 2 + COLUMNS.length * COL_PITCH))), x: 0, y: 40 }
}
function refreshColumns() {
  const active = hover ?? pinned
  const near = active ? new Set([active, ...nbrs.get(active)!]) : null
  view.classList.toggle('focus', !!active)
  boxEls.forEach((el, id) => { el.classList.toggle('lit', !!near && near.has(id)); el.classList.toggle('faded', !!near && !near.has(id)); el.classList.toggle('pinned', pinned === id) })
  edges.forEach((e, k) => edgeEls[k]?.classList.toggle('lit', !!active && (e.from === active || e.to === active)))
  showPanel(active, pinned === active && hover === null)
}

// ============ routing and chrome ============
function refresh() { if (mode === 'overview') refreshOverview(); else if (mode === 'focus') refreshFocus(); else refreshColumns() }
function draw(animate: boolean) {
  plane.replaceChildren(); hover = null
  view.className = `m-${mode}`
  let target
  if (mode === 'overview') target = renderOverview()
  else if (mode === 'focus') target = renderFocus(focusId!)
  else target = renderColumns()
  if (animate) plane.querySelectorAll('.box, .chip, .tile, .group, .dot, .col-label, .bc-label, svg').forEach(el => el.classList.add('fade-in'))
  setCam(target, animate)
  document.querySelectorAll<HTMLElement>('#modes button').forEach(b => b.classList.toggle('on', b.dataset.mode === mode))
  trailEl.replaceChildren()
  if (mode === 'focus') {
    const back = document.createElement('button'); back.textContent = '‹ Overview'; back.addEventListener('click', () => navigate('overview')); trailEl.appendChild(back)
    trail.slice(-5).forEach((id, k, list) => {
      const sep = document.createElement('span'); sep.textContent = '›'; trailEl.appendChild(sep)
      if (k === list.length - 1) { const cur = document.createElement('span'); cur.style.color = 'var(--ink)'; cur.textContent = id; trailEl.appendChild(cur) }
      else { const b = document.createElement('button'); b.textContent = id; b.addEventListener('click', () => navigate(id)); trailEl.appendChild(b) }
    })
  }
  refresh()
}
function route() {
  const h = decodeURIComponent(location.hash.slice(1))
  if (h === 'columns') mode = 'columns'
  else if (h && byId.has(h)) {
    mode = 'focus'
    if (h !== focusId) { fcollapsed.clear(); if (trail[trail.length - 1] !== h) trail.push(h) }
    focusId = lastFocus = h
  } else mode = 'overview'
  draw(true)
}
function navigate(h: string) { if (location.hash.slice(1) === h) route(); else location.hash = h }
addEventListener('hashchange', route)

document.querySelectorAll<HTMLElement>('#modes button').forEach(b => b.addEventListener('click', () => {
  const m = b.dataset.mode
  navigate(m === 'focus' ? (pinned ?? lastFocus ?? order.get('actor')?.[0]?.id ?? items[0].id) : m!)
}))
const search = document.getElementById('search') as HTMLInputElement
document.getElementById('ids')!.innerHTML = items.slice(0, 400).map(i => `<option value="${esc(i.id)}">${esc(i.title)}</option>`).join('')
search.addEventListener('change', () => { const id = search.value.trim().toUpperCase(); if (byId.has(id)) { navigate(id); search.blur() } })

view.addEventListener('pointerdown', e => {
  if (e.button !== 0) return
  const start = { x: e.clientX, y: e.clientY }
  let last = { ...start }
  dragging = true; dragged = false
  const move = (ev: PointerEvent) => {
    if (!dragged && Math.hypot(ev.clientX - start.x, ev.clientY - start.y) < 5) return
    dragged = true; view.classList.add('drag'); cam.x += ev.clientX - last.x; cam.y += ev.clientY - last.y; last = { x: ev.clientX, y: ev.clientY }; apply()
  }
  const up = () => { dragging = false; view.classList.remove('drag'); removeEventListener('pointermove', move); removeEventListener('pointerup', up); setTimeout(() => { dragged = false }, 0) }
  addEventListener('pointermove', move); addEventListener('pointerup', up)
})
view.addEventListener('wheel', e => { e.preventDefault(); plane.classList.remove('smooth'); zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.0015)) }, { passive: false })
view.addEventListener('click', e => { if (!dragged && mode === 'columns' && (e.target === view || e.target === plane || (e.target as Element).tagName === 'svg')) { pinned = null; refresh() } })
addEventListener('keydown', e => {
  if (e.key === 'f' && mode === 'columns' && (hover ?? pinned) && !(document.activeElement instanceof HTMLInputElement)) { navigate((hover ?? pinned)!); return }
  if (e.key !== 'Escape') return
  if (mode === 'focus') navigate('overview')
  else if (mode === 'columns') { pinned = null; hover = null; refresh() }
  ;(document.activeElement as HTMLElement)?.blur()
})

document.getElementById('stat')!.textContent = `${items.length} artifacts · ${edges.length} edges · ${synthetic ? 'synthetic' : `${data.source}@${data.revision}`}`
route()
