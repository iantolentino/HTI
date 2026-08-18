import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { comboBonus, progressiveExp, progressiveTarget, staticDiminishedExp, todayDate } from '@/lib/game'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { userTaskId, note } = await request.json() as { userTaskId: string; note?: string }
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
  const combo = completedToday + 1 === activeTasks.length ? comboBonus(dayExpBefore + exp, true) : 0
  const gained = exp + combo
  await prisma.$transaction([
    prisma.dailyLog.create({ data: { userId: user.id, taskId: habit.taskId, date, expEarned: exp, targetAtCompletion: target, note } }),
    prisma.userTask.update({ where: { id: habit.id }, data: { consecutiveMisses: 0, lastMissEvaluatedDate: date } }),
    prisma.user.update({ where: { id: user.id }, data: { totalExp: { increment: gained }, lifetimeExp: { increment: gained }, lastCompletionAt: new Date(), hasCompletedFirstDay: completedToday + 1 === activeTasks.length ? true : undefined } }),
  ])
  const updated = await prisma.user.findUniqueOrThrow({ where: { id: user.id } })
  let level = updated.level; let total = updated.totalExp; let leveled = false
  while (total >= Math.ceil(100 * Math.pow(level, 1.15))) { total -= Math.ceil(100 * Math.pow(level, 1.15)); level++; leveled = true }
  if (leveled) {
    await prisma.user.update({ where: { id: user.id }, data: { level, totalExp: total } })
    const palette = await prisma.palette.findFirst({ where: { unlockLevel: { lte: level }, requiresPrestige: false, isSeasonal: false, users: { none: { userId: user.id } } }, orderBy: { order: 'asc' } })
    if (palette) await prisma.userPalette.create({ data: { userId: user.id, paletteId: palette.id } })
  }
  return NextResponse.json({ exp, bonus: combo, gained, level, leveled })
}
