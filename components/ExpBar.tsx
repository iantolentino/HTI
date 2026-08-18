import React from 'react';
import { Zap } from 'lucide-react';

export function ExpBar({ current, next }: { current: number; next: number }) {
  const pct = Math.min(100, Math.round(current / next * 100));
  return <div aria-label={`Experience ${current} of ${next}`}>
    <div className="flex items-center justify-between text-xs font-bold"><span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 fill-[rgb(var(--accent))] text-[rgb(var(--accent))]" />{current} EXP</span><span className="text-[rgb(var(--muted))]">{next - current} to level up</span></div>
    <div className="mt-2 h-3 overflow-hidden rounded-full bg-[rgb(var(--primary)/.12)]"><div className="h-full rounded-full bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--accent))] transition-all duration-700" style={{ width: `${pct}%` }} /></div>
  </div>;
}
