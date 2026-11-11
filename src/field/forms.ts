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
  | 'noise' | 'copies' | 'two' | 'dust'
  | 'lifecycle' | 'lifecycle-ai' | 'lifecycle-left' | 'fragments'
  | 'specs-0' | 'specs-1' | 'specs-2' | 'specs-3' | 'specs-many' | 'specs-dim' | 'specs-faint' | 'pyramid' | 'hourglass' | 'hourglass-stale'
  | 'before-0' | 'before-1' | 'before-2' | 'before-3' | 'before-4' | 'before-5' | 'before-dim'
  | 'after-0' | 'after-1' | 'after-2' | 'after-3' | 'after-4' | 'after-5' | 'after-6' | 'after-7' | 'after-8' | 'after-dim'
  | 'graph-nodes' | 'code' | 'heading-lost' | 'heading-set'
  | 'question' | 'cite-0' | 'cite' | 'drift-current' | 'drift-stale' | 'pipeline-1' | 'pipeline-2' | 'pipeline-3' | 'dogfood' | 'bands' | 'ring'


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
    if (point) b.sheet(point.x, point.y, sys.tint[k][i], touched ? d : d * 0.55)
    else b.sheet(sys.cloud[i].x, sys.cloud[i].y, grey, 0.2 * (d / 0.85), sys.cloud[i].z)
  })
}

// After: the final shape is there from the start, grey and slightly blurred;
// iteration k has built its features exactly in place.
// With `clean`, the architecture is the finished, tidy one (the product-code sheet); otherwise it is laid in
// pieces, some added late, and a few pieces move (see system.ts).
function drawAfter(b: Builder, sys: System, k: number, d = 0.88, clean = false) {
  sys.homes.forEach((home, i) => {
    b.group = home.f
    const move = clean ? null : sys.grow.move[i]
    const gone = move && k >= move.step
    if ((clean ? builtAt(home) : sys.grow.born[i]) <= k) b.sheet(home.x + (gone ? move.dx : 0), home.y + (gone ? move.dy : 0), home.c, d)
    else b.sheet(home.x + sys.ghost[i][0] * blurAt(k), home.y + sys.ghost[i][1] * blurAt(k), grey, 0.4 * (d / 0.88))
  })
}

