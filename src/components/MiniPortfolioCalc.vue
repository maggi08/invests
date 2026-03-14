<template>
  <div class="mpc">
    <!-- Controls -->
    <div class="mpc__controls">
      <div class="mpc__control" v-for="ctrl in controls" :key="ctrl.id">
        <div class="mpc__control-header">
          <span class="mpc__control-label">{{ ctrl.label }}</span>
          <span class="mpc__control-value">{{ ctrl.display }}</span>
        </div>
        <input
          class="mpc__slider"
          type="range"
          :min="ctrl.min"
          :max="ctrl.max"
          :step="ctrl.step"
          v-model.number="ctrl.model.value"
        />
      </div>

      <div class="mpc__control">
        <div class="mpc__control-header">
          <span class="mpc__control-label">Currency</span>
        </div>
        <div class="mpc__currency-row">
          <button
            v-for="cur in currencies"
            :key="cur.sym"
            class="mpc__cur-btn"
            :class="{ 'mpc__cur-btn--active': currency === cur.sym }"
            @click="currency = cur.sym"
          >
            {{ cur.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Metrics -->
    <div class="mpc__metrics">
      <div class="mpc__metric" v-for="m in metrics" :key="m.label">
        <div class="mpc__metric-label">{{ m.label }}</div>
        <div class="mpc__metric-value" :style="m.color ? { color: m.color } : {}">{{ m.value }}</div>
      </div>
    </div>

    <!-- Chart -->
    <div class="mpc__chart-wrap">
      <canvas ref="chartCanvas"></canvas>
    </div>

    <!-- Legend -->
    <div class="mpc__legend">
      <span class="mpc__legend-item">
        <span class="mpc__swatch" style="background:#16a37f"></span>
        Portfolio value
      </span>
      <span class="mpc__legend-item">
        <span class="mpc__swatch" style="background:#94a3b8"></span>
        Total contributed
      </span>
      <span class="mpc__legend-item">
        <span class="mpc__swatch" style="background:#bbf7e0; border: 1px solid #6ee7c7"></span>
        Investment gains
      </span>
    </div>

    <!-- Milestones -->
    <div class="mpc__milestones">
      <span class="mpc__milestones-icon">🏁</span>
      <span class="mpc__milestone-text">
        <template v-for="(ms, idx) in milestoneItems" :key="ms.target">
          <span :class="ms.reached ? 'mpc__ms--reached' : 'mpc__ms--unreached'">
            {{ ms.label }}
            <template v-if="ms.reached"> — yr {{ ms.year }}</template>
            <template v-else> — beyond {{ years }} yrs</template>
          </span>
          <span v-if="idx < milestoneItems.length - 1" class="mpc__ms-dot"> · </span>
        </template>
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

// ─── Reactive state ───────────────────────────────────────────────────────────
const salary       = ref(3000)
const savingsRate  = ref(10)
const salaryGrowth = ref(20)
const invReturn    = ref(12)
const years        = ref(20)
const currency     = ref('$')

const chartCanvas  = ref(null)
let chartInstance  = null

// ─── Config ───────────────────────────────────────────────────────────────────
const currencies = [
  { sym: '$', label: '$ USD' },
  { sym: '€', label: '€ EUR' },
  { sym: '₸', label: '₸ KZT' },
  { sym: '£', label: '£ GBP' },
]

const MILESTONE_TARGETS = [100_000, 250_000, 500_000, 1_000_000, 2_000_000, 5_000_000, 10_000_000]
const MILESTONE_LABELS  = ['100k', '250k', '500k', '1M', '2M', '5M', '10M']

// ─── Controls config ──────────────────────────────────────────────────────────
const controls = computed(() => [
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

// ─── Simulation ───────────────────────────────────────────────────────────────
const simulation = computed(() => {
  const P          = salary.value
  const sr         = savingsRate.value / 100
  const sg         = salaryGrowth.value / 100
  const ir         = invReturn.value / 100
  const yrs        = years.value
  const monthlyIR  = Math.pow(1 + ir, 1 / 12) - 1

  const labels      = ['Start']
  const portfolio   = [0]
  const contributed = [0]
  const milestones  = {}

  let port         = 0
  let totalContrib = 0
  let curSalary    = P
  let targetIdx    = 0

  for (let y = 1; y <= yrs; y++) {
    if (y > 1) curSalary *= (1 + sg)
    const monthlyContrib = curSalary * sr

    for (let m = 0; m < 12; m++) {
      port = port * (1 + monthlyIR) + monthlyContrib
      totalContrib += monthlyContrib
    }

    while (targetIdx < MILESTONE_TARGETS.length && port >= MILESTONE_TARGETS[targetIdx]) {
      milestones[MILESTONE_TARGETS[targetIdx]] = { year: y, salary: Math.round(curSalary) }
      targetIdx++
    }

    labels.push(`Yr ${y}`)
    portfolio.push(Math.round(port))
    contributed.push(Math.round(totalContrib))
  }

  return { labels, portfolio, contributed, milestones, finalSalary: Math.round(curSalary) }
})

// ─── Formatting ───────────────────────────────────────────────────────────────
function fmt(v) {
  const sym = currency.value
  if (v >= 1e9) return `${sym}${(v / 1e9).toFixed(2)}B`
  if (v >= 1e6) return `${sym}${(v / 1e6).toFixed(2)}M`
  if (v >= 1e3) return `${sym}${Math.round(v / 1000)}k`
  return `${sym}${Math.round(v).toLocaleString()}`
}

function fmtAxis(v) {
  const sym = currency.value
  if (v >= 1e9) return `${sym}${(v / 1e9).toFixed(1)}B`
  if (v >= 1e6) return `${sym}${(v / 1e6).toFixed(1)}M`
  if (v >= 1e3) return `${sym}${Math.round(v / 1000)}k`
  return `${sym}${v}`
}

// ─── Derived UI data ──────────────────────────────────────────────────────────
const metrics = computed(() => {
  const { portfolio, contributed, finalSalary } = simulation.value
  const finalPort    = portfolio[portfolio.length - 1]
  const finalContrib = contributed[contributed.length - 1]
  const gains        = finalPort - finalContrib

  return [
    { label: 'Portfolio at end',    value: fmt(finalPort) },
    { label: 'Total invested',      value: fmt(finalContrib) },
    { label: 'Investment gains',    value: fmt(gains), color: '#16a37f' },
    { label: 'Final monthly salary',value: `${fmt(finalSalary)}/mo` },
  ]
})

const milestoneItems = computed(() =>
  MILESTONE_TARGETS.map((target, i) => {
    const ms = simulation.value.milestones[target]
    return {
      target,
      label: `${currency.value}${MILESTONE_LABELS[i]}`,
      reached: !!ms,
      year: ms?.year,
    }
  })
)

// ─── Chart ────────────────────────────────────────────────────────────────────
function buildChartData() {
  const { labels, portfolio, contributed } = simulation.value
  const gains = portfolio.map((v, i) => v - contributed[i])

  return {
    labels,
    datasets: [
      {
        label: 'Portfolio',
        data: portfolio,
        borderColor: '#16a37f',
        backgroundColor: 'rgba(22,163,127,0.12)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2.5,
        order: 1,
      },
      {
        label: 'Contributed',
        data: contributed,
        borderColor: '#94a3b8',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.2,
        pointRadius: 0,
        borderDash: [4, 3],
        borderWidth: 1.5,
        order: 2,
      },
      {
        label: 'Gains',
        data: gains,
        borderColor: 'transparent',
        backgroundColor: 'rgba(110,231,183,0.15)',
        fill: '-1',
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 0,
        order: 3,
      },
    ],
  }
}

function buildChartOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        borderWidth: 1,
        titleColor: '#94a3b8',
        bodyColor: '#e2e8f0',
        callbacks: {
          label: (ctx) => {
            if (ctx.datasetIndex === 2) return ` Gains: ${fmt(ctx.parsed.y)}`
            return ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y)}`
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, maxTicksLimit: 10, color: '#475569' },
      },
      y: {
        ticks: { font: { size: 11 }, color: '#475569', callback: (v) => fmtAxis(v) },
        grid: { color: 'rgba(51,65,85,0.6)' },
      },
    },
  }
}

function initChart() {
  if (!chartCanvas.value) return
  chartInstance = new Chart(chartCanvas.value, {
    type: 'line',
    data: buildChartData(),
    options: buildChartOptions(),
  })
}

function updateChart() {
  if (!chartInstance) return
  const data = buildChartData()
  chartInstance.data.labels          = data.labels
  chartInstance.data.datasets[0].data = data.datasets[0].data
  chartInstance.data.datasets[1].data = data.datasets[1].data
  chartInstance.data.datasets[2].data = data.datasets[2].data
  chartInstance.options.scales.y.ticks.callback = (v) => fmtAxis(v)
  chartInstance.options.plugins.tooltip.callbacks.label = (ctx) => {
    if (ctx.datasetIndex === 2) return ` Gains: ${fmt(ctx.parsed.y)}`
    return ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y)}`
  }
  chartInstance.update()
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(async () => {
  await nextTick()
  initChart()
})

onBeforeUnmount(() => {
  chartInstance?.destroy()
})

watch(
  [salary, savingsRate, salaryGrowth, invReturn, years, currency],
  () => updateChart(),
  { flush: 'post' }
)
</script>

<style scoped>
.mpc {
  font-family: 'DM Sans', system-ui, sans-serif;
  color: #e2e8f0;
  padding: 1.75rem;
  background: #0f172a;
  border-radius: 20px;
  border: 1px solid #1e293b;
  max-width: 900px;
  margin-bottom: 2.5rem;
}

/* ── Controls ── */
.mpc__controls {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem 2rem;
  margin-bottom: 1.75rem;
}

@media (max-width: 600px) {
  .mpc__controls {
    grid-template-columns: 1fr;
  }
}

.mpc__control-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
}

.mpc__control-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.mpc__control-value {
  font-size: 14px;
  font-weight: 600;
  color: #f1f5f9;
}

.mpc__slider {
  width: 100%;
  accent-color: #16a37f;
  cursor: pointer;
}

/* ── Currency buttons ── */
.mpc__currency-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.mpc__cur-btn {
  font-size: 12px;
  font-family: inherit;
  padding: 5px 12px;
  border: 1px solid #1e293b;
  border-radius: 8px;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
}

.mpc__cur-btn:hover {
  border-color: #334155;
  color: #cbd5e1;
}

.mpc__cur-btn--active {
  background: rgba(22, 163, 127, 0.12);
  color: #34d399;
  border-color: #16a37f;
  font-weight: 600;
}

/* ── Metrics ── */
.mpc__metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 1.25rem;
}

@media (max-width: 600px) {
  .mpc__metrics {
    grid-template-columns: repeat(2, 1fr);
  }
}

.mpc__metric {
  background: #1e293b;
  border-radius: 10px;
  padding: 12px 14px;
}

.mpc__metric-label {
  font-size: 11px;
  color: #475569;
  margin-bottom: 4px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.mpc__metric-value {
  font-size: 17px;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: -0.02em;
}

/* ── Chart ── */
.mpc__chart-wrap {
  position: relative;
  width: 100%;
  height: 260px;
  margin-bottom: 10px;
}

/* ── Legend ── */
.mpc__legend {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #475569;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.mpc__legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.mpc__swatch {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  flex-shrink: 0;
}

/* ── Milestones ── */
.mpc__milestones {
  font-size: 12px;
  color: #475569;
  background: #1e293b;
  border-radius: 10px;
  padding: 10px 14px;
  line-height: 2;
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

.mpc__milestones-icon {
  flex-shrink: 0;
  margin-top: 1px;
}

.mpc__ms--reached {
  font-weight: 600;
  color: #e2e8f0;
}

.mpc__ms--unreached {
  opacity: 0.35;
}

.mpc__ms-dot {
  color: #334155;
  margin: 0 2px;
}
</style>
