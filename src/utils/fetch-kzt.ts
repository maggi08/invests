export const DEFAULT_KZT_USD = 0.002

const API_URL =
  'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/kzt.json'

export async function fetchKZTtoUSD(): Promise<number> {
  try {
    const request = await fetch(API_URL)
    const response = await request.json()
    return response.kzt.usd as number
  } catch {
    return DEFAULT_KZT_USD
  }
}
