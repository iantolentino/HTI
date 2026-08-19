'use client'
import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Zap } from 'lucide-react'
export function ExpBar({current,next}:{current:number;next:number}){const reduced=useReducedMotion();const pct=Math.min(100,Math.round(current/next*100));return <div aria-label={`Experience ${current} of ${next}`}><div className="flex items-center justify-between text-xs font-black"><span className="flex items-center gap-1.5"><Zap className="size-3.5 fill-accent text-accent"/>{current} EXP</span><span className="text-muted-foreground">{next-current} to level up</span></div><div className="mt-2 h-4 overflow-hidden border-2 border-border bg-card"><motion.div className="h-full origin-left bg-accent will-change-transform" initial={false} animate={{scaleX:pct/100}} transition={reduced?{duration:0}:{type:'spring',stiffness:170,damping:23}}/></div></div>}