// Stage icons drawn in glyphs, after the SDLC timeline in Juan's article (NUT panel 1).
// Each icon has its own seed, so the three lifecycle forms draw it identically and it stays still.
type Pen = { line(x1: number, y1: number, x2: number, y2: number, n: number, c: string, d?: number): void; arc(cx: number, cy: number, r: number, a0: number, a1: number, n: number, c: string, d?: number): void; fill(inside: (x: number, y: number) => boolean, x0: number, y0: number, x1: number, y1: number, n: number, c: string, d?: number): void }
const ink = { yellow: '#ffd23f', amber: '#ff9f1c', orange: '#ff6b2c', red: '#f0443a', white: '#f4f6fa', grey: '#9aa6b8', steel: '#c3ccd8', brown: '#c98a4b', blue: '#5aa9ff', sky: '#9fd3ff', green: '#4fcb8c', pink: '#f27ec2', dark: '#4a5468' }
const inPoly = (pts: [number, number][]) => (x: number, y: number) => {
  let inside = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j]
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}
const stageIcons: ((p: Pen) => void)[] = [
  // Problem: a warning triangle with an exclamation mark, the trigger.
  p => {
    const tri: [number, number][] = [[0, -46], [46, 34], [-46, 34]]
    p.fill(inPoly(tri), -46, -46, 46, 34, 110, ink.red, 0.35)
    tri.forEach((pt, k) => { const [x2, y2] = tri[(k + 1) % 3]; p.line(pt[0], pt[1], x2, y2, 30, ink.red, 0.95) })
    p.line(0, -20, 0, 6, 12, ink.white, 0.95); p.fill((x, y) => Math.hypot(x, y - 20) < 4.5, -5, 15, 5, 25, 7, ink.white, 0.95)
  },
  // Ideation: a lit bulb.
  p => {
    p.fill((x, y) => x * x + (y + 14) ** 2 < 30 * 30, -30, -44, 30, 16, 70, ink.yellow, 0.35)
    p.arc(0, -14, 34, Math.PI * 0.72, Math.PI * 2.28, 90, ink.yellow, 0.9)
    p.line(-14, 14, -12, 28, 8, ink.yellow, 0.9); p.line(14, 14, 12, 28, 8, ink.yellow, 0.9)
    p.line(-8, 8, -4, -18, 10, ink.orange, 0.95); p.line(-4, -18, 0, -6, 6, ink.orange, 0.95); p.line(0, -6, 4, -18, 6, ink.orange, 0.95); p.line(4, -18, 8, 8, 10, ink.orange, 0.95)
    for (const y of [32, 40, 48]) p.line(-12 + (y - 32) / 4, y, 12 - (y - 32) / 4, y, 9, ink.grey, 0.8)
    for (const a of [-2.6, -2.1, -1.57, -1.05, -0.55]) p.line(48 * Math.cos(a), -14 + 48 * Math.sin(a), 60 * Math.cos(a), -14 + 60 * Math.sin(a), 4, ink.amber, 0.7)
  },
  // Product: a bullseye.
  p => {
    ;[[42, ink.red], [32, ink.white], [22, ink.red], [12, ink.white], [5, ink.red]].forEach(([r, c], k) =>
      p.fill((x, y) => { const q = Math.hypot(x, y + 4); return q < (r as number) && q >= (k < 4 ? [32, 22, 12, 5][k] : 0) }, -42, -46, 42, 38, Math.round(80 * (r as number) / 42) + 12, c as string, 0.85))
  },
  // Functional backlog: a clipboard with items.
  p => {
    p.fill((x, y) => Math.abs(x) < 30 && Math.abs(y) < 40, -30, -40, 30, 40, 60, ink.brown, 0.4)
    p.line(-32, -42, 32, -42, 16, ink.brown, 0.9); p.line(32, -42, 32, 42, 20, ink.brown, 0.9); p.line(32, 42, -32, 42, 16, ink.brown, 0.9); p.line(-32, 42, -32, -42, 20, ink.brown, 0.9)
    p.fill((x, y) => Math.abs(x) < 14 && y > -50 && y < -38, -14, -50, 14, -38, 22, ink.grey, 0.95)
    for (const y of [-20, -2, 16]) { p.fill((x, q) => Math.hypot(x + 18, q - y) < 4, -22, y - 4, -14, y + 4, 5, ink.green, 0.95); p.line(-8, y, 22, y, 9, ink.white, 0.85) }
  },
  // Architecture: a column building.
  p => {
    p.fill(inPoly([[-46, -22], [0, -48], [46, -22]]), -46, -48, 46, -22, 70, ink.steel, 0.75)
    p.line(-46, -22, 0, -48, 14, ink.white, 0.9); p.line(0, -48, 46, -22, 14, ink.white, 0.9)
    for (const x of [-32, -11, 11, 32]) p.fill((u, v) => Math.abs(u - x) < 6 && v > -18 && v < 32, x - 6, -18, x + 6, 32, 34, ink.white, 0.8)
    p.fill((x, y) => Math.abs(x) < 48 && y > 32 && y < 44, -48, 32, 48, 44, 44, ink.steel, 0.85)
  },
  // Design: a pencil.
  p => {
    const a = -Math.PI / 4, c = Math.cos(a), s = Math.sin(a)
    const along = (t: number, w: number): [number, number] => [t * c - w * s, t * s + w * c]
    const band = (t0: number, t1: number, col: string, n: number, d = 0.85) => p.fill((x, y) => { const t = x * c + y * s, w = -x * s + y * c; return t > t0 && t < t1 && Math.abs(w) < 9 }, -60, -60, 60, 60, n, col, d)
    band(-34, 26, ink.yellow, 90); band(-46, -34, ink.steel, 18); band(-58, -46, ink.pink, 18, 0.9)
    p.fill((x, y) => { const t = x * c + y * s, w = -x * s + y * c; return t > 26 && t < 46 && Math.abs(w) < 9 * (46 - t) / 20 }, -60, -60, 60, 60, 26, ink.brown, 0.85)
    const [tx, ty] = along(48, 0); p.fill((x, y) => Math.hypot(x - tx, y - ty) < 4, tx - 4, ty - 4, tx + 4, ty + 4, 6, ink.dark, 0.95)
    const [x1, y1] = along(-34, 0), [x2, y2] = along(26, 0); p.line(x1, y1, x2, y2, 14, ink.amber, 0.9)
  },
  // Development: a laptop with code on screen.
  p => {
    p.fill((x, y) => Math.abs(x) < 40 && y > -42 && y < 14, -40, -42, 40, 14, 40, ink.blue, 0.15)
    p.line(-42, -44, 42, -44, 18, ink.steel, 0.9); p.line(42, -44, 42, 16, 14, ink.steel, 0.9); p.line(-42, 16, -42, -44, 14, ink.steel, 0.9); p.line(-42, 16, 42, 16, 18, ink.steel, 0.9)
    p.line(-28, -30, -18, -18, 5, ink.green, 0.95); p.line(-18, -18, -28, -6, 5, ink.green, 0.95); p.line(-8, -4, 14, -4, 6, ink.white, 0.95); p.line(-8, -30, 28, -30, 9, ink.sky, 0.75); p.line(-8, -17, 20, -17, 7, ink.sky, 0.75)
    p.fill(inPoly([[-46, 20], [46, 20], [58, 34], [-58, 34]]), -58, 20, 58, 34, 50, ink.steel, 0.55)
  },
  // DevOps: a gear.
  p => {
    p.fill((x, y) => { const r = Math.hypot(x, y), th = Math.atan2(y, x); return r > 13 && (r < 32 || (r < 44 && Math.cos(8 * th) > 0.35)) }, -44, -44, 44, 44, 190, ink.grey, 0.8)
    p.arc(0, 0, 13, 0, Math.PI * 2, 24, ink.white, 0.85)
  },
  // Operations: a cloud.
  p => {
    const circles: [number, number, number][] = [[-26, 8, 20], [0, -8, 28], [26, 6, 20], [0, 14, 18]]
    p.fill((x, y) => y < 28 && circles.some(([cx, cy, r]) => Math.hypot(x - cx, y - cy) < r - 4), -48, -38, 48, 28, 100, ink.sky, 0.3)
    p.arc(-26, 8, 20, Math.PI * 0.5, Math.PI * 1.55, 22, ink.white, 0.9); p.arc(0, -8, 28, Math.PI * 1.1, Math.PI * 1.95, 30, ink.white, 0.9); p.arc(26, 6, 20, Math.PI * 1.45, Math.PI * 2.5, 22, ink.white, 0.9)
    p.line(-26, 28, 26, 28, 18, ink.white, 0.9)
  },
  // SRE: a shield with a check.
  p => {
    const shield: [number, number][] = [[0, -48], [40, -34], [38, 4], [24, 30], [0, 46], [-24, 30], [-38, 4], [-40, -34]]
    p.fill(inPoly(shield), -40, -48, 40, 46, 140, ink.blue, 0.55)
    shield.forEach((pt, k) => { const [x2, y2] = shield[(k + 1) % shield.length]; p.line(pt[0], pt[1], x2, y2, 8, ink.sky, 0.9) })
    p.line(-18, 0, -4, 16, 8, ink.green, 1); p.line(-4, 16, 22, -16, 14, ink.green, 1)
  },
  // Maintenance: a wrench.
  p => {
    const a = Math.PI / 4, c = Math.cos(a), s = Math.sin(a)
    p.fill((x, y) => { const t = x * c + y * s, w = -x * s + y * c; return t > -48 && t < 24 && Math.abs(w) < 8 }, -60, -60, 60, 60, 90, ink.steel, 0.85)
    const hx = -38 * c, hy = -38 * s
    p.fill((x, y) => { const t = x * c + y * s, w = -x * s + y * c; const r = Math.hypot(t - 36, w); return r < 21 && !(t > 36 && Math.abs(w) < 8) }, -10, -10, 60, 60, 90, ink.steel, 0.85)
    p.fill((x, y) => Math.hypot(x - hx, y - hy) < 3, hx - 3, hy - 3, hx + 3, hy + 3, 4, ink.dark, 0.95)
  },
]

