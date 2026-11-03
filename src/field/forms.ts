// Point sets for the recurring product-graph field. Every form fills the same
// number of points, so the field can morph from any form to any other.
// World units: the stage spans x ∈ [-16, 16] and y ∈ [-9, 9] at z = 0.

export const POINTS = 5200

export const color = {
  white: '#eef1f5',
  accent: '#7aa7ff',
  dust: '#3b5888',
  act: '#80a9ff',
  jrn: '#ab8ffa',
  uc: '#4fcb8c',
  br: '#f79c50',
  term: '#e3b544',
  bc: '#43c4da',
  fr: '#f27ec2',
  qr: '#a9b2c5',
  con: '#f7776c',
  sb: '#a5d05a',
} as const

/** `grp` tags points that light up together (for example one pie wedge and its increment); -1 is no group. */
export type Form = { pos: Float32Array; col: Float32Array; den: Float32Array; grp: Float32Array }

export type FormName =
  | 'noise' | 'condense' | 'copies' | 'off-target' | 'model' | 'two' | 'logo' | 'kinds'
  | 'before-1' | 'before-2' | 'before-3' | 'after-0' | 'after-1' | 'after-2' | 'after-3'
  | 'cite' | 'drift-current' | 'drift-stale' | 'pipeline' | 'dogfood' | 'bands' | 'ring'

