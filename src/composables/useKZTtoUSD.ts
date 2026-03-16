import { onMounted, ref } from 'vue'
import type { Ref } from 'vue'
import { fetchKZTtoUSD, DEFAULT_KZT_USD } from '@/utils/fetch-kzt'

export enum CURRENCY {
  usd = '$',
  kzt = '₸',
}

export function useKZTtoUSD(): {
  kztToUSD: Ref<number>
  convertCurrency: (val: number, to: CURRENCY) => number
  CURRENCY: typeof CURRENCY
} {
  const kztToUSD = ref<number>(DEFAULT_KZT_USD)

  const convertCurrency = (val: number, to: CURRENCY): number => {
    if (to === CURRENCY.kzt) {
      return Math.floor(val / kztToUSD.value)
    }
    return Math.floor(val * kztToUSD.value)
  }

  onMounted(() => {
    fetchKZTtoUSD().then((res) => (kztToUSD.value = res))
  })

  return { kztToUSD, convertCurrency, CURRENCY }
}
