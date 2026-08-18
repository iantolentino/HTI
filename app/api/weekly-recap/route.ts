import { NextResponse } from 'next/server'
import { z } from 'zod'
import { currentUser } from '@/lib/current-user'
import { isoDay, todayDate } from '@/lib/game'
import { prisma } from '@/lib/prisma'

const input = z.object({ key: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) })

export async function POST(request: Request) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { key } = input.parse(await request.json())
    const currentDate = todayDate(user.timezone)
    const monday = new Date(currentDate)
    monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7))
    if (key !== isoDay(monday, user.timezone)) return NextResponse.json({ error: 'That recap is no longer current.' }, { status: 400 })
    await prisma.user.update({ where: { id: user.id }, data: { lastWeeklyRecapKey: key } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Could not dismiss this recap.' }, { status: 400 })
  }
}
