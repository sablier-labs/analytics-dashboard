export function formatNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toLocaleString();
}

export function formatCurrency(value: number): string {
  const formatted = formatNumber(value);
  return `$${formatted}`;
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatMonth(monthString: string): string {
  const date = new Date(`${monthString}-01`);
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}
