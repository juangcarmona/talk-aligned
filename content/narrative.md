# Narrative

Eighteen scenes, about 40 minutes, then questions. Less is more: two ideas carry the talk, artifacts and citations. Everything else supports them.

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

It starts with client work. At Plain Concepts, Juan's team had done several SDD projects, internal and for clients he cannot name. Each SDD cycle redefined what they wanted, and what the AI understood drifted from it, so every iteration meant rework. When a client asked for a real proof of concept, they decided to do it properly: solid architecture foundations and the MVP defined as early as possible, in plain Markdown with folders for actors, use cases, business rules and a DDD domain. Drift dropped and delivery got much faster, because each SDD change became one incremental slice of a product that was already defined. The methodology grew out of that.

The noise has a public example. Shillinq had 160 OpenSpec specs and 273 archived changes, and one official spec forbade and required the same service. An issue is a snapshot of one moment; specs that nobody consolidates pile up those snapshots, and the context grows past what an agent can handle, even with synchronisation mechanisms.

The answer is two sources of truth that are never mixed up. Intent says what we build; architecture says how. They cite each other and never copy each other. Intent is written as small artifacts with stable IDs. Delivery cites them by digest. When a decision changes, the pipeline names every consumer that is now stale. A change to the definition is a Product Change: tools validate, a person approves, a merge accepts.

Juan's own tools prove it on themselves. ProductShape defines itself with its own methodology, ArcShape was defined with it, and Lighthouse uses it too. The method works and is still unfinished; how it fits SDD flows and agentic workflows is still being defined.

## Scenes and timings

Agreed with Juan on 2026-11-04; the SDD sandwich (sheets 5–9) on 2026-11-05. NUT is the image *Product Definition as Code in a nutshell* in BLOG-PDAC.

| # | Scene | Act | Min | Carries |
| --- | --- | --- | --- | --- |
| 1 | `title` | — | 1 | Who, where |
| 2 | `lifecycle` | I · Why | 2 | The SDLC timeline; AI investment in the middle; the bottleneck moves left (NUT 1–2) |
| 3 | `fragments` | I · Why | 2 | "AI doesn't have a product model. It has fragments." (NUT 3) |
| 4 | `direction` | I · Why | 2 | Without direction, people and AI build at random; with it, every decision aims somewhere |
| 5 | `sdd-rocks` | I · Why | 1 | "SDD rocks!": who knows it, who uses it. The top of the sandwich |
| 6 | `noise` | I · Why | 2 | One rule, three refund specs, three directions; ×160 |
| 7 | `shillinq` | I · Why | 1 | A real case, line by line, with a QR to check it; validation checks shape, not meaning |
| 8 | `before` | I · Why | 3 | Ticket by ticket without a definition: undo, redo, rework |
| 9 | `not-truth` | I · Why | 1 | Back to "SDD rocks!", but specs should never be your source of truth: redefinition → drift → divergence |
| 10 | `two-truths` | II · The turn | 2 | Product and architecture; SDD feeds from them |
| 11 | `after` | II · The turn | 3 | Architecture first, then slice by slice: each lands in its vertical |
| 12 | `graph` | III · How | 4 | The demo product as a navigable graph |
| 13 | `product-code` | III · How | 2 | A node lights the code tokens that implement it |
| 14 | `cite` | III · How | 3 | BR-REFUND-001 and the four files that cite it |
| 15 | `drift` | III · How | 3 | CHG-REFUND-002: 30 → 14; the citations go stale; CI fails |
| 16 | `change` | III · How | 1 | AI proposes, code validates, a person accepts |
| 17 | `trust` | IV · Verify | 1 | Is what was built what had to be built? Can we trust AI? |
| 18 | `tests` | IV · Verify | 3 | From pyramid to hourglass; SB-driven e2e know what to adapt |
| 19 | `closing` | V · Closing | 2 | Uncle Bob doesn't read his agents' code: what do we read? The intent. Tools check shape; meaning is ours |
| 20 | `url` | — | 1 | `aligned.jgcarmona.com` + QR, then questions |
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
| `origin` | Copies → off-target scatter → pull to centre → four kind nodes → two drawings of a vertical-slice CQRS system: a cloud rebuilt every iteration before, a grey outline filled in place after | From drifting SDD cycles to slices of a defined product |
| `noise` | Many small deformed clusters | Copies of one decision, drifting |
| `two-truths` | Two separate clusters joined by thin lines | Two sources, related, distinct |
| `artifacts` | The PDaC logo, then a graph of kind-coloured nodes | Artifacts and relationships |
| `cite` | One white node, edges to consumer nodes | Cite instead of restate |
| `drift` | Same layout; consumers decay to sparse glyphs | Stale made visible |
| `change` | Three glyph discs on a line: AI, code, and the person in white | AI proposes, code validates, a person accepts |
| `dogfooding` | Three graphs side by side | Three products, one method |
| `limits` | Graph split into three bands | Tools, agents, people |
| `url` | Ring around the QR | Holds still for questions |
