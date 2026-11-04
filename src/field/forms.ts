// Point sets for the recurring product-graph field. Every form fills the same
// number of points, so the field can morph from any form to any other.
// World units: the stage spans x ∈ [-16, 16] and y ∈ [-9, 9] at z = 0.

import { color, rng } from './palette'
import { AFTER_STEPS, BIG, CODE, blurAt, builtAt, grey, system, type System } from './system'
import { BOX, edges, nodes, byId, toCompact } from '../graph/model'

export { color }
export const POINTS = 5200


/** `grp` tags points that light up together (for example one pie wedge and its increment); -1 is no group. */
/** `sway` scales the field's slow idle rotation: 0 keeps points exactly under content drawn on the sheet. */
export type Form = { pos: Float32Array; col: Float32Array; den: Float32Array; grp: Float32Array; sway?: number }

export type FormName =
  | 'noise' | 'copies' | 'two'
  | 'lifecycle' | 'lifecycle-ai' | 'lifecycle-left' | 'fragments'
  | 'specs-0' | 'specs-1' | 'specs-2' | 'specs-3' | 'specs-many' | 'specs-dim' | 'pyramid' | 'hourglass' | 'hourglass-stale'
  | 'before-0' | 'before-1' | 'before-2' | 'before-3' | 'before-4' | 'before-5' | 'before-dim'
  | 'after-0' | 'after-1' | 'after-2' | 'after-3' | 'after-4' | 'after-5' | 'after-6' | 'after-7' | 'after-8' | 'after-dim'
  | 'graph-nodes' | 'code' | 'heading-lost' | 'heading-set'
  | 'question' | 'cite-0' | 'cite' | 'drift-current' | 'drift-stale' | 'pipeline' | 'dogfood' | 'bands' | 'ring'


