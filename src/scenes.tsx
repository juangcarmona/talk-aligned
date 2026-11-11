import { useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { At, Kind, Person, StepContext, Term } from './components'
import { agentBall, citeMap, form, groupMask, POINTS, TWO_GROUP, twoDiscs, KNOWLEDGE_GROUP, lifecycleNeon, e2eGroups, e2eMask, e2eRegions, lowStages, validationArc, shapes, smallShape, sources, specCards, stages, target, type FormName } from './field/forms'
import { DISTANCE, highlightPoints } from './field/GlyphField'
import { AFTER_STEPS, iterationOf, sliceStep } from './field/system'
import { KindIcon, ProductGraph } from './graph/ProductGraph'
import { BOX, area, byId, features } from './graph/model'
import type { T } from './i18n'
import { QrCode } from './QrCode'

// The scene list mirrors content/outline.md. Wording on screen comes from the
// sources named there; headings are new wording proposed for Juan.

export type Scene = {
  id: string
  act: 0 | 1 | 2 | 3 | 4 | 5
  title: [en: string, es: string]
  steps: number
  layout: 'left' | 'center' | 'full'
  form: (step: number) => FormName
  content: (t: T) => ReactNode
}

export const acts: [string, string][] = [['', ''], ['I · Why', 'I · Por qué'], ['II · The turn', 'II · El giro'], ['III · How', 'III · Cómo'], ['IV · Verify', 'IV · Verificar'], ['V · Closing', 'V · Cierre']]

const stageNames: [string, string][] = [['Problem', 'Problema'], ['Ideation', 'Ideación'], ['Product', 'Producto'], ['Functional Backlog', 'Backlog funcional'], ['Architecture', 'Arquitectura'], ['Design', 'Diseño'], ['Development', 'Desarrollo'], ['DevOps', 'DevOps'], ['Operations', 'Operaciones'], ['SRE', 'SRE'], ['Maintenance', 'Mantenimiento']]
const sourceNames = ['Stakeholders', 'Customers', 'Product Owner', 'Developers', 'Jira', 'Meeting Notes', 'Slack', 'Docs & Wiki', 'Source Code']
// Who passes knowledge to whom on the fragments sheet. The verbs are illustrative **[proposal]**.
const relations: { from: number; to: number; en: string; es: string; dashed?: boolean; below?: boolean }[] = [
  { from: 0, to: 2, en: 'ask for', es: 'piden' },
  { from: 1, to: 2, en: 'give feedback', es: 'opinan', below: true },
  { from: 2, to: 3, en: 'refines with', es: 'refina con' },
  { from: 2, to: 4, en: 'writes in', es: 'escribe en' },
  { from: 2, to: 5, en: 'agrees in', es: 'acuerda en', below: true },
  { from: 3, to: 6, en: 'discuss in', es: 'discuten en' },
  { from: 3, to: 7, en: 'sometimes', es: 'a veces', dashed: true },
  { from: 3, to: 8, en: 'implement', es: 'implementan', below: true },
]
/** A line between two source labels, from edge to edge, with the middle where its verb goes. */
function relationLine(from: number, to: number, below = false) {
  const a = sources[from], b = sources[to]
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len
  const reach = (k: number) => Math.min((sourceNames[k].length * 14.4 + 30) / 2 / Math.max(Math.abs(ux), 1e-6), 22 / Math.max(Math.abs(uy), 1e-6)) + 14
  const x1 = a.x + ux * reach(from), y1 = a.y + uy * reach(from), x2 = b.x - ux * reach(to), y2 = b.y - uy * reach(to)
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, vertical = Math.abs(ux) < 0.2
  // The verb sits beside the line, on the upper side, never on it.
  let nx = -uy, ny = ux
  if (ny > 0 !== below) { nx = -nx; ny = -ny }
  return { x1, y1, x2, y2, vertical, lx: vertical ? mx + 18 : mx + nx * 28, ly: vertical ? my : my + ny * 28 }
}
const columnNames: [string, string][] = [['Actors', 'Actores'], ['Journeys', 'Journeys'], ['Use cases', 'Casos de uso'], ['Rules and domain', 'Reglas y dominio'], ['Requirements', 'Requisitos'], ['Behaviour', 'Comportamiento']]

// After: the architecture tickets first, each one laying a layer that every slice will stand on.
const architecture: [string, string][] = [
  ['Infrastructure: data, CI/CD', 'Infraestructura: datos, CI/CD'],
  ['Domain model (DDD)', 'Modelo de dominio (DDD)'],
  ['Cross-cutting: logs, validation', 'Cross-cutting: logs, validación'],
  ['Authentication & authorization', 'Autenticación y autorización'],
]

/** The backlog beside the before and after drawings: each step takes the next tickets. Before, earlier tickets get reopened; after, they stay done. */
function Backlog({ t, after }: { t: T; after: boolean }) {
  const step = useContext(StepContext)
  const last = after ? AFTER_STEPS : 5
  const tickets = after
    ? [...architecture.map((label, k) => ({ title: t(...label), at: k + 1, arch: true })), ...features.map((id, f) => ({ title: byId.get(id)!.title, at: sliceStep[f], arch: false }))]
    : features.map((id, f) => ({ title: byId.get(id)!.title, at: iterationOf[f], arch: false }))
  return <ol className={`backlog ${after ? 'long' : ''}`} aria-label={t('Backlog', 'Backlog')}>
    <li className="backlog-title">{t('Backlog', 'Backlog')}</li>
    {tickets.map(({ title, at, arch }, k) => {
      const state = step > last ? (after ? 'done' : 'reopened') : at === step ? 'current' : at < step ? (after ? 'done' : 'reopened') : 'pending'
      return <li key={title} className={`${state} ${arch ? 'arch' : ''} ${after && k === architecture.length ? 'first-slice' : ''}`}><span className="ticket-id">#{101 + k}</span>{title}<i aria-hidden="true">{state === 'done' ? '✓' : state === 'reopened' ? '↺' : ''}</i></li>
    })}
  </ol>
}

/** What one thing leads to, as boxes joined by arrows over the dimmed drawing. */
function Chain({ at, links, tone }: { at: number; links: string[]; tone: 'good' | 'bad' }) {
  return <At at={at} className={`chain ${tone}`}>{links.map((w, k) => <span key={w} className="link" style={{ '--k': k } as CSSProperties}>{k > 0 && <i aria-hidden="true">→</i>}<b>{w}</b></span>)}</At>
}

// A warning sign that is also a cycle, like the recycling symbol: three alarms at the corners of a
// triangle, chasing each other clockwise around it. The same sign closes `before` and opens
// `not-truth`, where its corners change from the symptoms to their causes.
const tri = { w: 820, h: 700, top: [410, 92], right: [730, 640], left: [90, 640] } as const
// Each arrow runs inside the triangle, parallel to its side and pulled towards the centre.
const centre = [(tri.top[0] + tri.right[0] + tri.left[0]) / 3, (tri.top[1] + tri.right[1] + tri.left[1]) / 3]
function edge(a: readonly number[], b: readonly number[], from = 0.26, to = 0.74, inset = 0.2) {
  const p = (u: number) => { const x = a[0] + (b[0] - a[0]) * u, y = a[1] + (b[1] - a[1]) * u; return [x + (centre[0] - x) * inset, y + (centre[1] - y) * inset] }
  const [x1, y1] = p(from), [x2, y2] = p(to)
  const angle = Math.atan2(y2 - y1, x2 - x1), head = 26
  const h1 = [x2 - head * Math.cos(angle - 0.5), y2 - head * Math.sin(angle - 0.5)], h2 = [x2 - head * Math.cos(angle + 0.5), y2 - head * Math.sin(angle + 0.5)]
  return { line: `M${x1} ${y1} L${x2} ${y2}`, head: `M${h1[0]} ${h1[1]} L${x2} ${y2} L${h2[0]} ${h2[1]}` }
}
function Warning({ at, labels, then, scale = 1 }: { at: number; labels: string[]; then?: { at: number; labels: string[] }; scale?: number }) {
  const corners = [tri.top, tri.right, tri.left]
  const sides = [edge(tri.top, tri.right), edge(tri.right, tri.left), edge(tri.left, tri.top)]
  return <At at={at} className="warning" style={{ width: tri.w * scale, height: tri.h * scale, '--s': scale, viewTransitionName: 'warning' } as CSSProperties}>
    <svg viewBox={`0 0 ${tri.w} ${tri.h}`} aria-hidden="true">
      <path className="warning-body" d={`M${tri.top[0]} ${tri.top[1]} L${tri.right[0]} ${tri.right[1]} L${tri.left[0]} ${tri.left[1]} Z`} />
      {sides.map((e, k) => <g key={k} className="warning-arrow" style={{ '--k': k } as CSSProperties}><path d={e.line} /><path d={e.head} /></g>)}
      <text className="warning-mark" x={tri.top[0]} y={500} textAnchor="middle">!</text>
    </svg>
    {corners.map(([x, y], k) => <span key={k} className="warning-corner" style={{ left: `${(x / tri.w) * 100}%`, top: `${(y / tri.h) * 100}%` }}>
      {then ? <><At at={0} until={then.at} as="span"><b>{labels[k]}</b></At><At at={then.at} as="span"><b>{then.labels[k]}</b></At></> : <b>{labels[k]}</b>}
    </span>)}
  </At>
}

/** The product graph, revealing one layer per step. */
function GraphSteps({ t }: { t: T }) {
  const step = useContext(StepContext)
  return <>
    <div className="column-labels" aria-hidden="true">{columnNames.map((name, c) => <span key={c} className={c <= step || (c === 5 && step >= 4) ? 'on' : ''} style={{ left: area.x + (c * (area.w - BOX.w)) / 5 }}>{t(...name)}</span>)}</div>
    <ProductGraph reveal={step} />
  </>
}

const DEMO_DIGEST = 'sha256:b1ae4e4cbc6a19a762a5de5b9e2a46a9acb8e48f5cc7161b8456fa7135bfd2e9'

// The four files in the demo shop that cite BR-REFUND-001. Markdown carries the
// citation as a comment; the C# code and the TypeScript test carry it in a sidecar
// ledger beside them (ProductShape 0.22.1 reads citations in .md and .yml only).
const citers = [
  { what: ['SDD spec', 'spec SDD'], file: 'openspec/specs/refunds/spec.md', c: 'var(--accent)', md: true },
  { what: ['agent skill', 'skill de agente'], file: '.agents/skills/refunds/SKILL.md', c: 'var(--k-journey)', md: true },
  { what: ['code', 'código'], file: 'src/Refunds/RefundPolicy.cs', sidecar: 'RefundPolicy.citations.yml', c: 'var(--k-use-case)', md: false },
  { what: ['test', 'test'], file: 'tests/refund-window.test.ts', sidecar: 'refund-window.citations.yml', c: 'var(--k-structured-behaviour)', md: false },
] as { what: readonly [string, string]; file: string; sidecar?: string; c: string; md: boolean }[]

/** The rule on the left and the files that cite it on the right, shared by the cite and drift scenes. */
function Citers({ t, at, citeAt, staleAt, e2e }: { t: T; at: number; citeAt: number; staleAt?: number; e2e?: boolean }) {
  const step = useContext(StepContext)
  const digest = <mark>{DEMO_DIGEST.slice(0, 15)}…</mark>
  return <At at={at} className="citers">
    {citers.map(({ what, file, sidecar, c, md }, k) => {
      const stale = staleAt !== undefined && step >= staleAt
      return <div key={file} className="citer" style={{ top: citeMap.citers[k].y, '--c': c, '--k': k } as CSSProperties}>
        <p className="citer-file"><b>{e2e && file.startsWith('tests/') ? 'tests' : t(what[0], what[1])}</b><code>{file}</code>{staleAt !== undefined && <span className={`badge ${stale ? 's-stale' : 's-current'}`}>{stale ? 'stale' : 'current'}</span>}</p>
        <code className={`citer-cite ${step >= citeAt ? 'on' : ''}`}>{md ? <>{'<!-- pdac:cite id="BR-REFUND-001" digest="'}{digest}{'" -->'}</> : <><span className="sidecar">↳ {sidecar}</span>{'  id: BR-REFUND-001  digest: '}{digest}</>}</code>
        {e2e && file.startsWith('tests/') && <code className={`citer-cite ${step >= citeAt ? 'on' : ''}`}><span className="sidecar">↳ tests/e2e/refund-window.citations.yml</span>{'  id: '}<mark>SB-REFUND-001</mark>{' · '}<mark>SB-REFUND-002</mark></code>}
      </div>
    })}
  </At>
}

// The three beats of a product change, always on screen: dim until their step, lit on it.
function DriftBeats({ t }: { t: T }) {
  const step = useContext(StepContext)
  const beats = [
    { at: 1, kind: 'ai', label: t('A person proposes, with AI', 'Una persona propone, con IA'), body: <code>CHG-REFUND-002 · draft</code> },
    { at: 2, kind: 'code', label: t('The CLI validates', 'El CLI valida'), body: <code>validate · 0 error(s)</code> },
    { at: 3, kind: 'human', label: t('An owner accepts', 'Un responsable acepta'), body: <><Person /><code>PO / stakeholders</code></> },
  ]
  return <ol className="drift-beats">
    {beats.map(b => <li key={b.kind} className={`drift-beat ${b.kind} ${step === b.at ? 'now' : step > b.at ? 'done' : ''}`}><small>{b.label}</small><span>{b.body}</span></li>)}
  </ol>
}

function RuleCard({ change }: { change?: boolean }) {
  return <article className="card compact cite-rule" style={{ viewTransitionName: 'rule-card' }}>
    <header><Kind token="BR" /><code>BR-REFUND-001</code></header>
    <p className="rule">Refunds are accepted within {change ? <><span className="old">30</span><At at={1} as="span" className="inline"><span className="new">14</span></At></> : '30'} days of delivery.</p>
  </article>
}

// The impact of the refund change on the behaviours that guide the e2e tests
// (tests scene, step 2). The edges and statuses are the demo's: BR-REFUND-001
// is illustrated by SB-REFUND-001 and -002, both modified by CHG-REFUND-002;
// SB-CANCEL-001 illustrates another rule. Hovering a behaviour lights the e2e
// tokens that follow it, an illustration like the product-code scene.
const behaviours = [
  { id: 'SB-REFUND-001', title: 'Refund on the last day', y: 300, changed: true, gwt: ['An order was delivered on March 1', <>The customer requests a refund on <span className="old">March 31</span> <span className="new">March 15</span></>, 'The request is accepted'] },
  { id: 'SB-REFUND-002', title: 'Refund one day late', y: 400, changed: true, gwt: ['An order was delivered on March 1', <>The customer requests a refund on <span className="old">April 1</span> <span className="new">March 16</span></>, 'The request is rejected'] },
  { id: 'SB-CANCEL-001', title: 'Cancel after dispatch', y: 510, changed: false, gwt: ['An order has been dispatched', 'The customer tries to cancel it', 'The cancellation is refused'] },
] as const
const ruleBox = { x: 96, y: 360, w: 430 }
const sbBox = { x: 590, w: 420, h: 56 }

function TestImpact({ t }: { t: T }) {
  const step = useContext(StepContext)
  // 'rule' or the index of a behaviour.
  const [hover, setHover] = useState<'rule' | number | null>(null)
  const hits = hover === 'rule' ? [0, 1] : hover === null ? [] : [hover]
  useEffect(() => { highlightPoints(hits.length ? e2eMask(hits.map(k => e2eGroups[k])) : null) }, [hover])
  useEffect(() => () => highlightPoints(null), [])
  useEffect(() => { if (step < 2) setHover(null) }, [step])
  const shown = typeof hover === 'number' ? hover : 0
  const links = hover === null ? [0, 1] : hits
  const on = (k: number) => ({ onPointerEnter: () => setHover(k as never), onPointerLeave: () => setHover(null), onFocus: () => setHover(k as never), onBlur: () => setHover(null) })
  const arc = { a: lowStages[validationArc.from], c: lowStages[validationArc.to] }
  return <>
    <svg className={`impact-edges ${hover === 'rule' ? 'rule-lit' : ''}`} viewBox="0 0 1920 1080" aria-hidden="true">
      {behaviours.slice(0, 2).map(sb => { const x1 = ruleBox.x + ruleBox.w, y1 = ruleBox.y + 28, y2 = sb.y + sbBox.h / 2; return <path key={sb.id} className="edge" d={`M${x1} ${y1} C${(x1 + sbBox.x) / 2} ${y1}, ${(x1 + sbBox.x) / 2} ${y2}, ${sbBox.x} ${y2}`} /> })}
      {links.map(k => { const sb = behaviours[k], x1 = sbBox.x + sbBox.w, y1 = sb.y + sbBox.h / 2, r = e2eRegions[k]; return <path key={k} className={`link ${sb.changed ? 'stale' : ''}`} d={`M${x1} ${y1} C${(x1 + r.x) / 2} ${y1}, ${(x1 + r.x) / 2} ${r.y}, ${r.x} ${r.y}`} /> })}
    </svg>
    <button type="button" data-hover className={`box-like rule-box ${hover === 'rule' ? 'lit' : ''}`} style={{ left: ruleBox.x, top: ruleBox.y, width: ruleBox.w }} {...on('rule' as never)}>
      <KindIcon type="business-rule" /><code>BR-REFUND-001</code><span><span className="old">30</span> <span className="new">14</span> {t('days', 'días')}</span>
    </button>
    {behaviours.map((sb, k) => <button type="button" key={sb.id} data-hover className={`box-like sb ${sb.changed ? '' : 'unaffected'} ${hits.includes(k) ? 'lit' : ''}`} style={{ left: sbBox.x, top: sb.y, width: sbBox.w, '--k': k } as CSSProperties} {...on(k)}>
      <KindIcon type="structured-behaviour" /><code>{sb.id}</code><span className={`badge ${sb.changed ? 's-stale' : 's-current'}`}>{sb.changed ? 'stale' : 'current'}</span>
    </button>)}
    {step < 3 && <div className="gwt-panel" key={hover === 'rule' ? 'rule' : shown}>
      {hover === 'rule'
        ? <><strong>Refund window</strong><p className="gwt">Refunds are accepted within <span className="old">30</span> <span className="new">14</span> days of delivery. <span className="keep">→ SB-REFUND-001, SB-REFUND-002</span></p></>
        : <><strong>{behaviours[shown].title}</strong><div className="gwt-lines">{(['given', 'when', 'then'] as const).map((word, j) => <p key={word}><b>{word}</b>{behaviours[shown].gwt[j]}</p>)}</div></>}
    </div>}
    <p className="e2e-tag" style={{ left: smallShape.x, top: 244 }}><b>E2E</b><code>tests/e2e/</code></p>
    {lowStages.map((s, k) => <span key={k} className={`low-stage ${k === validationArc.from || k === validationArc.to ? 'on' : ''}`} style={{ left: s.x, top: s.y + 22 }}>{t(...stageNames[k])}</span>)}
    <span className="arc-label" style={{ left: (arc.a.x + arc.c.x) / 2, top: validationArc.peak + 26 }}>{t('product → validation', 'producto → validación')}</span>
  </>
}

// Two sources of truth, in light. Hovering a card lights its disc of glyphs. Moving over the
// architecture disc picks the glyph under the pointer and shows one of its citations: a link of
// light to a glyph of the product.
type Spot = { ax: number; ay: number; px: number | null; py: number | null }
/** Architecture zones that cite the product: the disc in 7 sectors × 2 rings, about two zones in three cite. */
function citesProduct(x: number, y: number) {
  const { x: cx, y: cy, r } = twoDiscs.architecture
  const sector = Math.floor(((Math.atan2(y - cy, x - cx) + Math.PI) / (2 * Math.PI)) * 7) % 7
  const ring = Math.hypot(x - cx, y - cy) < r * 0.5 ? 0 : 1
  return [1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1][ring * 7 + sector] === 1
}
// SDD reads both sources. Illustrative files for the hover, not taken from a real repo: product IDs from
// the demo model, architecture IDs in the ArcShape ADR style. [proposal]
type SddPart = 'specs' | 'agents' | 'code'
type Ref = string
const sddFiles: Record<SddPart, { path: string; product: Ref[]; architecture: Ref[] }[]> = {
  specs: [
    { path: 'openspec/specs/refunds/spec.md', product: ['BR-REFUND-001', 'UC-REQUEST-REFUND'], architecture: ['BBV · Refunds', 'ADR-0003'] },
    { path: 'openspec/specs/checkout/spec.md', product: ['UC-CHECKOUT', 'BR-PAYMENT-001'], architecture: ['RUN · Checkout'] },
    { path: 'openspec/specs/orders/spec.md', product: ['UC-CANCEL-ORDER', 'BR-CANCEL-001'], architecture: ['BBV · Orders'] },
  ],
  agents: [
    { path: '.agents/skills/refunds/SKILL.md', product: ['BR-REFUND-001', 'JRN-REFUND'], architecture: ['XCC · Validation'] },
    { path: '.agents/skills/checkout/SKILL.md', product: ['JRN-PURCHASE'], architecture: ['RUN · Checkout', 'ADR-0004'] },
    { path: '.agents/skills/reviewer/SKILL.md', product: [], architecture: ['ADR-0001', 'XCC · Logging', 'CON · .NET 8'] },
  ],
  code: [
    { path: 'src/Refunds/RefundPolicy.cs', product: ['BR-REFUND-001'], architecture: ['BBV · Refunds'] },
    { path: 'src/Checkout/CheckoutHandler.cs', product: ['UC-CHECKOUT'], architecture: ['RUN · Checkout', 'ADR-0004'] },
    { path: 'src/Shared/Logging/RequestLog.cs', product: [], architecture: ['XCC · Logging'] },
  ],
}
// Colours: product IDs by PDaC kind (the deck's --k-* tokens); architecture by arc42 section family, as the
// ArcShape reader colours them (quality: GOAL CON CTX QR; views: BBV RUN DEP; concepts: STR XCC ADR).
const productKind: Record<string, string> = { BR: 'business-rule', UC: 'use-case', SB: 'structured-behaviour', JRN: 'journey', FR: 'functional-requirement', ACT: 'actor' }
const refColor = (id: Ref, side: 'product' | 'architecture') => {
  const code = id.split(/[-\s]/)[0]
  if (side === 'product') return `var(--k-${productKind[code] ?? 'actor'})`
  return ['BBV', 'RUN', 'DEP'].includes(code) ? 'var(--arc-views)' : ['STR', 'XCC', 'ADR'].includes(code) ? 'var(--arc-concepts)' : ['GOAL', 'CON', 'CTX', 'QR'].includes(code) ? 'var(--arc-quality)' : 'var(--arc-other)'
}
type Flash = { id: number; x: number; y: number; c: string }
function useFlashes() {
  const [flashes, setFlashes] = useState<Flash[]>([])
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let id = 0
    const timer = setInterval(() => {
      const d = Math.random() < 0.5 ? twoDiscs.product : twoDiscs.architecture
      const r = d.r * Math.sqrt(Math.random()) * 0.9, a = Math.random() * Math.PI * 2
      const flash = { id: ++id, x: d.x + r * Math.cos(a), y: d.y + r * Math.sin(a), c: d === twoDiscs.product ? 'var(--accent)' : 'var(--k-bounded-context)' }
      setFlashes(list => [...list.slice(-5), flash])
    }, 420)
    return () => clearInterval(timer)
  }, [])
  return flashes
}
/** The agent's eyes look at the glyph it is fetching; the glyph travels to it along a line of light. */
function Agent({ flashes }: { flashes: Flash[] }) {
  const { x, y, r } = agentBall
  const last = flashes[flashes.length - 1]
  const d = last ? Math.hypot(last.x - x, last.y - y) : 1
  const look = last ? { x: ((last.x - x) / d) * r * 0.22, y: ((last.y - y) / d) * r * 0.22 } : { x: r * 0.1, y: -r * 0.1 }
  const edge = (f: Flash) => { const k = Math.hypot(f.x - x, f.y - y); return { x: x + ((f.x - x) / k) * r, y: y + ((f.y - y) / k) * r } }
  return <>
    <svg className="agent-flashes" viewBox="0 0 1920 1080" aria-hidden="true">
      {flashes.map(f => { const e = edge(f); return <path key={f.id} d={`M${f.x} ${f.y} L${e.x} ${e.y}`} style={{ '--c': f.c } as CSSProperties} /> })}
    </svg>
    {flashes.map(f => { const e = edge(f); return <span key={f.id} className="fetched" style={{ offsetPath: `path('M${f.x} ${f.y} L${e.x} ${e.y}')`, '--c': f.c } as CSSProperties} /> })}
    <span className="agent-eyes" style={{ left: x, top: y, transform: `translate(${look.x}px, ${look.y}px)` }}><i /><i /></span>
  </>
}

