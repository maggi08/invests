export const DEFAULT_KZT_USD = 0.002;

export async function fetchKZTtoUSD() {
  try {
    const request = await fetch(
      'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/kzt.json'
    );
    const response = await request.json();
    return response.kzt.usd;
  } catch (err) {
    return DEFAULT_KZT_USD;
  }
}