function hex(value: string): [number, number, number] {
  const n = parseInt(value.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

class Builder {
  pos = new Float32Array(POINTS * 3)
  col = new Float32Array(POINTS * 3)
  den = new Float32Array(POINTS)
  grp = new Float32Array(POINTS).fill(-1)
  group = -1
  sway = 1
  i = 0
  random: () => number

  constructor(seed: number) { this.random = rng(seed) }

  point(x: number, y: number, z: number, c: string, d: number) {
    if (this.i >= POINTS) return
    const [r, g, b] = hex(c)
    this.pos.set([x, y, z], this.i * 3)
    this.col.set([r, g, b], this.i * 3)
    this.den[this.i] = Math.max(0, Math.min(1, d))
    this.grp[this.i] = this.group
    this.i++
  }

  /** Filled circle, sampled as a sunflower so it reads as a node. */
  disc(cx: number, cy: number, r: number, count: number, c: string, d = 0.85) {
    for (let k = 0; k < count; k++) {
      const rr = r * Math.sqrt((k + 0.5) / count)
      const th = k * 2.39996
      this.point(cx + rr * Math.cos(th), cy + rr * Math.sin(th), (this.random() - 0.5) * r * 0.5, c, d - 0.45 * (rr / r) + (this.random() - 0.5) * 0.1)
    }
  }

  ring(cx: number, cy: number, r: number, count: number, c: string, d = 0.5, width = 0.12) {
    for (let k = 0; k < count; k++) {
      const th = (k / count) * Math.PI * 2
      const rr = r + (this.random() - 0.5) * width
      this.point(cx + rr * Math.cos(th), cy + rr * Math.sin(th), (this.random() - 0.5) * 0.3, c, d + (this.random() - 0.5) * 0.15)
    }
  }

  line(x1: number, y1: number, x2: number, y2: number, count: number, c: string, d = 0.35, dashed = false) {
    for (let k = 0; k < count; k++) {
      const t = (k + 0.5) / count
      if (dashed && Math.floor(t * 14) % 2) continue
      this.point(x1 + (x2 - x1) * t + (this.random() - 0.5) * 0.06, y1 + (y2 - y1) * t + (this.random() - 0.5) * 0.06, 0, c, d)
    }
  }

  blob(cx: number, cy: number, sx: number, sy: number, count: number, c: string, d = 0.5) {
    for (let k = 0; k < count; k++) {
      const u = Math.max(1e-6, this.random()), v = this.random()
      const m = Math.sqrt(-2 * Math.log(u))
      this.point(cx + sx * m * Math.cos(2 * Math.PI * v), cy + sy * m * Math.sin(2 * Math.PI * v), (this.random() - 0.5) * 2, c, d * (0.6 + this.random() * 0.5))
    }
  }

  /** One point at a sheet position in px (1920×1080), on the z = 0 plane. */
  sheet(px: number, py: number, c: string, d: number, z = 0) {
    this.point((px - 960) / 60, (540 - py) / 60, z, c, d)
  }

  /** Leaves the next `count` points as background dust, so a piece that is not there yet waits in the dust. */
  skip(count: number) {
    this.group = -1
    for (let k = 0; k < count && this.i < POINTS; k++) {
      const [x, y, z, tint, d] = dust[this.i]
      this.point(x, y, z, tint, d)
    }
  }

  /** Remaining points become faint background dust. Dust is fixed per index, so it stays put between forms. */
  done(): Form {
    this.group = -1
    while (this.i < POINTS) {
      const [x, y, z, tint, d] = dust[this.i]
      this.point(x, y, z, tint, d)
    }
    return { pos: this.pos, col: this.col, den: this.den, grp: this.grp, sway: this.sway }
  }
}

const dust: [number, number, number, string, number][] = (() => {
  const random = rng(20261121)
  const tints = Object.values(color).slice(3)
  return Array.from({ length: POINTS }, () => [
    (random() - 0.5) * 34, (random() - 0.5) * 20, -6 + random() * 7,
    random() < 0.08 ? tints[Math.floor(random() * tints.length)] : color.dust,
    random() * 0.22,
  ])
})()


// The system drawn as code tokens (see system.ts). Before: iteration k without a
// product definition; blocks not written yet wait in a grey cloud.
function drawBefore(b: Builder, sys: System, k: number, d = 0.85) {
  sys.homes.forEach((home, i) => {
    b.group = home.f
    const point = sys.before[k][i]
    // Blocks this cycle wrote or rewrote are bright; the ones it left alone are dimmer.
    const touched = k > 0 && point !== sys.before[k - 1][i]
    if (point) b.sheet(point.x, point.y, home.c, touched ? d : d * 0.55)
    else b.sheet(sys.cloud[i].x, sys.cloud[i].y, grey, 0.2 * (d / 0.85), sys.cloud[i].z)
  })
}

// After: the final shape is there from the start, grey and slightly blurred;
// iteration k has built its features exactly in place.
function drawAfter(b: Builder, sys: System, k: number, d = 0.88) {
  sys.homes.forEach((home, i) => {
    b.group = home.f
    if (builtAt(home) <= k) b.sheet(home.x, home.y, home.c, d)
    else b.sheet(home.x + sys.ghost[i][0] * blurAt(k), home.y + sys.ghost[i][1] * blurAt(k), grey, 0.4 * (d / 0.88))
  })
}

/** The SDLC timeline (NUT panel 1): ten stages on one line, in sheet px. */
export const stages = Array.from({ length: 10 }, (_, k) => ({ x: 170 + k * 176, y: 560 }))

function lifecycle(b: Builder, band: 'none' | 'ai' | 'left') {
  b.sway = 0
  stages.forEach(({ x, y }, k) => { if (k) for (let j = 0; j < 40; j++) b.sheet(stages[k - 1].x + 28 + ((x - stages[k - 1].x - 56) * (j + 0.5)) / 40, y, color.accent, 0.3) })
  stages.forEach(({ x, y }, k) => {
    for (let j = 0; j < 70; j++) {
      const r = 20 * Math.sqrt((j + 0.5) / 70), th = j * 2.39996
      b.sheet(x + r * Math.cos(th), y + r * Math.sin(th), k === 5 ? color.white : color.act, k === 5 ? 0.95 : 0.6)
    }
  })
  // One strip of glyphs: the AI investment over Architecture to Operations, which then moves left to Ideation and Product.
  const [from, to] = band === 'left' ? [0, 1] : [3, 7]
  const x0 = stages[from].x - 60, x1 = stages[to].x + 60
  for (let j = 0; j < 900; j++) {
    const u = (j % 150) / 150, v = Math.floor(j / 150) / 6
    if (band === 'none') { b.skip(1); continue }
    b.sheet(x0 + (x1 - x0) * (u + b.random() * 0.006), 640 + v * 44 + b.random() * 4, band === 'left' ? color.uc : color.accent, 0.8)
  }
}

/** The sources of product knowledge (NUT panel 3), in sheet px. */
export const sources = [
  { x: 300, y: 560, c: color.act }, { x: 600, y: 760, c: color.jrn }, { x: 1080, y: 340, c: color.bc }, { x: 1180, y: 610, c: color.term },
  { x: 1100, y: 840, c: color.uc }, { x: 840, y: 910, c: color.fr }, { x: 480, y: 340, c: color.br },
]
export const knowledge = { x: 820, y: 590 }

function fragments(b: Builder) {
  b.sway = 0
  const pairs = [[0, 1], [0, 6], [1, 5], [2, 3], [3, 4], [4, 5], [6, 2], [1, 3], [0, 4], [5, 2]]
  pairs.forEach(([a, c]) => b.line((sources[a].x - 960) / 60, (540 - sources[a].y) / 60, (sources[c].x - 960) / 60, (540 - sources[c].y) / 60, 60, color.white, 0.22, true))
  for (let j = 0; j < 500; j++) {
    const m = Math.sqrt(-2 * Math.log(Math.max(1e-6, b.random()))), th = b.random() * Math.PI * 2, spread = 1.5
    b.sheet(knowledge.x + 120 * spread * m * Math.cos(th), knowledge.y + 70 * spread * m * Math.sin(th), grey, 0.22, (b.random() - 0.5) * 2)
  }
  sources.forEach(({ x, y, c }, k) => {
    const other = sources[(k + 3) % sources.length]
    for (let j = 0; j < 220; j++) {
      const m = Math.sqrt(-2 * Math.log(Math.max(1e-6, b.random()))), th = b.random() * Math.PI * 2
      // Leaking: a third of each cluster drifts towards another source and never arrives.
      const t = j % 3 === 0 ? 0.2 + b.random() * 0.5 : 0
      b.sheet(x + (other.x - x) * t + 62 * m * Math.cos(th), y + (other.y - y) * t + 38 * m * Math.sin(th), c, 0.55 + b.random() * 0.3)
    }
  })
}

/** The refund rule in the noise scene, in sheet px: one concept on the left, and the three specs on the right that each point it their own way. */
export const target = { x: 470, y: 610 }
/** Left edge and vertical centre of each spec card the arrows point at. */
export const specCards = { x: 1040, tops: [262, 522, 782], height: 104 }

function arrow(b: Builder, x0: number, y0: number, th: number, len: number, c: string, d: number, shaft: number) {
  const ux = Math.cos(th), uy = Math.sin(th)
  for (let k = 0; k < shaft; k++) { const t = (k + 0.5) / shaft; b.sheet(x0 + ux * len * t, y0 + uy * len * t, c, d * 0.8) }
  const x1 = x0 + ux * len, y1 = y0 + uy * len, head = Math.max(3, Math.round(shaft / 12))
  for (let k = 1; k <= head; k++) { const back = k * 5; b.sheet(x1 - ux * back - uy * back * 0.6, y1 - uy * back + ux * back * 0.6, c, d); b.sheet(x1 - ux * back + uy * back * 0.6, y1 - uy * back - ux * back * 0.6, c, d) }
}

function specArrows(b: Builder, many: boolean, d = 1, shown = 3) {
  b.sway = 0
  const tints = [color.con, color.uc, color.term]
  if (!many) {
    for (let j = 0; j < 320; j++) { const th = (j / 320) * Math.PI * 2; b.sheet(target.x + 64 * Math.cos(th), target.y + 64 * Math.sin(th), color.white, 0.7) }
    // One arrow per spec, from the rule to its card; the ones not told yet wait in the dust.
    specCards.tops.forEach((top, k) => {
      const ex = specCards.x - 24, ey = top + specCards.height / 2
      const th = Math.atan2(ey - target.y, ex - target.x), x0 = target.x + 72 * Math.cos(th), y0 = target.y + 72 * Math.sin(th)
      if (k >= shown) { b.skip(110 + 2 * Math.max(3, Math.round(110 / 12))); return }
      arrow(b, x0, y0, th, Math.hypot(ex - x0, ey - y0), tints[k], 0.95, 110)
    })
    return
  }
  // A hundred and sixty rules, each a small circle whose spec points its own way.
  for (let n = 0; n < 160; n++) {
    let x = 0, y = 0
    do { x = 140 + b.random() * 1680; y = 270 + b.random() * 680 } while (x < 720 && y > 720)
    for (let j = 0; j < 14; j++) { const th = (j / 14) * Math.PI * 2; b.sheet(x + 12 * Math.cos(th), y + 12 * Math.sin(th), color.white, 0.5 * d) }
    const th = b.random() * Math.PI * 2
    arrow(b, x + 15 * Math.cos(th), y + 15 * Math.sin(th), th, 50 + b.random() * 50, tints[n % 3], 0.8 * d, 12)
  }
}

// Direction: boats at sea. Lost, there is no lighthouse and the boats are
// scattered over the whole sheet, each sailing its own way. Then a lighthouse
// appears and lights up, and the boats regroup on arcs around it, bows to the lamp.
export const lighthouse = { x: 1760, base: 920, height: 300 }

function boat(b: Builder, cx: number, cy: number, th: number, tint: string) {
  const f = Math.cos(th) >= 0 ? 1 : -1
  for (let k = 0; k < 14; k++) { const t = (k + 0.5) / 14; b.sheet(cx - f * 26 - Math.cos(th) * 60 * t, cy + 8 - Math.sin(th) * 60 * t, color.accent, 0.12 + 0.2 * (1 - t)) }
  for (let row = 0; row < 3; row++) { const w = 46 - row * 8; for (let k = 0; k < 10; k++) b.sheet(cx - w / 2 + (w * (k + 0.5)) / 10 + f * row * 2, cy + row * 4, tint, 0.85) }
  for (let k = 0; k < 8; k++) b.sheet(cx, cy - 4 - k * 4, color.white, 0.6)
  for (let row = 0; row < 7; row++) { const w = (row + 1) * 2.6; for (let k = 0; k < 3; k++) b.sheet(cx + f * (3 + (w * (k + 0.5)) / 3), cy - 34 + row * 4, color.white, 0.75) }
}

const BOATS = 20

/** Lost: scattered over the sheet, clear of the text block, never two boats on top of each other. */
const scattered = (() => {
  const random = rng(7)
  const out: { x: number; y: number; th: number }[] = []
  while (out.length < BOATS) {
    const x = 140 + random() * 1660, y = 230 + random() * 760
    if (x < 1040 && y < 640) continue
    if (out.some(p => Math.hypot(p.x - x, p.y - y) < 170)) continue
    out.push({ x, y, th: random() * Math.PI * 2 })
  }
  return out
})()

function heading(b: Builder, set: boolean) {
  b.sway = 0
  const { x, base, height } = lighthouse
  const lamp = { x, y: base - height - 18 }
  // The tower, the lamp and the beam are not there until the light is set.
  for (let j = 0; j < 260; j++) {
    if (!set) { b.skip(1); continue }
    const v = (j % 26) / 26, u = Math.floor(j / 26) / 9, w = 44 - 20 * v
    b.sheet(x - w / 2 + w * u, base - v * height, Math.floor(v * 6) % 2 ? color.con : color.white, 0.8)
  }
  for (let j = 0; j < 40; j++) {
    if (!set) { b.skip(1); continue }
    const th = j * 2.39996, r = 13 * Math.sqrt((j + 0.5) / 40)
    b.sheet(lamp.x + r * Math.cos(th), lamp.y + r * Math.sin(th), color.term, 0.98)
  }
  for (let j = 0; j < 420; j++) {
    if (!set) { b.skip(1); continue }
    const t = b.random(), spread = (b.random() - 0.5) * 2
    b.sheet(lamp.x - t * 640, lamp.y + spread * t * 120 + t * 60, color.term, 0.18 * (1 - t) + 0.05)
  }
  const tints = [color.act, color.uc, color.br, color.jrn]
  // Set: four arcs of five boats around the lamp, every bow towards the light.
  const arcs = [250, 390, 530, 670]
  for (let n = 0; n < BOATS; n++) {
    const tint = tints[n % 4]
    if (!set) { const p = scattered[n]; boat(b, p.x, p.y, p.th, tint); continue }
    const r = arcs[Math.floor(n / 5)], k = n % 5, a = Math.PI + ((k - 2) / 2) * (0.16 + 90 / r) + (Math.floor(n / 5) % 2 ? 0.06 : 0)
    const bx = lamp.x + r * Math.cos(a), by = lamp.y + 40 + r * Math.sin(a) * 1.4
    boat(b, bx, by, Math.atan2(lamp.y - by, lamp.x - bx), tint)
  }
}

/**
 * The cite and drift scenes, in sheet px: the rule as an orange cloud under its
 * card on the left, and the four files that cite it on the right, one colour each.
 */
export const citeMap = {
  rule: { x: 366, y: 700 },
  citers: [{ y: 330, c: color.accent }, { y: 455, c: color.jrn }, { y: 580, c: color.uc }, { y: 705, c: color.sb }].map(p => ({ ...p, x: 1000 })),
}

function citations(b: Builder, state: 'hidden' | 'current' | 'stale') {
  b.sway = 0
  const { rule, citers } = citeMap
  const w = (px: number) => (px - 960) / 60, h = (py: number) => (540 - py) / 60
  citers.forEach(({ x, y, c }) => {
    if (state === 'hidden') { b.skip(200); return }
    // From the edge of the rule's ring to the citer.
    const th = Math.atan2(y - rule.y, x - rule.x), x0 = rule.x + 130 * Math.cos(th), y0 = rule.y + 130 * Math.sin(th)
    if (state === 'stale') b.line(w(x0), h(y0), w(x - 48), h(y), 200, color.br, 0.35, true)
    else b.line(w(x0), h(y0), w(x - 48), h(y), 200, c, 0.5)
  })
  citers.forEach(({ x, y, c }) => {
    if (state === 'hidden') { b.skip(260); return }
    b.disc(w(x), h(y), 0.7, 260, state === 'stale' ? color.br : c, state === 'stale' ? 0.4 : 0.9)
  })
  b.disc(w(rule.x), h(rule.y), 1.7, 700, color.br, 0.95)
  b.ring(w(rule.x), h(rule.y), 2.1, 220, state === 'stale' ? color.con : color.white, 0.45)
}

/** The bridge to testing: every glyph gathers into one big question mark, in sheet px. */
export const questionMark = { x: 1400, y: 420, r: 150 }

function question(b: Builder) {
  b.sway = 0
  const { x, y, r } = questionMark
  const tints = [color.white, color.white, color.accent, color.jrn, color.uc, color.br, color.term, color.sb]
  // The hook (an arc from the left, over the top, down to the right), the neck (a curve into the stem) and the dot.
  const path: [number, number][] = []
  for (let k = 0; k <= 140; k++) { const a = Math.PI * (0.92 + (1.43 * k) / 140); path.push([x + r * Math.cos(a), y + r * Math.sin(a)]) }
  const [px, py] = path[path.length - 1]
  for (let k = 1; k <= 60; k++) { const u = k / 60; path.push([(1 - u) ** 2 * px + 2 * (1 - u) * u * x + u * u * x, (1 - u) ** 2 * py + 2 * (1 - u) * u * (py + 30) + u * u * (y + 250)]) }
  for (let k = 1; k <= 30; k++) path.push([x, y + 250 + (k / 30) * 60])
  for (let j = 0; j < 2600; j++) {
    const [cx, cy] = path[Math.floor(b.random() * path.length)]
    const th = b.random() * Math.PI * 2, rr = 26 * Math.sqrt(b.random())
    b.sheet(cx + rr * Math.cos(th), cy + rr * Math.sin(th), tints[j % tints.length], 0.6 + b.random() * 0.35, (b.random() - 0.5) * 1.2)
  }
  for (let j = 0; j < 400; j++) {
    const th = b.random() * Math.PI * 2, rr = 36 * Math.sqrt(b.random())
    b.sheet(x + rr * Math.cos(th), y + 420 + rr * Math.sin(th), tints[j % tints.length], 0.7 + b.random() * 0.3)
  }
}

/** The test shapes (tests scene): unit, integration and end-to-end bands, as a pyramid or an hourglass. */
export const shapes = { x: 1420, bands: [[300, 470], [500, 670], [700, 870]] as const }
/** Zoomed out (tests scene, step 2+): the hourglass, smaller, on the right, beside the behaviour that guides its e2e band. */
export const smallShape = { x: 1580, y: 500, scale: 0.55 }
/** Where a link from the behaviour lands on the small hourglass: the left edge of its e2e band. */
export const e2eAnchor = { x: smallShape.x - (680 * smallShape.scale) / 2 - 10, y: smallShape.y + (385 - 585) * smallShape.scale }
/** Neon groups of the zoomed-out e2e band, one per behaviour, and where each third of the band sits. */
export const e2eGroups = [201, 202, 203]
export const e2eRegions = [0, 1, 2].map(k => ({ x: smallShape.x + ((k - 1) * 680 * smallShape.scale) / 3, y: e2eAnchor.y }))

function testShape(b: Builder, hourglass: boolean, small = false, stale = false) {
  b.sway = 0
  const widths = hourglass ? [[680, 600], [260, 260], [600, 680]] : [[150, 330], [360, 520], [560, 720]]
  const tints = [color.sb, color.act, color.uc]
  const [cx, cy, k0] = small ? [smallShape.x, smallShape.y, smallShape.scale] : [shapes.x, 585, 1]
  shapes.bands.forEach(([top, bottom], k) => {
    for (let j = 0; j < 1000; j++) {
      const v = b.random(), w = widths[k][0] + (widths[k][1] - widths[k][0]) * v, u = b.random() - 0.5
      // Zoomed out, the e2e band is split by the behaviour each scenario follows (left to right: SB-REFUND-001, SB-REFUND-002, SB-CANCEL-001);
      // stale, the ones guided by the changed behaviours light up amber.
      const scenario = Math.min(2, Math.floor((u + 0.5) * 3))
      b.group = small && k === 0 ? e2eGroups[scenario] : -1
      const lit = stale && k === 0 && scenario < 2 && j % 5 < 2
      b.sheet(cx + u * w * k0, cy + (top + v * (bottom - top) - 585) * k0, lit ? color.br : tints[k], lit ? 0.95 : (0.55 + b.random() * 0.3) * (stale && k > 0 ? 0.6 : 1))
    }
  })
  b.group = -1
  if (stale) lowLifecycle(b)
}

/** The lifecycle line again, low on the tests sheet, with an arc from Product straight to validation (DevOps, where CI runs the e2e). */
export const lowStages = stages.map(({ x }) => ({ x, y: 930 }))
export const validationArc = { from: 1, to: 6, peak: 820 }

function lowLifecycle(b: Builder) {
  lowStages.forEach(({ x, y }, k) => { if (k) for (let j = 0; j < 30; j++) b.sheet(lowStages[k - 1].x + 18 + ((x - lowStages[k - 1].x - 36) * (j + 0.5)) / 30, y, color.accent, 0.3) })
  lowStages.forEach(({ x, y }, k) => {
    const on = k === validationArc.from || k === validationArc.to
    for (let j = 0; j < 40; j++) { const r = 12 * Math.sqrt((j + 0.5) / 40), th = j * 2.39996; b.sheet(x + r * Math.cos(th), y + r * Math.sin(th), on ? color.sb : color.act, on ? 0.95 : 0.5) }
  })
  const a = lowStages[validationArc.from], c = lowStages[validationArc.to]
  for (let j = 0; j < 260; j++) {
    const u = (j + 0.5) / 260, mx = (a.x + c.x) / 2
    const x = (1 - u) ** 2 * a.x + 2 * (1 - u) * u * mx + u * u * c.x, y = (1 - u) ** 2 * (a.y - 18) + 2 * (1 - u) * u * (2 * validationArc.peak - a.y) + u * u * (c.y - 18)
    b.sheet(x, y + (b.random() - 0.5) * 4, color.sb, 0.85)
  }
}

/** 1 for the e2e points of the zoomed-out tests that follow the given behaviours (by neon group). */
export function e2eMask(groups: number[]) {
  const grp = form('hourglass-stale').grp, mask = new Float32Array(POINTS)
  for (let i = 0; i < POINTS; i++) if (groups.includes(grp[i])) mask[i] = 1
  return mask
}

/** The product graph's nodes as glyph discs behind their boxes; `small` places them in the zoomed-out position. */
function graphNodes(b: Builder, small: boolean) {
  const at = (id: string) => { const n = byId.get(id)!; const c = { x: n.x + BOX.w / 2, y: n.y + BOX.h / 2 }; return small ? toCompact(c.x, c.y) : c }
  edges.forEach(e => { const p = at(e.from), q = at(e.to); b.line((p.x - 960) / 60, (540 - p.y) / 60, (q.x - 960) / 60, (540 - q.y) / 60, small ? 5 : 10, color.accent, 0.12) })
  nodes.forEach(n => {
    const { x, y } = at(n.id)
    const hex = (color as Record<string, string>)[({ actor: 'act', journey: 'jrn', 'use-case': 'uc', 'business-rule': 'br', 'domain-term': 'term', 'bounded-context': 'bc', 'functional-requirement': 'fr', 'quality-requirement': 'qr', constraint: 'con', 'structured-behaviour': 'sb' } as const)[n.type]]
    for (let j = 0; j < (small ? 10 : 24); j++) {
      const r = (small ? 8 : 26) * Math.sqrt((j + 0.5) / 24), th = j * 2.39996
      b.sheet(x + r * Math.cos(th) * (small ? 1 : 4), y + r * Math.sin(th), hex, small ? 0.5 : 0.25)
    }
  })
}

const builders: Record<FormName, (b: Builder) => void> = {
  noise: () => {},
  copies: b => {
    for (let k = 0; k < 14; k++) {
      const x = 4 + (k % 4) * 3.4 + (b.random() - 0.5) * 1.4
      const y = 5.6 - Math.floor(k / 4) * 3.6 + (b.random() - 0.5) * 1.2
      b.blob(x, y, 0.35 + b.random() * 0.6, 0.3 + b.random() * 0.5, 150, k % 3 ? color.br : color.con, 0.6)
    }
  },

  'before-0': b => drawBefore(b, system(BIG), 0),
  'before-1': b => drawBefore(b, system(BIG), 1),
  'before-2': b => drawBefore(b, system(BIG), 2),
  'before-3': b => drawBefore(b, system(BIG), 3),
  'before-4': b => drawBefore(b, system(BIG), 4),
  'before-5': b => drawBefore(b, system(BIG), 5),
  'before-dim': b => drawBefore(b, system(BIG), 5, 0.3),
  'after-0': b => drawAfter(b, system(BIG), 0),
  'after-1': b => drawAfter(b, system(BIG), 1),
  'after-2': b => drawAfter(b, system(BIG), 2),
  'after-3': b => drawAfter(b, system(BIG), 3),
  'after-4': b => drawAfter(b, system(BIG), 4),
  'after-5': b => drawAfter(b, system(BIG), 5),
  'after-6': b => drawAfter(b, system(BIG), 6),
  'after-7': b => drawAfter(b, system(BIG), 7),
  'after-8': b => drawAfter(b, system(BIG), 8),
  'after-dim': b => drawAfter(b, system(BIG), AFTER_STEPS, 0.3),
  lifecycle: b => lifecycle(b, 'none'),
  'lifecycle-ai': b => lifecycle(b, 'ai'),
  'lifecycle-left': b => lifecycle(b, 'left'),
  fragments: b => fragments(b),
  'specs-0': b => specArrows(b, false, 1, 0),
  'specs-1': b => specArrows(b, false, 1, 1),
  'specs-2': b => specArrows(b, false, 1, 2),
  'specs-3': b => specArrows(b, false, 1, 3),
  'specs-many': b => specArrows(b, true),
  'specs-dim': b => specArrows(b, true, 0.4),
  pyramid: b => testShape(b, false),
  hourglass: b => testShape(b, true),
  'hourglass-stale': b => testShape(b, true, true, true),
  'graph-nodes': b => { b.sway = 0; graphNodes(b, false) },
  // The code first, so point index = home index for the neon masks in graph/code.ts.
  code: b => { b.sway = 0; drawAfter(b, system(CODE), AFTER_STEPS); b.group = -1; graphNodes(b, true) },
  'heading-lost': b => heading(b, false),
  'heading-set': b => heading(b, true),
  two: b => {
    b.disc(5.5, 0, 2.6, 1300, color.accent, 0.8)
    b.disc(12.5, 0, 2.6, 1300, color.bc, 0.8)
    b.line(8.3, 0, 9.7, 0, 160, color.white, 0.45, true)
  },
  question: b => question(b),
  'cite-0': b => citations(b, 'hidden'),
  cite: b => citations(b, 'current'),
  'drift-current': b => citations(b, 'current'),
  'drift-stale': b => citations(b, 'stale'),
  pipeline: b => {
    const xs = [-13, -8, -3, 2, 7, 12.5]
    xs.forEach((x, k) => { if (k) b.line(xs[k - 1], -6.4, x, -6.4, 150, color.accent, 0.3) })
    xs.forEach((x, k) => b.disc(x, -6.4, k === 2 || k === 5 ? 1.05 : 0.7, k === 2 || k === 5 ? 320 : 180, k === 2 || k === 5 ? color.white : color.br))
  },
  dogfood: b => {
    const graphs: [number, number, string][] = [[-10.5, 95, color.accent], [0, 35, color.bc], [10.5, 127, color.sb]]
    for (const [cx, count, c] of graphs) {
      const nodes: [number, number][] = []
      for (let k = 0; k < count; k++) {
        const th = k * 2.39996, rr = 3.2 * Math.sqrt((k + 0.5) / count)
        nodes.push([cx + rr * Math.cos(th) * 1.15, 2.6 + rr * Math.sin(th) * 0.85])
      }
      nodes.forEach(([x, y], k) => { if (k) { const [px, py] = nodes[Math.floor(b.random() * k)]; b.line(px, py, x, y, 6, c, 0.15) } })
      nodes.forEach(([x, y]) => b.disc(x, y, 0.16, 9, c, 0.8))
    }
  },
  bands: b => {
    ;[[4.5, color.accent], [0, color.term], [-4.5, color.white]].forEach(([y, c]) => b.blob(9, y as number, 4.2, 0.55, 900, c as string, 0.6))
  },
  ring: b => {
    b.ring(0, 2.3, 3.75, 1300, color.accent, 0.55, 0.35)
    b.ring(0, 2.3, 4.3, 600, color.white, 0.3, 0.15)
  },
}

const cache = new Map<FormName, Form>()

export function form(name: FormName): Form {
  let f = cache.get(name)
  if (!f) {
    const b = new Builder(name.length * 7919 + name.charCodeAt(0))
    builders[name](b)
    f = b.done()
    cache.set(name, f)
  }
  return f
}

export const GLYPHS = ['.', ':', '-', '+', 'x', '*', '#', '@']
