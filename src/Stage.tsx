import type { CSSProperties } from 'react'
import { StepContext } from './components'
import { Field } from './Field'
import { acts, scenes } from './scenes'

export const actColor = ['var(--ink)', 'var(--k-constraint)', 'var(--accent)', 'var(--k-business-rule)', 'var(--k-structured-behaviour)']

/** One scene at a given step, laid out on a fixed 1920×1080 drawing sheet. */
export function Stage({ index, step, still = false }: { index: number; step: number; still?: boolean }) {
  const scene = scenes[index]
  return <div className="sheet" data-layout={scene.layout} data-act={scene.act} style={{ '--act': actColor[scene.act] } as CSSProperties}>
    <Field form={scene.form(step)} still={still} />
    {scene.act > 0 && <div className="chapter-bar" aria-hidden="true" />}
    {scene.act > 0 && <p className="chapter-label">{acts[scene.act]}</p>}
    <StepContext.Provider value={step}>
      <article className="scene" key={scene.id} data-scene={scene.id} aria-label={scene.title}>{scene.content}</article>
    </StepContext.Provider>
    <p className="sheet-block" aria-hidden="true"><span>Aligned</span><span>Sheet {String(index + 1).padStart(2, '0')}/{scenes.length}</span><span>{scene.id}</span></p>
  </div>
}
