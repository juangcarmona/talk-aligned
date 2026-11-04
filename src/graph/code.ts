// Which code tokens implement which product node, in the product-code scene.
// A use case is its feature column. Everything else follows the compiled
// relationships to the use cases it touches, and lights the part of those
// columns where that kind of knowledge lives: actors in the presentation
// layer, requirements in the application layer, rules and terms in the domain.
// This mapping is an illustration of a vertical-slice codebase, not measured code.

import { POINTS } from '../field/forms'
import { CODE, system, columnX, type System } from '../field/system'
import { byId, edges, features, type Kind } from './model'

export function codeSystem(): System {
  return system(CODE)
}

// Feature columns, by height: presentation, application, domain, data access.
const layers: Record<string, [number, number]> = { presentation: [0, 0.25], application: [0.25, 0.5], domain: [0.5, 0.85], data: [0.85, 1], all: [0, 1] }

type Reach = { features: number[]; layer: keyof typeof layers; bands: number[]; stores: number[]; share: number }

function useCases(id: string): string[] {
  const out = new Set<string>()
  for (const e of edges) {
    const other = e.from === id ? e.to : e.to === id ? e.from : null
    if (!other) continue
    const node = byId.get(other)
    if (node?.type === 'use-case') out.add(other)
    // Journeys reach use cases through their steps; behaviour through the rule it illustrates.
    if (node && (node.type === 'business-rule' || node.type === 'journey') && byId.get(id)?.type === 'structured-behaviour') useCases(other).forEach(u => out.add(u))
  }
  return [...out]
}

function reach(id: string): Reach {
  const type = byId.get(id)?.type as Kind
  const cols = (ids: string[]) => ids.map(u => features.indexOf(u)).filter(f => f >= 0)
  switch (type) {
    case 'use-case': return { features: cols([id]), layer: 'all', bands: [], stores: [], share: 1 }
    case 'actor': return { features: cols(useCases(id)), layer: 'presentation', bands: [1], stores: [], share: 0.9 }
    case 'journey': return { features: cols(useCases(id)), layer: 'all', bands: [], stores: [], share: 0.45 }
    case 'business-rule': return { features: cols(useCases(id)), layer: 'domain', bands: [], stores: [], share: 0.8 }
    case 'domain-term': return { features: cols(useCases(id)), layer: 'domain', bands: [], stores: [0, 1], share: 0.35 }
    case 'bounded-context': return { features: cols(useCases(id)), layer: 'all', bands: [], stores: [], share: 0.5 }
    case 'functional-requirement': return { features: cols(useCases(id)), layer: 'application', bands: [], stores: [], share: 0.85 }
    case 'quality-requirement': return { features: cols(useCases(id)), layer: 'application', bands: [0], stores: [], share: 0.5 }
    case 'constraint': return { features: cols(useCases(id)), layer: 'presentation', bands: [2], stores: [], share: 0.6 }
    case 'structured-behaviour': return { features: cols(useCases(id)), layer: 'domain', bands: [], stores: [], share: 0.5 }
    default: return { features: [], layer: 'all', bands: [], stores: [], share: 0 }
  }
}

const masks = new Map<string, Float32Array>()

/** 1 for every point of the product-code form that implements the node. The code drawing's homes come first in that form, so home index = point index. */
export function codeMask(id: string): Float32Array {
  const found = masks.get(id)
  if (found) return found
  const sys = codeSystem()
  const r = reach(id)
  const [lo, hi] = layers[r.layer]
  const mask = new Float32Array(POINTS)
  sys.homes.forEach((home, i) => {
    // A stable per-point sample, so the same tokens light up every time.
    const sample = ((i * 2654435761) % 1000) / 1000 < r.share
    const inFeature = home.f >= 0 && r.features.includes(home.f) && home.v >= lo && home.v < hi
    const inBand = home.band >= 0 && r.bands.includes(home.band)
    const inStore = home.store >= 0 && r.stores.includes(home.store)
    if ((inFeature || inBand || inStore) && sample) mask[i] = 1
  })
  masks.set(id, mask)
  return mask
}

/** Points on the code drawing where a connector from the node should end: the top of each feature it reaches, or its bands. */
export function anchors(id: string): { x: number; y: number }[] {
  const sys = codeSystem()
  const r = reach(id)
  const [lo] = layers[r.layer]
  const top = CODE.y + (152 / 720) * CODE.h, height = ((612 - 152) / 720) * CODE.h
  const points = r.features.map(f => ({ x: columnX(sys, f) + sys.column / 2, y: top + lo * height }))
  r.bands.forEach(band => points.push({ x: CODE.x + 18, y: CODE.y + ((band * 48 + 20) / 720) * CODE.h }))
  return points
}
