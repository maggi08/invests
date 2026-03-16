import type { Ref } from 'vue'

export interface SimulationResult {
  labels: string[]
  portfolio: number[]
  contributed: number[]
  milestones: Record<number, { year: number; salary: number }>
  finalSalary: number
}

export interface MetricItem {
  label: string
  value: string
  color?: string
}

export interface MilestoneItem {
  target: number
  label: string
  reached: boolean
  year?: number
}

export interface ControlConfig {
  id: string
  label: string
  min: number
  max: number
  step: number
  model: Ref<number>
  display: string
}

export interface CurrencyOption {
  sym: string
  label: string
}