const ICON_GROUP = 100, LINE_GROUP = 200

function drawIcon(b: Builder, k: number, cx: number, cy: number, budget: number, scale = 1) {
  const random = rng(4242 + k * 101)
  const start = b.i
  b.group = ICON_GROUP + k
  const put = (x: number, y: number, c: string, d: number) => { if (b.i - start < budget) b.sheet(cx + x * scale, cy + y * scale, c, d + (random() - 0.5) * 0.12) }
  const pen: Pen = {
    line: (x1, y1, x2, y2, n, c, d = 0.85) => { for (let j = 0; j < n; j++) { const t = (j + 0.5) / n; put(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, c, d) } },
    arc: (x0, y0, r, a0, a1, n, c, d = 0.85) => { for (let j = 0; j < n; j++) { const a = a0 + ((a1 - a0) * (j + 0.5)) / n; put(x0 + r * Math.cos(a), y0 + r * Math.sin(a), c, d) } },
    fill: (inside, x0, y0, x1, y1, n, c, d = 0.85) => { for (let j = 0, tries = 0; j < n && tries < n * 60; tries++) { const x = x0 + random() * (x1 - x0), y = y0 + random() * (y1 - y0); if (inside(x, y)) { put(x, y, c, d); j++ } } },
  }
  stageIcons[k](pen)
  b.skip(start + budget - b.i)
}