function TwoTruths({ t }: { t: T }) {
  const [hover, setHover] = useState<'product' | 'architecture' | SddPart | null>(null)
  const flashes = useFlashes()
  const [spot, setSpot] = useState<Spot | null>(null)
  const goal = useRef({ hover, spot })
  goal.current = { hover, spot }
  const points = useRef<{ x: number; y: number; i: number }[][]>([])
  if (!points.current.length) {
    // Where each glyph lands on the sheet, with the camera's perspective, per group.
    const f = form('two')
    const groups: { x: number; y: number; i: number }[][] = [[], []]
    for (let i = 0; i < POINTS; i++) {
      const g = f.grp[i]
      if (g !== TWO_GROUP.product && g !== TWO_GROUP.architecture) continue
      const k = DISTANCE / (DISTANCE - f.pos[i * 3 + 2])
      groups[g].push({ x: 960 + f.pos[i * 3] * 60 * k, y: 540 - f.pos[i * 3 + 1] * 60 * k, i })
    }
    points.current = groups
  }
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const level = [0, 0, 0, 0]
    const mask = new Float32Array(POINTS)
    let frame = 0, on = false, glow = 0
    const tick = () => {
      const { hover, spot } = goal.current
      const sdd = hover === 'specs' || hover === 'agents' || hover === 'code'
      const to = [hover === 'product' ? 1 : sdd ? 0.55 : 0, hover === 'architecture' ? 1 : sdd ? 0.55 : spot ? 0.3 : 0, 0, hover === 'agents' ? 1 : 0]
      let any = false
      level.forEach((v, g) => { level[g] = reduced ? to[g] : v + (to[g] - v) * 0.08; if (level[g] > 0.01) any = true })
      glow = reduced ? (spot ? 1 : 0) : glow + ((spot ? 1 : 0) - glow) * 0.12
      mask.set(groupMask('two', level))
      if (spot && glow > 0.01) {
        any = true
        for (const group of points.current) for (const p of group) {
          const d = Math.min(Math.hypot(p.x - spot.ax, p.y - spot.ay), spot.px === null || spot.py === null ? Infinity : Math.hypot(p.x - spot.px, p.y - spot.py))
          if (d < 34) mask[p.i] = Math.max(mask[p.i], glow * (1 - d / 34))
        }
      }
      if (any) { highlightPoints(mask); on = true }
      else if (on) { highlightPoints(null); on = false }
      frame = requestAnimationFrame(tick)
    }
    tick()
    return () => { cancelAnimationFrame(frame); highlightPoints(null) }
  }, [])
  const onArchitecture = (event: React.MouseEvent<HTMLElement>) => {
    const box = event.currentTarget.getBoundingClientRect(), scale = box.width / (twoDiscs.architecture.r * 2)
    const x = twoDiscs.architecture.x - twoDiscs.architecture.r + (event.clientX - box.left) / scale
    const y = twoDiscs.architecture.y - twoDiscs.architecture.r + (event.clientY - box.top) / scale
    const [product, architecture] = points.current
    let best = architecture[0], dist = Infinity
    for (const p of architecture) { const d = Math.hypot(p.x - x, p.y - y); if (d < dist) { dist = d; best = p } }
    // Not all of the architecture cites the product: some zones are purely technical. Elsewhere,
    // each architecture glyph always cites the same product glyph.
    const cited = citesProduct(best.x, best.y) ? product[(best.i * 2654435761 >>> 0) % product.length] : null
    setSpot(s => (s && s.ax === best.x && s.ay === best.y ? s : { ax: best.x, ay: best.y, px: cited?.x ?? null, py: cited?.y ?? null }))
  }
  const hoverOn = (name: 'product' | 'architecture' | SddPart) => ({ onMouseEnter: () => setHover(name), onMouseLeave: () => setHover(h => (h === name ? null : h)) })
  const disc = (d: { x: number; y: number; r: number }) => ({ left: d.x - d.r, top: d.y - d.r, width: d.r * 2, height: d.r * 2 })
  const part = hover === 'specs' || hover === 'agents' || hover === 'code' ? hover : null
  const sddLit = (name: 'product' | 'architecture') => (hover === name || part ? 'lit' : '')
  return <>
    <h2>{t('Two sources of truth', 'Dos fuentes de verdad')}</h2>
    <p className="lead truths-lead">{t('Related, never mixed up.', 'Relacionadas, sin mezclarse.')}</p>
    <div className="truths">
      <section className={`truth intent ${sddLit('product')}`} {...hoverOn('product')}><small>{t('Intent', 'Intención')}</small><strong>{t('Product', 'Producto')}</strong><code>docs/product/</code></section>
      <svg className="cites" viewBox="0 0 160 60" aria-hidden="true"><path className="draw dashed" pathLength={1} d="M4 30 H156" /><text x="80" y="18" textAnchor="middle">{t('cites', 'cita')}</text><text x="80" y="54" textAnchor="middle">{t('references', 'referencia')}</text></svg>
      <section className={`truth how ${sddLit('architecture')}`} {...hoverOn('architecture')}><small>{t('Architecture', 'Arquitectura')}</small><strong>{t('Architecture', 'Arquitectura')}</strong><code>docs/architecture/</code></section>
    </div>
    <div className={`sdd ${part ? 'lit' : ''}`}>
      <svg className="sdd-reads" viewBox="0 0 900 60" aria-hidden="true">
        <defs><marker id="sdd-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" /></marker></defs>
        <path d="M360 58 L190 4" markerEnd="url(#sdd-head)" /><path d="M540 58 L710 4" markerEnd="url(#sdd-head)" />
      </svg>
      <div className="sdd-box">
        <b style={{ viewTransitionName: 'sdd' }}>SDD</b>
        {(['specs', 'agents', 'code'] as const).map(name => <span key={name} className={`sdd-part ${hover === name ? 'on' : ''}`} {...hoverOn(name)}>{name === 'specs' ? 'specs' : name === 'agents' ? t('agents', 'agentes') : t('code', 'código')}</span>)}
      </div>
    </div>
    <div className="truth-question">
      <p className={`intent ${hover === 'product' ? 'on' : ''}`}>{t('What do we want to build?', '¿Qué queremos construir?')}</p>
      <p className={`how ${hover === 'architecture' || spot ? 'on' : ''}`}>{t('How do we make it possible?', '¿Cómo lo hacemos posible?')}</p>
      {(['specs', 'agents', 'code'] as const).map(name => <ul key={name} className={`sdd-files ${hover === name ? 'on' : ''}`}>
        {sddFiles[name].map(f => <li key={f.path}><code>{f.path}</code>{f.product.map(id => <span key={id} className="ref" style={{ '--c': refColor(id, 'product') } as CSSProperties}>{id}</span>)}{f.architecture.map(id => <span key={id} className="ref" style={{ '--c': refColor(id, 'architecture') } as CSSProperties}>{id}</span>)}</li>)}
      </ul>)}
    </div>
    <div className="overlay">
      <span className="disc-hit" style={disc(twoDiscs.product)} {...hoverOn('product')} />
      <span className="disc-hit" style={disc(twoDiscs.architecture)} onMouseMove={onArchitecture} onMouseLeave={() => setSpot(null)} />
      <svg className={`cite-link ${spot?.px != null ? 'on' : ''}`} viewBox="0 0 1920 1080" aria-hidden="true">
        <defs><marker id="cite-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" /></marker></defs>
        {spot && spot.px !== null && spot.py !== null && <path d={`M${spot.ax} ${spot.ay} Q${(spot.ax + spot.px) / 2} ${Math.min(spot.ay, spot.py) - 150} ${spot.px} ${spot.py}`} markerEnd="url(#cite-head)" />}
      </svg>
      {/* The agent reads both sources: it looks at a glyph of either disc and brings it in. */}
      <Agent flashes={flashes} />
    </div>
  </>
}

