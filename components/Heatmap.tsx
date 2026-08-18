'use client'
import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
export function Heatmap({ values = [] }: { values?: number[] }) {
  const reduced = useReducedMotion()
  const days = Array.from({ length: 365 }, (_, index) => values[index] ?? 0)

  return <div className="overflow-x-auto" role="img" aria-label="Contribution graph, 365 days">
    <div className="grid min-w-[620px] grid-flow-col grid-rows-7 gap-1">
      {days.map((value, index) => <motion.span key={index} title={`${value}% complete`} initial={reduced ? false : { opacity: 0, scale: .3 }} animate={{ opacity: 1, scale: 1 }} transition={reduced ? { duration: 0 } : { duration: .16, delay: Math.min(index * .004, .55) }} className={`heat ${value > 75 ? 'l3' : value > 45 ? 'l2' : value > 0 ? 'l1' : ''}`} />)}
    </div>
  </div>
}
