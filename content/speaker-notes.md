# Speaker notes

Draft for Juan to rewrite in his own words. The presenter window reads this file: one `##` heading per scene ID, and `[click]` marks a step. Facts come from the sources listed in `outline.md`.

## title

Hi, I'm Juan, Software Development Engineer at Plain Concepts. In the next forty minutes you'll see one product rule, the files that cite it, and the moment CI notices it changed.

## origin

This didn't start as a theory. We'd been doing Spec-Driven Development for a while at Plain Concepts, internal projects and for clients I can't name. And intuitively we knew it wasn't enough to define what we wanted again in every SDD cycle. [click] Because we kept seeing drift: what the AI thought we wanted versus what we actually wanted. Every iteration meant restructuring. Rework, again and again. [click] So when a client asked us for a real proof of concept, we said: let's do it right. Solid architecture foundations, and define the MVP as early as possible. Yes, agile, all of that. But what do we actually know about the product we want to build? [click] We wrote it down. With what plain Markdown gives you: simple files, a folder structure. And with what product engineering gives you: actors, use cases, business rules. Plus a domain definition, Domain-Driven Design. [click] Look at what that changes. This is a Clean Architecture with CQRS, only the layers: API, application split into commands and queries, domain, infrastructure. On the left, before: SDD alone. Grey is what we expected from this delivery. Colour is what got delivered. They don't match, and the delivery is spread across every layer. [click] Second delivery. The expectations have moved. The delivery touches every layer again, and look at the first one: most of its pieces moved too. [click] Third. Every delivery changes a lot of things, and each change is bigger than the last. A jumble. [click] On the right, after. Intent is defined and architecture is defined. In grey, the product we want, in slices. Each slice is narrow: a bit of API, one side of CQRS, some domain, some infrastructure. [click] First slice. Boom: the pieces land almost where they were. [click] Second. Nothing from before moves. [click] Third. And our clients' products started drifting much less, and moving much faster. Because every SDD change was iterative and incremental: SDD now delivered one slice of a product we had already defined. The fourth is still grey: we already know what comes next.

## noise

Here's the noise in five seconds. Three specs, three wordings, two meanings: thirty days from purchase is not thirty days from delivery. [click] A real public case: Shillinq, an open source accounting suite. 160 OpenSpec specs, 273 archived changes. Serious SDD. And the official VAT spec forbids a service and, 380 lines further down the same file, requires it. Both MUST. It shipped two models of the same tax form, the wrong schema at runtime, and a security hole. I told the maintainers; nobody answered. [click] An issue is a photo of one moment. Specs that nobody consolidates keep piling up those photos. There are sync mechanisms, but the context grows past what the AI can manage. And validation checks shape, not meaning.

## two-truths

So the first decision: two sources of truth. Intent, what we want to build, in docs/product. Architecture, how we build it, in docs/architecture. They're related, they cite each other, but you never mix them. [click] In my own tools it's written down: ProductShape owns product intent, ArcShape owns architecture evidence, Lighthouse owns the delivery baseline.

## artifacts

Intent is not one big document. It's small artifacts, each with a stable ID: actors, journeys, use cases, business rules, terms, bounded contexts, functional and quality requirements, constraints, and structured behaviour. Each relationship is written once, on one artifact; the graph is compiled. [click] Here's a real one from ArcShape. Its only business rule says that ArcShape must cite the approved product definition and never copy it. The architecture tool, defined by a rule that says architecture doesn't own product truth.

## cite

Now the core idea. The rule lives once. [click] Everyone who depends on it cites it: the constraints section, the cross-cutting concepts, an implementation backlog. [click] A citation is one line: the ID and a SHA-256 of the canonical content. [click] ArcShape has 370 of these in 55 files. Nobody restates the rule; they point at it.

## drift

Watch what happens when it changes. This is ProductShape's release contract, the exact block CI runs on every release. One rule, one citation. [click] The window goes from 30 to 14 days. [click] Verify again: stale, PRODUCT061, exit code 1. The job fails. Drift is detected instead of silent. [click] Four states: current, stale, tampered when an embedded copy was edited, unresolved when the ID doesn't exist. By default stale is a warning; the repository decides to make it an error.

## change

And how does a decision change, then? Through a Product Change: a file with the delta and its reason. The tool validates it as an overlay without touching the baseline. A person approves. Apply writes it; it creates no commits. Then a normal PR, CI, and a person merges. [click] Apply is not acceptance; the merge is. [click] Tools check structure. AI skills draft and interpret impact. People approve and merge. No tool approves or merges, ever.

## dogfooding

Does it work? ProductShape defines itself with its own method: first commit on 25 July, the same day I published the article, and it's on 0.22.1 now. ArcShape was defined with it from its first baseline, CHG-INITIAL. Lighthouse too. [click] And I know of people already using the methodology, at least conceptually, and some with the verification mechanisms in their own projects.

## limits

Honest part. Structural impact is not semantic impact. If two accepted artifacts contradict each other, both validate; PDaC puts them in one graph where a reviewer can see them, which is better than 380 lines apart, but it's not a guarantee. [click] And it's not finished. How it fits SDD flows and agentic workflows is still being defined.

## url

Everything is here, sources included. Questions.