// Hovering a source lights its glyphs in neon. Hovering Product Knowledge lights the fragments
// one glyph at a time, in a new random order each time: each one flashes and stays lit, slowly
// at first, until all of them are. Leaving fades everything out. The field goes back to normal
// once the light has faded.
function Fragments({ t }: { t: T }) {
  const [hover, setHover] = useState<number | null>(null)
  const goal = useRef<number | null>(null)
  goal.current = hover
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const grp = form('fragments').grp
    const visible = Array.from({ length: POINTS }, (_, i) => i).filter(i => grp[i] >= 0 && grp[i] <= KNOWLEDGE_GROUP)
    const level = Array.from({ length: KNOWLEDGE_GROUP + 1 }, () => 0)
    const spark = new Float32Array(POINTS)
    const FILL_MS = 6000
    let frame = 0, on = false, order: number[] = [], lit = 0, since = 0
    const tick = () => {
      const h = goal.current
      let any = false
      level.forEach((v, g) => {
        const to = h === g && h !== KNOWLEDGE_GROUP ? 1 : 0
        level[g] = reduced ? to : v + (to - v) * 0.08
        if (level[g] > 0.01) any = true
      })
      if (h === KNOWLEDGE_GROUP) {
        if (!order.length) {
          order = [...visible]
          for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]] }
          lit = 0; since = performance.now()
        }
        // Slow at first, then faster: the share lit grows with the square of the time.
        const goalLit = reduced ? order.length : Math.min(order.length, Math.round(order.length * ((performance.now() - since) / FILL_MS) ** 2))
        for (; lit < goalLit; lit++) spark[order[lit]] = 1.6
      } else order = []
      const mask = groupMask('fragments', level)
      for (const i of visible) {
        // A new glyph flashes above full and settles to lit; without the hover, everything fades out.
        if (h === KNOWLEDGE_GROUP) { if (spark[i] > 0.85) spark[i] = Math.max(0.85, spark[i] * 0.93) }
        else spark[i] = reduced ? 0 : spark[i] * 0.9
        if (spark[i] > 0.01) { any = true; mask[i] = Math.max(mask[i], Math.min(1, spark[i])) }
      }
      if (any || h !== null) { highlightPoints(mask); on = true }
      else if (on) { highlightPoints(null); on = false }
      frame = requestAnimationFrame(tick)
    }
    tick()
    return () => { cancelAnimationFrame(frame); highlightPoints(null) }
  }, [])
  const hoverOn = (g: number) => ({ onMouseEnter: () => setHover(g), onMouseLeave: () => setHover(h => (h === g ? null : h)) })
  const word = <span className={`title-knowledge ${hover === KNOWLEDGE_GROUP ? 'lit' : ''}`} {...hoverOn(KNOWLEDGE_GROUP)}>Product Knowledge</span>
  return <>
    <h2>{t('Where ', 'Dónde vive el ')}{word}{t(' lives', '')}</h2>
    <div className="overlay">
      <svg className="flow-edges" viewBox="0 0 1920 1080" aria-hidden="true">
        <defs><marker id="flow-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></marker></defs>
        {relations.map(r => {
          const l = relationLine(r.from, r.to, r.below)
          const lit = hover === r.from || hover === r.to || hover === KNOWLEDGE_GROUP
          return <g key={`${r.from}-${r.to}`} className={`flow ${lit ? 'lit' : ''} ${r.dashed ? 'dashed' : ''}`}>
            <line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} markerEnd="url(#flow-arrow)" />
            <text x={l.lx} y={l.ly} textAnchor={l.vertical ? 'start' : 'middle'} dominantBaseline="central">{t(r.en, r.es)}</text>
          </g>
        })}
      </svg>
      {sources.map((s, k) => <span key={k} className={`source-name ${hover === k ? 'lit' : ''}`} style={{ left: s.x, top: s.y, '--k': k, '--c': s.c } as CSSProperties} {...hoverOn(k)}>{sourceNames[k]}</span>)}
      <div className="fragments-line"><p>“AI doesn’t have a product model.</p><p>It has <em>fragments</em>.”</p></div>
    </div>
  </>
}

