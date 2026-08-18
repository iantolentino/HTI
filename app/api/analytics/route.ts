import { NextResponse } from 'next/server'
import { currentUser } from '@/lib/current-user'
import { prisma } from '@/lib/prisma'
import { isoDay, streakFromDates, todayDate } from '@/lib/game'

const categories = ['HEALTH', 'MENTAL', 'SELF_CARE', 'NUTRITION'] as const
export async function GET() {
  const user = await currentUser(); if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const since = todayDate(user.timezone); since.setUTCDate(since.getUTCDate() - 364)
  const [logs, activeTaskCount] = await Promise.all([prisma.dailyLog.findMany({ where: { userId: user.id, date: { gte: since } }, include: { task: true }, orderBy: { date: 'asc' } }),prisma.userTask.count({where:{userId:user.id,isPaused:false}})])
  const byDay = new Map<string, { exp: number; completions: number }>(); const categoryDays: Record<string, Map<string, number>> = Object.fromEntries(categories.map(category => [category, new Map()]))
  const categoryExp: Record<string, number> = Object.fromEntries(categories.map(category => [category, 0]))
  for (const log of logs) { const key = isoDay(log.date, user.timezone); const value = byDay.get(key) ?? { exp: 0, completions: 0 }; value.exp += log.expEarned; value.completions += 1; byDay.set(key, value); categoryDays[log.task.category].set(key, (categoryDays[log.task.category].get(key) ?? 0) + log.expEarned); categoryExp[log.task.category] += log.expEarned }
  const dailyAverage=byDay.size?[...byDay.values()].reduce((sum,value)=>sum+value.exp,0)/byDay.size:0
  const values = Array.from({ length: 365 }, (_, index) => { const date = new Date(since); date.setUTCDate(date.getUTCDate() + index); const value = byDay.get(isoDay(date, user.timezone)); if(!value)return 0;const completion=activeTaskCount?Math.min(100,Math.round(value.completions/activeTaskCount*100)):0;const expMomentum=dailyAverage?Math.min(100,Math.round(value.exp/dailyAverage*50)):50;return Math.round(completion*.65+expMomentum*.35) })
  const categoryValues = Object.fromEntries(categories.map(category => [category, Array.from({ length: 365 }, (_, index) => { const date = new Date(since); date.setUTCDate(date.getUTCDate() + index); return Math.min(100, (categoryDays[category].get(isoDay(date, user.timezone)) ?? 0) * 2) })]))
  const monthlyExp = Array.from({ length: 12 }, (_, offset) => { const date = new Date(); date.setUTCMonth(date.getUTCMonth() - (11 - offset), 1); const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`; return { month: date.toLocaleString('en-US', { month: 'short' }), exp: logs.filter(log => { const day = isoDay(log.date, user.timezone); return day.startsWith(key) }).reduce((sum, log) => sum + log.expEarned, 0) } })
  const best = [...byDay.entries()].sort((a, b) => b[1].exp - a[1].exp)[0]
  const days=[...byDay.keys()];const currentStreak=streakFromDates(days,isoDay(new Date(),user.timezone),user.createdAt.getTime()>Date.now()-7*86400000)
  const categoryMastery = Object.fromEntries(categories.map(category => [category, Math.max(1, Math.floor(Math.sqrt(categoryExp[category] / 100)) + 1)]))
  return NextResponse.json({ values, categoryValues, categoryExp, categoryMastery, monthlyExp, best: best ? { date: best[0], exp: best[1].exp } : null, total: logs.length,currentStreak,longestStreak:user.longestStreak })
}
