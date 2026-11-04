---
id: SB-CANCEL-001
type: structured-behaviour
title: Cancel after dispatch
status: active
illustrates:
  - BR-CANCEL-001
given:
  - An order has been dispatched
when: The customer tries to cancel it
then:
  - The cancellation is refused
  - The customer is offered the refund path
uses-terms:
  - TERM-ORDER
---
## Intent

Dispatch closes cancellation.

## Boundaries

None.
