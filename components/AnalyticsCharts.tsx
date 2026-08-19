'use client'

import { LineChart, Line, Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

type Props = {
  monthlyExp: { month: string; exp: number }[]
  radar: { category: string; value: number }[]
}

export default function AnalyticsCharts({ monthlyExp, radar }: Props) {
  return <>
    <Card className="mt-4">
      <CardHeader className="flex-row items-center gap-2"><TrendingUp className="size-5 text-brand" /><div><h2 className="font-black">Monthly EXP trend</h2><p className="text-sm text-muted-foreground">Your recent rhythm at a glance.</p></div></CardHeader>
      <CardContent><div className="h-52 w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={monthlyExp}><XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} /><YAxis hide /><Tooltip contentStyle={{ borderRadius: 0, border: '2px solid rgb(var(--border))', background: 'rgb(var(--card))' }} /><Line type="monotone" dataKey="exp" stroke="rgb(var(--accent))" strokeWidth={3} dot={{ r: 3 }} /></LineChart></ResponsiveContainer></div></CardContent>
    </Card>

    <Card className="mt-4">
      <CardHeader><h2 className="font-black">Category balance</h2></CardHeader>
      <CardContent><div className="h-64"><ResponsiveContainer width="100%" height="100%"><RadarChart data={radar}><PolarGrid /><PolarAngleAxis dataKey="category" tick={{ fontSize: 11 }} /><Radar dataKey="value" stroke="rgb(var(--accent))" fill="rgb(var(--accent))" fillOpacity={.28} /></RadarChart></ResponsiveContainer></div></CardContent>
    </Card>
  </>
}
