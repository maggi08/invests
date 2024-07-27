export const formatPrice = (amount: number): string => {
  if (!amount) return '0';
  return `${parseFloat(String(amount))
    .toString()
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}`;
};
