# Outline

Eleven scenes. Each has a stable ID (its URL is `/#/<id>`), what is on screen, the planned motion and its sources. What Juan says lives in [`speaker-notes.md`](speaker-notes.md), which the presenter window reads.

- Quoted text is literal from the named source. **[proposal]** marks new wording for Juan to approve. IDs, paths, digests and terminal output are copied from the source.
- Scene headings ("Where this came from", "SDD at scale makes noise", "Two sources of truth", "Small artifacts, stable IDs", "Define once, cite everywhere", "Change it, and CI knows", "Tools validate, people accept", "It runs on its own tools", "What it does not catch") are all **[proposal]**.
- → is one click (a step inside the scene).
- Source keys are defined in [`narrative.md`](narrative.md).
- Chapter bars use the PDaC kind palette (PS `design-system.md`, dark): I · Why — constraint `#f7776c` · II · Define — accent `#7aa7ff` · III · Cite — business rule `#f79c50` · IV · Own it — structured behaviour `#a5d05a`.

---

### 1. `title` · 1 min
- **On screen:** "AI-Assisted Development at Scale" / "Keeping Product Decisions, Specs, and Agents Aligned" · Juan G. Carmona · Software Development Engineer, Plain Concepts · X-Ops Conference Madrid 2026 · Aula Magna, URJC · 21 Nov 2026.
- **Motion:** Glyph noise drifting on the blueprint grid; dimension lines frame the title like a drawing sheet with a title block.
- **Sources:** title ABS; role ABS speaker line ("Software Development Engineer at Plain Concepts"); place and date JUAN.

### 2. `origin` · 5 min · I · Why
Eleven steps. One story: SDD alone kept drifting; a PoC done properly defined the product first; after that each SDD change was one slice of a known product. Steps 4 to 10 show it as a before and after on the layers of an architecture.
- **On screen, step by step** (all wording **[proposal]**):
  0. Three SDD cycles drawn in a row, each one with "redefine what we want" inside. Caption: "Every SDD cycle redefined the product."
  1. Two lines leave the same point: "what we wanted" straight, "what the AI understood" bending away; a dimension between their ends labelled "drift". Below: "rework, every iteration".
  2. "A real PoC. Let's do it right." Two blocks: "Architecture foundations" · "MVP defined early". Under them, large: "What do we know about the product?"
  3. A folder tree in plain Markdown: `docs/product/` → `actors/` · `use-cases/` · `business-rules/` · `domain/` (DDD). Caption: "Plain Markdown. Product engineering and DDD."
  4–10. Two panels with the same layers of a Clean Architecture with CQRS (API · Application commands · Application queries · Domain · Infrastructure), labelled between them. Left: "Before · SDD alone". Right: "After · intent and architecture defined". Grey pieces are what was expected or defined; coloured pieces are what was delivered. Legend under each panel: "expected" and "delivery 1–3"; "defined" and "slice 1–4". Hovering a legend entry lights its pieces in neon. Caption: "Illustration of SDD projects at Plain Concepts, internal and for clients. Not measured data."
     - 4, 5, 6 (before): each click is one SDD cycle. The grey expectations move to new places, the delivery lands somewhere else in every layer, and most pieces from earlier deliveries move and take the new delivery's colour, because it touched them. Caption: "Every delivery touches every layer."
     - 7 (after): the grey definition appears all at once, four slices, each a narrow column through the layers (API, one CQRS side, Domain, Infrastructure). The before panel stays as it ended.
     - 8, 9, 10 (after): each click delivers one slice; its pieces land next to their grey and nothing else moves. Slice 4 stays grey: the next one is already known. Caption: "Each slice lands close to where it was defined."
