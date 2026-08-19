import type { Category } from '@prisma/client'

export const MASTERY_THRESHOLDS = [0, 100, 300, 700, 1400, 2500, 4000, 6000]
export const MASTERY_TITLES = ['Initiate', 'Learner', 'Steady', 'Skilled', 'Focused', 'Master', 'Elite', 'Legend']

export function categoryMastery(exp: number) {
  const level = Math.max(1, MASTERY_THRESHOLDS.reduce((current, threshold, index) => exp >= threshold ? index + 1 : current, 1))
  const currentFloor = MASTERY_THRESHOLDS[level - 1] ?? 0
  const next = MASTERY_THRESHOLDS[level] ?? currentFloor + 2000
  return { level, title: MASTERY_TITLES[level - 1] ?? 'Legend', expIntoLevel: Math.max(0, exp - currentFloor), expToNext: Math.max(0, next - currentFloor), nextThreshold: next }
}

export function masteryByCategory(categoryExp: Partial<Record<Category, number>>) {
  return Object.fromEntries((['HEALTH', 'MENTAL', 'SELF_CARE', 'NUTRITION'] as const).map(category => [category, categoryMastery(categoryExp[category] ?? 0)]))
}
