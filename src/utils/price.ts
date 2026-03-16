const formatPrice = (amount: number): string => {
  if (!amount) return '0';
  return `${parseFloat(String(amount))
    .toString()
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}`;
};

const round = (val: number): number => {
  if (val < 10000) return val;
  const len = `${val}`.length - 2;
  const zeros = `0`.repeat(len);
  const factor = Number(`1${zeros}`);
  return Math.round(val / factor) * factor;
};

export { formatPrice, round };
