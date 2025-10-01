/**
 * Format amount in KZT currency
 * @param amount - Amount in tenge
 * @returns Formatted string with ₸ symbol and thousands separators
 */
export function formatCurrencyKZT(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'KZT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace('KZT', '₸');
}

/**
 * Parse KZT string to number
 * @param value - String like "1 000 ₸" or "1000"
 * @returns Numeric value
 */
export function parseCurrencyKZT(value: string): number {
  const cleaned = value.replace(/[^\d]/g, '');
  return parseInt(cleaned, 10) || 0;
}
