export const splitToBullets = (text?: string) =>
  (text ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

export const toList = (value: unknown) => {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => String(item).split(/\r?\n|,|•|·|;/))
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(/\r?\n|,|•|·|;/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};