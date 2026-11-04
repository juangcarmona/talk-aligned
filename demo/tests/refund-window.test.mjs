// SB-REFUND-001 and SB-REFUND-002. The citation lives in refund-window.citations.yml.
import { strictEqual } from 'node:assert'
import { test } from 'node:test'
import { refundAccepted } from '../src/refunds.mjs'

test('a refund on the last day of the window is accepted', () => {
  strictEqual(refundAccepted(new Date('2026-03-01'), new Date('2026-03-31')), true)
})

test('a refund one day late is rejected', () => {
  strictEqual(refundAccepted(new Date('2026-03-01'), new Date('2026-04-01')), false)
})
