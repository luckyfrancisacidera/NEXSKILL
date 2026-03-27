export const CURRENCY_SYMBOL_MAP: Record<string, string> = {
  USD: "$",
  US: "$",
  PHP: "\u20B1",
  EUR: "\u20AC",
  GBP: "\u00A3",
  JPY: "\u00A5",
  CAD: "C$",
  AUD: "A$",
  SGD: "S$",
  INR: "\u20B9",
};

export const getCurrencySymbol = (currencyCode?: string) => {
  const code = currencyCode?.trim().toUpperCase();
  if (!code) return "$";
  return CURRENCY_SYMBOL_MAP[code] ?? `${code} `;
};

export const formatCurrencyAmount = (amount?: number, currencyCode?: string) => {
  if (!amount) return "Not specified";
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(amount)}`;
};
