'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Award, X } from 'lucide-react'

export type EarnedBadge = { key: string; name: string; description: string; icon: string }

export function BadgeToast({ badge, onClose }: { badge: EarnedBadge | null; onClose: () => void }) {
  const reduced = useReducedMotion()
  useEffect(() => {
    if (!badge) return
    const timeout = window.setTimeout(onClose, 5200)
    return () => window.clearTimeout(timeout)
  }, [badge, onClose])

  return <AnimatePresence>{badge && <motion.aside
    role="status"
    aria-live="polite"
    className="fixed bottom-24 left-1/2 z-40 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 border-2 border-border bg-card p-3 shadow-[4px_4px_0_rgb(var(--shadow))]"
    initial={reduced ? false : { opacity: 0, y: 28, scale: .86, rotate: -3 }}
    animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: [1, 1.04, 1], rotate: 0 }}
    exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: .92 }}
    transition={{ duration: .28, ease: 'easeOut' }}
  >
    <div className="flex items-start gap-3">
      <motion.span className="grid size-11 shrink-0 place-items-center border-2 border-border bg-[rgb(var(--warning))] text-2xl" animate={reduced ? {} : { rotate: [0, -9, 9, 0] }} transition={{ delay: .1, duration: .35 }}>{badge.icon}</motion.span>
      <div className="min-w-0 flex-1"><p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-brand"><Award className="size-3.5" /> Badge earned</p><b className="mt-1 block">{badge.name}</b><p className="mt-0.5 text-xs text-muted-foreground">{badge.description}</p></div>
      <button type="button" aria-label="Dismiss badge" onClick={onClose} className="grid size-8 place-items-center border-2 border-border bg-muted"><X className="size-4" /></button>
    </div>
  </motion.aside>}</AnimatePresence>
}
