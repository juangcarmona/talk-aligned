// The software system drawn as code tokens: every point is a block of tokens
// with a home in the finished system, a vertical-slice architecture with CQRS.
// Three cross-cutting bands on top, ten feature columns (six commands, four
// queries), and the write and read stores at the bottom. The same system is
// drawn at different sizes, so the geometry is relative to a sheet rectangle.

import { color, rng } from './palette'

export type Rect = { x: number; y: number; w: number; h: number }
export type Point = { x: number; y: number }

/** `f` is the feature (-1 for shared parts), `band` the cross-cutting band (-1 if none), `v` the height inside its feature column (0 top, 1 bottom). */
export type Home = Point & { c: string; f: number; band: number; store: number; v: number }

export type System = {
  rect: Rect
  homes: Home[]
  /** Iteration 0–5 without a product definition: where each block is, or null while it is still in the cloud. */
  before: (Point | null)[][]
  /** Before: the colour each block shows at each iteration; late cycles mix pieces of one feature into another. */
  tint: string[][]
  cloud: (Point & { z: number })[]
  ghost: [number, number][]
  column: number
  gap: number
}

/** Where the system is drawn: beside the backlog (before, after) and beside the graph (product-code). */
export const BIG: Rect = { x: 440, y: 250, w: 1380, h: 700 }
export const CODE: Rect = { x: 1000, y: 262, w: 824, h: 700 }

export const FEATURES = 10
export const COMMANDS = 6
export const grey = '#9aa3b5'
const SPACING = 14

// Proportions of the original 820 × 720 drawing.
const BAND = 40 / 720, BAND_STEP = 48 / 720, FEATURE_TOP = 152 / 720, FEATURE_BOTTOM = 612 / 720, STORE_TOP = 628 / 720

/** Before: the iteration that writes each feature's ticket. */
export const iterationOf = [1, 2, 2, 3, 3, 3, 4, 4, 5, 5]

/**
 * After: the architecture comes first, one ticket per step: authentication and
 * authorization (band 0), cross-cutting concerns (band 1), the domain model
 * (band 2) and the infrastructure (the stores). Then the slices, a few per step.
 */
export const AFTER_STEPS = 8
export const sliceStep = [5, 5, 6, 6, 7, 7, 8, 8, 8, 8]
export function builtAt(home: Home) {
  return home.band >= 0 ? home.band + 1 : home.store >= 0 ? 4 : sliceStep[home.f]
}
/** After: how blurred the grey outline still is at step k. */
export const blurAt = (k: number) => 7 - (5 * k) / AFTER_STEPS

const cache = new Map<string, System>()