- **Motion:** The glyph field tells the same story. 0: the same cluster restated in many deformed copies. 1: copies scattered around a white target ring, all off-centre. 2: everything pulls towards the centre. 3: the cloud forms four kind nodes (ACT, UC, BR, TERM) joined by edges. 4–10: the glyph field draws the pieces of both panels; each piece keeps its points between steps, so the audience sees pieces fly in from the background dust and, before, move again on every delivery.
- **Sources:** JUAN, 2026-11-03 (SDD projects, internal and for Plain Concepts clients, not named; per-cycle redefinition and drift between what the AI thought we wanted and what we wanted; rework every iteration; a real PoC with architecture foundations and the MVP defined as early as possible; plain Markdown, folder structure, actors, use cases, business rules, domain definition with DDD; less drift and much faster delivery; each SDD change iterative and incremental, one slice of the development; the before and after on Clean Architecture layers with CQRS: in SDD alone every delivery touches many things in every layer and the change is larger, with intent and architecture defined each slice is bounded and lands close to what was expected). BLOG-PDAC: "I recently tried this approach manually with quite a few clients, and it worked."

### 3. `noise` · 4 min · I · Why
- **On screen:** The refund grep:
  ```
  $ grep -rn -i "refund" openspec/specs
  billing:   Refunds are issued for purchases made in the last 30 days.
  checkout:  Customers can request a refund within 30 days of delivery.
  support:   If the order is less than a month old, offer a refund.
  ```
  → "160 specs · 273 archived changes" · `ConductionNL/shillinq` · "Forbidden and mandatory, same file, same day, both marked MUST." → "Validation checks shape, not meaning."
