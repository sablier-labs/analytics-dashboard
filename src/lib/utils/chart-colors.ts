/**
 * Brand-based color palette for pie charts
 * Based on Sablier's primary orange brand color with variations
 */
const BRAND_COLORS = [
  "#FF5001", // Primary brand orange
  "#ea580c", // Orange 600
  "#fb923c", // Orange 400
  "#fdba74", // Orange 300
  "#fed7aa", // Orange 200
  "#c2410c", // Orange 700
  "#9a3412", // Orange 800
  "#f97316", // Orange 500 variant
  "#ff6b35", // Orange variant
  "#ff8566", // Orange tint
  "#ff9f80", // Orange light
  "#ffb399", // Orange lighter
  "#ffc7b3", // Orange lightest
  "#e55100", // Deep orange
  "#ff7043", // Orange accent
  "#ff8a65", // Orange light accent
  "#ffab91", // Orange very light
  "#ffccbc", // Orange pale
  "#d84315", // Red orange
  "#ff5722", // Deep orange material
  "#ff6f00", // Amber orange
  "#ff8f00", // Amber
  "#ffa000", // Amber dark
  "#ffb300", // Amber darker
  "#ffc107", // Amber yellow
] as const;

/**
 * Generate brand-based colors for pie chart data
 * Cycles through the brand color palette based on data length
 */
export function generateChainColors(dataLength: number): string[] {
  return Array.from(
    { length: dataLength },
    (_, index) => BRAND_COLORS[index % BRAND_COLORS.length],
  );
}
