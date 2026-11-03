import { AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, NearestFilter, PerspectiveCamera, Points, Scene, ShaderMaterial, WebGLRenderer } from 'three'
import { GLYPHS, POINTS, form, type Form, type FormName } from './forms'

// The recurring piece: one point cloud whose sprites sample a glyph atlas.
// Each scene names a form; the field morphs every point from where it is to
// where the new form wants it, staggered by a per-point seed.

const FOV = 30
export const DISTANCE = 9 / Math.tan((FOV / 2) * (Math.PI / 180))
const MORPH_MS = 1700
const GLOW_MS = 280

// Live fields, so scene content can light a group of points without holding a reference.
const live = new Set<GlyphField>()

/** Light the points of one group in neon (-1 turns it off). */
export function highlight(group: number) {
  live.forEach(field => field.setHighlight(group))
}

function atlas() {
  const canvas = document.createElement('canvas')
  canvas.width = 64 * GLYPHS.length
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
  ctx.font = '700 48px ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#fff'
  GLYPHS.forEach((glyph, k) => ctx.fillText(glyph, 64 * (k + 0.5), 34))
  const texture = new CanvasTexture(canvas)
  texture.minFilter = texture.magFilter = NearestFilter
  texture.generateMipmaps = false
  return texture
}

const vertexShader = (halo: boolean) => /* glsl */ `
  attribute float gTo;
  uniform float uHighlight;
  uniform float uGlow;
  varying float vLit;
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute vec3 cFrom;
  attribute vec3 cTo;
  attribute float dFrom;
  attribute float dTo;
  attribute float aSeed;
  uniform float uMix;
  uniform float uTime;
  uniform float uIdle;
  uniform float uSize;
  uniform float uScale;
  varying vec3 vColor;
  varying float vGlyph;
  varying float vAlpha;

  float mixFor(float seed) { return smoothstep(0.0, 1.0, clamp(uMix * 1.6 - seed * 0.6, 0.0, 1.0)); }

  void main() {
    float m = mixFor(aSeed);
    vec3 p = mix(aFrom, aTo, m);
    p.z += sin(m * 3.14159) * (aSeed - 0.5) * 3.0;
    p.x += sin(uTime * 0.55 + aSeed * 40.0) * 0.035 * uIdle;
    p.y += cos(uTime * 0.45 + aSeed * 31.0) * 0.035 * uIdle;
    float lit = uGlow * (1.0 - step(0.5, abs(gTo - uHighlight)));
    float dimmed = uGlow * (1.0 - lit);
    vLit = lit;
    vec3 base = mix(cFrom, cTo, m);
    vColor = mix(base, min(base * 1.3 + 0.08, vec3(1.0)), lit);
    float d = mix(mix(dFrom, dTo, m), 0.97, lit);
    float flicker = fract(sin(dot(vec2(aSeed, floor(uTime * 2.0 + aSeed * 9.0)), vec2(12.9898, 78.233))) * 43758.5453);
    vGlyph = floor(clamp(d + (flicker - 0.5) * 0.16 * uIdle, 0.0, 0.999) * 8.0);
    vAlpha = mix(0.32, 1.0, d) * (1.0 - 0.62 * dimmed);
    float buzz = 0.88 + 0.12 * sin(uTime * 9.0 + aSeed * 40.0);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * uScale * (${DISTANCE.toFixed(3)} / -mv.z) * (1.0 + ${halo ? '2.4' : '0.45'} * lit * buzz);
    gl_Position = projectionMatrix * mv;
  }
`

// The halo pass draws lit points again as soft additive discs: the neon glow.
const haloShader = /* glsl */ `
  varying vec3 vColor;
  varying float vLit;
  void main() {
    if (vLit < 0.02) discard;
    float r = length(gl_PointCoord - 0.5) * 2.0;
    gl_FragColor = vec4(vColor, pow(max(0.0, 1.0 - r), 2.4) * 0.12 * vLit);
  }
`

const fragmentShader = /* glsl */ `
  uniform sampler2D uAtlas;
  varying vec3 vColor;
  varying float vGlyph;
  varying float vAlpha;
  varying float vLit;
  void main() {
    vec2 uv = vec2((vGlyph + gl_PointCoord.x) / 8.0, 1.0 - gl_PointCoord.y);
    float a = texture2D(uAtlas, uv).a;
    if (a < 0.25) discard;
    gl_FragColor = vec4(vColor, a * vAlpha);
  }
`

export class GlyphField {
  private renderer: WebGLRenderer
  private scene = new Scene()
  private camera = new PerspectiveCamera(FOV, 16 / 9, 0.1, 200)
  private geometry = new BufferGeometry()
  private material: ShaderMaterial
  private points: Points
  private halo: Points
  private haloMaterial: ShaderMaterial
  private glow = 0
  private glowTarget = 0
  private current: Form
  private target: Form
  private seeds = new Float32Array(POINTS)
  private mix = 1
  private morphStart = 0
  private frame = 0
  private start = performance.now()

