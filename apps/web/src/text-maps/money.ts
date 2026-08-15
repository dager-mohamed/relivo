/**
 * Money is stored in minor units (see companies.funding / deals.value), so
 * every display path divides by 100 exactly once — here.
 */
export function formatMoney(minorUnits: number): string {
  const major = minorUnits / 100;

  if (major >= 1_000_000) return `$${trim(major / 1_000_000)}M`;
  if (major >= 1_000) return `$${trim(major / 1_000)}K`;
  return `$${major.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

// PRODUCT.md abbreviates to one decimal, but "$125.0K" reads worse than "$125K".
function trim(value: number): string {
  return value.toFixed(1).replace(/\.0$/, "");
}
