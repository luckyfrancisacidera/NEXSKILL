const phpCurrencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
});

export const formatPhpCurrency = (amount: number) => phpCurrencyFormatter.format(amount);

export const formatOfferCompensation = (amount: number, normalizedUnit?: string | null) => {
  const suffix = normalizedUnit === 'month' ? ' / month' : ' / year';
  return `${formatPhpCurrency(amount)}${suffix}`;
};
