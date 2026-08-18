import React from 'react'
import { Flame, Trophy } from 'lucide-react'

type StreakStatsProps = {
  currentStreak: number
  longestStreak: number
}

export function StreakStats({ currentStreak, longestStreak }: StreakStatsProps) {
  return (
    <section aria-label="Streak summary" className="mb-4 grid grid-cols-2 gap-3">
      <article className="card -rotate-[1deg] p-4">
        <div className="flex items-center gap-2 text-[rgb(var(--accent))]">
          <Flame aria-hidden="true" className="size-5 fill-current" />
          <span className="text-[10px] font-black uppercase tracking-[.12em]">Current</span>
        </div>
        <p className="mt-3 text-3xl font-black leading-none">{currentStreak}</p>
        <p className="mt-1 text-xs font-bold text-muted-foreground">day streak</p>
      </article>
      <article className="card rotate-[1deg] bg-[rgb(var(--muted-bg))] p-4">
        <div className="flex items-center gap-2 text-[rgb(var(--success))]">
          <Trophy aria-hidden="true" className="size-5" />
          <span className="text-[10px] font-black uppercase tracking-[.12em]">Personal best</span>
        </div>
        <p className="mt-3 text-3xl font-black leading-none">{longestStreak}</p>
        <p className="mt-1 text-xs font-bold text-muted-foreground">days in a row</p>
      </article>
    </section>
  )
}
