'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Flame, Plus, TrendingUp, X } from 'lucide-react'
import { ExpBar } from '@/components/ExpBar'
import { TaskCard, Habit } from '@/components/TaskCard'
import { Card } from '@/components/ui/card'
import { Nav } from '@/components/Nav'
import { LevelUpModal } from '@/components/LevelUpModal'
import { BadgeToast, EarnedBadge } from '@/components/BadgeToast'

type Recap={key:string;bestDay:string|null;consistentCategory:string;weakestCategory:string}
type Dashboard={user:{displayName:string;level:number;title:string;totalExp:number;nextExp:number};tasks:Habit[];done:number;growth:number|null;streak:number;discoverUnlocked:boolean;welcomeBack:{daysMissed:number;message:string}|null;weeklyRecap:Recap|null;challenge:{id:string;title:string;description:string;exp:number;completedAt:string|null}}

export default function Dashboard(){
  const [data,setData]=useState<Dashboard|null>(null)
  const [toast,setToast]=useState('')
  const [badges,setBadges]=useState<EarnedBadge[]>([])
  const [levelUp,setLevelUp]=useState<{level:number;palette:string|null;mystery:boolean}|null>(null)
  const load=async()=>{try{const response=await fetch('/api/dashboard');setData(response.ok?await response.json() as Dashboard:null)}catch{setData(null)}}
  useEffect(()=>{void load()},[])
  const notify=(message:string)=>{setToast(message);setTimeout(()=>setToast(''),3600)}
  async function complete(id:string,note?:string){const response=await fetch('/api/complete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({userTaskId:id,note})});const body=await response.json() as {message?:string;error?:string;combo?:number;vault?:number;perfectWeekBonus?:number;unlockedPalette?:string|null;mysteryPalette?:boolean;gained?:number;leveled?:boolean;level?:number;earnedBadges?:EarnedBadge[]};if(!response.ok){notify(body.message??body.error??'Could not record this win.');return}const extra=[body.combo?`+${body.combo} combo`:null,body.vault?`+${body.vault} vault`:null,body.perfectWeekBonus?`+${body.perfectWeekBonus} perfect week`:null,body.unlockedPalette?`${body.unlockedPalette} unlocked`:null].filter(Boolean).join(' · ');notify(`+${body.gained??0} EXP${extra?` · ${extra}`:''} — nice work.`);if(body.earnedBadges?.length)setBadges(current=>[...current,...body.earnedBadges!]);if(body.leveled)setLevelUp({level:body.level??1,palette:body.unlockedPalette??null,mystery:Boolean(body.mysteryPalette)});void load()}
  async function manageHabit(id:string,action:'pause'|'remove'){const response=await fetch('/api/habits',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({userTaskId:id,action})});const body=await response.json();notify(response.ok?(action==='pause'?'Habit paused. You can bring it back from the library.':'Habit removed from your routine.'):body.error??'Could not update this habit.');if(response.ok)void load()}
  async function completeChallenge(){const response=await fetch('/api/challenge',{method:'POST'});const body=await response.json();notify(response.ok?`Monthly challenge complete · +${body.exp} EXP`:body.error);if(response.ok)void load()}
  async function dismissRecap(recap:Recap){const response=await fetch('/api/weekly-recap',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key:recap.key})});if(!response.ok){notify('Could not dismiss this recap yet.');return}setData(current=>current?{...current,weeklyRecap:null}:current)}

  if(!data)return <main className="shell"><Card className="animate-pulse p-5"><div className="h-7 w-48 bg-muted"/><div className="mt-5 h-3 bg-muted"/><div className="mt-5 grid grid-cols-2 gap-3"><div className="h-20 bg-muted"/><div className="h-20 bg-muted"/></div></Card><Nav/></main>
  return <main className="shell">
    <Card className="p-4 sm:p-7"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="eyebrow">TODAY’S QUEST</p><h1 className="mt-2 truncate text-2xl font-black tracking-tight">Hi, {data.user.displayName}</h1><p className="mt-1 text-sm text-muted-foreground">Level {data.user.level} · {data.user.title}</p></div><div className="shrink-0 border-2 border-border bg-muted px-3 py-2 text-center"><b className="block text-lg">{data.done}/{data.tasks.length}</b><span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">wins</span></div></div><div className="mt-6"><ExpBar current={data.user.totalExp} next={data.user.nextExp}/></div><div className="mt-5 grid grid-cols-2 gap-3"><div className="border-2 border-border bg-muted p-4"><span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-brand"><Flame className="size-3.5"/>Streak</span><b className="mt-1 block text-xl">{data.streak} day{data.streak===1?'':'s'}</b></div><div className="border-2 border-border bg-[rgb(var(--accent)/.18)] p-4"><span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-brand"><TrendingUp className="size-3.5"/>Growth</span><b className="mt-1 block text-xl">{data.growth===null?'Starting':`${data.growth>0?'+':''}${data.growth}%`}</b></div></div></Card>
    {data.welcomeBack&&<Card className="mt-4 bg-muted p-4"><b>{data.welcomeBack.message}</b><p className="mt-1 text-sm text-muted-foreground">{data.welcomeBack.daysMissed} day{data.welcomeBack.daysMissed===1?'':'s'} passed. Your next small win still counts.</p></Card>}
    {data.weeklyRecap&&<Card className="relative mt-4 p-4"><button type="button" aria-label="Dismiss weekly recap" onClick={()=>void dismissRecap(data.weeklyRecap!)} className="absolute right-3 top-3 grid size-8 place-items-center border-2 border-border bg-muted"><X className="size-4"/></button><p className="eyebrow pr-10">WEEKLY RECAP</p><p className="mt-2 pr-6 text-sm">Best day: <b>{data.weeklyRecap.bestDay??'Still to come'}</b> · Strongest: <b>{data.weeklyRecap.consistentCategory.replace('_',' ')}</b> · A gentle nudge: <b>{data.weeklyRecap.weakestCategory.replace('_',' ')}</b></p></Card>}
    <Card className="mt-4 border-[rgb(var(--warning))] bg-[rgb(var(--warning)/.14)] p-4"><p className="eyebrow">MONTHLY CHALLENGE</p><h2 className="mt-1 font-black">{data.challenge.title}</h2><p className="mt-1 text-sm text-muted-foreground">{data.challenge.description}</p><button disabled={Boolean(data.challenge.completedAt)} onClick={()=>void completeChallenge()} className="btn btn-secondary mt-3">{data.challenge.completedAt?'Completed':`Claim +${data.challenge.exp} EXP`}</button></Card>
    <section className="mt-7"><div className="mb-3 flex items-end justify-between gap-3"><div className="min-w-0"><p className="eyebrow">SHOW UP FOR YOURSELF</p><h2 className="mt-1 text-xl font-black">Today’s habits</h2></div><Link className="flex shrink-0 items-center gap-1 text-sm font-bold text-brand" href="/library">Add habit <Plus className="size-4"/></Link></div>{data.tasks.length?<div className="task-grid grid gap-3">{data.tasks.map((task,index)=><TaskCard key={task.id} task={task} index={index} onComplete={complete} onPause={id=>manageHabit(id,'pause')} onRemove={id=>manageHabit(id,'remove')}/>)}</div>:<Card className="p-8 text-center"><div className="mx-auto grid size-14 place-items-center border-2 border-border bg-muted text-2xl">🌱</div><h2 className="mt-3 font-black">Make today yours</h2><p className="mt-1 text-sm text-muted-foreground">Pick a habit from the library to begin.</p><Link className="btn btn-primary mt-4" href="/library">Explore habits <ArrowRight className="size-4"/></Link></Card>}</section>
    {toast&&<div role="status" className="fixed bottom-24 left-1/2 z-20 max-w-[calc(100vw-2rem)] -translate-x-1/2 border-2 border-border bg-card px-5 py-3 text-center text-sm font-bold text-foreground shadow-[4px_4px_0_rgb(var(--shadow))]">{toast}</div>}
    <BadgeToast badge={badges[0]??null} onClose={()=>setBadges(current=>current.slice(1))}/>
    <LevelUpModal level={levelUp?.level??null} palette={levelUp?.palette??null} mystery={levelUp?.mystery} onClose={()=>setLevelUp(null)}/>
    <Nav deemphasizeDiscovery={!data.discoverUnlocked}/>
  </main>
}
