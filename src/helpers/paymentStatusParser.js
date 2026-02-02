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
