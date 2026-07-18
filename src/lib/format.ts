/** format.ts — tiny display formatters. Money lives in euro cents everywhere; render it here. */

export function euros(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}