/** The SDLC timeline (NUT panel 1): eleven stages on one line, in sheet px. */
export const stages = Array.from({ length: 11 }, (_, k) => ({ x: 150 + k * 162, y: 560 }))

function lifecycle(b: Builder) {
  b.sway = 0
  // One continuous line under the icons; the stage names sit on it.
  const [first, last] = [stages[0], stages[stages.length - 1]]
  b.group = LINE_GROUP
  for (let j = 0; j < 360; j++) b.sheet(first.x + ((last.x - first.x) * (j + 0.5)) / 360, first.y, color.accent, 0.3)
  b.skip(700)
  stages.forEach(({ x, y }, k) => drawIcon(b, k, x, y - 64, 300))
}

/**
 * The sources of product knowledge (NUT panel 3), in sheet px, laid out left to right as the knowledge travels:
 * who asks for it (Stakeholders, Customers), who interprets it (Product Owner, Developers), where it ends up
 * written down (Jira, Meeting Notes, Slack, Docs & Wiki, Source Code). Close together, and each cluster is a loose
 * cloud that overlaps its neighbours.
 */
export const sources = [
  { x: 340, y: 350, c: color.con }, { x: 340, y: 480, c: color.qr },
  { x: 700, y: 405, c: color.sb }, { x: 700, y: 680, c: color.fr },
  { x: 1100, y: 350, c: color.act }, { x: 1100, y: 460, c: color.term }, { x: 1100, y: 570, c: color.jrn }, { x: 1100, y: 680, c: color.bc }, { x: 1100, y: 790, c: color.br },
].map(s => ({ ...s, y: s.y + 70 }))
/** Where a third of each cluster's glyphs leak to and never arrive (indexes into sources). */
const leaks = [2, 2, 4, 6, 8, 6, 3, 8, 7]
/** "Product Knowledge" is the word in the title: it has no glyphs of its own, hovering it lights the glyphs of every source. */
export const KNOWLEDGE_GROUP = 9

