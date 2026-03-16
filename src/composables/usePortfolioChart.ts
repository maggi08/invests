import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import { Chart, registerables } from 'chart.js'
import type { TooltipItem } from 'chart.js'
import type { SimulationResult } from '@/types/portfolio'

Chart.register(...registerables)

export function usePortfolioChart(
  simulation: ComputedRef<SimulationResult>,
  currency: Ref<string>,
  fmt: (v: number) => string,
  fmtAxis: (v: number) => string,
): { chartCanvas: Ref<HTMLCanvasElement | null> } {
  const chartCanvas = ref<HTMLCanvasElement | null>(null)
  let chartInstance: Chart | null = null

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
      interaction: { mode: 'index' as const, intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1e293b',
          borderColor: '#334155',
          borderWidth: 1,
          titleColor: '#94a3b8',
          bodyColor: '#e2e8f0',
          callbacks: {
            label: (ctx: TooltipItem<'line'>) => {
              const y = ctx.parsed.y ?? 0
              if (ctx.datasetIndex === 2) return ` Gains: ${fmt(y)}`
              return ` ${ctx.dataset.label}: ${fmt(y)}`
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
          ticks: {
            font: { size: 11 },
            color: '#475569',
            callback: (v: number | string) => fmtAxis(Number(v)),
          },
          grid: { color: 'rgba(51,65,85,0.6)' },
        },
      },
    }
  }

  function initChart(): void {
    if (!chartCanvas.value) return
    chartInstance = new Chart(chartCanvas.value, {
      type: 'line',
      data: buildChartData(),
      options: buildChartOptions(),
    })
  }

  function updateChart(): void {
    if (!chartInstance) return
    const data = buildChartData()
    chartInstance.data.labels = data.labels
    chartInstance.data.datasets[0].data = data.datasets[0].data
    chartInstance.data.datasets[1].data = data.datasets[1].data
    chartInstance.data.datasets[2].data = data.datasets[2].data

    const yScale = chartInstance.options.scales?.['y']
    if (yScale?.ticks) {
      yScale.ticks.callback = (v: number | string) => fmtAxis(Number(v))
    }

    const tooltipCallbacks = chartInstance.options.plugins?.tooltip?.callbacks
    if (tooltipCallbacks) {
      tooltipCallbacks.label = (ctx) => {
        const y = ctx.parsed.y ?? 0
        if (ctx.datasetIndex === 2) return ` Gains: ${fmt(y)}`
        return ` ${ctx.dataset.label}: ${fmt(y)}`
      }
    }

    chartInstance.update()
  }

  onMounted(async () => {
    await nextTick()
    initChart()
  })

  onBeforeUnmount(() => {
    chartInstance?.destroy()
  })

  watch(simulation, () => updateChart(), { flush: 'post' })
  watch(currency, () => updateChart(), { flush: 'post' })

  return { chartCanvas }
}
