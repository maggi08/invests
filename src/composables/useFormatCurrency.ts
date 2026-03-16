import type { Ref } from 'vue'

export function useFormatCurrency(currency: Ref<string>): {
  fmt: (v: number) => string
  fmtAxis: (v: number) => string
} {
  function fmt(v: number): string {
    const sym = currency.value
    if (v >= 1e9) return `${sym}${(v / 1e9).toFixed(2)}B`
    if (v >= 1e6) return `${sym}${(v / 1e6).toFixed(2)}M`
    if (v >= 1e3) return `${sym}${Math.round(v / 1000)}k`
    return `${sym}${Math.round(v).toLocaleString()}`
  }

  function fmtAxis(v: number): string {
    const sym = currency.value
    if (v >= 1e9) return `${sym}${(v / 1e9).toFixed(1)}B`
    if (v >= 1e6) return `${sym}${(v / 1e6).toFixed(1)}M`
    if (v >= 1e3) return `${sym}${Math.round(v / 1000)}k`
    return `${sym}${v}`
  }

  return { fmt, fmtAxis }
}
