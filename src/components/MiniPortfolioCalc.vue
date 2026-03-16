<template>
  <div :class="$style.mpc">
    <!-- Controls -->
    <div :class="$style.mpcControls">
      <div v-for="ctrl in controls" :key="ctrl.id" :class="$style.mpcControl">
        <div :class="$style.mpcControlHeader">
          <span :class="$style.mpcControlLabel">{{ ctrl.label }}</span>
          <span :class="$style.mpcControlValue">{{ ctrl.display }}</span>
        </div>
        <input
          v-model.number="ctrl.model.value"
          :class="$style.mpcSlider"
          type="range"
          :min="ctrl.min"
          :max="ctrl.max"
          :step="ctrl.step"
        />
      </div>

      <div :class="$style.mpcControl">
        <div :class="$style.mpcControlHeader">
          <span :class="$style.mpcControlLabel">Currency</span>
        </div>
        <CurrencyToggle v-model="currency" :options="currencies" />
      </div>
    </div>

    <!-- Metrics -->
    <div :class="$style.mpcMetrics">
      <MetricCard
        v-for="m in metrics"
        :key="m.label"
        :label="m.label"
        :value="m.value"
        :color="m.color"
      />
    </div>

    <!-- Chart -->
    <div :class="$style.mpcChartWrap">
      <canvas ref="chartCanvas"></canvas>
    </div>

    <!-- Legend -->
    <div :class="$style.mpcLegend">
      <span :class="$style.mpcLegendItem">
        <span :class="$style.mpcSwatch" style="background:#16a37f"></span>
        Portfolio value
      </span>
      <span :class="$style.mpcLegendItem">
        <span :class="$style.mpcSwatch" style="background:#94a3b8"></span>
        Total contributed
      </span>
      <span :class="$style.mpcLegendItem">
        <span :class="[$style.mpcSwatch, $style.mpcSwatchGains]"></span>
        Investment gains
      </span>
    </div>

    <!-- Milestones -->
    <div :class="$style.mpcMilestones">
      <span :class="$style.mpcMilestonesIcon">🏁</span>
      <span :class="$style.mpcMilestoneText">
        <template v-for="(ms, idx) in milestoneItems" :key="ms.target">
          <span :class="ms.reached ? $style.mpcMsReached : $style.mpcMsUnreached">
            {{ ms.label }}
            <template v-if="ms.reached"> — yr {{ ms.year }}</template>
            <template v-else> — beyond {{ years }} yrs</template>
          </span>
          <span v-if="idx < milestoneItems.length - 1" :class="$style.mpcMsDot"> · </span>
        </template>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ControlConfig, CurrencyOption } from '@/types/portfolio'
import { useFormatCurrency } from '@/composables/useFormatCurrency'
import { usePortfolioSimulation } from '@/composables/usePortfolioSimulation'
import { usePortfolioChart } from '@/composables/usePortfolioChart'
import MetricCard from './MetricCard.vue'
import CurrencyToggle from './CurrencyToggle.vue'

const salary = ref<number>(3000)
const savingsRate = ref<number>(10)
const salaryGrowth = ref<number>(20)
const invReturn = ref<number>(12)
const years = ref<number>(20)
const currency = ref<string>('$')

const currencies: CurrencyOption[] = [
  { sym: '$', label: '$ USD' },
  { sym: '€', label: '€ EUR' },
  { sym: '₸', label: '₸ KZT' },
  { sym: '£', label: '£ GBP' },
]

const controls = computed<ControlConfig[]>(() => [
  {
    id: 'salary',
    label: 'Monthly salary',
    min: 500, max: 20000, step: 100,
    model: salary,
    display: `${currency.value}${salary.value.toLocaleString()}`,
  },
  {
    id: 'savingsRate',
    label: 'Savings rate',
    min: 5, max: 50, step: 1,
    model: savingsRate,
    display: `${savingsRate.value}%`,
  },
  {
    id: 'salaryGrowth',
    label: 'Annual salary growth',
    min: 0, max: 30, step: 1,
    model: salaryGrowth,
    display: `${salaryGrowth.value}%`,
  },
  {
    id: 'invReturn',
    label: 'Investment return / yr',
    min: 3, max: 30, step: 1,
    model: invReturn,
    display: `${invReturn.value}%`,
  },
  {
    id: 'years',
    label: 'Time period',
    min: 5, max: 40, step: 1,
    model: years,
    display: `${years.value} yrs`,
  },
])

const { fmt, fmtAxis } = useFormatCurrency(currency)
const { simulation, metrics, milestoneItems } = usePortfolioSimulation(
  salary, savingsRate, salaryGrowth, invReturn, years, currency,
)
const { chartCanvas } = usePortfolioChart(simulation, currency, fmt, fmtAxis)
</script>

<style module>
.mpc {
  @apply font-sans text-slate-200 p-7 bg-surface rounded-2xl border border-card max-w-[900px] mb-10;
}

.mpcControls {
  @apply grid gap-x-8 gap-y-5 mb-7;
  grid-template-columns: repeat(2, 1fr);
}

@media (max-width: 600px) {
  .mpcControls {
    grid-template-columns: 1fr;
  }
}

.mpcControl {}

.mpcControlHeader {
  @apply flex justify-between items-baseline mb-2;
}

.mpcControlLabel {
  @apply text-[13px] font-medium text-subtle;
}

.mpcControlValue {
  @apply text-sm font-semibold text-slate-100;
}

.mpcSlider {
  @apply w-full cursor-pointer;
  accent-color: #16a37f;
}

.mpcMetrics {
  @apply grid gap-2.5 mb-5;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

@media (max-width: 600px) {
  .mpcMetrics {
    grid-template-columns: repeat(2, 1fr);
  }
}

.mpcChartWrap {
  @apply relative w-full mb-2.5;
  height: 260px;
}

.mpcLegend {
  @apply flex gap-4 text-xs text-muted flex-wrap mb-4;
}

.mpcLegendItem {
  @apply flex items-center gap-1.5;
}

.mpcSwatch {
  @apply w-2.5 h-2.5 rounded-[2px] flex-shrink-0;
}

.mpcSwatchGains {
  @apply border border-[#6ee7c7];
  background: #bbf7e0;
}

.mpcMilestones {
  @apply text-xs text-muted bg-card rounded-xl px-3.5 py-2.5 leading-loose flex items-start gap-1.5;
}

.mpcMilestonesIcon {
  @apply flex-shrink-0 mt-px;
}

.mpcMilestoneText {}

.mpcMsReached {
  @apply font-semibold text-slate-200;
}

.mpcMsUnreached {
  @apply opacity-40;
}

.mpcMsDot {
  @apply text-card-border mx-0.5;
}
</style>
