'use client'

import { useEffect, useState } from 'react'
import { Download, TrendingUp } from 'lucide-react'
import { LineChart, Line, Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Heatmap } from '@/components/Heatmap'
import { Nav } from '@/components/Nav'
import { StreakStats } from '@/components/StreakStats'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type AnalyticsData = {
  values: number[]
  categoryValues: Record<string, number[]>
  categoryExp: Record<string, number>
  monthlyExp: { month: string; exp: number }[]
  best: { date: string; exp: number } | null
  total: number
  currentStreak: number
  longestStreak: number
}

const labels: Record<string, string> = {
  HEALTH: 'Health', MENTAL: 'Mental', SELF_CARE: 'Self-care', NUTRITION: 'Nutrition',
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    fetch('/api/analytics').then(response => response.ok ? response.json() : null).then(setData)
  }, [])

  if (!data) return <main className="shell"><Card className="h-64 animate-pulse" /><Nav /></main>

  const max = Math.max(...Object.values(data.categoryExp), 1)
  const radar = Object.entries(data.categoryExp).map(([category, exp]) => ({ category: labels[category], value: Math.round(exp / max * 100) }))

  return <main className="shell">
    <header className="mb-6">
      <p className="eyebrow">YOUR MOMENTUM</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight">Progress that adds up</h1>
      <p className="mt-1 text-muted-foreground">Consistency tells the real story.</p>
    </header>

    <StreakStats currentStreak={data.currentStreak} longestStreak={data.longestStreak} />

    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div><h2 className="font-black">Contribution year</h2><p className="text-sm text-muted-foreground">{data.total} wins recorded</p></div>
        <Badge variant="secondary">365 days</Badge>
      </CardHeader>
      <CardContent className="overflow-x-auto pb-5"><Heatmap values={data.values} /></CardContent>
    </Card>

    <Card className="mt-4">
      <CardHeader><h2 className="font-black">Category rhythm</h2><p className="text-sm text-muted-foreground">Small wins across every part of your life.</p></CardHeader>
      <CardContent className="grid gap-5 sm:grid-cols-2">
        {Object.entries(data.categoryValues).map(([category, values]) => <div key={category} className="min-w-0">
          <div className="mb-2 flex items-center justify-between"><span className="text-sm font-bold">{labels[category]}</span><span className="text-sm text-muted-foreground">{data.categoryExp[category]} EXP</span></div>
          <div className="overflow-x-auto"><Heatmap values={values} /></div>
        </div>)}
      </CardContent>
    </Card>

    <Card className="mt-4">
      <CardHeader className="flex-row items-center gap-2"><TrendingUp className="size-5 text-brand" /><div><h2 className="font-black">Monthly EXP trend</h2><p className="text-sm text-muted-foreground">Your recent rhythm at a glance.</p></div></CardHeader>
      <CardContent><div className="h-52 w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={data.monthlyExp}><XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} /><YAxis hide /><Tooltip contentStyle={{ borderRadius: 0, border: '2px solid rgb(var(--border))', background: 'rgb(var(--card))' }} /><Line type="monotone" dataKey="exp" stroke="rgb(var(--accent))" strokeWidth={3} dot={{ r: 3 }} /></LineChart></ResponsiveContainer></div></CardContent>
    </Card>

    <Card className="mt-4">
      <CardHeader><h2 className="font-black">Category balance</h2></CardHeader>
      <CardContent><div className="h-64"><ResponsiveContainer width="100%" height="100%"><RadarChart data={radar}><PolarGrid /><PolarAngleAxis dataKey="category" tick={{ fontSize: 11 }} /><Radar dataKey="value" stroke="rgb(var(--accent))" fill="rgb(var(--accent))" fillOpacity={.28} /></RadarChart></ResponsiveContainer></div></CardContent>
    </Card>

    <Card className="mt-4">
      <CardHeader><h2 className="font-black">Category mastery</h2></CardHeader>
      <CardContent className="grid gap-3">{Object.entries(data.categoryExp).map(([category, exp]) => <div key={category}><div className="flex justify-between text-sm font-bold"><span>{labels[category]}</span><span>{exp} EXP</span></div><div className="mt-1 h-3 rounded-full bg-brand/15"><div className="h-full rounded-full bg-accent" style={{ width: `${Math.round(exp / max * 100)}%` }} /></div></div>)}</CardContent>
    </Card>

    <Card className="mt-4">
      <CardHeader><h2 className="font-black">Personal best</h2></CardHeader>
      <CardContent><p className="text-sm text-muted-foreground">{data.best ? `Your best day was ${data.best.date} — ${data.best.exp} EXP` : 'Complete a habit to create your first highlight.'}</p><div className="mt-4 flex flex-wrap gap-3"><a className="btn btn-secondary" href="/api/export?format=csv"><Download className="size-4" />Export CSV</a><a className="btn btn-secondary" href="/api/export?format=json"><Download className="size-4" />Export JSON</a></div></CardContent>
    </Card>
    <Nav />
  </main>
}
