/**
 * Format large numbers with dots as thousands separator (Croatian convention).
 * Example: 3871833 → "3.871.833"
 */
export function formatNumber(num) {
  return num.toLocaleString('hr-HR');
}

/**
 * Format percentage with sign.
 * Example: -9.63 → "-9,63%"
 */
export function formatPercent(value) {
  const formatted = value.toLocaleString('hr-HR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });
  return value > 0 ? `+${formatted}%` : `${formatted}%`;
}

/**
 * Format a ratio value for display.
 * Example: 1.18 → "1,18 : 1"
 */
export function formatRatio(value) {
  const formatted = value.toLocaleString('hr-HR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} : 1`;
}
