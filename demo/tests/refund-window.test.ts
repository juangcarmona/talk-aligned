// BR-REFUND-001, through the refunds API. The citation lives in refund-window.citations.yml.
import { expect, test } from '@playwright/test'

const refund = (deliveredOn: string, requestedOn: string) =>
  ({ data: { orderId: 'ORD-1001', deliveredOn, requestedOn } })

test('a refund on the last day of the window is accepted', async ({ request }) => {
  const response = await request.post('/api/refunds', refund('2026-03-01', '2026-03-31'))
  expect(response.status()).toBe(201)
})

test('a refund one day late is rejected', async ({ request }) => {
  const response = await request.post('/api/refunds', refund('2026-03-01', '2026-04-01'))
  expect(response.status()).toBe(422)
})
