# Outline

Eighteen scenes, 40 minutes. Each has a stable ID (its URL is `/#/<id>`), what is on screen, the planned motion and its sources. What Juan says lives in [`speaker-notes.md`](speaker-notes.md), which the presenter window reads.

- Quoted text is literal from the named source. **[proposal]** marks new wording for Juan to approve. IDs, paths, digests and terminal output are copied from the source.
- Scene headings are **[proposal]** unless quoted.
- → is one click (a step inside the scene).
- Source keys are defined in [`narrative.md`](narrative.md). New key: **NUT**, the image *Product Definition as Code in a nutshell* and its six panels, in BLOG-PDAC (jgcarmona.com `origin/main` `1d7c21a`).
- Story agreed with Juan on 2026-11-04. I · Why: the lifecycle, the fragments, direction, SDD noise and the before, ticket by ticket; conclusion: specs are not the source of truth. II · The turn: two sources of truth that SDD feeds from, and the after, ticket by ticket. III · How: the graph, its code, citations, change and who decides. IV · Verify: can we trust AI? Tests that follow the product. V · Closing: Uncle Bob no longer reads his agents' code; so what do we read? The intent.
- Chapter bars use the PDaC kind palette (PS `design-system.md`, dark): I · Why — constraint `#f7776c` · II · The turn — accent `#7aa7ff` · III · How — business rule `#f79c50` · IV · Verify — journey `#ab8ffa` · V · Closing — structured behaviour `#a5d05a`.

---

### 1. `title` · 1 min
- **On screen:** "AI-Assisted Development at Scale" / "Keeping Product Decisions, Specs, and Agents Aligned" · Juan G. Carmona · Software Development Engineer, Plain Concepts · X-Ops Conference Madrid 2026 · Aula Magna, URJC · 21 Nov 2026.
- **Motion:** Glyph noise drifting on the blueprint grid; dimension lines frame the title like a drawing sheet with a title block.
- **Sources:** title ABS; role ABS speaker line ("Software Development Engineer at Plain Concepts"); place and date JUAN.

### 2. `lifecycle` · 2 min · I · Why
- **On screen:** the SDLC as a timeline, left to right: Ideation → Product → Functional Backlog → Architecture → Design → Development → DevOps → Operations → SRE → Maintenance; "Today" over Development (NUT panel 1). → A dense band of glyphs over Development to Ops: where the AI investment is today (NUT panel 2, "Today"). → The band fades and a pulse travels left; a green band over Ideation and Product (NUT panel 2, "Future opportunity"). Caption: "AI is rapidly accelerating the middle of the lifecycle. The next bottleneck is moving left." (NUT panel 1, literal).
- **Motion:** stages are glyph nodes joined by a line; the bands are glyph strips; the pulse moves right to left.
- **Sources:** NUT panels 1 and 2; BLOG-PDAC: "Most AI effort today is concentrated in development, DevOps and operations." (notes).

