import { onMounted, ref } from 'vue';

const DEFAULT_KZT_USD = 0.002;

enum Currency {
  usd = '$',
  kzt = '₸',
}

async function fetchKZTtoUSD() {
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

export function useKZTtoUSD() {
  const kztToUSD = ref(DEFAULT_KZT_USD);

  const convertCurrency = (
    val: number,
    currency: Currency = Currency.usd
  ): number => {
    if (currency === Currency.usd) {
      val = val / kztToUSD.value;
    } else {
      val = val * kztToUSD.value;
    }
    return Math.floor(val);
  };

  onMounted(() => {
    fetchKZTtoUSD().then(res => (kztToUSD.value = res));
  });

  return { kztToUSD, convertCurrency, Currency };
}
