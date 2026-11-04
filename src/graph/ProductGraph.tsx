import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { highlightPoints } from '../field/GlyphField'
import { anchors, codeMask } from './code'
import { BOX, area, byId, compact, edges, kinds, nodes, related, toCompact, type Node } from './model'

export function KindIcon({ type }: { type: Node['type'] }) {
  return <svg className="kind-icon" viewBox="0 0 16 16" aria-hidden="true" dangerouslySetInnerHTML={{ __html: kinds[type].icon }} />
}

function curve(a: Node, b: Node) {
  const [from, to] = a.x <= b.x ? [a, b] : [b, a]
  const x1 = from.x + BOX.w, y1 = from.y + BOX.h / 2, x2 = to.x, y2 = to.y + BOX.h / 2
  if (Math.abs(x2 - x1) < 10 || to.x === from.x) return `M${from.x + BOX.w} ${y1} C${from.x + BOX.w + 60} ${y1}, ${to.x + BOX.w + 60} ${y2}, ${to.x + BOX.w} ${y2}`
  const mid = (x1 + x2) / 2
  return `M${x1} ${y1} C${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`
}

function relationLines(id: string) {
  return edges.filter(e => e.from === id || e.to === id).map(e => e.from === id ? `${e.kind} → ${e.to}` : `${e.from} → ${e.kind}`)
}

/**
 * The product definition as a graph of boxes, laid out as in PDaC-2. `reveal` is
 * the last layer shown (0 actors … 4 everything). Hovering or clicking a box
 * lights its neighbours and opens a panel with the artifact. With `code`, the
 * graph is zoomed out to the left and a node also lights its code tokens.
 */
export function ProductGraph({ reveal = 4, code = false }: { reveal?: number; code?: boolean }) {
  const [hover, setHover] = useState<string | null>(null)
  const [pinned, setPinned] = useState<string | null>(null)
  const active = hover ?? pinned
  const near = useMemo(() => (active ? related(active) : null), [active])

  useEffect(() => { if (code) highlightPoints(active ? codeMask(active) : null) }, [active, code])
  useEffect(() => () => { if (code) highlightPoints(null) }, [code])

  const node = active ? byId.get(active)! : null
  const place = (n: Node) => (code ? toCompact(n.x, n.y) : { x: n.x, y: n.y })
  // The panel is docked bottom left, under the actors and journeys, so it never covers the boxes or the code.
  const panel = node && (code ? { left: 96, bottom: 64, width: 812 } : { left: 96, bottom: 64, width: 560 })

  return <div className={`product-graph ${code ? 'code' : ''} ${active ? 'focus' : ''}`} style={{ viewTransitionName: 'product-graph' }}>
    <div className="graph-plane" style={code ? { transform: `translate(${compact.x}px, ${compact.y}px) scale(${compact.scale}) translate(${-area.x}px, ${-area.y}px)` } : undefined}>
      <svg className="graph-edges" viewBox="0 0 1920 1080" aria-hidden="true">
        {edges.map((e, k) => {
          const a = byId.get(e.from)!, b = byId.get(e.to)!
          const shown = a.layer <= reveal && b.layer <= reveal
          const lit = !!near && (e.from === active || e.to === active)
          return <path key={k} d={curve(a, b)} className={`${shown ? 'on' : ''} ${lit ? 'lit' : ''}`} style={{ '--c': kinds[a.type].color } as CSSProperties} />
        })}
      </svg>
      {nodes.map(n => <button type="button" key={n.id} data-hover className={`box ${n.layer <= reveal ? 'on' : ''} ${near ? (near.has(n.id) ? 'lit' : 'faded') : ''} ${pinned === n.id ? 'pinned' : ''}`}
        style={{ left: n.x, top: n.y, width: BOX.w, height: BOX.h, '--c': kinds[n.type].color, '--d': `${(n.y - 262) / 1400}s` } as CSSProperties}
        onPointerEnter={() => setHover(n.id)} onPointerLeave={() => setHover(null)} onFocus={() => setHover(n.id)} onBlur={() => setHover(null)}
        onClick={() => setPinned(p => (p === n.id ? null : n.id))} aria-label={`${n.id} · ${n.title}`}>
        <KindIcon type={n.type} /><span className="box-id">{n.id}</span><span className="box-title">{n.title}</span>
      </button>)}
    </div>
    {code && node && <svg className="graph-links" viewBox="0 0 1920 1080" aria-hidden="true">
      {anchors(node.id).map((a, k) => { const p = place(node); const x = p.x + BOX.w * compact.scale, y = p.y + (BOX.h * compact.scale) / 2; return <path key={k} d={`M${x} ${y} C${(x + a.x) / 2} ${y}, ${(x + a.x) / 2} ${a.y - 40}, ${a.x} ${a.y}`} style={{ '--c': kinds[node.type].color } as CSSProperties} /> })}
    </svg>}
    {node && panel && <aside className={`node-panel ${code ? 'wide' : ''}`} style={{ ...panel, '--c': kinds[node.type].color } as CSSProperties}>
      <header><KindIcon type={node.type} /><span>{kinds[node.type].token}</span><code>{node.id}</code></header>
      <strong>{node.title}</strong>
      {node.text && <p>{node.text}</p>}
      {node.detail.length > 0 && <ul className="detail">{node.detail.map(line => <li key={line}>{line}</li>)}</ul>}
      <ul className="relations">{relationLines(node.id).slice(0, 7).map(line => <li key={line}>{line}</li>)}</ul>
    </aside>}
  </div>
}
