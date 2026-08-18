import { NextResponse } from 'next/server'
import { currentUser } from '@/lib/current-user'
import { prisma } from '@/lib/prisma'
import { isoDay } from '@/lib/game'

const categories = ['HEALTH', 'MENTAL', 'SELF_CARE', 'NUTRITION'] as const
export async function GET() {
  const user = await currentUser(); if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const since = new Date(); since.setUTCDate(since.getUTCDate() - 364)
  const logs = await prisma.dailyLog.findMany({ where: { userId: user.id, date: { gte: since } }, include: { task: true }, orderBy: { date: 'asc' } })
  const byDay = new Map<string, { exp: number; categories: Set<string> }>(); const categoryDays: Record<string, Map<string, number>> = Object.fromEntries(categories.map(category => [category, new Map()]))
  const categoryExp: Record<string, number> = Object.fromEntries(categories.map(category => [category, 0]))
  for (const log of logs) { const key = isoDay(log.date, user.timezone); const value = byDay.get(key) ?? { exp: 0, categories: new Set<string>() }; value.exp += log.expEarned; value.categories.add(log.task.category); byDay.set(key, value); categoryDays[log.task.category].set(key, (categoryDays[log.task.category].get(key) ?? 0) + log.expEarned); categoryExp[log.task.category] += log.expEarned }
  const values = Array.from({ length: 365 }, (_, index) => { const date = new Date(since); date.setUTCDate(date.getUTCDate() + index); const value = byDay.get(isoDay(date, user.timezone)); return value ? Math.min(100, Math.round(value.exp / 2) + value.categories.size * 10) : 0 })
  const categoryValues = Object.fromEntries(categories.map(category => [category, Array.from({ length: 365 }, (_, index) => { const date = new Date(since); date.setUTCDate(date.getUTCDate() + index); return Math.min(100, (categoryDays[category].get(isoDay(date, user.timezone)) ?? 0) * 2) })]))
  const monthlyExp = Array.from({ length: 12 }, (_, offset) => { const date = new Date(); date.setUTCMonth(date.getUTCMonth() - (11 - offset), 1); const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`; return { month: date.toLocaleString('en-US', { month: 'short' }), exp: logs.filter(log => { const day = isoDay(log.date, user.timezone); return day.startsWith(key) }).reduce((sum, log) => sum + log.expEarned, 0) } })
  const best = [...byDay.entries()].sort((a, b) => b[1].exp - a[1].exp)[0]
  return NextResponse.json({ values, categoryValues, categoryExp, monthlyExp, best: best ? { date: best[0], exp: best[1].exp } : null, total: logs.length })
}