export function system(rect: Rect): System {
  const key = `${rect.x},${rect.y},${rect.w},${rect.h}`
  const found = cache.get(key)
  if (found) return found
  const { x: x0, y: y0, w, h } = rect
  const s = w / 820
  const gap = 12 * s
  const column = (w - 9 * gap) / FEATURES
  const homes: Home[] = []
  const grid = (x: number, y: number, gw: number, gh: number, c: string, f: number, band: number, store: number) => {
    const nx = Math.max(1, Math.round(gw / SPACING)), ny = Math.max(1, Math.round(gh / SPACING))
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) homes.push({ x: x + ((i + 0.5) * gw) / nx, y: y + ((j + 0.5) * gh) / ny, c, f, band, store, v: (j + 0.5) / ny })
  }
  for (let k = 0; k < 3; k++) grid(x0, y0 + k * BAND_STEP * h, w, BAND * h, color.act, -1, k, -1)
  for (let f = 0; f < FEATURES; f++) grid(x0 + f * (column + gap), y0 + FEATURE_TOP * h, column, (FEATURE_BOTTOM - FEATURE_TOP) * h, f < COMMANDS ? color.br : color.term, f, -1, -1)
  const split = COMMANDS * (column + gap)
  grid(x0, y0 + STORE_TOP * h, split - gap, (1 - STORE_TOP) * h, color.uc, -1, -1, 0)
  grid(x0 + split, y0 + STORE_TOP * h, w - split, (1 - STORE_TOP) * h, color.bc, -1, -1, 1)

  // Before: no product definition. Iteration 0 is a shapeless cloud. Each
  // iteration writes a little more, through a different misreading of the
  // product (a smooth warp that changes every time), and rewrites most of what
  // was there; iteration 4 throws three features away.
  const random = rng(11)
  // Points pushed past an edge bounce back in, so nothing piles up along the border.
  const reflect = (v: number, lo: number, hi: number) => { const span = hi - lo, t = (((v - lo) % (2 * span)) + 2 * span) % (2 * span); return lo + (t > span ? 2 * span - t : t) }
  const priority = homes.map(() => random())
  // Each cycle adds a little and redoes almost everything.
  const written = [0.22, 0.34, 0.46, 0.58, 0.7]
  const rework = [0, 0.9, 0.9, 0.9, 0.9]
  const amplitude = [220, 180, 150, 125, 110].map(a => a * s)
  const jitter = [40, 32, 26, 20, 16].map(a => a * s)
  // The last two cycles look like an architecture, but are not: whole pieces come loose and
  // land somewhere else, the cross-cutting bands show up in several places at once, and
  // features take each other's colours.
  const chaos = [0, 0, 0, 0.7, 1]
  const palette = [color.br, color.term, color.uc, color.bc, color.act]
  const piece = { w: 70 * s, h: 64 * s }
  const before: (Point | null)[][] = [homes.map(() => null)]
  const tint: string[][] = [homes.map(h => h.c)]
  for (let k = 0; k < written.length; k++) {
    const waves = Array.from({ length: 6 }, () => [(0.003 + random() * 0.009) / s, (0.003 + random() * 0.009) / s, random() * Math.PI * 2])
    const warp = (x: number, y: number, from: number) => waves.slice(from, from + 3).reduce((sum, [a, b, c]) => sum + Math.sin(a * x + b * y + c), 0) / 3
    type Piece = { dx: number; dy: number; c: string | null }
    const pieces = new Map<string, Piece>()
    const pieceOf = (home: Home): Piece => {
      const ix = Math.floor((home.x - x0) / piece.w), iy = Math.floor((home.y - y0) / piece.h)
      const key = `${ix},${iy},${home.band}`
      let found = pieces.get(key)
      if (!found) {
        const cx = x0 + (ix + 0.5) * piece.w, cy = y0 + (iy + 0.5) * piece.h
        const jump = home.band >= 0 ? random() < 0.55 * chaos[k] : random() < 0.28 * chaos[k]
        const to = home.band >= 0 ? { x: x0 + random() * w, y: y0 + (0.2 + random() * 0.75) * h } : { x: cx + (random() - 0.5) * 360 * s, y: cy + (random() - 0.5) * 280 * s }
        found = { dx: jump ? to.x - cx : 0, dy: jump ? to.y - cy : 0, c: random() < 0.4 * chaos[k] ? palette[Math.floor(random() * palette.length)] : null }
        pieces.set(key, found)
      }
      return found
    }
    const colours: string[] = []
    before.push(before[k].map((point, i) => {
      const home = homes[i]
      colours[i] = tint[k][i]
      if (priority[i] >= written[k] || (k === 3 && home.f >= 2 && home.f <= 4)) return null
      if (point && random() >= rework[k]) return point
      const p = chaos[k] ? pieceOf(home) : null
      colours[i] = p?.c ?? home.c
      // A loose piece moves in one block, so it still reads as a piece of something.
      if (p && (p.dx || p.dy)) return { x: reflect(home.x + p.dx + (random() - 0.5) * 6 * s, x0, x0 + w), y: reflect(home.y + p.dy + (random() - 0.5) * 6 * s, y0, y0 + h) }
      return {
        x: reflect(home.x + amplitude[k] * warp(home.x, home.y, 0) + (random() - 0.5) * 2 * jitter[k], x0, x0 + w),
        y: reflect(home.y + amplitude[k] * 0.7 * warp(home.x, home.y, 3) + (random() - 0.5) * 2 * jitter[k], y0, y0 + h),
      }
    }))
    tint.push(colours)
  }

  const fog = rng(5)
  const cloud = homes.map(() => {
    const m = Math.sqrt(-2 * Math.log(Math.max(1e-6, fog()))), th = fog() * Math.PI * 2
    return { x: x0 + w / 2 + 220 * s * m * Math.cos(th), y: y0 + h * 0.52 + 170 * s * m * Math.sin(th), z: (fog() - 0.5) * 1.5 }
  })
  const blurRandom = rng(3)
  const ghost = homes.map((): [number, number] => { const th = blurRandom() * Math.PI * 2, r = 0.3 + blurRandom() * 0.7; return [r * Math.cos(th), r * Math.sin(th)] })

  const result = { rect, homes, before, tint, cloud, ghost, column, gap }
  cache.set(key, result)
  return result
}

/** Left edge of a feature column, in sheet px. */
export function columnX(sys: System, f: number) {
  return sys.rect.x + f * (sys.column + sys.gap)
}
