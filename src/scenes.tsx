import { useContext, useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { At, Dim, Kind, Person, StepContext, Term } from './components'
import { citeMap, e2eGroups, e2eMask, e2eRegions, lowStages, validationArc, knowledge, shapes, smallShape, sources, specCards, stages, target, type FormName } from './field/forms'
import { highlightPoints } from './field/GlyphField'
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

const stageNames: [string, string][] = [['Ideation', 'Ideación'], ['Product', 'Producto'], ['Functional Backlog', 'Backlog funcional'], ['Architecture', 'Arquitectura'], ['Design', 'Diseño'], ['Development', 'Desarrollo'], ['DevOps', 'DevOps'], ['Operations', 'Operaciones'], ['SRE', 'SRE'], ['Maintenance', 'Mantenimiento']]
const sourceNames = ['Jira', 'Slack', 'Docs', 'Meeting Notes', 'Wiki', 'Developers', 'Source Code']
const columnNames: [string, string][] = [['Actors', 'Actores'], ['Journeys', 'Journeys'], ['Use cases', 'Casos de uso'], ['Rules and domain', 'Reglas y dominio'], ['Requirements', 'Requisitos'], ['Behaviour', 'Comportamiento']]

// After: the architecture tickets first, each one laying a layer that every slice will stand on.
const architecture: [string, string][] = [
  ['Authentication & authorization', 'Autenticación y autorización'],
  ['Cross-cutting: logs, validation', 'Cross-cutting: logs, validación'],
  ['Domain model (DDD)', 'Modelo de dominio (DDD)'],
  ['Infrastructure: data, CI/CD', 'Infraestructura: datos, CI/CD'],
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
// citation as a comment; code and tests carry it in a ledger beside them.
const citers = [
  { what: ['SDD spec', 'spec SDD'], file: 'openspec/specs/refunds/spec.md', c: 'var(--accent)', md: true },
  { what: ['agent skill', 'skill de agente'], file: '.agents/skills/refunds/SKILL.md', c: 'var(--k-journey)', md: true },
  { what: ['code', 'código'], file: 'src/refunds.citations.yml', c: 'var(--k-use-case)', md: false },
  { what: ['test', 'test'], file: 'tests/refund-window.citations.yml', c: 'var(--k-structured-behaviour)', md: false },
] as const

/** The rule on the left and the files that cite it on the right, shared by the cite and drift scenes. */
function Citers({ t, at, citeAt, staleAt }: { t: T; at: number; citeAt: number; staleAt?: number }) {
  const step = useContext(StepContext)
  const digest = <mark>{DEMO_DIGEST.slice(0, 15)}…</mark>
  return <At at={at} className="citers">
    {citers.map(({ what, file, c, md }, k) => {
      const stale = staleAt !== undefined && step >= staleAt
      return <div key={file} className="citer" style={{ top: citeMap.citers[k].y, '--c': c, '--k': k } as CSSProperties}>
        <p className="citer-file"><b>{t(what[0], what[1])}</b><code>{file}</code>{staleAt !== undefined && <span className={`badge ${stale ? 's-stale' : 's-current'}`}>{stale ? 'stale' : 'current'}</span>}</p>
        <code className={`citer-cite ${step >= citeAt ? 'on' : ''}`}>{md ? <>{'<!-- pdac:cite id="BR-REFUND-001" digest="'}{digest}{'" -->'}</> : <>{'- id: BR-REFUND-001  digest: '}{digest}</>}</code>
      </div>
    })}
  </At>
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
        ? <><strong>Refund window</strong><p className="gwt">Refunds are accepted within <span className="old">30</span> <span className="new">14</span> days of delivery. → SB-REFUND-001, SB-REFUND-002</p></>
        : <><strong>{behaviours[shown].title}</strong><p className="gwt"><b>given</b> {behaviours[shown].gwt[0]} · <b>when</b> {behaviours[shown].gwt[1]} · <b>then</b> {behaviours[shown].gwt[2]}</p></>}
    </div>}
    <p className="e2e-tag" style={{ left: smallShape.x, top: 244 }}><b>E2E</b><code>tests/e2e/</code></p>
    {lowStages.map((s, k) => <span key={k} className={`low-stage ${k === validationArc.from || k === validationArc.to ? 'on' : ''}`} style={{ left: s.x, top: s.y + 22 }}>{t(...stageNames[k])}</span>)}
    <span className="arc-label" style={{ left: (arc.a.x + arc.c.x) / 2, top: validationArc.peak + 26 }}>{t('product → validation', 'producto → validación')}</span>
  </>
}