function rng(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

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

  /** One architecture piece: a 4×2 patch of glyphs centred on a sheet position in px. */
  block(px: number, py: number, c: string, d: number) {
    for (let k = 0; k < 8; k++) this.point((px - 960) / 60 + ((k % 4) - 1.5) * 0.2, (540 - py) / 60 + (Math.floor(k / 4) - 0.5) * 0.2, 0, c, d)
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
    return { pos: this.pos, col: this.col, den: this.den, grp: this.grp }
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

/** Sheet geometry, in 1920×1080 px, of the two architectures on the origin scene: five layer rows per panel. */
export const layers = { top: 300, row: 100, rows: 5, width: 760, panels: [96, 1064] as const }
export const pieceColors = [color.uc, color.br, color.act, color.jrn]
const expected = '#9aa3b5'

type Piece = { x: number; y: number; c: string; g: number }

function spot(random: () => number, panel: number, row: number, from = 36, span = layers.width - 72) {
  return { x: layers.panels[panel] + from + random() * span, y: layers.top + row * layers.row + 30 + random() * 40 }
}

// Before: each SDD cycle expects something new (grey) and delivers somewhere else,
// in every layer, and rewrites most of what earlier cycles delivered.
// Pieces keep their index across cycles, so the field shows them move.
const before = (() => {
  const random = rng(42)
  const ghosts: Piece[][] = []
  const delivered: (Piece | null)[][] = []
  let current: (Piece | null)[] = Array(36).fill(null)
  for (let k = 0; k < 3; k++) {
    ghosts.push(Array.from({ length: 12 }, () => ({ ...spot(random, 0, Math.floor(random() * layers.rows)), c: expected, g: k })))
    current = current.map((piece, n) => {
      if (Math.floor(n / 12) === k) return { ...spot(random, 0, n % layers.rows), c: pieceColors[k], g: k }
      if (piece && random() < 0.6) return { ...spot(random, 0, Math.floor(random() * layers.rows)), c: pieceColors[k], g: k }
      return piece
    })
    delivered.push(current)
  }
  return { ghosts, delivered }
})()

// After: intent and architecture are defined, so each slice is known up front
// (grey) and lands close to it, in its own column; earlier slices stay put.
const after = (() => {
  const random = rng(7)
  const ghosts: Piece[] = []
  const delivered: Piece[] = []
  for (let s = 0; s < 4; s++) {
    const side = s % 2 ? 2 : 1 // CQRS: odd slices are queries, even slices commands
    for (const row of [0, side, side, 3, 3, 4]) {
      const ghost = { ...spot(random, 1, row, 26 + s * 190, 138), c: expected, g: 10 + s }
      ghosts.push(ghost)
      const angle = random() * Math.PI * 2, near = 16 + random() * 8
      delivered.push({ x: ghost.x + near * Math.cos(angle), y: ghost.y + near * 0.6 * Math.sin(angle), c: pieceColors[s], g: 10 + s })
    }
  }
  return { ghosts, delivered }
})()

/** Both architectures: `cycle` is the last SDD cycle shown before; `slices` is -1 (nothing defined yet) or the slices delivered after. */
function architecture(b: Builder, cycle: number, slices: number) {
  const put = (piece: Piece | null, d: number) => {
    if (!piece) return b.skip(8)
    b.group = piece.g
    b.block(piece.x, piece.y, piece.c, d)
  }
  before.ghosts[cycle].forEach(piece => put(piece, 0.5))
  before.delivered[cycle].forEach(piece => put(piece, 0.92))
  after.ghosts.forEach(piece => put(slices >= 0 ? piece : null, 0.5))
  after.delivered.forEach((piece, n) => put(Math.floor(n / 6) < slices ? piece : null, 0.92))
}

const kindRing: [string, string][] = [
  ['ACT', color.act], ['JRN', color.jrn], ['UC', color.uc], ['BR', color.br], ['TERM', color.term],
  ['BC', color.bc], ['FR', color.fr], ['QR', color.qr], ['CON', color.con], ['SB', color.sb],
]

/** The PDaC logo: a white centre node, six kind-coloured nodes, spokes and rim. */
function logo(b: Builder, cx: number, cy: number, s: number) {
  const outer = [color.uc, color.act, color.jrn, color.term, color.br, color.con]
  const nodes = outer.map((_, k) => {
    const th = Math.PI / 2 - (k * Math.PI) / 3
    return [cx + s * 3.4 * Math.cos(th), cy + s * 3.4 * Math.sin(th)] as const
  })
  nodes.forEach(([x, y], k) => {
    b.line(cx, cy, x, y, 70, color.accent, 0.3)
    const [nx, ny] = nodes[(k + 1) % 6]
    b.line(x, y, nx, ny, 60, color.accent, 0.2)
  })
  nodes.forEach(([x, y], k) => b.disc(x, y, s * 0.95, 230, outer[k]))
  b.disc(cx, cy, s * 1.3, 420, color.white, 0.95)
}

const builders: Record<FormName, (b: Builder) => void> = {
  noise: () => {},
  condense: b => {
    b.blob(8.5, 0, 3.2, 2.6, 2200, color.accent, 0.45)
    b.blob(8.5, 0, 1.1, 1.0, 500, color.white, 0.8)
  },
  copies: b => {
    for (let k = 0; k < 14; k++) {
      const x = 4 + (k % 4) * 3.4 + (b.random() - 0.5) * 1.4
      const y = 5.6 - Math.floor(k / 4) * 3.6 + (b.random() - 0.5) * 1.2
      b.blob(x, y, 0.35 + b.random() * 0.6, 0.3 + b.random() * 0.5, 150, k % 3 ? color.br : color.con, 0.6)
    }
  },
  'off-target': b => {
    b.ring(9, 0, 1.1, 260, color.white, 0.75, 0.08)
    b.disc(9, 0, 0.18, 30, color.white, 0.9)
    for (let k = 0; k < 9; k++) {
      const th = k * 2.39996 + 0.4, rr = 2.6 + (k % 3) * 1.25
      b.blob(9 + rr * Math.cos(th) * 1.25, rr * Math.sin(th) * 0.95, 0.32 + b.random() * 0.3, 0.28 + b.random() * 0.25, 170, k % 2 ? color.br : color.con, 0.6)
    }
  },
  model: b => {
    const nodes: [number, number, string][] = [[5.6, 3, color.act], [12.4, 3, color.uc], [12.4, -3, color.br], [5.6, -3, color.term]]
    ;[[0, 1], [1, 2], [1, 3], [2, 3]].forEach(([i, j]) => b.line(nodes[i][0], nodes[i][1], nodes[j][0], nodes[j][1], 150, color.accent, 0.3))
    nodes.forEach(([x, y, c]) => b.disc(x, y, 1.25, 520, c))
  },
  'before-1': b => architecture(b, 0, -1),
  'before-2': b => architecture(b, 1, -1),
  'before-3': b => architecture(b, 2, -1),
  'after-0': b => architecture(b, 2, 0),
  'after-1': b => architecture(b, 2, 1),
  'after-2': b => architecture(b, 2, 2),
  'after-3': b => architecture(b, 2, 3),
  two: b => {
    b.disc(5.5, 0, 2.6, 1300, color.accent, 0.8)
    b.disc(12.5, 0, 2.6, 1300, color.bc, 0.8)
    b.line(8.3, 0, 9.7, 0, 160, color.white, 0.45, true)
  },
  logo: b => logo(b, 8.6, 0, 1.15),
  kinds: b => {
    kindRing.forEach(([, c], k) => {
      const th = Math.PI / 2 - (k * Math.PI * 2) / 10
      const x = 8.6 + 5.4 * Math.cos(th), y = 5.0 * Math.sin(th)
      b.line(8.6, 0, x, y, 40, color.accent, 0.18)
      b.disc(x, y, k === 3 ? 1.25 : 0.8, k === 3 ? 360 : 170, c)
    })
    b.disc(8.6, 0, 0.9, 200, color.white, 0.6)
  },
  cite: b => {
    const consumers = [[13.4, 4.2], [13.4, 0], [13.4, -4.2]]
    consumers.forEach(([x, y]) => b.line(6.4, 0, x, y, 260, color.white, 0.55))
    consumers.forEach(([x, y]) => b.disc(x, y, 0.95, 260, color.accent))
    b.disc(6.4, 0, 1.7, 700, color.br, 0.95)
    b.ring(6.4, 0, 2.3, 220, color.white, 0.4)
  },
  'drift-current': b => {
    b.line(6.4, 0, 13.2, 0, 300, color.white, 0.55)
    b.disc(13.2, 0, 1.2, 420, color.accent, 0.9)
    b.disc(6.4, 0, 1.7, 700, color.br, 0.95)
    b.ring(6.4, 0, 2.3, 220, color.white, 0.4)
  },
  'drift-stale': b => {
    b.line(6.4, 0, 13.2, 0, 300, color.br, 0.3, true)
    b.disc(13.2, 0, 1.5, 420, color.br, 0.38)
    b.disc(6.4, 0, 1.7, 700, color.br, 0.95)
    b.ring(6.4, 0, 2.3, 220, color.con, 0.5)
  },
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
