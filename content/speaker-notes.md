# Speaker notes

Draft for Juan to rewrite in his own words. The presenter window reads this file: one `##` heading per scene ID, and `[click]` marks a step. Facts come from the sources listed in `outline.md`.

## title

Hi, I'm Juan, Software Development Engineer at Plain Concepts. In the next forty minutes you'll see one product rule, the files that cite it, and the moment CI notices it changed.

## lifecycle

This is the software lifecycle, left to right: from an idea to maintenance. And this is where we are today: development. [click] This is where the AI investment is going: code assistants, test generators, review bots, CI copilots, incident analysers. Development, DevOps, operations. Your territory. Useful, and getting saturated. [click] As implementation gets automated, the bottleneck moves left. To the product: who is it for, which behaviour should exist, which rules govern it. That's where the next opportunity is.

## fragments

And on the left there's a jumble. Product decisions in Jira. Conversations in Slack or Teams. Long reasoning in docs, or in some Confluence page. Half of it in meetings nobody wrote down. The rest in code comments and in the heads of two senior engineers. AI doesn't have a product model. It has fragments. And it has to rebuild meaning from those fragments on every invocation, with no guarantee it rebuilds the same meaning twice.

## direction

Before the tools, a word about people and AI. A team without direction is a boat without a lighthouse: it builds at random. And vibe coding is exactly that: building at random, very fast. [click] With direction it's different. Every decision is still about today's problem, but it keeps the destination in sight, directly or indirectly. That's what a team that knows the product has: direction, a guide, a roadmap.

## noise

Spec-Driven Development was the answer to drift on the implementation side. Let's take one rule: the refund. One concept, one rule. And with many specs, what happens is that the same rule ends up written several ways. [click] Billing: refunds are issued for purchases made in the last 30 days. From the purchase. [click] Checkout: 30 days from delivery. [click] Support: less than a month. One concept, one rule, and three specs pointing three different ways. Each one was a snapshot of what someone wanted at that moment. [click] Now multiply. A hundred and sixty specs, each rebuilt and redefined in its own cycle, each leaving artifacts behind that nobody consolidates. Some point the opposite way. [click] This is a real case: Shillinq, an open-source accounting suite built with SDD. 160 OpenSpec specs, 273 archived changes. Its VAT spec forbids a service and, 380 lines further down in the same file, requires it. Both MUST. I told the maintainers and nobody answered. [click] And validation checks shape, not meaning.

## before

Now on the code itself. Every dot is a block of code tokens. On the left, the backlog. No product definition: this is what we have in our heads at the start, a cloud. [click] Ticket 101, add to cart. One SDD cycle. Something gets written, following our reading of the ticket. [click] Next tickets: check out and pay. Another cycle, a different reading, and almost everything moves again. The earlier ticket is reopened. It isn't only chaos: it's uncertainty. Ask the same thing twice and you get different code. [click] Three more tickets. Undo, redo, a small increment. [click] Here we threw three features away. They didn't fit what we now understood. [click] The last tickets. The shape begins to show, after five cycles rebuilding everything. [click] Indeterminism leads to drift, and drift leads to rework. A team that doesn't know the product only sees the ticket in front of it.

## not-truth

So the conclusion of this first part: the specs should not be our source of truth. Why? Because we've just seen how much noise they make. [click] An AI keeps defining and redefining: entities, business rules, the refund. And language models are inherently non-deterministic, so every redefinition comes out slightly different. Those small variations chain one onto the next, and that's drift. And if the AI already has in its context versions with divergent meanings, what comes out is chaos: divergence. [click] That's the problem with large spec sets. It isn't that a spec can't be a source of truth. It's that the more specs there are, the more chances divergence has to start. [click] The specs must feed from a source of truth.

## two-truths

So we put in a good source of truth. Two, in fact. As software engineers we know the architecture has to be sketched as early as possible, and then it evolves. The same goes for the product: sketch early what we want, an MVP to iterate on. The intent, what we build, in docs/product. The architecture, how we build it, in docs/architecture. Related, citing each other, never mixed up. [click] And SDD feeds from them: specs, agents and code read both. That is their source of truth.

## after

Now the same system with the product defined, and a backlog that starts with the architecture. The future can already be sensed: the outline is there, a bit blurred, before anything is written. [click] Ticket 101: authentication and authorization. It runs across every slice. [click] Cross-cutting concerns: logs, validation, error handling. [click] The domain model, domain-driven design: the language every slice will share. [click] And the infrastructure: data, CI/CD. These first tickets lay the foundations of a vertical slice architecture. [click] Now the slices, one by one. Add to cart and check out: each lands in its own vertical, on top of what's already there. [click] Pay and cancel. Nothing built earlier moves; every earlier ticket stays done. [click] Request a refund and approve it. It's paint by numbers. [click] Browse, search, track, history: done. [click] Direction gives us a guide, and the guide gets us to delivery.

