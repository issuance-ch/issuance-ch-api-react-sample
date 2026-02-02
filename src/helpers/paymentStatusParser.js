/**
 * @file Payment status parser helper.
 * Converts raw payment status strings into human-readable labels
 * and provides associated badge colors for display.
 */

/**
 * Parse a raw payment status string into a display label.
 * @param {string} statusRaw - The raw payment status (e.g. "status.received").
 * @returns {string} The human-readable label.
 */
export function parsePaymentStatusLabel(statusRaw) {
  switch (statusRaw) {
    case 'status.to_be_checked':
      return 'Not paid yet';
    case 'status.announced':
      return 'Payment announced';
    case 'status.received':
      return 'Payment received';
    case 'status.cleared':
      return 'Payment cleared';
    case 'status.reconciled':
      return 'Payment reconciled';
    default:
      return statusRaw ? statusRaw.replace('status.', '').replace(/_/g, ' ') : 'Unknown';
  }
}

/**
 * Get the Bootstrap badge color for a given payment status.
 * @param {string} statusRaw - The raw payment status.
 * @returns {string} The Bootstrap color name (e.g. "success", "warning").
 */
export function parsePaymentStatusColor(statusRaw) {
  switch (statusRaw) {
    case 'status.received':
    case 'status.cleared':
    case 'status.reconciled':
      return 'success';
    case 'status.announced':
      return 'warning';
    case 'status.to_be_checked':
      return 'danger';
    default:
      return 'secondary';
  }
}

/**
 * Check if a single payment status indicates the user has at least announced the payment.
 * @param {string} statusRaw - The raw payment status.
 * @returns {boolean}
 */
export function isPaymentFilled(statusRaw) {
  return statusRaw === 'status.announced'
    || statusRaw === 'status.received'
    || statusRaw === 'status.cleared'
    || statusRaw === 'status.reconciled';
}

/**
 * Check if a single payment status indicates the payment has been confirmed by the team.
 * @param {string} statusRaw - The raw payment status.
 * @returns {boolean}
 */
export function isPaymentConfirmed(statusRaw) {
  return statusRaw === 'status.received'
    || statusRaw === 'status.cleared'
    || statusRaw === 'status.reconciled';
}

/**
 * Check if all payments in an array are at least announced.
 * @param {Array<{payment_status: string}>} payments - The payment status array.
 * @returns {boolean}
 */
export function areAllPaymentsFilled(payments) {
  return Array.isArray(payments)
    && payments.length > 0
    && payments.every(p => isPaymentFilled(p.payment_status));
}

/**
 * Check if all payments in an array are confirmed (received/cleared/reconciled).
 * @param {Array<{payment_status: string}>} payments - The payment status array.
 * @returns {boolean}
 */
export function areAllPaymentsConfirmed(payments) {
  return Array.isArray(payments)
    && payments.length > 0
    && payments.every(p => isPaymentConfirmed(p.payment_status));
}

/**
 * Parse a payment status into an object with label and color.
 * @param {string} statusRaw - The raw payment status.
 * @returns {{ label: string, color: string }} The parsed status object.
 */
export default function paymentStatusParser(statusRaw) {
  return {
    label: parsePaymentStatusLabel(statusRaw),
    color: parsePaymentStatusColor(statusRaw),
  };
}
