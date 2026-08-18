'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { ArrowLeft, Crown, Flame, Sparkles, Trophy } from 'lucide-react'
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

type Lifetime={lifetimeExp:number;currentRunExp:number;totalCompletions:number;currentStreak:number;longestStreak:number;prestigeCount:number;memberSince:string}

const number=new Intl.NumberFormat('en-US')

export default function LifetimePage(){
  const [data,setData]=useState<Lifetime|null>(null)
  useEffect(()=>{fetch('/api/lifetime').then(async response=>response.ok?response.json() as Promise<Lifetime>:null).then(setData).catch(()=>setData(null))},[])

  if(!data)return <main className="shell"><div className="card h-72 animate-pulse"/><Nav/></main>
  const memberSince=new Intl.DateTimeFormat('en-US',{month:'short',year:'numeric'}).format(new Date(data.memberSince))
  return <main className="shell">
    <Link href="/settings" className="mb-5 inline-flex items-center gap-1 text-sm font-black text-brand"><ArrowLeft className="size-4"/>Profile</Link>
    <header className="mb-6">
      <p className="eyebrow">THE WHOLE STORY</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight">Lifetime stats</h1>
      <p className="mt-1 text-muted-foreground">Everything you have earned stays part of your story.</p>
    </header>
    <Card className="overflow-hidden bg-[rgb(var(--accent))]">
      <CardHeader>
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.14em]">All-time EXP</p><h2 className="mt-2 text-4xl font-black">{number.format(data.lifetimeExp)}</h2></div><Sparkles className="size-10" aria-hidden="true"/></div>
      </CardHeader>
      <CardContent><p className="text-sm font-bold">Across every run, including before and after prestige.</p></CardContent>
    </Card>
    <section className="mt-4 grid grid-cols-2 gap-3">
      <Stat icon={<Trophy className="size-5"/>} label="Current run" value={`${number.format(data.currentRunExp)} EXP`}/>
      <Stat icon={<Crown className="size-5"/>} label="Prestige" value={number.format(data.prestigeCount)}/>
      <Stat icon={<Sparkles className="size-5"/>} label="Total wins" value={number.format(data.totalCompletions)}/>
      <Stat icon={<Flame className="size-5"/>} label="Best streak" value={`${data.longestStreak} days`}/>
    </section>
    <Card className="mt-4 p-5">
      <p className="eyebrow">RIGHT NOW</p>
      <div className="mt-3 flex items-end justify-between gap-3"><div><h2 className="text-3xl font-black">{data.currentStreak} day{data.currentStreak===1?'':'s'}</h2><p className="mt-1 text-sm text-muted-foreground">Current streak</p></div><p className="text-right text-xs font-bold uppercase tracking-wide text-muted-foreground">Here since<br/>{memberSince}</p></div>
    </Card>
    <p className="mt-5 text-center text-xs font-bold text-muted-foreground">Prestige refreshes your current level, never your lifetime progress.</p>
    <Nav/>
  </main>
}

function Stat({icon,label,value}:{icon:ReactNode;label:string;value:string}){
  return <Card className="min-h-32 p-4"><span className="grid size-9 place-items-center border-2 border-border bg-muted">{icon}</span><p className="mt-3 text-[10px] font-black uppercase tracking-[.12em] text-muted-foreground">{label}</p><b className="mt-1 block text-lg leading-tight">{value}</b></Card>
}
