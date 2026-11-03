import type { CSSProperties } from 'react'
import { StepContext } from './components'
import { Field } from './Field'
import { translator, type Lang } from './i18n'
import { acts, scenes } from './scenes'

export const actColor = ['var(--ink)', 'var(--k-constraint)', 'var(--accent)', 'var(--k-business-rule)', 'var(--k-structured-behaviour)']

function hhmm(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

type Props = { index: number; step: number; lang: Lang; still?: boolean; minutes?: number; onLang?: (lang: Lang) => void }

/** One scene at a given step, laid out on a fixed 1920×1080 drawing sheet. */
export function Stage({ index, step, lang, still = false, minutes = 0, onLang }: Props) {
  const scene = scenes[index]
  const t = translator(lang)
  return <div className="sheet" data-layout={scene.layout} data-act={scene.act} style={{ '--act': actColor[scene.act] } as CSSProperties}>
    <Field form={scene.form(step)} still={still} />
    {scene.act > 0 && <div className="chapter-bar" aria-hidden="true" />}
    {scene.act > 0 && <p className="chapter-label">{t(...acts[scene.act])}</p>}
    <StepContext.Provider value={step}>
      <article className="scene" key={scene.id} data-scene={scene.id} aria-label={t(...scene.title)}>{scene.content(t)}</article>
    </StepContext.Provider>
    {index === 0 && onLang && <nav className="lang-toggle" aria-label={t('Presentation language', 'Idioma de la presentación')}>
      {(['en', 'es'] as const).map(value => <button key={value} type="button" lang={value} aria-pressed={lang === value} onClick={() => onLang(value)}>{value.toUpperCase()}</button>)}
    </nav>}
    <p className="sheet-block" aria-hidden="true">
      <span>Aligned</span>
      <span>{t('Sheet', 'Hoja')} {String(index + 1).padStart(2, '0')}/{scenes.length}</span>
      <span>{scene.id}</span>
      {minutes > 0 && <span className="elapsed">{hhmm(minutes)}</span>}
    </p>
  </div>
}
