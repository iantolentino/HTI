import { NextResponse } from 'next/server'
import { randomInt } from 'crypto'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { comboBonus, isoDay, progressiveExp, progressiveTarget, staticDiminishedExp, streakFromDates, todayDate, vaultBoost, vaultDeposit } from '@/lib/game'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

const PERFECT_WEEK_EXP = 150
const completeInput = z.object({ userTaskId:z.string().min(1), note:z.string().trim().max(600).optional() })

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  let parsed: z.infer<typeof completeInput>
  try { parsed = completeInput.parse(await request.json()) } catch { return NextResponse.json({ error: 'Please choose a valid habit.' }, { status: 400 }) }
  const { userTaskId, note } = parsed
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const habit = await prisma.userTask.findFirst({ where: { id: userTaskId, userId: user.id }, include: { task: true } })
  if (!habit) return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
  const date = todayDate(user.timezone)
  if (await prisma.dailyLog.findUnique({ where: { userId_taskId_date: { userId: user.id, taskId: habit.taskId, date } } })) return NextResponse.json({ error: 'Already completed today.' }, { status: 409 })
  const recent = await prisma.dailyLog.findFirst({ where: { userId: user.id, createdAt: { gt: new Date(Date.now() - 3000) } }, orderBy: { createdAt: 'desc' } })
  if (recent) return NextResponse.json({ slowDown: true, message: 'Slow down — give each win a moment to count.' }, { status: 429 })

  const target = habit.task.type === 'PROGRESSIVE' ? (habit.currentTarget ?? progressiveTarget(habit.task.baseTarget ?? 1, user.level, habit.task.scalingFactor ?? 0, habit.personalTargetOverride)) : null
  let exp = habit.task.type === 'PROGRESSIVE' ? progressiveExp(habit.task.baseExp, target ?? 0) : habit.task.baseExp
  if (habit.task.type === 'STATIC') {
    const count = await prisma.dailyLog.count({ where: { userId: user.id, date, task: { category: habit.task.category, type: 'STATIC' } } })
    exp = staticDiminishedExp(exp, count + 1)
  }
  const activeTasks = await prisma.userTask.findMany({ where: { userId: user.id, isPaused: false }, select: { taskId: true } })
  const completedToday = await prisma.dailyLog.count({ where: { userId: user.id, date, taskId: { in: activeTasks.map(task => task.taskId) } } })
  const dayExpBefore = (await prisma.dailyLog.aggregate({ where: { userId: user.id, date }, _sum: { expEarned: true } }))._sum.expEarned ?? 0
  const weekStart = new Date(date); weekStart.setUTCDate(weekStart.getUTCDate() - 7)
  const trailingExp = (await prisma.dailyLog.aggregate({ where: { userId: user.id, date: { gte: weekStart, lt: date } }, _sum: { expEarned: true } }))._sum.expEarned ?? 0
  const trailingAverage = Math.round(trailingExp / 7)
  const combo = completedToday + 1 === activeTasks.length ? comboBonus(dayExpBefore + exp, true) : 0
  const useVault = dayExpBefore === 0 && trailingAverage > 0 && exp < trailingAverage * 0.7 && user.lastVaultAppliedDate?.getTime() !== date.getTime()
  const vault = useVault ? vaultBoost(user.expVaultBalance, true) : 0
  const gained = exp + combo + vault
  try {
    await prisma.$transaction([
      prisma.dailyLog.create({ data: { userId: user.id, taskId: habit.taskId, date, expEarned: exp, targetAtCompletion: target, note } }),
      prisma.userTask.update({ where: { id: habit.id }, data: { consecutiveMisses: 0, lastMissEvaluatedDate: date } }),
      prisma.user.update({ where: { id: user.id }, data: { totalExp: { increment: gained }, lifetimeExp: { increment: gained }, expVaultBalance: vault ? { decrement: vault } : undefined, lastVaultAppliedDate: vault ? date : undefined, lastCompletionAt: new Date(), hasCompletedFirstDay: completedToday + 1 === activeTasks.length ? true : undefined } }),
    ])
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return NextResponse.json({ error: 'Already completed today.' }, { status: 409 })
    throw error
  }

  const windowStart = new Date(date); windowStart.setUTCDate(windowStart.getUTCDate() - 365)
  const [recentLogs, completionAggregate] = await Promise.all([
    prisma.dailyLog.findMany({ where: { userId: user.id, date: { gte: windowStart } }, select: { date: true, taskId: true } }),
    prisma.dailyLog.count({ where: { userId: user.id } }),
  ])
  const dayKey = isoDay(date, user.timezone)
  const streak = streakFromDates([...new Set(recentLogs.map(log => isoDay(log.date, user.timezone)))], dayKey, false)
  let perfectWeekBonus = 0
  const lastSeven = new Set<string>()
  for (let offset = 0; offset < 7; offset++) { const candidate = new Date(date); candidate.setUTCDate(candidate.getUTCDate() - offset); const key = isoDay(candidate, user.timezone); const completed = new Set(recentLogs.filter(log => isoDay(log.date, user.timezone) === key).map(log => log.taskId)); if (completed.size >= activeTasks.length) lastSeven.add(key) }
  const eligiblePerfectWeek = lastSeven.size === 7 && (!user.lastPerfectWeekEnd || date.getTime() - user.lastPerfectWeekEnd.getTime() >= 7 * 86400000)
  if (eligiblePerfectWeek) perfectWeekBonus = PERFECT_WEEK_EXP
  const completionTotal = completionAggregate
  const badgeKeys = [streak >= 7 ? 'streak7' : null, streak >= 30 ? 'streak30' : null, completionTotal >= 100 ? 'completions100' : null, eligiblePerfectWeek ? 'perfect_week' : null, Date.now() - user.createdAt.getTime() >= 30 * 86400000 ? 'first_month' : null].filter((key): key is string => Boolean(key))
  const earnedBadges: { key: string; name: string; description: string; icon: string }[] = []
  if (perfectWeekBonus || streak > user.longestStreak || badgeKeys.length) {
    const badges = badgeKeys.length ? await prisma.badge.findMany({ where: { key: { in: badgeKeys } } }) : []
    const existingBadgeIds = new Set((await prisma.userBadge.findMany({ where: { userId: user.id, badgeId: { in: badges.map(badge => badge.id) } }, select: { badgeId: true } })).map(badge => badge.badgeId))
    earnedBadges.push(...badges.filter(badge => !existingBadgeIds.has(badge.id)).map(badge => ({ key: badge.key, name: badge.name, description: badge.description, icon: badge.icon })))
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { totalExp: perfectWeekBonus ? { increment: perfectWeekBonus } : undefined, lifetimeExp: perfectWeekBonus ? { increment: perfectWeekBonus } : undefined, longestStreak: Math.max(user.longestStreak, streak), lastPerfectWeekEnd: eligiblePerfectWeek ? date : undefined } }),
      ...badges.map(badge => prisma.userBadge.upsert({ where: { userId_badgeId: { userId: user.id, badgeId: badge.id } }, update: {}, create: { userId: user.id, badgeId: badge.id } })),
    ])
  }
  const dayTotal = dayExpBefore + exp + combo + vault + perfectWeekBonus
  const deposit = completedToday + 1 === activeTasks.length ? vaultDeposit(dayTotal, trailingAverage, Math.max(trailingAverage, dayTotal)) : 0
  if (deposit) await prisma.user.update({ where: { id: user.id }, data: { expVaultBalance: Math.min(Math.max(trailingAverage, dayTotal), user.expVaultBalance - vault + deposit) } })

  const updated = await prisma.user.findUniqueOrThrow({ where: { id: user.id } })
  let level = updated.level; let total = updated.totalExp; let leveled = false
  while (total >= Math.ceil(100 * Math.pow(level, 1.15))) { total -= Math.ceil(100 * Math.pow(level, 1.15)); level++; leveled = true }
  let unlockedPalette: string | null = null
  let mysteryPalette = false
  if (leveled) {
    await prisma.user.update({ where: { id: user.id }, data: { level, totalExp: total } })
    const palette = await prisma.palette.findFirst({ where: { unlockLevel: { lte: level }, requiresPrestige: false, isSeasonal: false, users: { none: { userId: user.id } } }, orderBy: { order: 'asc' } })
    const mysteryCandidates = !palette ? await prisma.palette.findMany({ where: { unlockLevel: null, isSeasonal: false, requiresPrestige: false, users: { none: { userId: user.id } } } }) : []
    const mystery = mysteryCandidates.length ? mysteryCandidates[randomInt(mysteryCandidates.length)] : null
    const reward = palette ?? mystery
    if (reward) { await prisma.userPalette.create({ data: { userId: user.id, paletteId: reward.id } }); unlockedPalette = reward.name; mysteryPalette = Boolean(mystery) }
  }
  return NextResponse.json({ exp, combo, vault, perfectWeekBonus, gained: gained + perfectWeekBonus, level, leveled, streak, unlockedPalette, mysteryPalette, earnedBadges })
}
