export const formatSalary = (min: number, max: number) => {
  const formatAmount = (value: number) => `$${Math.round(value / 1000)}k`;
  return `${formatAmount(min)} - ${formatAmount(max)} / year`;
};
