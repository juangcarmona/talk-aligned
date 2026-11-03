import type { CSSProperties } from 'react'
import type { ReactNode } from 'react'
import { At, Dim, Kind, Person, Source, Term } from './components'
import type { FormName } from './field/forms'
import { QrCode } from './QrCode'

// The scene list mirrors content/outline.md. Wording on screen comes from the
// sources named there; headings are new wording proposed for Juan.

export type Scene = {
  id: string
  act: 0 | 1 | 2 | 3 | 4
  title: string
  steps: number
  layout: 'left' | 'center' | 'full'
  form: (step: number) => FormName
  content: ReactNode
}

export const acts = ['', 'I · Why', 'II · Define', 'III · Cite', 'IV · Own it'] as const

const ARC_DIGEST = 'sha256:0c2a1bb402fcf272e5ecfe15282e8d15dccd7fb57992a344071757f82cf457a7'

export const scenes: Scene[] = [
  {
    id: 'title', act: 0, title: 'AI-Assisted Development at Scale', steps: 0, layout: 'center', form: () => 'noise',
    content: <div className="title">
      <p className="eyebrow">Product Definition as Code</p>
      <h1>AI-Assisted Development at Scale</h1>
      <p className="subtitle">Keeping Product Decisions, Specs, and Agents Aligned</p>
      <dl className="title-block">
        <div><dt>Speaker</dt><dd>Juan G. Carmona</dd></div>
        <div><dt>Role</dt><dd>Software Development Engineer · Plain Concepts</dd></div>
        <div><dt>Event</dt><dd>X-Ops Conference Madrid 2026</dd></div>
        <div><dt>Place</dt><dd>Aula Magna · URJC Móstoles</dd></div>
        <div><dt>Date</dt><dd>2026-11-21</dd></div>
      </dl>
    </div>,
  },
  {
    id: 'origin', act: 1, title: 'Where this came from', steps: 1, layout: 'left', form: step => step ? 'condense' : 'noise',
    content: <>
      <h2>Where this came from</h2>
      <svg className="flow" viewBox="0 0 960 150" role="img" aria-label="Client proofs of concept, then reverse engineering, then product definition">
        {['Client PoCs', 'Reverse engineering', 'Product definition'].map((label, k) => <g key={label} style={{ '--d': `${k * 0.35}s` } as CSSProperties}>
          <rect className="draw" pathLength={1} x={k * 335 + 2} y="30" width="286" height="90" rx="3" />
          <text x={k * 335 + 145} y="83" textAnchor="middle">{label}</text>
          {k < 2 && <path className="draw arrow" pathLength={1} d={`M${k * 335 + 294} 75 H${k * 335 + 329} m-12 -8 l12 8 l-12 8`} />}
        </g>)}
      </svg>
      <p className="muted">SDD projects at Plain Concepts. Clients not named.</p>
      <At at={1} className="bars">
        <div className="bar"><span>drift · with a product definition</span><i style={{ width: '22%' }} /></div>
        <div className="bar noise"><span>noise · SDD alone</span><i style={{ width: '88%' }} /></div>
        <p className="muted small">Qualitative, from those projects. No numbers.</p>
      </At>
    </>,
  },
  {
    id: 'noise', act: 1, title: 'SDD at scale makes noise', steps: 2, layout: 'left', form: () => 'copies',
    content: <>
      <h2>SDD at scale makes noise</h2>
      <At at={0} until={1}>
        <Term label="Three specs restating one refund rule" lines={[
          '$ grep -rn -i "refund" openspec/specs',
          'billing:   Refunds are issued for [[purchases]] made in the last 30 days.',
          'checkout:  Customers can request a refund within 30 days of [[delivery]].',
          'support:   If the order is less than a month old, offer a refund.',
        ]} />
        <Source>Example from pdac.dev</Source>
      </At>
      <At at={1} className="stack">
        <p className="repo">ConductionNL/shillinq</p>
        <div className="stats"><p><b>160</b> specs</p><p><b>273</b> archived changes</p></div>
        <blockquote>“Forbidden and mandatory, same file, same day, both marked MUST.”</blockquote>
        <Dim label="380 lines apart" width={520} />
        <Source>I Tried to Prove PDaC Wrong · jgcarmona.com, Aug 2026</Source>
      </At>
      <At at={2} className="punch"><p>“Validation checks shape, not meaning.”</p></At>
    </>,
  },
  {
    id: 'two-truths', act: 2, title: 'Two sources of truth', steps: 1, layout: 'left', form: () => 'two',
    content: <>
      <h2>Two sources of truth</h2>
      <div className="truths">
        <section className="truth intent"><small>Intent · what</small><strong>Product</strong><code>docs/product/</code></section>
        <svg className="cites" viewBox="0 0 160 60" aria-hidden="true"><path className="draw dashed" pathLength={1} d="M4 30 H156" /><text x="80" y="20" textAnchor="middle">cites</text></svg>
        <section className="truth how"><small>Architecture · how</small><strong>Architecture</strong><code>docs/architecture/</code></section>
      </div>
      <p className="lead">Related. Never confused.</p>
      <At at={1}>
        <blockquote className="small-quote">“ProductShape owns product intent, ArcShape owns architecture evidence and Lighthouse owns the delivery baseline.”</blockquote>
        <Source>Lighthouse README</Source>
      </At>
    </>,
  },
  {
    id: 'artifacts', act: 2, title: 'Small artifacts, stable IDs', steps: 1, layout: 'left', form: step => step ? 'kinds' : 'logo',
    content: <>
      <h2>Small artifacts, stable IDs</h2>
      <At at={0} until={1}>
        <ul className="kinds">
          {[['ACT', 'Actor'], ['JRN', 'Journey'], ['UC', 'Use case'], ['BR', 'Business rule'], ['TERM', 'Domain term'], ['BC', 'Bounded context'], ['FR', 'Functional req.'], ['QR', 'Quality req.'], ['CON', 'Constraint'], ['SB', 'Structured behaviour']].map(([token, name]) => <li key={token}><Kind token={token} />{name}</li>)}
        </ul>
        <p className="muted">Markdown with frontmatter. Each relationship written once; the graph is compiled.</p>
        <Source>PDaC-2 · pdac.dev/diagrams</Source>
      </At>
      <At at={1}>
        <article className="card" style={{ viewTransitionName: 'rule-card' }}>
          <header><Kind token="BR" /><code>BR-PRODUCT-DEFINITION-AUTHORITY</code></header>
          <pre className="frontmatter">{'type: business-rule\nstatus: active\napplies-to:\n  - UC-CREATE-ARCHITECTURE-DOCS\n  - UC-LINK-PRODUCT-DEFINITION  …'}</pre>
          <p>“When an approved ProductShape definition exists, ArcShape must link or cite its relevant approved artifacts rather than copying or replacing them as a competing source of product truth.”</p>
        </article>
        <Source>arcshape · docs/product/model/business-rules/br-product-definition-authority.md</Source>
      </At>
    </>,
  },
  {
    id: 'cite', act: 3, title: 'Define once, cite everywhere', steps: 3, layout: 'left', form: () => 'cite',
    content: <>
      <h2>Define once, cite everywhere</h2>
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
      <At at={3}><p className="tally"><b>370</b> citations in <b>55</b> files</p></At>
      <Source>arcshape @ 62ffe75 · git grep pdac:cite</Source>
    </>,
  },
  {
    id: 'drift', act: 3, title: 'Change it, and CI knows', steps: 3, layout: 'left', form: step => step >= 2 ? 'drift-stale' : 'drift-current',
    content: <>
      <h2>Change it, and CI knows</h2>
      <article className="card compact" style={{ viewTransitionName: 'rule-card' }}>
        <header><Kind token="BR" /><code>BR-REFUND-001</code></header>
        <p className="rule">Refunds are accepted within <span className="old">30</span><At at={1} as="span" className="inline"><span className="new">14</span></At> days of delivery.</p>
      </article>
      <At at={0} until={2}>
        <Term label="Citation verification before the change" lines={[
          '$ prodshape citations verify',
          '[[current]]\tBR-REFUND-001\topenspec/refund.citations.yml:1',
          '1 citation(s): 1 current, 0 stale, 0 tampered, 0 unresolved',
          '# exit 0',
        ]} />
      </At>
      <At at={2} until={3}>
        <Term label="Citation verification after the change" lines={[
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
        <p><b className="s-current">current</b>matches</p>
        <p><b className="s-stale">stale</b>artifact changed</p>
        <p><b className="s-tampered">tampered</b>embedded copy edited</p>
        <p><b className="s-unresolved">unresolved</b>ID not found</p>
      </At>
      <Source>ProductShape release contract · @prodshape/cli@0.22.1, run 2026-11-03</Source>
    </>,
  },
  {
    id: 'change', act: 3, title: 'Tools validate, people accept', steps: 2, layout: 'full', form: () => 'pipeline',
    content: <>
      <h2>Tools validate, people accept</h2>
      <ol className="pipeline">
        {[['Product Change', 'CHG-…'], ['change validate', 'overlay'], ['approve', 'person'], ['change apply', 'no commits'], ['PR + CI', 'prodshape validate'], ['merge', 'person']].map(([name, detail], k) => <li key={name} className={detail === 'person' ? 'human' : ''} style={{ '--k': k } as CSSProperties}>
          {detail === 'person' && <Person />}<strong>{name}</strong><small>{detail}</small>
        </li>)}
      </ol>
      <At at={1}><p className="punch">“A human merge accepts the resulting baseline; apply is not acceptance.”</p></At>
      <At at={2} className="bands">
        <p><b>Tools</b>schemas · IDs · relationships · digests · citations</p>
        <p><b>AI skills</b>drafting · impact interpretation · exploration</p>
        <p><b>People</b>approve a Product Change · accept by merge</p>
      </At>
      <Source>ProductShape README · docs/methodology/change.md · overview.md</Source>
    </>,
  },
  {
    id: 'dogfooding', act: 4, title: 'It runs on its own tools', steps: 1, layout: 'full', form: () => 'dogfood',
    content: <>
      <h2>It runs on its own tools</h2>
      <div className="products">
        <section><strong>ProductShape</strong><p>first commit 2026-07-25</p><p>0.1.0 → 0.22.1</p><p><b>95</b> artifacts defining itself</p></section>
        <section><strong>ArcShape</strong><p>first commit 2026-10-16</p><p>baseline <code>CHG-INITIAL</code></p><p><b>35</b> artifacts</p></section>
        <section><strong>Lighthouse</strong><p>first commit 2026-10-20</p><p>delivery baseline</p><p><b>127</b> artifacts</p></section>
      </div>
      <At at={1}><p className="lead">Others already use it, with ProductShape or their own tools.</p></At>
      <Source>git log and docs/product/model of each repository, 2026-11-03</Source>
    </>,
  },
  {
    id: 'limits', act: 4, title: 'What it does not catch', steps: 1, layout: 'left', form: () => 'bands',
    content: <>
      <h2>What it does not catch</h2>
      <p className="punch">“Structural impact is not semantic impact.”</p>
      <p className="echo">“Validation checks shape, not meaning.”</p>
      <p className="muted">Two accepted artifacts that contradict each other both validate.</p>
      <At at={1}><p className="lead">Still to define: SDD flows, agentic workflows.</p></At>
      <Source>ProductShape docs/limitations.md · I Tried to Prove PDaC Wrong</Source>
    </>,
  },
  {
    id: 'url', act: 0, title: 'aligned.jgcarmona.com', steps: 0, layout: 'center', form: () => 'ring',
    content: <div className="closing">
      <QrCode value="https://aligned.jgcarmona.com" />
      <p className="url">aligned.jgcarmona.com</p>
      <p className="links">pdac.dev · productshape.dev · arcshape.dev</p>
    </div>,
  },
]