// The lifecycle in light, one distribution per step: spread evenly over the whole line; a bell
// peaking on Development, where the AI investment is today; a Poisson (λ = 1) peaking between
// Problem, Ideation and Product, the opportunity. Hovering a stage sends a spot of neon along the line
// to it; leaving lets the step's light come back. Everything eases, nothing snaps.
const TODAY = 6
// The opportunity: Problem, Ideation and Product fully lit, then a Poisson-like tail (1 / k!) towards the right.
const poisson = [1, 1, 1, 6, 24, 120, 720, 5040, 40320, 362880, 3628800].map((f, k) => (k < 3 ? 1 : 1 / f * 2))
const lifecycleLight = [
  stages.map(() => 0.45),
  stages.map((_, k) => Math.exp(-((k - TODAY) ** 2) / (2 * 1.3 ** 2))),
  poisson,
]
const lifecycleState = { step: 0, hover: null as number | null }
function Lifecycle({ t }: { t: T }) {
  const step = useContext(StepContext)
  const [hover, setHover] = useState<number | null>(null)
  lifecycleState.step = step
  lifecycleState.hover = hover
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const ease = (from: number, to: number, rate: number) => (reduced ? to : from + (to - from) * rate)
    const weights = [...lifecycleLight[lifecycleState.step]]
    let cx = stages[TODAY].x, travel = 0, frame = 0
    const tick = () => {
      const { step, hover } = lifecycleState
      lifecycleLight[step].forEach((w, k) => { weights[k] = ease(weights[k], w, 0.05) })
      travel = ease(travel, hover === null ? 0 : 1, 0.08)
      if (hover !== null) cx = ease(cx, stages[hover].x, 0.07)
      highlightPoints(lifecycleNeon(weights, cx, travel))
      frame = requestAnimationFrame(tick)
    }
    tick()
    return () => { cancelAnimationFrame(frame); highlightPoints(null) }
  }, [])
  const lit = (k: number) => (hover === null ? lifecycleLight[step][k] > 0.8 : k === hover)
  return <>
    {stages.map((s, k) => <span key={k} className={`stage ${lit(k) ? 'lit' : ''}`} style={{ left: s.x, top: s.y + 34 }}>{t(...stageNames[k])}</span>)}
    {stages.map((s, k) => <span key={`h${k}`} className="stage-hit" style={{ left: s.x, top: s.y - 130 }} onMouseEnter={() => setHover(k)} onMouseLeave={() => setHover(h => (h === k ? null : h))} />)}
  </>
}