function fragments(b: Builder) {
  b.sway = 0
  sources.forEach(({ x, y, c }, k) => {
    const other = sources[leaks[k]]
    b.group = k
    for (let j = 0; j < 260; j++) {
      const m = Math.sqrt(-2 * Math.log(Math.max(1e-6, b.random()))), th = b.random() * Math.PI * 2
      // Leaking: a third of each cluster drifts towards the next source and never arrives.
      const t = j % 3 === 0 ? 0.2 + b.random() * 0.5 : 0
      b.sheet(x + (other.x - x) * t + 84 * m * Math.cos(th), y + (other.y - y) * t + 54 * m * Math.sin(th), c, 0.55 + b.random() * 0.3)
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

/**
 * Neon for the lifecycle. `weights` lights each stage (its icon, and the line between stages by interpolation);
 * `travel` mixes in a spot of light at sheet x = `cx` on the line, so the light can move along it.
 */
const neon = new Float32Array(POINTS)
export function lifecycleNeon(weights: number[], cx: number, travel: number) {
  const f = form('lifecycle')
  const spot = (x: number, width: number) => { const t = Math.max(0, 1 - Math.abs(x - cx) / width); return t * t * (3 - 2 * t) }
  const along = (x: number) => {
    const u = Math.max(0, Math.min(stages.length - 1, (x - stages[0].x) / (stages[1].x - stages[0].x)))
    const k = Math.min(stages.length - 2, Math.floor(u))
    return weights[k] + (weights[k + 1] - weights[k]) * (u - k)
  }
  for (let i = 0; i < POINTS; i++) {
    const g = f.grp[i]
    if (g === LINE_GROUP) { const x = f.pos[i * 3] * 60 + 960; neon[i] = (1 - travel) * along(x) + travel * spot(x, 130) }
    else if (g >= ICON_GROUP && g < ICON_GROUP + stages.length) { const k = g - ICON_GROUP; neon[i] = (1 - travel) * weights[k] + travel * spot(stages[k].x, 160) }
    else neon[i] = 0
  }
  return neon
}

/** The two sources of truth as glyph discs, in sheet px, and their point groups. */
export const TWO_GROUP = { product: 0, architecture: 1, link: 2, agent: 3 }

/** The agent drawn in glyphs: a white ball, lit from the top right. Its eyes are drawn on the sheet, so they can look around. */
export const agentBall = { x: 1500, y: 860, r: 58 }
function agent(b: Builder) {
  const random = rng(7351), { x: cx, y: cy, r } = agentBall
  for (let n = 0; n < 460; n++) {
    const rr = r * Math.sqrt(random()), a = random() * Math.PI * 2, x = rr * Math.cos(a), y = rr * Math.sin(a)
    const light = 0.8 + 0.2 * Math.max(0, (x - y) / (r * 1.6) + 0.4)
    b.sheet(cx + x, cy + y, color.white, Math.min(1, light))
  }
}
export const twoDiscs = { product: { x: 960 + 5.5 * 60, y: 540, r: 2.6 * 60 }, architecture: { x: 960 + 12.5 * 60, y: 540, r: 2.6 * 60 } }

function beats(b: Builder, shown: number) {
  b.sway = 0
  const xs = [-9.87, 0, 9.87], tints = [color.jrn, color.uc, color.white]
  xs.forEach((x, k) => { if (k) { if (k < shown) b.line(xs[k - 1] + 1.2, -6.6, x - 1.2, -6.6, 220, color.accent, 0.3); else b.skip(220) } })
  xs.forEach((x, k) => { if (k < shown) b.disc(x, -6.6, k === 2 ? 1.0 : 0.8, 320, tints[k]); else b.skip(320) })
}

/** Neon by group: point i is lit by `level[grp[i]]` (groups outside the array stay dark). */
const groupNeon = new Float32Array(POINTS)
export function groupMask(name: FormName, level: number[]) {
  const g = form(name).grp
  for (let i = 0; i < POINTS; i++) groupNeon[i] = level[g[i]] ?? 0
  return groupNeon
}

/** The lifecycle line again, low on the tests sheet, with an arc from Product straight to validation (DevOps, where CI runs the e2e). */
export const lowStages = stages.map(({ x }) => ({ x, y: 930 }))
export const validationArc = { from: 2, to: 7, peak: 820 }

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
  // Only the background dust: a quiet sheet for one big line.
  dust: () => {},
  lifecycle: b => lifecycle(b),
  'lifecycle-ai': b => lifecycle(b),
  'lifecycle-left': b => lifecycle(b),
  fragments: b => fragments(b),
  'specs-0': b => specArrows(b, false, 1, 0),
  'specs-1': b => specArrows(b, false, 1, 1),
  'specs-2': b => specArrows(b, false, 1, 2),
  'specs-3': b => specArrows(b, false, 1, 3),
  'specs-many': b => specArrows(b, true),
  'specs-dim': b => specArrows(b, true, 0.4),
  'specs-faint': b => specArrows(b, true, 0.15),
  pyramid: b => testShape(b, false),
  hourglass: b => testShape(b, true),
  'hourglass-stale': b => testShape(b, true, true, true),
  'graph-nodes': b => { b.sway = 0; graphNodes(b, false) },
  // The code first, so point index = home index for the neon masks in graph/code.ts.
  code: b => { b.sway = 0; drawAfter(b, system(CODE), AFTER_STEPS, 0.88, true); b.group = -1; graphNodes(b, true) },
  'heading-lost': b => heading(b, false),
  'heading-set': b => heading(b, true),
  two: b => {
    // Still, so hovering can find the glyph under the pointer. Groups: product, architecture, the link.
    b.sway = 0
    b.group = TWO_GROUP.product; b.disc(5.5, 0, 2.6, 1300, color.accent, 0.8)
    b.group = TWO_GROUP.architecture; b.disc(12.5, 0, 2.6, 1300, color.bc, 0.8)
    b.group = TWO_GROUP.link; b.line(8.3, 0, 9.7, 0, 160, color.white, 0.45, true)
    b.group = TWO_GROUP.agent; agent(b)
  },
  question: b => question(b),
  'cite-0': b => citations(b, 'hidden'),
  cite: b => citations(b, 'current'),
  'drift-current': b => citations(b, 'current'),
  'drift-stale': b => citations(b, 'stale'),
  // Three beats on one line under the cards: AI, code, and the person in white. A beat not told yet waits in the dust.
  'pipeline-1': b => beats(b, 1),
  'pipeline-2': b => beats(b, 2),
  'pipeline-3': b => beats(b, 3),
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
