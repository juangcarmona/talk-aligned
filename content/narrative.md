# Narrative

Eleven scenes, about 40 minutes, then questions. Less is more: two ideas carry the talk, artifacts and citations. Everything else supports them.

## Sources

Short keys, reused in `outline.md`.

| Key | Source | Revision / date |
| --- | --- | --- |
| JUAN | Juan G. Carmona, in this repository's working session | 2026-11-03 |
| ABS | Sessionize abstract (session 187449) | read 2026-11-03 |
| IS2 | `presentations/talks/ingenieria-del-software-2_0` (`content/speaker-notes.md`, `deck/experience*.tsx`, `research/sources.md`) | `origin/main` `f93e100` |
| PS | `juangcarmona/productshape`: README, `docs/methodology/overview.md`, `change.md`, `docs/limitations.md`, `CHANGELOG.md`, `src/public-site/design-system.md`, `assets/site.css`, `pdac-logo.png` | `2e5f465` |
| PDAC-DIAG | pdac.dev/diagrams | read 2026-11-03 |
| ARC | `juangcarmona/arcshape`: `docs/product/`, `docs/architecture/` | `62ffe75` |
| LH | `juangcarmona/lighthouse`: README, `docs/product/` | `9ad3fc5` |
| SHQ | `ConductionNL/shillinq`, `openspec/specs/bookkeeping-vat-btw-filing/spec.md` | GitHub, read 2026-11-03 |
| BLOG-PDAC | *Product Definition as Code for the AI-SDLC*, 2026-07-25 | `jgcarmona.com` `1cb4cca` |
| BLOG-WRONG | *I Tried to Prove PDaC Wrong*, 2026-08-21 | same |
| BLOG-SDD | *Spec-Driven Development: Controlling AI-Generated Drift*, 2026-04-11 | same |
| CK | platform.ckgrafico.com, technique only | read 2026-11-03 |

BLOG-PDAC Part II describes the v0.1 loop (Delivery Slices, Handoffs, `promote`). The current loop is in PS `change.md`. The talk quotes BLOG-PDAC only for the problem.

## The story

It starts with client work. At Plain Concepts, Juan ran Spec-Driven Development projects, proofs of concept and AI adoption strategies with large clients he cannot name. Some PoCs were reverse engineering. Defining the product well cut drift sharply. SDD, in turn, produced a lot of noise: every change wrote more documents, and those documents only checked each other. The methodology grew out of that.

The noise has a public example. Shillinq had 160 OpenSpec specs and 273 archived changes, and one official spec forbade and required the same service. An issue is a snapshot of one moment; specs that nobody consolidates pile up those snapshots, and the context grows past what an agent can handle, even with synchronisation mechanisms.

The answer is two sources of truth that are never mixed up. Intent says what we build; architecture says how. They cite each other and never copy each other. Intent is written as small artifacts with stable IDs. Delivery cites them by digest. When a decision changes, the pipeline names every consumer that is now stale. A change to the definition is a Product Change: tools validate, a person approves, a merge accepts.

Juan's own tools prove it on themselves. ProductShape defines itself with its own methodology, ArcShape was defined with it, and Lighthouse uses it too. The method works and is still unfinished; how it fits SDD flows and agentic workflows is still being defined.

## Scenes and timings

| # | Scene | Act | Min | Carries |
| --- | --- | --- | --- | --- |
| 1 | `title` | — | 1 | Who, where |
| 2 | `origin` | I · Why | 4 | Client PoCs, reverse engineering, product definition reduced drift, SDD produced noise |
| 3 | `noise` | I · Why | 5 | Refund grep, Shillinq: forbidden and mandatory in one file; issues are snapshots; contexts grow |
| 4 | `two-truths` | II · Define | 4 | Intent vs architecture; related, never confused |
| 5 | `artifacts` | II · Define | 5 | The artifact kinds, stable IDs, one real artifact |
| 6 | `cite` | III · Cite | 6 | One rule, its consumers, the citation line, digests |
| 7 | `drift` | III · Cite | 5 | Change the rule; current / stale / tampered / unresolved; CI fails |
| 8 | `change` | III · Cite | 4 | Product Change path; tools, agents, people |
| 9 | `dogfooding` | IV · Own it | 3 | ProductShape, ArcShape, Lighthouse; how it started; others using it |
| 10 | `limits` | IV · Own it | 2 | What it does not catch; what is still to define |
| 11 | `url` | — | 1 | `aligned.jgcarmona.com` + QR, then questions |
| | | | **40** | |

## Reused from Ingeniería del Software 2.0

| Element | Use |
| --- | --- |
| `grep "refund"` with three specs | Opening of `noise` |
| VAT case and "Forbidden and mandatory…" | `noise`, now with the project named |
| `BR-REFUND-001` card and the stale citation | `drift`, with the real release-contract output |
| Citation states (PDaC-5) | `drift` |
| Two sources of truth (`two-sources-of-truth`) | `two-truths`, redrawn |
| Product Change workflow | `change` |
| Scene IDs in the URL, keyboard and click navigation, chapter bar, elapsed clock | Deck engine |

Not reused: repository preparation, SDD tool tour, arc42 sections, testing hourglass, Power BI/Fabric, agentic-sdlc, the Death Star video, guardrails (Juan's guardrails article is unpublished).

## Recurring visual: the product graph in glyphs

One point cloud runs under every scene, drawn as glyphs (`. : - + x * # @`) in the PDaC kind colours on a blueprint grid. Technique from CK; identity from the PDaC logo (white centre node, six coloured nodes, spokes). Each scene gives it one form:

| Scene | Form | Explains |
| --- | --- | --- |
| `title` | Loose noise | Knowledge without shape |
| `origin` | Noise slowly condensing | Defining the product reduced drift |
| `noise` | Many small deformed clusters | Copies of one decision, drifting |
| `two-truths` | Two separate clusters joined by thin lines | Two sources, related, distinct |
| `artifacts` | The PDaC logo, then a graph of kind-coloured nodes | Artifacts and relationships |
| `cite` | One white node, edges to consumer nodes | Cite instead of restate |
| `drift` | Same layout; consumers decay to sparse glyphs | Stale made visible |
| `change` | A horizontal pipeline of nodes, two marked as human gates | Promotion with human gates |
| `dogfooding` | Three graphs side by side | Three products, one method |
| `limits` | Graph split into three bands | Tools, agents, people |
| `url` | Ring around the QR | Holds still for questions |
