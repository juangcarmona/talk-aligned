import { createContext, useContext, type CSSProperties, type ReactNode } from 'react'

// Current step inside the scene. Elements reveal when the step reaches their `at`.
export const StepContext = createContext(0)

export function At({ at, until, children, className = '', style, as: Tag = 'div' }: { at: number; until?: number; children: ReactNode; className?: string; style?: CSSProperties; as?: 'div' | 'span' }) {
  const step = useContext(StepContext)
  const on = step >= at && (until === undefined || step < until)
  return <Tag className={`rv ${on ? 'on' : ''} ${until !== undefined ? 'slot' : ''} ${className}`} style={style} aria-hidden={!on}>{children}</Tag>
}

const kindColor: Record<string, string> = {
  ACT: 'var(--k-actor)', JRN: 'var(--k-journey)', UC: 'var(--k-use-case)', BR: 'var(--k-business-rule)', TERM: 'var(--k-domain-term)',
  BC: 'var(--k-bounded-context)', FR: 'var(--k-functional-requirement)', QR: 'var(--k-quality-requirement)', CON: 'var(--k-constraint)', SB: 'var(--k-structured-behaviour)',
}

export function Kind({ token }: { token: string }) {
  return <span className="kind" style={{ '--kind': kindColor[token] } as CSSProperties}><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.5" /></svg>{token}</span>
}

/** Terminal output that types in line by line. Highlight words with [[double brackets]]. */
export function Term({ lines, label }: { lines: string[]; label: string }) {
  return <pre className="term" role="region" aria-label={label}>
    {lines.map((line, k) => <span key={k} className={`term-line ${line.startsWith('$') ? 'cmd' : ''}`} style={{ '--k': k } as CSSProperties}>
      {line.split(/(\[\[.+?\]\])/).map((part, j) => part.startsWith('[[') ? <mark key={j}>{part.slice(2, -2)}</mark> : part)}
      {'\n'}
    </span>)}
  </pre>
}

/** A dimension line: the blueprint way of saying "this distance matters". */
export function Dim({ label, width = 360, className = '' }: { label: string; width?: number; className?: string }) {
  return <svg className={`dim ${className}`} width={width} height="44" viewBox={`0 0 ${width} 44`} aria-label={label} role="img">
    <path className="draw" pathLength={1} d={`M2 8 V36 M${width - 2} 8 V36 M2 22 H${width - 2}`} />
    <path className="draw tick" pathLength={1} d={`M2 22 l10 -6 M2 22 l10 6 M${width - 2} 22 l-10 -6 M${width - 2} 22 l-10 6`} />
    <rect x={width / 2 - label.length * 8.5 - 10} y="8" width={label.length * 17 + 20} height="28" />
    <text x={width / 2} y="29" textAnchor="middle">{label}</text>
  </svg>
}

export function Person() {
  return <svg className="person" viewBox="0 0 24 24" aria-label="human decision" role="img"><circle cx="12" cy="7" r="3.5" /><path d="M4.5 21v-2.5a7.5 7.5 0 0 1 15 0V21" /></svg>
}

export function Source({ children }: { children: ReactNode }) {
  return <p className="source">{children}</p>
}
