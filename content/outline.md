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

### 2. `origin` · 4 min · I · Why
- **On screen:** Three blueprint boxes drawn left to right: **[proposal]** "Client PoCs" → "Reverse engineering" → "Product definition". → under them, two measured bars: "drift" short, "SDD noise" long.
- **Motion:** Boxes draw as strokes; the bars extend like dimension lines. The glyph noise starts to condense. Explains where the method came from: defining the product reduced drift, SDD added noise.
- **Sources:** JUAN (client SDD projects at Plain Concepts, unnamed; PoCs with reverse engineering; "definiendo bien el producto, las derivas se reducían mucho"; "SDD generaba mucho ruido"). BLOG-PDAC: "I recently tried this approach manually with quite a few clients, and it worked."

### 3. `noise` · 5 min · I · Why
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
