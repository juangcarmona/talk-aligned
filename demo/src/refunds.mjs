// Refund window, from BR-REFUND-001. The citation lives in refunds.citations.yml.
const DAY = 24 * 60 * 60 * 1000
export const REFUND_WINDOW_DAYS = 30

export function refundAccepted(deliveredAt, requestedAt) {
  return requestedAt.getTime() - deliveredAt.getTime() <= REFUND_WINDOW_DAYS * DAY
}
