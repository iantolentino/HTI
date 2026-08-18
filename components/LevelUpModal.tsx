'use client'

import React from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Sparkles, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LevelUpModal({ level, palette, mystery = false, onClose }: { level: number | null; palette: string | null; mystery?: boolean; onClose: () => void }) {
  const reduced = useReducedMotion()
  return <AnimatePresence>{level !== null && <motion.div className="fixed inset-0 z-50 grid place-items-center bg-[rgb(var(--ink)/.72)] p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <motion.section role="dialog" aria-modal="true" aria-label="Level up" className="relative w-full max-w-sm overflow-hidden border-4 border-border bg-accent p-6 text-center text-foreground shadow-[8px_8px_0_rgb(var(--shadow))]" initial={reduced ? false : { scale: .65, rotate: -5 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 250, damping: 16 }}>
      <motion.div className="pointer-events-none absolute inset-0 opacity-25" animate={reduced ? {} : { rotate: [0, 4, -4, 0] }}><div className="absolute left-4 top-4 size-5 bg-brand" /><div className="absolute right-8 top-12 size-4 bg-white" /><div className="absolute bottom-7 left-10 size-4 bg-brand" /></motion.div>
      <Sparkles className="relative mx-auto size-10" /><p className="relative mt-4 font-black uppercase tracking-widest">Level up!</p><motion.p className="relative mt-1 text-7xl font-black leading-none" initial={{ scale: .4 }} animate={{ scale: 1 }} transition={{ delay: .15, type: 'spring' }}>{level}</motion.p><p className="relative mt-4 text-sm font-bold">Your momentum is getting loud.</p>
      {palette && (mystery ? <MysteryPaletteReveal name={palette} reduced={reduced} /> : <motion.div className="relative mt-5 border-2 border-border bg-brand p-3 text-white" initial={reduced ? false : { x: -12, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: .3 }}><Trophy className="mx-auto size-5" /><b className="mt-1 block">{palette} unlocked!</b></motion.div>)}
      <Button className="relative mt-6 w-full" onClick={onClose}>Keep going</Button>
    </motion.section>
  </motion.div>}</AnimatePresence>
}

function MysteryPaletteReveal({ name, reduced }: { name: string; reduced: boolean | null }) {
  const [revealed, setRevealed] = React.useState(Boolean(reduced))
  React.useEffect(() => {
    if (reduced) return
    const timeout = window.setTimeout(() => setRevealed(true), 1050)
    return () => window.clearTimeout(timeout)
  }, [reduced])
  return <motion.div className="relative mt-5 min-h-24 border-2 border-border bg-brand p-3 text-white" initial={reduced ? false : { rotateY: 0 }} animate={revealed ? { rotateY: 360, scale: [1, 1.08, 1] } : { x: [0, -5, 5, -4, 4, 0] }} transition={revealed ? { duration: .46, ease: 'easeOut' } : { duration: .5, repeat: 1, repeatDelay: .05 }} style={{ transformStyle: 'preserve-3d' }}>
    {revealed ? <motion.div initial={reduced ? false : { opacity: 0, scale: .6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .2 }}><Trophy className="mx-auto size-5" /><b className="mt-1 block">{name} revealed!</b><span className="mt-1 block text-[10px] font-black uppercase tracking-widest">Mystery palette</span></motion.div> : <><Sparkles className="mx-auto size-6 animate-pulse" /><b className="mt-2 block uppercase tracking-wider">Mystery reward</b><span className="mt-1 block text-xs">Hold tight…</span></>}
  </motion.div>
}
