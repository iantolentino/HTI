'use client';
import React, { useRef, useState } from 'react';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type Habit = { id: string; icon: string; name: string; category: string; target?: string; exp: number; done?: boolean };

export function TaskCard({ task, onComplete }: { task: Habit; onComplete: (id: string) => Promise<void> | void }) {
  const start = useRef(0); const [busy, setBusy] = useState(false);
  const complete = async () => { if (busy || task.done) return; setBusy(true); await onComplete(task.id); setBusy(false); };
  return <article className={cn('card group relative overflow-hidden p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_44px_rgb(24_28_40/.10)]', task.done && 'opacity-65')} onPointerDown={e => { start.current = e.clientX; }} onPointerUp={e => { if (e.clientX - start.current > 75) void complete(); }}>
    <div className="flex items-start gap-3">
      <div className={cn('grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[rgb(var(--primary)/.10)] text-2xl transition group-hover:scale-105', task.done && 'bg-emerald-500/15')}>{task.done ? <Check className="h-6 w-6 text-emerald-600" /> : task.icon}</div>
      <div className="min-w-0 flex-1"><Badge>{task.category.replace('_', ' ')}</Badge><h3 className="mt-2 truncate font-extrabold tracking-tight">{task.name}</h3><p className="mt-1 text-sm text-[rgb(var(--muted))]">{task.target ?? 'Quick daily win'} <span className="mx-1 text-[rgb(var(--ink)/.22)]">·</span> <span className="font-bold text-[rgb(var(--primary))]">{task.exp} EXP</span></p></div>
      <button aria-label={`Complete ${task.name}`} disabled={busy || task.done} onClick={() => void complete()} className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[rgb(var(--primary))] text-white shadow-lg shadow-[rgb(var(--primary)/.22)] transition hover:scale-105 disabled:bg-emerald-500/15 disabled:text-emerald-600 disabled:shadow-none')}><span className="sr-only">{task.done ? 'Completed' : 'Complete'}</span>{task.done ? <Check className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}</button>
    </div>
    <p className="mt-4 flex items-center gap-1.5 text-[11px] font-medium text-[rgb(var(--muted))]"><Sparkles className="h-3.5 w-3.5 text-[rgb(var(--accent))]" />Swipe right or tap when it is honestly done.</p>
  </article>;
}
