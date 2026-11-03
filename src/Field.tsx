import { useEffect, useRef } from 'react'
import { GlyphField, drawStatic, webglAvailable } from './field/GlyphField'
import type { FormName } from './field/forms'

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

/** The glyph field behind the stage. `still` renders one static frame (print, previews, no WebGL). */
export function Field({ form, still = false }: { form: FormName; still?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const field = useRef<GlyphField | null>(null)
  const live = !still && webglAvailable()

  useEffect(() => {
    if (!live || !canvas.current) return
    const instance = new GlyphField(canvas.current, reducedMotion(), form)
    field.current = instance
    const resize = new ResizeObserver(() => instance.resize())
    resize.observe(canvas.current)
    return () => { resize.disconnect(); instance.dispose(); field.current = null }
    // The field is created once; later forms arrive through setForm.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live])

  useEffect(() => {
    if (live) { field.current?.setForm(form); return }
    if (!canvas.current) return
    const target = canvas.current
    const draw = () => drawStatic(target, form)
    draw()
    const resize = new ResizeObserver(draw)
    resize.observe(target)
    return () => resize.disconnect()
  }, [form, live])

  return <canvas ref={canvas} className="field" aria-hidden="true" />
}
