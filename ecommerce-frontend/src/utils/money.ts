export function formatMoney(paise: number) {
  return `₹${(paise / 100).toFixed(2)}`;
}