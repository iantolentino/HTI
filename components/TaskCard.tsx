'use client'

import React, { useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Check, ChevronDown, CirclePause, NotebookPen, Sparkles, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type RegressionEntry = { date:string; oldTarget:number; newTarget:number }
export type Habit = { id:string; icon:string; name:string; category:string; target?:string|null; exp:number; done?:boolean; type?:string; regressions?:RegressionEntry[] }

type Props = { task:Habit; onComplete:(id:string,note?:string)=>Promise<void>|void; onPause?:(id:string)=>Promise<void>|void; onRemove?:(id:string)=>Promise<void>|void; index?:number }

export function TaskCard({task,onComplete,onPause,onRemove,index=0}:Props){
  const start=useRef(0)
  const [busy,setBusy]=useState(false)
  const [expanded,setExpanded]=useState(false)
  const [noteOpen,setNoteOpen]=useState(false)
  const [note,setNote]=useState('')
  const reduced=useReducedMotion()
  const complete=async(noteValue?:string)=>{
    if(busy||task.done)return
    setBusy(true)
    if(noteValue?.trim())await onComplete(task.id,noteValue.trim())
    else await onComplete(task.id)
    setBusy(false)
  }
  const manage=async(action:'pause'|'remove')=>{
    if(busy)return
    setBusy(true)
    if(action==='pause')await onPause?.(task.id)
    else await onRemove?.(task.id)
    setBusy(false)
  }
  return <motion.article initial={reduced?false:{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={reduced?{duration:0}:{delay:index*.045,duration:.24}} className={cn('card group relative overflow-hidden p-4',task.done&&'opacity-65')} onPointerDown={e=>{start.current=e.clientX}} onPointerUp={e=>{if(e.clientX-start.current>75)void complete()}}>
    <div className="flex items-start gap-3">
      <div className={cn('grid size-12 shrink-0 place-items-center border-2 border-border bg-accent text-2xl',task.done&&'bg-[rgb(var(--success))]')}><motion.span animate={task.done&&!reduced?{scale:[1,1.25,1],rotate:[0,-8,0]}:{}}>{task.done?<Check className="size-6"/>:task.icon}</motion.span></div>
      <div className="min-w-0 flex-1"><Badge>{task.category.replace('_',' ')}</Badge><h3 className="mt-2 truncate font-black tracking-tight">{task.name}</h3><p className="mt-1 text-sm text-muted-foreground">{task.target??'Quick daily win'} <span className="mx-1">·</span><span className="font-black text-brand">{task.exp} EXP</span></p></div>
      <motion.button whileTap={reduced?{}:{scale:.86,rotate:-8}} aria-label={`Complete ${task.name}`} disabled={busy||task.done} onClick={()=>void complete()} className={cn('grid size-11 shrink-0 place-items-center border-2 border-border bg-accent text-foreground shadow-[3px_3px_0_rgb(var(--shadow))] disabled:bg-[rgb(var(--success))] disabled:text-foreground disabled:shadow-none')}><span className="sr-only">{task.done?'Completed':'Complete'}</span>{task.done?<Check className="size-5"/>:<ArrowRight className="size-5"/>}</motion.button>
    </div>
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {!task.done&&<button type="button" onClick={()=>setNoteOpen(value=>!value)} className="inline-flex items-center gap-1 text-xs font-black text-brand underline decoration-2 underline-offset-4"><NotebookPen className="size-3.5"/>Add a note</button>}
      <button type="button" aria-expanded={expanded} onClick={()=>setExpanded(value=>!value)} className="ml-auto inline-flex items-center gap-1 text-xs font-black text-brand underline decoration-2 underline-offset-4">Details <ChevronDown className={cn('size-3.5 transition-transform',expanded&&'rotate-180')}/></button>
    </div>
    {noteOpen&&!task.done&&<form className="mt-3 border-t-2 border-border pt-3" onSubmit={event=>{event.preventDefault();void complete(note)}}><label className="grid gap-1.5 text-xs font-black uppercase tracking-wide text-muted-foreground">A small note for today<textarea value={note} maxLength={600} onChange={event=>setNote(event.target.value)} placeholder="What helped you show up?" className="min-h-20 resize-y border-2 border-border bg-card p-2 text-sm font-semibold text-foreground shadow-[2px_2px_0_rgb(var(--shadow))] outline-none"/></label><div className="mt-2 flex items-center justify-between gap-3"><span className="text-[11px] text-muted-foreground">Optional · {note.length}/600</span><button type="submit" disabled={busy} className="btn btn-primary px-3 py-2 text-xs">Complete with note</button></div></form>}
    {expanded&&<section className="mt-4 border-t-2 border-border pt-3" aria-label={`${task.name} details`}>
      <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">Target history</p>
      {task.type==='PROGRESSIVE'?(task.regressions?.length?<ul className="mt-2 space-y-2">{[...task.regressions].reverse().map((entry,index)=><li key={`${entry.date}-${index}`} className="border-2 border-[rgb(var(--warning))] bg-[rgb(var(--warning)/.14)] p-2 text-xs font-bold">Target lowered from {entry.oldTarget} → {entry.newTarget} on {entry.date}. We adjusted gently after three missed days.</li>)}</ul>:<p className="mt-2 text-sm text-muted-foreground">No target adjustments yet. If three difficult days stack up, your target will ease down and appear here.</p>):<p className="mt-2 text-sm text-muted-foreground">This is a steady, one-step habit with a flat EXP reward.</p>}
      {(onPause||onRemove)&&<div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={()=>void manage('pause')} className="btn btn-secondary px-3 py-2 text-xs"><CirclePause className="size-3.5"/>Pause habit</button><button type="button" disabled={busy} onClick={()=>void manage('remove')} className="btn px-3 py-2 text-xs !border-red-700 !bg-red-100 !text-red-800 !shadow-[2px_2px_0_#b91c1c] active:!shadow-none"><Trash2 className="size-3.5"/>Remove</button></div>}
    </section>}
    <p className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground"><Sparkles className="size-3.5 text-accent"/>Swipe right or tap when it is honestly done.</p>
  </motion.article>
}
