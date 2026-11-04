// Shared by the field forms and the system drawing: the PDaC kind colours (PS design-system.md, dark) and a seeded random source.

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

/** Deterministic random numbers, so every form is the same on every load. */
export function rng(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