### 3. `fragments` · 2 min · I · Why
- **On screen:** "Product Knowledge" in the centre, shapeless. Around it, one by one: Jira, Slack, Docs, Meeting Notes, Wiki, Developers, Source Code (NUT panel 3). → Caption: "AI doesn't have a product model. It has fragments." (NUT panel 3, literal).
- **Motion:** each source is a glyph cluster in its own colour; dashed arrows cross between them; glyphs leak between clusters and never settle in the centre.
- **Sources:** NUT panel 3; BLOG-PDAC section 3 (Jira, Slack or Teams, Docs, Confluence, meetings, code comments, people's heads); "with no guarantee it reconstructs the same meanings twice" (notes).

### 4. `direction` · 2 min · I · Why
- **On screen:** "Without direction, a team builds at random. So does vibe coding." **[proposal]** → "With direction, every decision solves today's problem and keeps the destination in sight." **[proposal]**
- **Motion:** twenty glyph boats scattered over the whole sheet, each sailing its own way, no lighthouse. On the click a lighthouse appears and lights up, its beam reaches over the sea, and the boats regroup on arcs around it, every bow towards the light.
- **Sources:** JUAN, 2026-11-04 (a team without direction builds at random; vibe coding builds at random; with direction, decisions focused on the current problem still take the final direction into account; direction, guide, roadmap).

### 5. `noise` · 3 min · I · Why
- **On screen:** on the left, one circle: "one rule" above, "the refund" below **[proposal]**. → one click per spec: an arrow leaves the circle towards a card on the right, `openspec/specs/billing` (red), `checkout` (green), `support` (yellow), each with its refund sentence (pdac.dev example) and the word "refund" highlighted in its colour. → "×160 specs": a hundred and sixty small rule circles, each with its spec pointing its own way. → `ConductionNL/shillinq`: "An open-source accounting suite built with SDD: 160 OpenSpec specs, 273 archived changes." **[proposal]**; "Forbidden and mandatory, same file, same day, both marked MUST."; dimension "380 lines apart". → "Validation checks shape, not meaning."
- **Motion:** the rule alone first; each arrow gathers out of the dust towards its card, three directions; at ×160 the cloud of rules fills the sheet; then it dims behind the Shillinq case.
- **Sources:** grep example IS2 (pdac.dev); numbers, quotes and "380 lines" BLOG-WRONG; identity SHQ (Juan confirmed it can be named). The snapshot idea (every SDD cycle is a snapshot that redefines and leaves artifacts behind) is told here, in the notes: JUAN, 2026-11-04.

### 6. `before` · 3 min · I · Why
- **On screen:** on the left, the backlog: ten tickets, one per use case of the demo shop (#101 Add to cart … #110 View order history). On the right, one large drawing; every point is a block of code tokens of a vertical-slice architecture with CQRS. 0: a shapeless cloud. → 1–5: each click takes the next tickets (the same order the after uses) and runs one SDD cycle: almost everything is undone and redone, with a small increment; blocks touched in this cycle are bright. Earlier tickets are marked reopened (↺). Cycle 4 throws three features away. → Three boxes joined by arrows: "indeterminism → drift → rework" **[proposal]**.
- **Motion:** each point keeps its index, so the same token blocks move, vanish back into the cloud and land elsewhere.
- **Sources:** JUAN, 2026-11-04 (points as token blocks; uncertainty and indeterminism; undo and redo with a small increment per cycle; the backlog dimension). Ticket titles are the demo use cases.

### 7. `not-truth` · 1 min · I · Why
- **On screen:** "Specs should not be the source of truth." The Act I conclusion. → chained boxes "redefine → vary → diverge" **[proposal]** → "More specs, more divergence." **[proposal]** → "Specs must feed from a source of truth." **[proposal]**, the bridge to the two sources of truth.
- **Motion:** the ×160 arrows, dimmed.
- **Sources:** SE2 scene title `specs-are-not-source-of-truth` ("Specs are not the source of truth" / "Las specs no son la fuente de verdad"); JUAN, 2026-11-04 (the conclusion of Act I; the why: redefinition, LLM non-determinism, small variations that chain into drift, divergent context, more specs more divergence; specs must feed from a source of truth).

### 8. `two-truths` · 2 min · II · The turn
- **On screen:** two blocks: "Intent · what" `docs/product/` · "Architecture · how" `docs/architecture/`, a dashed citation line between them; "Related. Never confused." → "SDD: specs, agents and code read both. That is their source of truth." **[proposal]**
- **Motion:** the blocks draw at opposite sides; the citation line last. Glyph cloud becomes two clusters.
- **Sources:** JUAN ("no se deben confundir. ¿Pueden estar interrelacionadas? Sí"; 2026-11-04: sketch architecture and product early; SDD feeds from them as its source of truth; Juan's own tools are not shown until the closing); IS2 `two-sources-of-truth`.

### 9. `after` · 3 min · II · The turn
- **On screen:** the same system, with a backlog that starts with the architecture **[proposal]**: #101 Authentication & authorization, #102 Cross-cutting: logs, validation, #103 Domain model (DDD), #104 Infrastructure: data, CI/CD; then the ten use cases as slices, #105–#114. 0: the final shape in grey, slightly blurred. → 1–4: each architecture ticket lays one layer (the three cross-cutting bands, then the stores). → 5–8: the slices land two by two, then the four queries; nothing built earlier moves; earlier tickets stay done (✓); the outline sharpens. → Three boxes joined by arrows, the opposite chain: "direction → guide → delivery" **[proposal]**.
- **Motion:** points fly in from the background and land on their grey place.
- **Sources:** JUAN, 2026-11-04 ("con PDaC el futuro se intuye… las cosas se van coloreando y colocando… no hay retrabajo"; one ticket, one SDD cycle, one vertical; the backlog defines the architecture first, auth, cross-cutting, DDD, infra, as the base of a vertical slice architecture, then slice by slice).

### 10. `graph` · 4 min · III · How
- **On screen:** the product definition of a small demo shop (`demo/`, built for this talk), drawn as a graph of boxes: each box has the ProductShape kind icon, the kind colour and the ID. Built layer by layer: actors → journeys → use cases → business rules and domain → requirements and structured behaviour → the whole graph, free to explore. Hovering a box lights its neighbours and opens a panel docked bottom left, under the actors and journeys, with the ID, kind, title, the artifact's text and its relationships, so it never covers the boxes. No source line on the sheet; the sources stay here.
- **Motion:** each layer slides in; edges draw from the declared relationships; a glyph node sits behind every box.
- **Sources:** the demo model under `demo/docs/product/model`, compiled with `@prodshape/cli@0.22.1` (`prodshape graph --format json`, saved in `content/evidence/demo/`). Kind icons: PS `src/packages/core/src/snapshot.ts` (kind icon set). The demo model is **[proposal]**, to be approved by Juan.

### 11. `product-code` · 2 min · III · How
- **On screen:** zoom out. Left: the product graph, smaller. Right: its implementation, the vertical-slice CQRS drawing in glyphs, one feature per use case. Hovering a node lights, in neon, the token glyphs that implement it: a use case, its feature column; an actor, its part in every feature it takes part in; a business rule, the domain part of the features it governs; a domain term, the domain of every feature that uses it; a quality requirement or constraint, the cross-cutting bands; and a line joins the node to the code.
- **Motion:** the graph shrinks to the left while the code assembles on the right; neon follows the pointer.
- **Sources:** relationships from the compiled demo graph; the mapping from nodes to code regions follows those relationships and is an illustration **[proposal]**.

### 12. `cite` · 3 min · III · How
- **On screen:** heading on two lines, "Define once," / "cite everywhere". On the left, a small card `BR-REFUND-001`, "Refunds are accepted within 30 days of delivery.", with the rule as an orange glyph cloud under it. → On the right, its four citers, one colour each, joined to the cloud: SDD spec `openspec/specs/refunds/spec.md` (blue), agent skill `.agents/skills/refunds/SKILL.md` (violet), code `src/refunds.citations.yml` (green), test `tests/refund-window.citations.yml` (lime). → Under each, its citation: `<!-- pdac:cite id="BR-REFUND-001" digest="sha256:b1ae4e4c…" -->` in Markdown, `- id: BR-REFUND-001  digest: sha256:b1ae4e4c…` in the ledgers. → "4 citations of the rule · 4 current".
- **Motion:** the citers gather out of the dust one by one, each a disc of its colour with a line from the rule.
- **Sources:** `demo/` (rule text from PS README quickstart); citations emitted with `prodshape cite` and verified with `prodshape citations verify`, `@prodshape/cli@0.22.1`, 2026-11-04; output in `content/evidence/demo/change.txt`.

### 13. `drift` · 3 min · III · How
- **On screen:** the same layout as `cite`, heading "Change it," / "and CI knows"; each citer has a status badge. The card `BR-REFUND-001`, "30" → "14". Terminal: `6 citation(s): 6 current, 0 stale, 0 tampered, 0 unresolved`, `# exit 0` → `prodshape change apply CHG-REFUND-002`, product diff, "Nothing was committed" → the four badges turn `stale` one by one; `6 citation(s): 0 current, 6 stale, 0 tampered, 0 unresolved`, `# exit 1` → the four states.
- **Motion:** lines type in; on stale the citer discs fade to sparse amber and the lines from the rule break into dashes.
- **Sources:** `content/evidence/demo/change.txt`: real output of `@prodshape/cli@0.22.1` on a copy of `demo/` (Product Change created, validated as overlay, approved, applied; then verify). Terminal lines are verbatim; "…" marks omitted text. Note: `change apply` lists 5 affected citations (it does not report the agent skill), while `citations verify` finds all 6 stale.

### 14. `change` · 2 min · III · How
- **On screen:** Pipeline: Product Change → `change validate` → approve 👤 → `change apply` → PR + CI → merge 👤. → "A human merge accepts the resulting baseline; apply is not acceptance." → three bands: Tools: schemas, IDs, relationships, digests · AI skills: drafting, impact, exploration · People: approve, merge.
- **Motion:** Stages draw as a pipeline; the two human gates carry a person mark. Glyph cloud becomes the same pipeline. Explains where machines stop.
- **Sources:** PS README (literal); PS `change.md`; PS `overview.md` "Division of responsibility".

### 15. `trust` · 1 min · IV · Verify
- **On screen:** opens Act IV. "Is what was built what had to be built?" **[proposal]** → "Can we trust AI?" **[proposal]**
- **Motion:** every glyph gathers into one big, many-coloured question mark.
- **Sources:** JUAN, 2026-11-04 (citations keep the documentation from drifting; tests, validation and evidence are not part of the how; the bridge to testing is a question, as in Software Engineering 2.0: one slide, a big question mark).

### 16. `tests` · 3 min · IV · Verify
- **On screen:** the test shape in glyphs, right, with "E2E", "Integration", "Unit" beside it, outside the glyphs. 0: "Before" over the pyramid. → "Now" over the hourglass. → Zoom out: the hourglass shrinks to the right; on the left the impact in the graph: `BR-REFUND-001` "30 → 14 days" joined to `SB-REFUND-001` "Refund on the last day" and `SB-REFUND-002` "Refund one day late", both `stale` (CHG-REFUND-002: March 31 → March 15, April 1 → March 16), and `SB-CANCEL-001` "Cancel after dispatch", `current`. Each behaviour links to its third of the e2e band; hovering a behaviour lights its e2e tokens in neon (an illustration, like `product-code`) and shows its given / when / then; hovering the rule lights both behaviours and all their e2e tokens. Low on the sheet, the lifecycle line from `lifecycle` again, with a glyph arc from Product straight to validation (DevOps, where CI runs the e2e), "product → validation" **[proposal]**. → "the product changes → the behaviour changes → its e2e go stale → AI adapts them" **[proposal]**.
- **Motion:** the pyramid morphs into the hourglass; then it shrinks to the right and part of its e2e band turns amber.
- **Sources:** SE2 `from-pyramid-to-hourglass` and notes `19-validacion`, `20-piramide` (Spanish wording literal; English **[proposal]** translation); `demo/tests/e2e/refund-window.feature` and its ledger citing SB-REFUND-001 and SB-REFUND-002; `content/evidence/demo/change.txt` (CHG-REFUND-002 modifies BR-REFUND-001, SB-REFUND-001 and SB-REFUND-002).

### 17. `closing` · 2 min · V · Closing
- **On screen:** a post card: Robert C. Martin, @unclebobmartin, author of *Clean Code*: “My current strategy is to not read any of the code written by my agents.” X, July 2026. → "If we no longer read the code, what do we read?" **[proposal]** → "The intent: the product, the architecture and the tests that follow them." **[proposal]** → "Tools check the shape. Meaning is still our job." **[proposal]**, echoing "Validation checks shape, not meaning." from `noise`.
- **Motion:** quiet noise under the post; the glyphs gather into the question mark from `trust`; then the two sources of truth from `two-truths`.
- **Sources:** Robert C. Martin on X, July 2026, as reported by Startup Fortune and others (wording and link **por confirmar con Juan**: he used a Martin post in Software Engineering 2.0); the limit: PS `docs/limitations.md` ("Structural impact is not semantic impact"). ProductShape, ArcShape and Lighthouse no longer appear here; the URL slide links pdac.dev, productshape.dev and arcshape.dev.

### 18. `url` · 1 min + questions
- **On screen:** `aligned.jgcarmona.com` large · QR · small: pdac.dev · productshape.dev · arcshape.dev.
- **Motion:** Glyphs settle in a ring around a crisp SVG QR (never glyph-drawn, so phones scan it).
- **Sources:** JUAN; PS README; ARC README.