## graph

This is a small demo shop I defined for this talk, compiled by ProductShape. First the actors: customer, support agent, payment service. [click] The journeys they follow. [click] The use cases: six commands and four queries. [click] The business rules and the domain: terms and bounded contexts. Here is our refund window. [click] And the requirements and behaviour, the Given/When/Then examples tests will come from. Every relationship is written once, on one artifact. I can move around it: this is the product, not a document about it.

## product-code

Zoom out. On the left, the product. On the right, its code: the vertical-slice system, one feature per use case. A use case is its feature. The customer touches the presentation of every feature they take part in. The refund window lives in the domain of two features. A constraint cuts across. When the product is a graph, you can see where every decision lands in the code.

## cite

Now the core idea, on the demo shop. The refund window lives once: BR-REFUND-001, 30 days from delivery. [click] Everything that depends on it cites it: the OpenSpec spec, the agent's skill, the code and the test. [click] Each citation is one line: pdac:cite, the ID and a SHA-256 digest of the rule's canonical content. In Markdown it's a comment; the code and the test cite through a small ledger beside them. [click] Four citations of the rule, four current. Nobody rewrites the rule; they all point at it.

## drift

Now let's change it. Same rule, same four citations, all current. Verify: six citations in the repository, all current, exit zero. [click] Finance wants 14 days. That's a Product Change, CHG-REFUND-002: it changes the rule and its two examples. The tool validates it as an overlay, a person approves it and apply writes it. Apply commits nothing: it tells you to open a pull request so a human can accept it. [click] Verify again. The digest no longer matches, so one by one they go stale: the spec, the agent skill, the code and the test, and the end-to-end scenarios too. PRODUCT061, exit 1. The job fails. Drift is caught instead of slipping through. [click] Four states: current; stale; tampered, when someone edits an embedded copy; and unresolved, when the ID doesn't exist.

## change

And how does a decision change, then? Through a Product Change: a file with the delta and its reason. The tool validates it as an overlay without touching the baseline. A person approves. Apply writes it; it creates no commits. Then a normal PR, CI, and a person merges. [click] Apply is not acceptance; the merge is. [click] Tools check structure. AI skills draft and interpret impact. People approve and merge. No tool approves or merges, ever.

## trust

Citations keep the documentation from drifting: specs, skills, code and tests point at the same rule, and CI knows when one falls behind. But that's the documentation. At a functional level: is what was built what had to be built? [click] In other words: can we trust AI? This is where tests come in. And the question is whether this adds reliability.

## tests

And this changes testing. Before, the classic pyramid: few end-to-end tests, because they were expensive to write and, above all, to keep. [click] Now, if product and architecture stay current and are our source of truth, an agent can generate the e2e from the scenarios and maintain them. The shape changes. Unit tests are still the base. [click] Let's step back to the refund, in the graph. The business rule changed: BR-REFUND-001 went from 30 to 14 days. Because it's a graph, I know which structured behaviours illustrate that rule: SB-REFUND-001, refund on the last day, and SB-REFUND-002, refund one day late. Both changed with it: the last day moves from March 31 to March 15, and the day late from April 1 to March 16. Both are stale, and so are the e2e tests that follow them. [hover the rule: both behaviours and all their tests light up; hover each behaviour: only its tests] SB-CANCEL-001 doesn't change: it illustrates another rule, and it stays current. And down here, the lifecycle: the product definition can, and should, go straight to validation. I don't have to look at every behaviour, or every e2e test. Only the ones the change reaches. [click] That's the chain: the product changes, the structured behaviour changes, the e2e tests it guides go stale, and because they're stale I know I have to change them. That lets us keep the e2e implementation maintained automatically, driven by AI, and directed by the product.

## closing

To close. Robert C. Martin, Uncle Bob, the author of Clean Code, said this in July: “My current strategy is to not read any of the code written by my agents.” It caused quite a stir. [click] So if we no longer read the code, what do we read? [click] The intent. The product and the architecture, our two sources of truth, and the tests that follow them. That's what we have to keep alive, cite and verify. [click] And honestly: tools check the shape. If two accepted artifacts contradict each other, both validate. Meaning is still our job.

## url

Everything is here, sources included. Questions.
