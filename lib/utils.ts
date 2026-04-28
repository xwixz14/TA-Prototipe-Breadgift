/**
 * Formats a number with Indonesian thousand separators (dots).
 */
export const formatNumber = (value: number | string): string => {
  if (value === "") return "";
  if (value === 0 || value === "0") return "0";
  const num = typeof value === "string" ? parseInt(value.replace(/\D/g, "")) : value;
  if (isNaN(num)) return "";
  return num.toLocaleString("id-ID");
};

/**
 * Parses a numeric string by removing all non-digits.
 */
export const parseRawNumber = (value: string): number => {
  const rawValue = value.replace(/\D/g, "");
  return rawValue === "" ? 0 : parseInt(rawValue);
};

/**
 * Limits a value to a maximum amount.
 */
export const limitValue = (value: number, max: number): number => {
  return Math.min(value, max);
};

export const MAX_LIMIT_CURRENCY = 100000000; // Rp 100.000.000
export const MAX_LIMIT_STOCK = 1000000;   // 1.000.000
