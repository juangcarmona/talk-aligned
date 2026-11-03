import { useContext, useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { At, Dim, Kind, Person, Source, StepContext, Term } from './components'
import { layers, pieceColors, type FormName } from './field/forms'
import type { T } from './i18n'
import { highlight } from './field/GlyphField'
import { QrCode } from './QrCode'

// The scene list mirrors content/outline.md. Wording on screen comes from the
// sources named there; headings are new wording proposed for Juan.

export type Scene = {
  id: string
  act: 0 | 1 | 2 | 3 | 4
  title: [en: string, es: string]
  steps: number
  layout: 'left' | 'center' | 'full'
  form: (step: number) => FormName
  content: (t: T) => ReactNode
}

export const acts: [string, string][] = [['', ''], ['I · Why', 'I · Por qué'], ['II · Define', 'II · Definir'], ['III · Cite', 'III · Citar'], ['IV · Own it', 'IV · Asumirlo']]

const rows: [string, string, string?][] = [['API', 'API'], ['commands', 'comandos', 'Application'], ['queries', 'consultas', 'Application'], ['Domain', 'Dominio'], ['Infrastructure', 'Infraestructura']]

/** Before and after, on the layers of a Clean Architecture with CQRS. The pieces are points of the glyph field; this draws the layers, the labels and a legend whose entries light their pieces. */
function Layers({ t }: { t: T }) {
  const step = useContext(StepContext)
  const [lit, setLit] = useState(-1)
  useEffect(() => { highlight(lit) }, [lit])
  useEffect(() => () => highlight(-1), [])
  const { top, row, width, panels } = layers
  const bottom = top + row * rows.length
  const legend = (panel: number, grey: string, entries: [label: string, group: number, at: number][]) =>
    <div className="legend" style={{ left: panels[panel] }}>
      <span className="key expected">{grey}</span>
      {entries.map(([label, group, at], k) => <At as="span" at={at} key={group}>
        <button type="button" className={`key ${lit === group ? 'lit' : lit >= 0 ? 'faded' : ''}`} data-hover style={{ '--c': pieceColors[k] } as CSSProperties}
          onPointerEnter={() => setLit(group)} onPointerLeave={() => setLit(-1)} onFocus={() => setLit(group)} onBlur={() => setLit(-1)}>{label}</button>
      </At>)}
    </div>
  return <>
    <svg className="layers" viewBox="0 0 1920 1080" role="img" aria-label={t('Before and after on the layers of a Clean Architecture with CQRS', 'Antes y después sobre las capas de una Clean Architecture con CQRS')}>
      {panels.map((x, p) => <g key={p} className={p && step < 7 ? 'waiting' : ''}>
        <text className="label" x={x} y={top - 24}>{p ? t('After · intent and architecture defined', 'Después · intención y arquitectura definidas') : t('Before · SDD alone', 'Antes · solo SDD')}</text>
        <rect className="frame" x={x} y={top} width={width} height={bottom - top} />
        {rows.slice(1).map((_, r) => <line key={r} className={r === 1 ? 'split' : ''} x1={x} x2={x + width} y1={top + (r + 1) * row} y2={top + (r + 1) * row} />)}
      </g>)}
      {rows.map(([en, es, group], r) => <g key={r} className="row-label">
        {group && <text className="group" x="960" y={top + r * row + 38} textAnchor="middle">{t(group, 'Aplicación')}</text>}
        <text x="960" y={top + r * row + (group ? 66 : 57)} textAnchor="middle">{t(en, es)}</text>
      </g>)}
    </svg>
    {legend(0, t('expected', 'lo esperado'), [1, 2, 3].map(k => [`${t('delivery', 'entrega')} ${k}`, k - 1, k + 3]))}
    {legend(1, t('defined', 'lo definido'), [1, 2, 3, 4].map(k => [`${t('slice', 'porción')} ${k}`, k + 9, 7]))}
  </>
}

const ARC_DIGEST = 'sha256:0c2a1bb402fcf272e5ecfe15282e8d15dccd7fb57992a344071757f82cf457a7'

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
    id: 'origin', act: 1, title: ['Where this came from', 'De dónde viene esto'], steps: 10, layout: 'left', form: step => (['copies', 'off-target', 'condense', 'model', 'before-1', 'before-2', 'before-3', 'after-0', 'after-1', 'after-2', 'after-3'] as const)[step],
    content: t => <>
      <h2>{t('Where this came from', 'De dónde viene esto')}</h2>
      <At at={0} until={1} className="beat">
        <svg className="drawing" viewBox="0 0 900 290" role="img" aria-label={t('Three SDD cycles, each redefining what we want', 'Tres ciclos SDD, cada uno redefine lo que queremos')}>
          {[0, 1, 2].map(k => {
            const cx = 120 + k * 330
            return <g key={k} style={{ '--d': `${k * 0.3}s` } as CSSProperties}>
              <text className="label" x={cx} y="30" textAnchor="middle">{t('SDD cycle', 'Ciclo SDD')} {k + 1}</text>
              <path className="draw" pathLength={1} d={`M${cx + 108} 170 A108 108 0 1 1 ${cx + 84} 102`} />
              <path className="draw" pathLength={1} d={`M${cx + 84} 102 l4 -20 m-4 20 l-20 -4`} />
              <text className="inside" x={cx} y="164" textAnchor="middle">{t('redefine', 'redefinir')}</text>
              <text className="inside" x={cx} y="194" textAnchor="middle">{t('what we want', 'lo que queremos')}</text>
              {k < 2 && <path className="draw" pathLength={1} d={`M${cx + 120} 170 H${cx + 206} m-12 -8 l12 8 l-12 8`} />}
            </g>
          })}
        </svg>
        <p className="lead">{t('Every SDD cycle redefined the product.', 'Cada ciclo SDD redefinía el producto.')}</p>
      </At>
      <At at={1} until={2} className="beat">
        <svg className="drawing" viewBox="0 0 900 300" role="img" aria-label={t('What we wanted and what the AI understood diverge; the gap is drift', 'Lo que queríamos y lo que entendió la IA divergen; la distancia es la deriva')}>
          <circle cx="40" cy="150" r="8" className="dot" />
          <path className="draw" pathLength={1} d="M40 150 L780 70" />
          <path className="draw warn" pathLength={1} d="M40 150 C 300 150, 520 210, 780 260" style={{ '--d': '0.3s' } as CSSProperties} />
          <text className="label" x="560" y="74" textAnchor="end">{t('what we wanted', 'lo que queríamos')}</text>
          <text className="label warn" x="560" y="250" textAnchor="end">{t('what the AI understood', 'lo que entendió la IA')}</text>
          <path className="draw dimline" pathLength={1} d="M820 70 V260 M806 70 H834 M806 260 H834" style={{ '--d': '0.9s' } as CSSProperties} />
          <text className="dimtext" x="848" y="172">{t('drift', 'deriva')}</text>
        </svg>
        <p className="lead">{t('Rework, every iteration.', 'Retrabajo en cada iteración.')}</p>
      </At>
      <At at={2} until={3} className="beat">
        <p className="kicker">{t("A real PoC. Let's do it right.", 'Una PoC de verdad. Vamos a hacerlo bien.')}</p>
        <div className="blocks">
          <section><small>01</small><strong>{t('Architecture foundations', 'Bases de arquitectura')}</strong></section>
          <section><small>02</small><strong>{t('MVP defined early', 'MVP definido pronto')}</strong></section>
        </div>
        <p className="question">{t('What do we know about the product?', '¿Qué sabemos del producto?')}</p>
      </At>
      <At at={3} until={4} className="beat">
        <pre className="tree">{'docs/product/\n├── actors/\n├── use-cases/\n├── business-rules/\n└── domain/          '}<span className="comment"># DDD</span></pre>
        <p className="lead">{t('Plain Markdown. Product engineering and DDD.', 'Markdown sencillo. Product engineering y DDD.')}</p>
      </At>
      <At at={0} until={4}><p className="muted small">{t('SDD projects at Plain Concepts, internal and for clients. Clients not named.', 'Proyectos SDD en Plain Concepts, internos y para clientes. Sin nombrar clientes.')}</p></At>
      <At at={4} className="architecture">
        <Layers t={t} />
        <At at={4} until={7}><p className="lead">{t('Every delivery touches every layer.', 'Cada entrega toca todas las capas.')}</p></At>
        <At at={7}><p className="lead">{t('Each slice lands close to where it was defined.', 'Cada porción cae cerca de donde se definió.')}</p></At>
        <p className="muted small">{t('Illustration of SDD projects at Plain Concepts, internal and for clients. Not measured data.', 'Ilustración de proyectos SDD en Plain Concepts, internos y para clientes. No son datos medidos.')}</p>
      </At>
    </>,
  },
  {
    id: 'noise', act: 1, title: ['SDD at scale makes noise', 'SDD a escala genera ruido'], steps: 2, layout: 'left', form: () => 'copies',
    content: t => <>
      <h2>{t('SDD at scale makes noise', 'SDD a escala genera ruido')}</h2>
      <At at={0} until={1}>
        <Term label={t('Three specs restating one refund rule', 'Tres specs que reescriben una regla de devolución')} lines={[
          '$ grep -rn -i "refund" openspec/specs',
          'billing:   Refunds are issued for [[purchases]] made in the last 30 days.',
          'checkout:  Customers can request a refund within 30 days of [[delivery]].',
          'support:   If the order is less than a month old, offer a refund.',
        ]} />
        <Source t={t}>{t('Example from pdac.dev', 'Ejemplo de pdac.dev')}</Source>
      </At>
      <At at={1} className="stack">
        <p className="repo">ConductionNL/shillinq</p>
        <div className="stats"><p><b>160</b> specs</p><p><b>273</b> {t('archived changes', 'cambios archivados')}</p></div>
        <blockquote>“Forbidden and mandatory, same file, same day, both marked MUST.”</blockquote>
        <Dim label={t('380 lines apart', '380 líneas de distancia')} width={560} />
        <Source t={t}>I Tried to Prove PDaC Wrong · jgcarmona.com, {t('Aug 2026', 'ago. 2026')}</Source>
      </At>
      <At at={2} className="punch"><p>“Validation checks shape, not meaning.”</p></At>
    </>,
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
      <At at={1}>
        <blockquote className="small-quote">“ProductShape owns product intent, ArcShape owns architecture evidence and Lighthouse owns the delivery baseline.”</blockquote>
        <Source t={t}>Lighthouse README</Source>
      </At>
    </>,
  },
  {
    id: 'artifacts', act: 2, title: ['Small artifacts, stable IDs', 'Artefactos pequeños, IDs estables'], steps: 1, layout: 'left', form: step => step ? 'kinds' : 'logo',
    content: t => <>
      <h2>{t('Small artifacts, stable IDs', 'Artefactos pequeños, IDs estables')}</h2>
      <At at={0} until={1}>
        <ul className="kinds">
          {[['ACT', t('Actor', 'Actor')], ['JRN', t('Journey', 'Journey')], ['UC', t('Use case', 'Caso de uso')], ['BR', t('Business rule', 'Regla de negocio')], ['TERM', t('Domain term', 'Término de dominio')], ['BC', t('Bounded context', 'Bounded context')], ['FR', t('Functional req.', 'Req. funcional')], ['QR', t('Quality req.', 'Req. de calidad')], ['CON', t('Constraint', 'Restricción')], ['SB', t('Structured behaviour', 'Comportamiento estructurado')]].map(([token, name]) => <li key={token}><Kind token={token} />{name}</li>)}
        </ul>
        <p className="muted">{t('Markdown with frontmatter. Each relationship written once; the graph is compiled.', 'Markdown con frontmatter. Cada relación se escribe una vez; el grafo se compila.')}</p>
        <Source t={t}>PDaC-2 · pdac.dev/diagrams</Source>
      </At>
      <At at={1}>
        <article className="card" style={{ viewTransitionName: 'rule-card' }}>
          <header><Kind token="BR" /><code>BR-PRODUCT-DEFINITION-AUTHORITY</code></header>
          <pre className="frontmatter">{'type: business-rule\nstatus: active\napplies-to:\n  - UC-CREATE-ARCHITECTURE-DOCS\n  - UC-LINK-PRODUCT-DEFINITION  …'}</pre>
          <p>“When an approved ProductShape definition exists, ArcShape must link or cite its relevant approved artifacts rather than copying or replacing them as a competing source of product truth.”</p>
        </article>
        <Source t={t}>arcshape · docs/product/model/business-rules/br-product-definition-authority.md</Source>
      </At>
    </>,
  },
  {
    id: 'cite', act: 3, title: ['Define once, cite everywhere', 'Define una vez, cita en todas partes'], steps: 3, layout: 'left', form: () => 'cite',
    content: t => <>
      <h2>{t('Define once, cite everywhere', 'Define una vez, cita en todas partes')}</h2>
      <article className="card compact" style={{ viewTransitionName: 'rule-card' }}>
        <header><Kind token="BR" /><code>BR-PRODUCT-DEFINITION-AUTHORITY</code></header>
      </article>
      <At at={1}>
        <ul className="consumers">
          {['docs/architecture/02-constraints/README.md:25', 'docs/architecture/08-crosscutting-concepts/README.md:13', 'docs/product/changes/…/implementation-backlog.md:82'].map((file, k) => <li key={file} style={{ '--k': k } as CSSProperties}><span className="stamp">sha256:0c2a1bb4</span><code>{file}</code></li>)}
        </ul>
      </At>
      <At at={2}>
        <pre className="cite-line">{'<!-- pdac:cite\n     id="BR-PRODUCT-DEFINITION-AUTHORITY"\n     digest="'}<mark>{ARC_DIGEST.slice(0, 23)}</mark>{'…" -->'}</pre>
      </At>
      <At at={3}><p className="tally"><b>370</b> {t('citations in', 'citas en')} <b>55</b> {t('files', 'ficheros')}</p></At>
      <Source t={t}>arcshape @ 62ffe75 · git grep pdac:cite</Source>
    </>,
  },
  {
    id: 'drift', act: 3, title: ['Change it, and CI knows', 'Cámbiala y CI lo sabe'], steps: 3, layout: 'left', form: step => step >= 2 ? 'drift-stale' : 'drift-current',
    content: t => <>
      <h2>{t('Change it, and CI knows', 'Cámbiala y CI lo sabe')}</h2>
      <article className="card compact" style={{ viewTransitionName: 'rule-card' }}>
        <header><Kind token="BR" /><code>BR-REFUND-001</code></header>
        <p className="rule">Refunds are accepted within <span className="old">30</span><At at={1} as="span" className="inline"><span className="new">14</span></At> days of delivery.</p>
      </article>
      <At at={0} until={2}>
        <Term label={t('Citation verification before the change', 'Verificación de citas antes del cambio')} lines={[
          '$ prodshape citations verify',
          '[[current]]\tBR-REFUND-001\topenspec/refund.citations.yml:1',
          '1 citation(s): 1 current, 0 stale, 0 tampered, 0 unresolved',
          '# exit 0',
        ]} />
      </At>
      <At at={2} until={3}>
        <Term label={t('Citation verification after the change', 'Verificación de citas después del cambio')} lines={[
          '$ prodshape citations verify',
          '[[stale]]\tBR-REFUND-001\topenspec/refund.citations.yml:1',
          'warning [[PRODUCT061]] openspec/refund.citations.yml entry 1:',
          '  Citation of \'BR-REFUND-001\' is stale: canonical content',
          '  changed since the citation was recorded',
          '1 citation(s): 0 current, 1 stale, 0 tampered, 0 unresolved',
          '# exit 1',
        ]} />
      </At>
      <At at={3} className="states">
        <p><b className="s-current">current</b>{t('matches', 'coincide')}</p>
        <p><b className="s-stale">stale</b>{t('artifact changed', 'el artefacto cambió')}</p>
        <p><b className="s-tampered">tampered</b>{t('embedded copy edited', 'copia incrustada editada')}</p>
        <p><b className="s-unresolved">unresolved</b>{t('ID not found', 'ID no encontrado')}</p>
      </At>
      <Source t={t}>{t('ProductShape release contract', 'Release contract de ProductShape')} · @prodshape/cli@0.22.1, {t('run', 'ejecutado')} 2026-11-03</Source>
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
      <Source t={t}>ProductShape README · docs/methodology/change.md · overview.md</Source>
    </>,
  },
  {
    id: 'dogfooding', act: 4, title: ['It runs on its own tools', 'Funciona sobre sus propias herramientas'], steps: 1, layout: 'full', form: () => 'dogfood',
    content: t => <>
      <h2>{t('It runs on its own tools', 'Funciona sobre sus propias herramientas')}</h2>
      <div className="products">
        <section><strong>ProductShape</strong><p>{t('first commit', 'primer commit')} 2026-07-25</p><p>0.1.0 → 0.22.1</p><p><b>95</b> {t('artifacts defining itself', 'artefactos que lo definen')}</p></section>
        <section><strong>ArcShape</strong><p>{t('first commit', 'primer commit')} 2026-10-16</p><p>baseline <code>CHG-INITIAL</code></p><p><b>35</b> {t('artifacts', 'artefactos')}</p></section>
        <section><strong>Lighthouse</strong><p>{t('first commit', 'primer commit')} 2026-10-20</p><p>{t('delivery baseline', 'baseline de entrega')}</p><p><b>127</b> {t('artifacts', 'artefactos')}</p></section>
      </div>
      <At at={1}><p className="lead">{t('Others already use it, with ProductShape or their own tools.', 'Otros ya la usan, con ProductShape o con sus propias herramientas.')}</p></At>
      <Source t={t}>{t('git log and docs/product/model of each repository', 'git log y docs/product/model de cada repositorio')}, 2026-11-03</Source>
    </>,
  },
  {
    id: 'limits', act: 4, title: ['What it does not catch', 'Lo que no detecta'], steps: 1, layout: 'left', form: () => 'bands',
    content: t => <>
      <h2>{t('What it does not catch', 'Lo que no detecta')}</h2>
      <p className="punch">“Structural impact is not semantic impact.”</p>
      <p className="echo">“Validation checks shape, not meaning.”</p>
      <p className="muted">{t('Two accepted artifacts that contradict each other both validate.', 'Dos artefactos aceptados que se contradicen validan los dos.')}</p>
      <At at={1}><p className="lead">{t('Still to define: SDD flows, agentic workflows.', 'Por definir: flujos SDD y agentic workflows.')}</p></At>
      <Source t={t}>ProductShape docs/limitations.md · I Tried to Prove PDaC Wrong</Source>
    </>,
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
