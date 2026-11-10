# Thesis

**Talk:** Las specs no deberían ser tu fuente de verdad (AI-Assisted Development at Scale)
**Event:** NetCoreConf Barcelona 2026 · Centre Urquinaona, Plaça Urquinaona 10, Barcelona · Saturday 12 December 2026 (submitted; acceptance por confirmar con Juan)
**Slot:** por confirmar con Juan; the deck runs about 40 minutes
**Before:** prepared for X-Ops Conference Madrid 2026 (21 November 2026), cancelled by the organisers
**Speaker:** Juan G. Carmona, Software Development Engineer at Plain Concepts
**Language:** English

## The idea in one sentence

> **[proposal]** A product decision should live once, with a stable ID, and everything downstream should cite it by digest; then drift stops being silent, because a pipeline can say which consumers still describe a decision that has changed.

Sources: the problem and the promise are in the Sessionize abstract ("A product decision changes, while the delivery specifications, security requirements, test cases, and agent instructions built around its previous version remain unchanged."; "cite them instead of restating or reinterpreting them"). The mechanism (ID, content digest, `citations verify`) is in the ProductShape README and `docs/methodology/overview.md`.

## What the audience takes home

1. **Intent and architecture are two sources of truth.** They are related and must never be confused. Product decisions live once, in one place; architecture cites them and never copies them.
   *Sources: Juan, 2026-11-03; ArcShape `BR-PRODUCT-DEFINITION-AUTHORITY`; Lighthouse README ("ProductShape owns product intent, ArcShape owns architecture evidence and Lighthouse owns the delivery baseline.").*

2. **Cite, don't restate.** A citation carries the artifact ID and a digest of its content. When the decision changes, every citation to it turns `stale`, and CI can fail on it.
   *Sources: ProductShape README (release contract, `PRODUCT061`); overview.md (citation contract).*

3. **Tools check structure, people decide meaning.** Validation and citation status are deterministic. Contradictions inside the definition are still a human review problem.
   *Sources: ProductShape README ("Deterministic tools check structure and references, never truth; people decide what is true and what should change."); limitations.md; I Tried to Prove PDaC Wrong.*

## Scope guard

| Abstract promise | Where |
| --- | --- |
| Traceability problem that grows as products evolve | `origin`, `noise` |
| PDaC: versioned, connected decisions, cited instead of restated; less repeated SDD prose | `two-truths`, `artifacts`, `cite` |
| One rule into a spec, security/quality requirements and CI checks | `cite` |
| Change the rule; find consumers relying on stale context | `drift` |
| What is mechanical, what agents surface, where human judgement stays | `change`, `limits` |
| Faster delivery without drift or security gaps reaching production | `limits`, `url` |

Dropped on purpose, with Juan's agreement: GitHub Copilot instructions (from the abstract), DomusMind, and everything from Ingeniería del Software 2.0 that is not about product definition and citations.