export const scenes: Scene[] = [
  {
    id: 'title', act: 0, title: ['AI-Assisted Development at Scale', 'AI-Assisted Development at Scale'], steps: 0, layout: 'center', form: () => 'noise',
    content: t => <div className="title">
      <p className="eyebrow">Product Definition as Code</p>
      <h1>AI-Assisted Development at Scale</h1>
      <p className="subtitle">Keeping Product Decisions, Specs, and Agents Aligned</p>
      <dl className="title-block">
        <div><dt>{t('Speaker', 'Ponente')}</dt><dd>Juan G. Carmona</dd></div>
        <div><dt>{t('Role', 'Puesto')}</dt><dd>Software Development Engineer · Plain Concepts</dd></div>
        <div><dt>{t('Event', 'Evento')}</dt><dd>X-Ops Conference Madrid 2026</dd></div>
        <div><dt>{t('Place', 'Lugar')}</dt><dd>Aula Magna · URJC Móstoles</dd></div>
        <div><dt>{t('Date', 'Fecha')}</dt><dd>2026-11-21</dd></div>
      </dl>
    </div>,
  },
  {
    id: 'lifecycle', act: 1, title: ['The software lifecycle', 'El ciclo de vida del software'], steps: 2, layout: 'full', form: step => (['lifecycle', 'lifecycle-ai', 'lifecycle-left'] as const)[step],
    content: t => <>
      <h2>{t('The software lifecycle', 'El ciclo de vida del software')}</h2>
      <div className="overlay">
        {stages.map((s, k) => <span key={k} className={`stage ${k === 5 ? 'today' : ''}`} style={{ left: s.x, top: s.y + 34 }}>{t(...stageNames[k])}</span>)}
        <span className="today-mark" style={{ left: stages[5].x, top: stages[5].y - 96 }}>{t('Today', 'Hoy')}</span>
        <At at={1} until={2} className="band-label" style={{ left: stages[3].x - 60, top: 700 }}>{t('Where the AI investment is today', 'Dónde está hoy la inversión en IA')}</At>
        <At at={2} className="band-label future" style={{ left: stages[0].x - 60, top: 700 }}>{t('Future opportunity', 'La oportunidad')}</At>
        <p className="caption" style={{ top: 820 }}>“AI is rapidly accelerating the middle of the lifecycle.<At at={2} as="span" className="inline"> The next bottleneck is moving left.</At>”</p>
      </div>
    </>,
  },
  {
    id: 'fragments', act: 1, title: ['Where product knowledge lives', 'Dónde vive el conocimiento de producto'], steps: 0, layout: 'full', form: () => 'fragments',
    content: t => <>
      <h2>{t('Where product knowledge lives', 'Dónde vive el conocimiento de producto')}</h2>
      <div className="overlay">
        <span className="knowledge" style={{ left: knowledge.x, top: knowledge.y }}>Product Knowledge</span>
        {sources.map((s, k) => <span key={k} className="source-name" style={{ left: s.x, top: s.y, '--k': k } as CSSProperties}>{sourceNames[k]}</span>)}
        <div className="fragments-line"><p>“AI doesn’t have a product model.</p><p>It has <em>fragments</em>.”</p></div>
      </div>
    </>,
  },
  {
    id: 'direction', act: 1, title: ['Direction', 'Rumbo'], steps: 1, layout: 'left', form: step => (step ? 'heading-set' : 'heading-lost'),
    content: t => <>
      <h2>{t('Direction', 'Rumbo')}</h2>
      <p className="lead">{t('Without direction, a team builds at random. So does vibe coding.', 'Sin rumbo, un equipo construye a lo loco. Con vibe coding, también.')}</p>
      <At at={1}><p className="lead">{t('With direction, every decision solves today’s problem and keeps the destination in sight.', 'Con rumbo, cada decisión resuelve el problema de hoy sin perder de vista el destino.')}</p></At>
    </>,
  },
  {
    id: 'noise', act: 1, title: ['SDD at scale makes noise', 'SDD a escala genera ruido'], steps: 6, layout: 'full', form: step => (['specs-0', 'specs-1', 'specs-2', 'specs-3', 'specs-many', 'specs-dim', 'specs-dim'] as const)[step],
    content: t => <>
      <h2>{t('SDD at scale makes noise', 'SDD a escala genera ruido')}</h2>
      <div className="overlay">
        <At at={0} until={4} className="spec-cards">
          <span className="target-label" style={{ left: target.x, top: target.y - 112 }}>{t('one rule', 'una regla')}</span>
          <span className="target-label concept" style={{ left: target.x, top: target.y + 78 }}>{t('the refund', 'la devolución')}</span>
        </At>
        {([['billing', '', 'Refunds', ' are issued for purchases made in the last 30 days.', 'var(--k-constraint)'], ['checkout', 'Customers can request a ', 'refund', ' within 30 days of delivery.', 'var(--k-use-case)'], ['support', 'If the order is less than a month old, offer a ', 'refund', '.', 'var(--k-domain-term)']] as const).map(([spec, before, word, after, c], k) =>
          <At key={spec} at={k + 1} until={4} className="spec-card" style={{ left: specCards.x, top: specCards.tops[k], minHeight: specCards.height, '--c': c } as CSSProperties}><small>openspec/specs/{spec}</small><p>{before}<mark>{word}</mark>{after}</p></At>)}
        <At at={4} until={5} className="times"><b>×160</b><span>specs</span></At>
      </div>
      <At at={5} className="stack shillinq">
        <p className="repo">ConductionNL/shillinq</p>
        <p className="lead">{t('An open-source accounting suite built with SDD: 160 OpenSpec specs, 273 archived changes.', 'Una suite de contabilidad open source hecha con SDD: 160 specs de OpenSpec, 273 cambios archivados.')}</p>
        <blockquote>“Forbidden and mandatory, same file, same day, both marked MUST.”</blockquote>
        <Dim label={t('380 lines apart', '380 líneas de distancia')} width={560} />
        <At at={6} className="punch"><p>“Validation checks shape, not meaning.”</p></At>
      </At>
    </>,
  },
  {
    id: 'before', act: 1, title: ['Before', 'Antes'], steps: 6, layout: 'full', form: step => (['before-0', 'before-1', 'before-2', 'before-3', 'before-4', 'before-5', 'before-dim'] as const)[step],
    content: t => <>
      <Backlog t={t} after={false} />
      <Chain at={6} tone="bad" links={[t('indeterminism', 'indeterminismo'), t('drift', 'deriva'), t('rework', 'retrabajo')]} />
    </>,
  },
  {
    id: 'not-truth', act: 1, title: ['Specs are not the source of truth', 'Las specs no son la fuente de verdad'], steps: 3, layout: 'center', form: () => 'specs-dim',
    content: t => <div className="why">
      <p className="verdict">{t('Specs should not be the source of truth.', 'Las specs no deberían ser la fuente de verdad.')}</p>
      <Chain at={1} tone="bad" links={[t('redefine', 'redefinir'), t('vary', 'variar'), t('diverge', 'divergir')]} />
      <At at={2}><p className="why-line">{t('More specs, more divergence.', 'Más specs, más divergencia.')}</p></At>
      <At at={3}><p className="why-line feed">{t('Specs must feed from a source of truth.', 'Las specs deben alimentarse de una fuente de verdad.')}</p></At>
    </div>,
  },
  {
    id: 'two-truths', act: 2, title: ['Two sources of truth', 'Dos fuentes de verdad'], steps: 1, layout: 'left', form: () => 'two',
    content: t => <>
      <h2>{t('Two sources of truth', 'Dos fuentes de verdad')}</h2>
      <div className="truths">
        <section className="truth intent"><small>{t('Intent · what', 'Intención · qué')}</small><strong>{t('Product', 'Producto')}</strong><code>docs/product/</code></section>
        <svg className="cites" viewBox="0 0 160 60" aria-hidden="true"><path className="draw dashed" pathLength={1} d="M4 30 H156" /><text x="80" y="20" textAnchor="middle">{t('cites', 'cita')}</text></svg>
        <section className="truth how"><small>{t('Architecture · how', 'Arquitectura · cómo')}</small><strong>{t('Architecture', 'Arquitectura')}</strong><code>docs/architecture/</code></section>
      </div>
      <p className="lead">{t('Related. Never confused.', 'Relacionadas. Nunca confundidas.')}</p>
      <At at={1} className="feeds"><span aria-hidden="true">↓</span><p><b>SDD</b>{t('specs, agents and code read both. That is their source of truth.', 'specs, agentes y código leen las dos. Esa es su fuente de verdad.')}</p></At>
    </>,
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
    id: 'drift', act: 3, title: ['Change it, and CI knows', 'Cámbiala y CI lo sabe'], steps: 3, layout: 'full', form: step => step >= 2 ? 'drift-stale' : 'drift-current',
    content: t => <>
      <h2>{t('Change it,', 'Cámbiala')}<br />{t('and CI knows', 'y CI lo sabe')}</h2>
      <div className="overlay">
        <RuleCard change />
        <Citers t={t} at={0} citeAt={0} staleAt={2} />
        <At at={0} until={1} className="cite-foot">
          <Term label={t('Citation verification before the change', 'Verificación de citas antes del cambio')} lines={[
            '$ prodshape citations verify',
            '6 citation(s): [[6 current]], 0 stale, 0 tampered, 0 unresolved',
            '# exit 0',
          ]} />
        </At>
        <At at={1} until={2} className="cite-foot">
          <Term label={t('The Product Change is applied', 'Se aplica el Product Change')} lines={[
            '$ prodshape change apply CHG-REFUND-002',
            'Product diff: 0 added, 3 modified, 0 removed',
            'Applied and archived. Nothing was committed: …',
          ]} />
        </At>
        <At at={2} until={3} className="cite-foot">
          <Term label={t('Citation verification after the change', 'Verificación de citas después del cambio')} lines={[
            '$ prodshape citations verify',
            '6 citation(s): 0 current, [[6 stale]], 0 tampered, 0 unresolved',
            '# exit 1',
          ]} />
        </At>
        <At at={3} className="cite-foot states">
          <p><b className="s-current">current</b>{t('matches', 'coincide')}</p>
          <p><b className="s-stale">stale</b>{t('artifact changed', 'el artefacto cambió')}</p>
          <p><b className="s-tampered">tampered</b>{t('embedded copy edited', 'copia incrustada editada')}</p>
          <p><b className="s-unresolved">unresolved</b>{t('ID not found', 'ID no encontrado')}</p>
        </At>
      </div>
    </>,
  },
  {
    id: 'change', act: 3, title: ['Tools validate, people accept', 'Las herramientas validan, las personas aceptan'], steps: 2, layout: 'full', form: () => 'pipeline',
    content: t => <>
      <h2>{t('Tools validate, people accept', 'Las herramientas validan, las personas aceptan')}</h2>
      <ol className="pipeline">
        {[['Product Change', 'CHG-…', false], ['change validate', 'overlay', false], [t('approve', 'aprobar'), t('person', 'persona'), true], ['change apply', t('no commits', 'sin commits'), false], ['PR + CI', 'prodshape validate', false], ['merge', t('person', 'persona'), true]].map(([name, detail, human], k) => <li key={k} className={human ? 'human' : ''} style={{ '--k': k } as CSSProperties}>
          {human && <Person />}<strong>{name}</strong><small>{detail}</small>
        </li>)}
      </ol>
      <At at={1}><p className="punch">“A human merge accepts the resulting baseline; apply is not acceptance.”</p></At>
      <At at={2} className="bands">
        <p><b>{t('Tools', 'Herramientas')}</b>{t('schemas · IDs · relationships · digests · citations', 'esquemas · IDs · relaciones · digests · citas')}</p>
        <p><b>{t('AI skills', 'Skills de IA')}</b>{t('drafting · impact interpretation · exploration', 'redacción · interpretación de impacto · exploración')}</p>
        <p><b>{t('People', 'Personas')}</b>{t('approve a Product Change · accept by merge', 'aprobar un Product Change · aceptar con el merge')}</p>
      </At>
    </>,
  },
  {
    id: 'trust', act: 4, title: ['Can we trust it?', '¿Podemos fiarnos?'], steps: 1, layout: 'left', form: () => 'question',
    content: t => <div className="questions">
      <p className="question">{t('Is what was built what had to be built?', '¿Lo que se ha implementado es lo que tenía que implementar?')}</p>
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