// Shillinq's VAT spec, quoted line for line from the public repo (main at 1ccd637, read 2026-11-05):
// the same file says there is no per-app controller, forbids the service, and 380 lines below the
// first statement requires it by name, with a second spelling of the model. Marks are [[...]].
const SHILLINQ_URL = 'https://github.com/ConductionNL/shillinq/blob/1ccd637/openspec/specs/bookkeeping-vat-btw-filing/spec.md#L32'
const specLines: ([number, string] | [null, number])[] = [
  [32, 'generic CRUD HTTP surface; shillinq [[adds no per-app controller]] for'],
  [33, 'BTW filing.'],
  [null, 147],
  [181, 'Per ADR-031 anti-pattern list, shillinq [[MUST NOT]] author a'],
  [182, '`[[VatReturnService]]::transition*` method. The lifecycle is the only'],
  [null, 231],
  [414, '`VatSuppletieDetectionService::detect()` [[MUST]] accept a filed (submitted or'],
  [415, 'later) `[[VATReturn]]` id, recompute the same GL-derived per-rubriek grouping'],
  [416, '`[[VATReturnService]]::deriveVATLines()` produces (grouped by `type` × `taxRate`)'],
]
function SpecFile({ t }: { t: T }) {
  return <figure className="spec-file">
    <figcaption>openspec/specs/bookkeeping-vat-btw-filing/spec.md</figcaption>
    <ol>
      {specLines.map(([n, text], k) => n === null
        ? <li key={k} className="gap"><span>⋮</span><em>{t(`${text} lines`, `${text} líneas`)}</em></li>
        : <li key={k}><span>{n}</span><code>{(text as string).split(/\[\[|\]\]/).map((part, j) => (j % 2 ? <mark key={j}>{part}</mark> : part))}</code></li>)}
    </ol>
  </figure>
}