  constructor(private canvas: HTMLCanvasElement, private reduced: boolean, initial: FormName) {
    this.renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' })
    this.renderer.setClearColor(0x000000, 0)
    this.camera.position.set(0, 0, DISTANCE)
    for (let i = 0; i < POINTS; i++) this.seeds[i] = Math.random()
    this.current = this.target = form(initial)
    const attr = (name: string, data: Float32Array, size: number) => this.geometry.setAttribute(name, new BufferAttribute(data.slice(), size))
    attr('position', this.target.pos, 3)
    attr('aFrom', this.current.pos, 3)
    attr('aTo', this.target.pos, 3)
    attr('cFrom', this.current.col, 3)
    attr('cTo', this.target.col, 3)
    attr('dFrom', this.current.den, 1)
    attr('dTo', this.target.den, 1)
    attr('aSeed', this.seeds, 1)
    attr('gTo', this.target.grp, 1)
    const uniforms = {
      uAtlas: { value: atlas() }, uMix: { value: 1 }, uTime: { value: 0 }, uIdle: { value: reduced ? 0 : 1 }, uSize: { value: 15 }, uScale: { value: 1 },
      uHighlight: { value: -1 }, uGlow: { value: 0 },
    }
    this.material = new ShaderMaterial({ vertexShader: vertexShader(false), fragmentShader, transparent: true, depthWrite: false, uniforms })
    this.haloMaterial = new ShaderMaterial({ vertexShader: vertexShader(true), fragmentShader: haloShader, transparent: true, depthWrite: false, blending: AdditiveBlending, uniforms })
    this.halo = new Points(this.geometry, this.haloMaterial)
    this.points = new Points(this.geometry, this.material)
    this.halo.frustumCulled = this.points.frustumCulled = false
    this.scene.add(this.halo, this.points)
    live.add(this)
    this.resize()
    this.loop()
  }

  resize() {
    const { width, height } = this.canvas.getBoundingClientRect()
    if (!width || !height) return
    const ratio = Math.min(devicePixelRatio, 2)
    this.renderer.setPixelRatio(ratio)
    this.renderer.setSize(width, height, false)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.material.uniforms.uScale.value = (height * ratio) / 1080
  }

  setForm(name: FormName) {
    const next = form(name)
    if (next === this.target) return
    // Freeze the in-between state as the new origin, so an interrupted morph continues smoothly.
    const from = this.blend()
    this.current = from
    this.target = next
    this.write('aFrom', from.pos); this.write('cFrom', from.col); this.write('dFrom', from.den)
    this.write('aTo', next.pos); this.write('cTo', next.col); this.write('dTo', next.den); this.write('gTo', next.grp)
    this.glowTarget = 0
    this.mix = this.reduced ? 1 : 0
    this.morphStart = performance.now()
  }

  private write(name: string, data: Float32Array) {
    const attribute = this.geometry.getAttribute(name) as BufferAttribute
    ;(attribute.array as Float32Array).set(data)
    attribute.needsUpdate = true
  }

  private blend(): Form {
    if (this.mix >= 1) return this.target
    const pos = new Float32Array(POINTS * 3), col = new Float32Array(POINTS * 3), den = new Float32Array(POINTS)
    for (let i = 0; i < POINTS; i++) {
      const t = Math.min(1, Math.max(0, this.mix * 1.6 - this.seeds[i] * 0.6))
      const m = t * t * (3 - 2 * t)
      for (let k = 0; k < 3; k++) {
        const j = i * 3 + k
        pos[j] = this.current.pos[j] + (this.target.pos[j] - this.current.pos[j]) * m
        col[j] = this.current.col[j] + (this.target.col[j] - this.current.col[j]) * m
      }
      den[i] = this.current.den[i] + (this.target.den[i] - this.current.den[i]) * m
    }
    return { pos, col, den, grp: this.target.grp }
  }

  setHighlight(group: number) {
    if (group >= 0) this.material.uniforms.uHighlight.value = group
    this.glowTarget = group >= 0 ? 1 : 0
    if (this.reduced) this.glow = this.glowTarget
  }

  private loop = () => {
    this.frame = requestAnimationFrame(this.loop)
    if (document.hidden) return
    const now = performance.now()
    const t = this.reduced ? 0 : (now - this.start) / 1000
    if (this.mix < 1) this.mix = Math.min(1, (now - this.morphStart) / MORPH_MS)
    const u = this.material.uniforms
    u.uMix.value = this.mix
    u.uTime.value = t
    const step = 16 / GLOW_MS
    this.glow = this.glowTarget > this.glow ? Math.min(this.glowTarget, this.glow + step) : Math.max(this.glowTarget, this.glow - step)
    u.uGlow.value = this.glow
    this.points.rotation.y = Math.sin(t * 0.07) * 0.12
    this.points.rotation.x = Math.sin(t * 0.05) * 0.04
    this.halo.rotation.copy(this.points.rotation)
    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    cancelAnimationFrame(this.frame)
    live.delete(this)
    this.geometry.dispose()
    this.material.dispose()
    this.haloMaterial.dispose()
    this.renderer.dispose()
  }
}

/** Static Canvas 2D rendering of a form: print, PDF, previews and no-WebGL fallback. */
export function drawStatic(canvas: HTMLCanvasElement, name: FormName) {
  const { width, height } = canvas.getBoundingClientRect()
  const ratio = Math.min(devicePixelRatio, 2)
  canvas.width = Math.max(1, Math.round(width * ratio))
  canvas.height = Math.max(1, Math.round(height * ratio))
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const f = form(name)
  const unit = canvas.height / 18
  const size = Math.round(15 * canvas.height / 1080)
  ctx.font = `700 ${size}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (let i = 0; i < POINTS; i++) {
    const z = f.pos[i * 3 + 2]
    const scale = DISTANCE / (DISTANCE - z)
    const x = canvas.width / 2 + f.pos[i * 3] * unit * scale
    const y = canvas.height / 2 - f.pos[i * 3 + 1] * unit * scale
    const d = f.den[i]
    const [r, g, b] = [f.col[i * 3], f.col[i * 3 + 1], f.col[i * 3 + 2]].map(v => Math.round(v * 255))
    ctx.fillStyle = `rgba(${r},${g},${b},${0.32 + 0.68 * d})`
    ctx.fillText(GLYPHS[Math.min(7, Math.floor(d * 8))], x, y)
  }
}

export function webglAvailable() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch { return false }
}
