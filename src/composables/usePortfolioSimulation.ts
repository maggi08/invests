import { computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import type { SimulationResult, MetricItem, MilestoneItem } from '@/types/portfolio'
import { useFormatCurrency } from './useFormatCurrency'

export const MILESTONE_TARGETS = [
  100_000, 250_000, 500_000, 1_000_000, 2_000_000, 5_000_000, 10_000_000,
]
const MILESTONE_LABELS = ['100k', '250k', '500k', '1M', '2M', '5M', '10M']

export function usePortfolioSimulation(
  salary: Ref<number>,
  savingsRate: Ref<number>,
  salaryGrowth: Ref<number>,
  invReturn: Ref<number>,
  years: Ref<number>,
  currency: Ref<string>,
): {
  simulation: ComputedRef<SimulationResult>
  metrics: ComputedRef<MetricItem[]>
  milestoneItems: ComputedRef<MilestoneItem[]>
} {
  const { fmt } = useFormatCurrency(currency)

  const simulation: ComputedRef<SimulationResult> = computed(() => {
    const P = salary.value
    const sr = savingsRate.value / 100
    const sg = salaryGrowth.value / 100
    const ir = invReturn.value / 100
    const yrs = years.value
    const monthlyIR = Math.pow(1 + ir, 1 / 12) - 1

    const labels: string[] = ['Start']
    const portfolio: number[] = [0]
    const contributed: number[] = [0]
    const milestones: Record<number, { year: number; salary: number }> = {}

    let port = 0
    let totalContrib = 0
    let curSalary = P
    let targetIdx = 0

    for (let y = 1; y <= yrs; y++) {
      if (y > 1) curSalary *= 1 + sg
      const monthlyContrib = curSalary * sr

      for (let m = 0; m < 12; m++) {
        port = port * (1 + monthlyIR) + monthlyContrib
        totalContrib += monthlyContrib
      }

      while (
        targetIdx < MILESTONE_TARGETS.length &&
        port >= MILESTONE_TARGETS[targetIdx]
      ) {
        milestones[MILESTONE_TARGETS[targetIdx]] = {
          year: y,
          salary: Math.round(curSalary),
        }
        targetIdx++
      }

      labels.push(`Yr ${y}`)
      portfolio.push(Math.round(port))
      contributed.push(Math.round(totalContrib))
    }

    return { labels, portfolio, contributed, milestones, finalSalary: Math.round(curSalary) }
  })

  const metrics: ComputedRef<MetricItem[]> = computed(() => {
    const { portfolio, contributed, finalSalary } = simulation.value
    const finalPort = portfolio[portfolio.length - 1]
    const finalContrib = contributed[contributed.length - 1]
    const gains = finalPort - finalContrib

    return [
      { label: 'Portfolio at end', value: fmt(finalPort) },
      { label: 'Total invested', value: fmt(finalContrib) },
      { label: 'Investment gains', value: fmt(gains), color: '#34d399' },
      { label: 'Final monthly salary', value: `${fmt(finalSalary)}/mo` },
    ]
  })

  const milestoneItems: ComputedRef<MilestoneItem[]> = computed(() =>
    MILESTONE_TARGETS.map((target, i) => {
      const ms = simulation.value.milestones[target]
      return {
        target,
        label: `${currency.value}${MILESTONE_LABELS[i]}`,
        reached: !!ms,
        year: ms?.year,
      }
    }),
  )

  return { simulation, metrics, milestoneItems }
}
