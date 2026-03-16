<template>
  <div :class="$style.sc">
    <!-- Controls -->
    <div :class="$style.scControls">
      <AppInput
        v-for="field in fields"
        :key="field.id"
        :label="field.label"
        type="number"
        :model-value="field.model.value"
        @update:model-value="field.model.value = Number($event)"
      />

      <div :class="$style.scField">
        <label :class="$style.scLabel">Currency</label>
        <CurrencyToggle
          :model-value="currency"
          :options="currencyOptions"
          @update:model-value="setCurrency"
        />
      </div>
    </div>

    <!-- Summary metrics -->
    <div :class="$style.scMetrics">
      <MetricCard
        v-for="m in summaryMetrics"
        :key="m.label"
        :label="m.label"
        :value="m.value"
      />
    </div>

    <!-- Tables -->
    <div :class="$style.scTables">
      <div :class="$style.scTableWrap">
        <div :class="$style.scTableTitle">Salary growth · {{ salaryGrowthPercent }}% / yr</div>
        <div :class="$style.scTable">
          <div :class="[$style.scRow, $style.scRowHead]">
            <span>#</span><span>Year</span><span>Salary</span><span>After growth</span>
          </div>
          <div v-for="row in calculations.salaryRows" :key="row.idx" :class="$style.scRow">
            <span :class="$style.scNum">{{ row.idx }}</span>
            <span :class="$style.scYear">{{ row.year }}</span>
            <span>{{ formatPrice(row.salary) }} {{ currency }}</span>
            <span :class="$style.scHighlight">{{ formatPrice(row.after) }} {{ currency }}</span>
          </div>
        </div>
      </div>

      <div :class="$style.scTableWrap">
        <div :class="$style.scTableTitle">Investments · {{ investPercent }}% of salary</div>
        <div :class="$style.scTable">
          <div :class="[$style.scRow, $style.scRowHead]">
            <span>#</span><span>Year</span><span>Contributed</span><span>Portfolio</span>
          </div>
          <div v-for="row in calculations.investRows" :key="row.idx" :class="$style.scRow">
            <span :class="$style.scNum">{{ row.idx }}</span>
            <span :class="$style.scYear">{{ row.year }}</span>
            <span>+{{ formatPrice(row.contrib) }} {{ currency }}</span>
            <span :class="$style.scHighlight">{{ formatPrice(row.portfolio) }} {{ currency }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { formatPrice } from '@/utils/price'
import { useKZTtoUSD, CURRENCY } from '@/composables/useKZTtoUSD'
import type { CurrencyOption } from '@/types/portfolio'
import AppInput from './AppInput.vue'
import MetricCard from './MetricCard.vue'
import CurrencyToggle from './CurrencyToggle.vue'

interface SalaryRow {
  idx: number
  year: number
  salary: number
  after: number
}

interface InvestRow {
  idx: number
  year: number
  contrib: number
  portfolio: number
}

const { convertCurrency } = useKZTtoUSD()

const salary = ref<number>(1000000)
const years = ref<number>(15)
const salaryGrowthPercent = ref<number>(50)
const investGrowthPercent = ref<number>(25)
const investPercent = ref<number>(10)
const startYear = ref<number>(2025)
const currency = ref<string>(CURRENCY.kzt)

const currencyOptions: CurrencyOption[] = [
  { sym: CURRENCY.usd, label: '$ USD' },
  { sym: CURRENCY.kzt, label: '₸ KZT' },
]

function setCurrency(val: string): void {
  salary.value = convertCurrency(salary.value, val === CURRENCY.usd ? CURRENCY.usd : CURRENCY.kzt)
  currency.value = val
}

const fields = computed(() => [
  { id: 'salary', label: 'Monthly salary', model: salary },
  { id: 'years', label: 'Years', model: years },
  { id: 'sg', label: 'Salary growth %', model: salaryGrowthPercent },
  { id: 'ig', label: 'Investment return %', model: investGrowthPercent },
  { id: 'ip', label: '% of salary to invest', model: investPercent },
  { id: 'sy', label: 'Start year', model: startYear },
])

const reverseCurrency = computed(() =>
  currency.value === CURRENCY.usd ? CURRENCY.kzt : CURRENCY.usd,
)

const summaryMetrics = computed(() => [
  {
    label: 'Monthly salary',
    value: `${formatPrice(Math.floor(salary.value))} ${currency.value}`,
  },
  {
    label: 'Monthly (converted)',
    value: `${formatPrice(convertCurrency(salary.value, reverseCurrency.value === CURRENCY.usd ? CURRENCY.usd : CURRENCY.kzt))} ${reverseCurrency.value}`,
  },
  {
    label: 'Yearly salary',
    value: `${formatPrice(Math.floor(salary.value * 12))} ${currency.value}`,
  },
  {
    label: 'Final year',
    value: String(startYear.value + years.value - 1),
  },
])

const calculations = computed<{ salaryRows: SalaryRow[]; investRows: InvestRow[] }>(() => {
  const salaryRows: SalaryRow[] = []
  const investRows: InvestRow[] = []

  let currentSalary = salary.value
  let investedSum = 0
  const sg = salaryGrowthPercent.value / 100 + 1
  const ig = investGrowthPercent.value / 100 + 1

  for (let i = 0; i < years.value; i++) {
    const year = startYear.value + i
    const afterSalary = Math.floor(currentSalary * sg)
    const contrib = Math.floor(((currentSalary * investPercent.value) / 100) * 12)
    const portfolio = Math.floor((investedSum + contrib) * ig)

    salaryRows.push({ idx: i + 1, year, salary: Math.floor(currentSalary), after: afterSalary })
    investRows.push({ idx: i + 1, year, contrib, portfolio })

    currentSalary = afterSalary
    investedSum = portfolio
  }

  return { salaryRows, investRows }
})
</script>

<style module>
.sc {
  @apply font-sans text-slate-200 p-7 bg-surface rounded-2xl border border-card max-w-[900px];
}

.scControls {
  @apply grid gap-4 mb-6;
  grid-template-columns: repeat(3, 1fr);
}

@media (max-width: 700px) {
  .scControls {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 460px) {
  .scControls {
    grid-template-columns: 1fr;
  }
}

.scField {
  @apply flex flex-col;
}

.scLabel {
  @apply block text-[12px] font-medium text-subtle uppercase tracking-[0.04em] mb-1.5;
}

.scMetrics {
  @apply grid gap-2.5 mb-6;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

@media (max-width: 600px) {
  .scMetrics {
    grid-template-columns: repeat(2, 1fr);
  }
}

.scTables {
  @apply grid gap-5;
  grid-template-columns: 1fr 1fr;
}

@media (max-width: 640px) {
  .scTables {
    grid-template-columns: 1fr;
  }
}

.scTableWrap {
  @apply bg-card rounded-xl overflow-hidden;
}

.scTableTitle {
  @apply text-[12px] font-semibold text-subtle uppercase tracking-[0.05em] px-3.5 py-2.5 border-b border-surface;
}

.scTable {
  @apply overflow-y-auto;
  max-height: 340px;
}

.scRow {
  @apply grid gap-1 px-3.5 py-1.5 text-[12.5px] border-b border-surface/60 items-center;
  grid-template-columns: 28px 52px 1fr 1fr;
}

.scRow:last-child {
  @apply border-b-0;
}

.scRowHead {
  @apply text-[11px] text-muted font-medium uppercase tracking-[0.04em] bg-surface/40 sticky top-0;
}

.scNum {
  @apply text-[11px] text-card-border;
}

.scYear {
  @apply text-subtle;
}

.scHighlight {
  @apply text-brand-light font-semibold;
}
</style>
