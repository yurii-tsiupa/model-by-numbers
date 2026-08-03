export function safePdfNumber(
  value: number,
  fallback: number,
  options: { min?: number; max?: number } = {},
): number {
  const safeFallback = Number.isFinite(fallback) ? fallback : 0;
  const finiteValue = Number.isFinite(value) ? value : safeFallback;
  const min = Number.isFinite(options.min) ? options.min! : -Number.MAX_SAFE_INTEGER;
  const max = Number.isFinite(options.max) ? options.max! : Number.MAX_SAFE_INTEGER;
  return Math.min(max, Math.max(min, finiteValue));
}
