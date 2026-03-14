<template>
  <div class="sc">
    <!-- Controls -->
    <div class="sc__controls">
      <div class="sc__field" v-for="field in fields" :key="field.id">
        <label class="sc__label">{{ field.label }}</label>
        <input
          class="sc__input"
          type="number"
          :value="field.model.value"
          @input="field.model.value = +($event.target as HTMLInputElement).value"
        />
      </div>

      <div class="sc__field">
        <label class="sc__label">Currency</label>
        <div class="sc__currency-row">
          <button
            v-for="cur in currencyOptions"
            :key="cur.value"
            class="sc__cur-btn"
            :class="{ 'sc__cur-btn--active': currency === cur.value }"
            @click="setCurrency(cur.value)"
          >
            {{ cur.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Summary metrics -->
    <div class="sc__metrics">
      <div class="sc__metric" v-for="m in summaryMetrics" :key="m.label">
        <div class="sc__metric-label">{{ m.label }}</div>
        <div class="sc__metric-value">{{ m.value }}</div>
      </div>
    </div>

    <!-- Tables -->
    <div class="sc__tables">
      <div class="sc__table-wrap">
        <div class="sc__table-title">Salary growth · {{ salaryGrowthPercent }}% / yr</div>
        <div class="sc__table">
          <div class="sc__row sc__row--head">
            <span>#</span><span>Year</span><span>Salary</span><span>After growth</span>
          </div>
          <div class="sc__row" v-for="row in calculations.salaryRows" :key="row.idx">
            <span class="sc__num">{{ row.idx }}</span>
            <span class="sc__year">{{ row.year }}</span>
            <span>{{ formatPrice(row.salary) }} {{ currency }}</span>
            <span class="sc__highlight">{{ formatPrice(row.after) }} {{ currency }}</span>
          </div>
        </div>
      </div>

      <div class="sc__table-wrap">
        <div class="sc__table-title">Investments · {{ investPercent }}% of salary</div>
        <div class="sc__table">
          <div class="sc__row sc__row--head">
            <span>#</span><span>Year</span><span>Contributed</span><span>Portfolio</span>
          </div>
          <div class="sc__row" v-for="row in calculations.investRows" :key="row.idx">
            <span class="sc__num">{{ row.idx }}</span>
            <span class="sc__year">{{ row.year }}</span>
            <span>+{{ formatPrice(row.contrib) }} {{ currency }}</span>
            <span class="sc__highlight">{{ formatPrice(row.portfolio) }} {{ currency }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { formatPrice, round } from '../utils/price'
import { useKZTtoUSD } from '../utils/useKZTtoUSD'

const { convertCurrency, CURRENCY } = useKZTtoUSD()

const salary             = ref(1000000)
const years              = ref(15)
const salaryGrowthPercent = ref(50)
const investGrowthPercent = ref(25)
const investPercent      = ref(10)
const startYear          = ref(2025)
const currency           = ref(CURRENCY.kzt)

const currencyOptions = [
  { label: '$ USD', value: CURRENCY.usd },
  { label: '₸ KZT', value: CURRENCY.kzt },
]

function setCurrency(val: string) {
  salary.value = convertCurrency(salary.value, val)
  currency.value = val
}

const reverseCurrency = computed(() =>
  currency.value === CURRENCY.usd ? CURRENCY.kzt : CURRENCY.usd
)

const fields = computed(() => [
  { id: 'salary',    label: 'Monthly salary',         model: salary },
  { id: 'years',     label: 'Years',                  model: years },
  { id: 'sg',        label: 'Salary growth %',        model: salaryGrowthPercent },
  { id: 'ig',        label: 'Investment return %',    model: investGrowthPercent },
  { id: 'ip',        label: '% of salary to invest',  model: investPercent },
  { id: 'sy',        label: 'Start year',             model: startYear },
])

const summaryMetrics = computed(() => [
  {
    label: 'Monthly salary',
    value: `${formatPrice(Math.floor(salary.value))} ${currency.value}`,
  },
  {
    label: 'Monthly (converted)',
    value: `${formatPrice(convertCurrency(salary.value, reverseCurrency.value))} ${reverseCurrency.value}`,
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

const calculations = computed(() => {
  const salaryRows: { idx: number; year: number; salary: number; after: number }[] = []
  const investRows: { idx: number; year: number; contrib: number; portfolio: number }[] = []

  let currentSalary = salary.value
  let investedSum   = 0
  const sg = salaryGrowthPercent.value / 100 + 1
  const ig = investGrowthPercent.value / 100 + 1

  for (let i = 0; i < years.value; i++) {
    const year       = startYear.value + i
    const afterSalary = Math.floor(currentSalary * sg)
    const contrib    = Math.floor((currentSalary * investPercent.value) / 100 * 12)
    const portfolio  = Math.floor((investedSum + contrib) * ig)

    salaryRows.push({ idx: i + 1, year, salary: Math.floor(currentSalary), after: afterSalary })
    investRows.push({ idx: i + 1, year, contrib, portfolio })

    currentSalary = afterSalary
    investedSum   = portfolio
  }

  return { salaryRows, investRows }
})
</script>

<style scoped>
.sc {
  font-family: 'DM Sans', system-ui, sans-serif;
  color: #e2e8f0;
  padding: 1.75rem;
  background: #0f172a;
  border-radius: 20px;
  border: 1px solid #1e293b;
  max-width: 900px;
}

/* ── Controls ── */
.sc__controls {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem 1.5rem;
  margin-bottom: 1.5rem;
}

@media (max-width: 700px) {
  .sc__controls {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 460px) {
  .sc__controls {
    grid-template-columns: 1fr;
  }
}

.sc__label {
  display: block;
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.sc__input {
  width: 100%;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  color: #f1f5f9;
  font-size: 14px;
  font-family: inherit;
  padding: 8px 10px;
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
}

.sc__input:focus {
  border-color: #16a37f;
}

/* ── Currency buttons ── */
.sc__currency-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.sc__cur-btn {
  font-size: 12px;
  font-family: inherit;
  padding: 7px 14px;
  border: 1px solid #1e293b;
  border-radius: 8px;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
}

.sc__cur-btn:hover {
  border-color: #334155;
  color: #cbd5e1;
}

.sc__cur-btn--active {
  background: rgba(22, 163, 127, 0.12);
  color: #34d399;
  border-color: #16a37f;
  font-weight: 600;
}

/* ── Metrics ── */
.sc__metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 1.5rem;
}

@media (max-width: 600px) {
  .sc__metrics {
    grid-template-columns: repeat(2, 1fr);
  }
}

.sc__metric {
  background: #1e293b;
  border-radius: 10px;
  padding: 12px 14px;
}

.sc__metric-label {
  font-size: 11px;
  color: #475569;
  margin-bottom: 4px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.sc__metric-value {
  font-size: 15px;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: -0.02em;
}

/* ── Tables ── */
.sc__tables {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

@media (max-width: 640px) {
  .sc__tables {
    grid-template-columns: 1fr;
  }
}

.sc__table-wrap {
  background: #1e293b;
  border-radius: 12px;
  overflow: hidden;
}

.sc__table-title {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 10px 14px;
  border-bottom: 1px solid #0f172a;
}

.sc__table {
  overflow-y: auto;
  max-height: 340px;
}

.sc__row {
  display: grid;
  grid-template-columns: 28px 52px 1fr 1fr;
  gap: 4px;
  padding: 7px 14px;
  font-size: 12.5px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.6);
  align-items: center;
}

.sc__row:last-child {
  border-bottom: none;
}

.sc__row--head {
  font-size: 11px;
  color: #475569;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: rgba(15, 23, 42, 0.4);
  position: sticky;
  top: 0;
}

.sc__num {
  color: #334155;
  font-size: 11px;
}

.sc__year {
  color: #64748b;
}

.sc__highlight {
  color: #34d399;
  font-weight: 600;
}
</style>