- **Motion:** Lines type in; "purchases" and "delivery" get an underline and a "≠" dimension. → two lines of a spec drawn 380 lines apart are pulled together by a dimension line labelled "380". Glyph cloud splits into many deformed copies. Explains drift as restatement.
- **Sources:** grep IS2 (pdac.dev example); numbers, quotes and "380 lines" BLOG-WRONG; project identity SHQ (the line "shillinq adds no per-app controller for" matches the article's quote; Juan confirmed on 2026-11-03 that the project can be named).

### 4. `two-truths` · 4 min · II · Define
- **On screen:** Two blocks: "Intent · what" `docs/product/` · "Architecture · how" `docs/architecture/`. A thin citation line between them, no arrow that merges them. → "ProductShape owns product intent, ArcShape owns architecture evidence and Lighthouse owns the delivery baseline."
- **Motion:** The two blocks draw at opposite sides; the citation line is drawn last, dashed. Glyph cloud becomes two clusters. Explains: related, never confused.
- **Sources:** JUAN ("no se deben confundir. ¿Pueden estar interrelacionadas? Sí"); IS2 `two-sources-of-truth`; LH README (literal); ARC `08-crosscutting-concepts`: "The ProductShape model states what ArcShape should do; architecture Markdown explains how this repository realizes it."

### 5. `artifacts` · 5 min · II · Define
- **On screen:** Ten kind markers in a ring: `ACT` `JRN` `UC` `BR` `TERM` `BC` `FR` `QR` `CON` `SB`. → one real artifact, the frontmatter and rule of `BR-PRODUCT-DEFINITION-AUTHORITY`:
  ```
  id: BR-PRODUCT-DEFINITION-AUTHORITY
  type: business-rule
  status: active
  applies-to: UC-CREATE-ARCHITECTURE-DOCS, …
  ```
  "When an approved ProductShape definition exists, ArcShape must link or cite its relevant approved artifacts rather than copying or replacing them as a competing source of product truth."
- **Motion:** Glyphs form the PDaC logo (white centre, six coloured nodes, spokes), then unfold into ten kind-coloured nodes. → the BR node lifts out and becomes the card. Explains small artifacts with stable IDs and typed relationships.
- **Sources:** kinds PDAC-DIAG PDaC-2 and PS `design-system.md`; artifact ARC `docs/product/model/business-rules/br-product-definition-authority.md` (literal).

### 6. `cite` · 6 min · III · Cite
- **On screen:** The rule card in the centre; edges to consumers, each labelled with file:line:
  - `docs/architecture/02-constraints/README.md:25`
  - `docs/architecture/08-crosscutting-concepts/README.md:13`
  - `docs/product/changes/completed/chg-package-v1-functional-features/implementation-backlog.md:82`
  → the citation line: `<!-- pdac:cite id="BR-PRODUCT-DEFINITION-AUTHORITY" digest="sha256:0c2a1bb4…" -->` → "370 citations in 55 files".
- **Motion:** The core effect. The digest leaves the card and travels along each construction line, stamping onto each consumer. Explains cite instead of restate.
- **Sources:** ARC `git grep pdac:cite` at `62ffe75` (paths, lines, digest, counts).

### 7. `drift` · 5 min · III · Cite
- **On screen:** `BR-REFUND-001` card, "Refunds are accepted within 30 days of delivery." → 30 becomes 14. → real output:
  ```
  stale	BR-REFUND-001	openspec/refund.citations.yml:1
  warning PRODUCT061 … Citation of 'BR-REFUND-001' is stale: canonical content changed since the citation was recorded
  1 citation(s): 0 current, 1 stale, 0 tampered, 0 unresolved
  ```
  `exit 1` → four states: current · stale · tampered · unresolved.
- **Motion:** The digest under the consumer re-rolls; the consumer node decays from dense glyphs to sparse ones and turns orange. Explains drift made visible and a CI job that fails.
- **Sources:** PS README release contract; output `content/evidence/release-contract.txt` (run 2026-11-03, `@prodshape/cli@0.22.1`); states PS `overview.md`; card IS2 `Demo`.

### 8. `change` · 4 min · III · Cite
- **On screen:** Pipeline: Product Change → `change validate` → approve 👤 → `change apply` → PR + CI → merge 👤. → "A human merge accepts the resulting baseline; apply is not acceptance." → three bands: Tools: schemas, IDs, relationships, digests · AI skills: drafting, impact, exploration · People: approve, merge.
- **Motion:** Stages draw as a pipeline; the two human gates carry a person mark. Glyph cloud becomes the same pipeline. Explains where machines stop.
- **Sources:** PS README (literal); PS `change.md`; PS `overview.md` "Division of responsibility".

### 9. `dogfooding` · 3 min · IV · Own it
- **On screen:** Three columns:
  - ProductShape · first commit 2026-07-25 · 0.1.0 → 0.22.1 · 95 artifacts defining itself
  - ArcShape · first commit 2026-10-16 · `CHG-INITIAL` · 35 artifacts
  - Lighthouse · first commit 2026-10-20 · 127 artifacts
  → **[proposal]** "Others already use it, with ProductShape or their own tools."
- **Motion:** Three small glyph graphs grow, each to its artifact count. Explains that the method runs on its own tools.
- **Sources:** PS `git log`, `CHANGELOG.md`, `docs/product/model`; ARC `git log`, `docs/product/changes/completed/CHG-INITIAL`; LH `git log`, `docs/product/model`; others using it JUAN.

### 10. `limits` · 2 min · IV · Own it
- **On screen:** "Structural impact is not semantic impact." → **[proposal]** "Still to define: SDD flows, agentic workflows."
- **Motion:** The Act I line "Validation checks shape, not meaning." returns and pins next to it. Explains that the critique applies to the tool too.
- **Sources:** PS `limitations.md`; BLOG-WRONG (PDaC would not catch a self-contradicting definition); JUAN ("quedan cosas por mejorar… con flujos SDD y con agentic workflows, está por definir").

### 11. `url` · 1 min + questions
- **On screen:** `aligned.jgcarmona.com` large · QR · small: pdac.dev · productshape.dev · arcshape.dev.
- **Motion:** Glyphs settle in a ring around a crisp SVG QR (never glyph-drawn, so phones scan it).
- **Sources:** JUAN; PS README; ARC README.