export const scenes: Scene[] = [
  {
    id: 'title', act: 0, title: ["Specs shouldn't be your source of truth", 'Las specs no deberían ser tu fuente de verdad'], steps: 0, layout: 'center', form: () => 'noise',
    content: t => <div className="title">
      <p className="eyebrow">AI-Assisted Development at Scale</p>
      <h1>{t("Specs shouldn't be", 'Las specs no deberían ser')}<br />{t('your source of truth', 'tu fuente de verdad')}</h1>
      <p className="subtitle">{t('Product and architecture, versioned and verifiable', 'Producto y arquitectura, versionados y verificables')}</p>
      <dl className="title-block">
        <div><dt>{t('Speaker', 'Ponente')}</dt><dd>Juan G. Carmona</dd></div>
        <div><dt>{t('Role', 'Puesto')}</dt><dd>Software Development Engineer · Plain Concepts</dd></div>
        <div><dt>{t('Event', 'Evento')}</dt><dd>NetCoreConf Barcelona 2026</dd></div>
        <div><dt>{t('Place', 'Lugar')}</dt><dd>Centre Urquinaona · Barcelona</dd></div>
        <div><dt>{t('Date', 'Fecha')}</dt><dd>2026-12-12</dd></div>
      </dl>
    </div>,
  },
  {
    id: 'lifecycle', act: 1, title: ['The software lifecycle', 'El ciclo de vida del software'], steps: 2, layout: 'full', form: step => (['lifecycle', 'lifecycle-ai', 'lifecycle-left'] as const)[step],
    content: t => <>
      <h2>{t('The software lifecycle', 'El ciclo de vida del software')}</h2>
      <div className="overlay">
        <Lifecycle t={t} />
        <At at={1} until={2} className="band-label" style={{ left: stages[TODAY].x, top: 680, transform: 'translateX(-50%)' }}>{t('Where the AI investment is today', 'Dónde está hoy la inversión en IA')}</At>
        <At at={2} className="band-label future" style={{ left: stages[1].x, top: 680, transform: 'translateX(-50%)' }}>{t('Future opportunity', 'La oportunidad')}</At>
      </div>
    </>,
  },
  {
    id: 'fragments', act: 1, title: ['Where Product Knowledge lives', 'Dónde vive el Product Knowledge'], steps: 0, layout: 'full', form: () => 'fragments',
    content: t => <Fragments t={t} />,
  },
  {
    id: 'direction', act: 1, title: ['Lack of direction', 'Falta de dirección'], steps: 1, layout: 'left', form: step => (step ? 'heading-set' : 'heading-lost'),
    content: t => <div className="swap">
      <At at={0} until={1} className="stack">
        <h2>{t('Lack of direction', 'Falta de dirección')}</h2>
        <p className="lead">{t('No development team', 'Ningún equipo de desarrollo')}<br />{t('can build without direction.', 'puede construir sin rumbo.')}</p>
        <p className="lead warn">{t('Vibe coding speeds up the disaster.', 'El vibe coding acelera el desastre.')}</p>
      </At>
      <At at={1} className="stack">
        <h2>{t('With direction', 'Con rumbo')}</h2>
        <p className="lead">{t('We can solve', 'Podemos resolver')}<br />{t('today’s problems', 'los problemas de hoy')}<br />{t('without losing sight of the destination', 'sin perder de vista el destino')}</p>
      </At>
    </div>,
  },
  {
    // The top of the SDD sandwich: it works. Juan asks the room who knows it and who uses it.
    id: 'sdd-rocks', act: 1, title: ['SDD rocks!', 'SDD rocks!'], steps: 0, layout: 'center', form: () => 'dust',
    content: () => <div className="why"><p className="verdict rocks solo">SDD rocks!</p></div>,
  },
  {
    id: 'noise', act: 1, title: ['SDD at scale makes noise', 'SDD a escala genera ruido'], steps: 4, layout: 'full', form: step => (['specs-0', 'specs-1', 'specs-2', 'specs-3', 'specs-many'] as const)[step],
    content: t => <>
      <h2>{t('SDD at scale', 'SDD a escala')}<At at={4} as="span" className="inline noise-word">{t(' makes noise', ' genera ruido')}</At></h2>
      <div className="overlay">
        <At at={0} until={4} className="spec-cards">
          <span className="target-label" style={{ left: target.x, top: target.y - 112 }}>{t('one rule', 'una regla')}</span>
          <span className="target-label concept" style={{ left: target.x, top: target.y + 78 }}>{t('the refund', 'la devolución')}</span>
        </At>
        {/* Each spec says the same rule with its own words: the verb (refund), the thing (purchase, delivery, order) and the time (30 days, a month). Words in [[brackets]] are marked. */}
        {([['billing', '[[Refunds]] are issued for [[purchases]] made in the last [[30 days]].', 'var(--k-constraint)'], ['checkout', 'Customers can request a [[refund]] within [[30 days]] of [[delivery]].', 'var(--k-use-case)'], ['support', 'If the [[order]] is [[less than a month]] old, offer a [[refund]].', 'var(--k-domain-term)']] as const).map(([spec, text, c], k) =>
          <At key={spec} at={k + 1} until={4} className="spec-card" style={{ left: specCards.x, top: specCards.tops[k], minHeight: specCards.height, '--c': c } as CSSProperties}><small>openspec/specs/{spec}</small><p>{text.split(/\[\[|\]\]/).map((part, j) => (j % 2 ? <mark key={j}>{part}</mark> : part))}</p></At>)}
        <At at={4} until={5} className="times"><b>×160</b><span>specs</span></At>
      </div>
    </>,
  },
  {
    // The real case, on its own sheet: the file itself, and a QR to check it.
    id: 'shillinq', act: 1, title: ['A real case: Shillinq', 'Un caso real: Shillinq'], steps: 1, layout: 'full', form: () => 'specs-faint',
    content: t => <>
      <h2>{t('SDD at scale', 'SDD a escala')}<span className="noise-word">{t(' makes noise', ' genera ruido')}</span></h2>
      <div className="shillinq">
        <SpecFile t={t} />
        <div className="check">
          <QrCode value={SHILLINQ_URL} />
          <p className="check-title">{t('Check it yourself', 'Compruébalo tú')}</p>
          <p className="check-repo"><a href={SHILLINQ_URL} target="_blank" rel="noreferrer">ConductionNL/shillinq</a></p>
          <p className="check-note">{t('Open source, built with SDD.', 'Open source, hecha con SDD.')}<br />{t('160 OpenSpec specs, 273 archived changes.', '160 specs de OpenSpec, 273 cambios archivados.')}</p>
        </div>
        <At at={1} className="shillinq-punch"><p>{t('When two specs contradict each other,', 'Cuando dos specs se contradicen,')}<br />{t('which one should the agent follow?', '¿a cuál debería hacer caso el agente?')}</p></At>
      </div>
    </>,
  },
  {
    id: 'before', act: 1, title: ['Before', 'Antes'], steps: 6, layout: 'full', form: step => (['before-0', 'before-1', 'before-2', 'before-3', 'before-4', 'before-5', 'before-dim'] as const)[step],
    content: t => <>
      <Backlog t={t} after={false} />
      <div className="warning-slot before-warning"><Warning at={6} scale={0.8} labels={[t('indeterminism', 'indeterminismo'), t('drift', 'deriva'), t('rework', 'retrabajo')]} /></div>
    </>,
  },
  {
    id: 'not-truth', act: 1, title: ['Specs are not the source of truth', 'Las specs no son la fuente de verdad'], steps: 2, layout: 'center', form: () => 'specs-dim',
    content: t => <div className="why">
      <At at={0}><p className="verdict rocks" style={{ viewTransitionName: 'sdd' }}>SDD rocks!</p></At>
      {/* The loop: each cycle redefines the rule, the small differences chain into drift, drift piles up into divergent versions, and with those in context the AI redefines again. */}
      <Warning at={2} scale={0.62} labels={[t('redefinition', 'redefinición'), t('drift', 'deriva'), t('divergence', 'divergencia')]} />
      <At at={1}><p className="verdict">{t('But specs should never be', 'Pero las specs nunca deberían ser')}<br />{t('your source of truth', 'tu fuente de verdad')}</p></At>
    </div>,
  },
  {
    id: 'two-truths', act: 2, title: ['Two sources of truth', 'Dos fuentes de verdad'], steps: 0, layout: 'left', form: () => 'two',
    content: t => <TwoTruths t={t} />,
  },
  {
    id: 'after', act: 2, title: ['After', 'Después'], steps: 9, layout: 'full', form: step => (['after-0', 'after-1', 'after-2', 'after-3', 'after-4', 'after-5', 'after-6', 'after-7', 'after-8', 'after-dim'] as const)[step],
    content: t => <>
      <Backlog t={t} after />
      <Chain at={9} tone="good" links={[t('direction', 'dirección'), t('guide', 'guía'), t('delivery', 'entrega')]} />
    </>,
  },
  {
    id: 'graph', act: 3, title: ['The product as a graph', 'El producto como grafo'], steps: 4, layout: 'full', form: () => 'graph-nodes',
    content: t => <>
      <h2 className="small-heading">{t('The product as a graph', 'El producto como grafo')}</h2>
      <GraphSteps t={t} />
    </>,
  },
  {
    id: 'product-code', act: 3, title: ['The product and its code', 'El producto y su código'], steps: 0, layout: 'full', form: () => 'code',
    content: t => <>
      <h2 className="small-heading">{t('The product and its code', 'El producto y su código')}</h2>
      <ProductGraph code />
    </>,
  },
  {
    id: 'cite', act: 3, title: ['Define once, cite everywhere', 'Define una vez, cita en todas partes'], steps: 3, layout: 'full', form: step => (step ? 'cite' : 'cite-0'),
    content: t => <>
      <h2>{t('Define once,', 'Define una vez,')}<br />{t('cite everywhere', 'cita en todas partes')}</h2>
      <div className="overlay">
        <RuleCard />
        <Citers t={t} at={1} citeAt={2} />
        <At at={3} className="cite-foot"><p className="tally"><b>4</b> {t('citations of the rule', 'citas de la regla')} · <b className="s-current">4</b> current</p></At>
      </div>
    </>,
  },
  {
    // The refund change from cite, end to end: who decides (AI proposes, code validates, a person accepts) and what CI sees.
    // Outputs verbatim from content/evidence/demo/change.txt; long lines end in "…".
    id: 'drift', act: 3, title: ['The product changes: what does it affect?', 'Cambia el producto: ¿qué se ve afectado?'], steps: 5, layout: 'full', form: step => step >= 4 ? 'drift-stale' : 'drift-current',
    content: t => <>
      <h2 style={{ fontSize: 56 }}>{t('The product changes:', 'Cambia el producto:')}<br />{t('what does it affect?', '¿qué se ve afectado?')}</h2>
      <div className="overlay">
        <DriftBeats t={t} />
        <RuleCard change />
        <Citers t={t} at={0} citeAt={0} staleAt={4} e2e />
        <At at={0} until={1} className="cite-foot">
          <Term label={t('Citation verification before the change', 'Verificación de citas antes del cambio')} lines={[
            '$ prodshape citations verify',
            '6 citation(s): [[6 current]], 0 stale, 0 tampered, 0 unresolved',
            '# exit 0',
          ]} />
        </At>
        <At at={1} until={2} className="cite-foot">
          <Term label={t('A person proposes the change, with AI helping from the graph', 'Una persona propone el cambio, con la IA ayudando desde el grafo')} lines={[
            '$ prodshape change create CHG-REFUND-002 \\',
            '    --title "Shorter refund window"',
            'Created docs/product/changes/active/chg-refund-002/…',
            '  (status draft, …)',
          ]} />
        </At>
        <At at={2} until={3} className="cite-foot">
          <Term label={t('The CLI validates the change against the 39 accepted artifacts', 'El CLI valida el cambio contra los 39 artefactos aceptados')} lines={[
            '$ prodshape change validate CHG-REFUND-002',
            '[[0 error(s)]], 0 warning(s) across 39 accepted artifact(s)',
            'and 1 live change(s)',
            '# exit 0',
          ]} />
        </At>
        <At at={3} until={4} className="cite-foot">
          <Term label={t('An owner accepts: the Product Owner or the stakeholders', 'Un responsable acepta: el Product Owner o los stakeholders')} lines={[
            '$ prodshape change apply CHG-REFUND-002',
            'Product diff: 0 added, 3 modified, 0 removed',
            'Applied and archived. Nothing was committed:',
            '  open a pull request so a human can accept it.',
          ]} />
        </At>
        <At at={4} until={5} className="cite-foot">
          <Term label={t('Citation verification after the change', 'Verificación de citas después del cambio')} lines={[
            '$ prodshape citations verify',
            '6 citation(s): 0 current, [[6 stale]], 0 tampered, 0 unresolved',
            '# exit 1',
          ]} />
        </At>
        <At at={5} className="cite-foot states">
          <p><b className="s-current">current</b>{t('matches', 'coincide')}</p>
          <p><b className="s-stale">stale</b>{t('artifact changed', 'el artefacto cambió')}</p>
          <p><b className="s-tampered">tampered</b>{t('embedded copy edited', 'copia incrustada editada')}</p>
          <p><b className="s-unresolved">unresolved</b>{t('ID not found', 'ID no encontrado')}</p>
        </At>
      </div>
    </>,
  },
  {
    id: 'trust', act: 4, title: ['Can we trust it?', '¿Podemos fiarnos?'], steps: 1, layout: 'left', form: () => 'question',
    content: t => <div className="questions">
      <p className="question">{t('Is what was built what had to be built?', '¿Lo que se ha implementado es lo que había que implementar?')}</p>
      <At at={1}><p className="question strong">{t('Can we trust AI?', '¿Podemos fiarnos de la IA?')}</p></At>
    </div>,
  },
  {
    id: 'tests', act: 4, title: ['Tests that follow the product', 'Tests que siguen al producto'], steps: 3, layout: 'full', form: step => (['pyramid', 'hourglass', 'hourglass-stale', 'hourglass-stale'] as const)[step],
    content: t => <>
      <h2>{t('Tests that follow the product', 'Tests que siguen al producto')}</h2>
      <div className="overlay">
        <At at={0} until={1} className="shape-title" style={{ left: shapes.x, top: 236 }}>{t('Before', 'Antes')}</At>
        <At at={1} until={2} className="shape-title" style={{ left: shapes.x, top: 236 }}>{t('Now', 'Ahora')}</At>
        <At at={0} until={2} className="shape-labels">{['E2E', t('Integration', 'Integración'), t('Unit', 'Unitarios')].map((label, k) =>
          <span key={k} style={{ top: (shapes.bands[k][0] + shapes.bands[k][1]) / 2 }}>{label}</span>)}</At>
        <At at={2} className="sb-boxes"><TestImpact t={t} /></At>
        <At at={3} className="test-flow">
          {[t('the product changes', 'cambia el producto'), t('the behaviour changes', 'cambia el comportamiento'), t('its e2e go stale', 'sus e2e quedan stale'), t('AI adapts them', 'la IA los adapta')].map((w, k) =>
            <span key={k} style={{ '--k': k } as CSSProperties}>{k > 0 && <i aria-hidden="true">→</i>}<b>{w}</b></span>)}
        </At>
      </div>
    </>,
  },
  {
    id: 'closing', act: 5, title: ['What do we read?', '¿Qué leemos?'], steps: 3, layout: 'left', form: step => (['noise', 'question', 'two', 'two'] as const)[step],
    content: t => <div className="read">
      <At at={0} until={1}>
        <figure className="post">
          <header><span className="avatar" aria-hidden="true">RM</span><p><b>Robert C. Martin</b><small>@unclebobmartin · {t('author of Clean Code', 'autor de Clean Code')}</small></p></header>
          <blockquote>“My current strategy is to not read any of the code written by my agents.”</blockquote>
          <figcaption>X · {t('July 2026', 'julio 2026')}</figcaption>
        </figure>
      </At>
      <At at={1}><p className="question strong">{t('If we no longer read the code, what do we read?', 'Si ya no leemos el código, ¿qué leemos?')}</p></At>
      <At at={2}><p className="answer">{t('The intent: the product, the architecture and the tests that follow them.', 'La intención: el producto, la arquitectura y los tests que los siguen.')}</p></At>
      <At at={3}><p className="limit">{t('Tools check the shape. Meaning is still our job.', 'Las herramientas comprueban la forma. El significado sigue siendo nuestro trabajo.')}</p></At>
    </div>,
  },
  {
    id: 'url', act: 0, title: ['aligned.jgcarmona.com', 'aligned.jgcarmona.com'], steps: 0, layout: 'center', form: () => 'ring',
    content: () => <div className="closing">
      <QrCode value="https://aligned.jgcarmona.com" />
      <p className="url">aligned.jgcarmona.com</p>
      <p className="links">pdac.dev · productshape.dev · arcshape.dev</p>
    </div>,
  },
]
