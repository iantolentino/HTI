'use client'
import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
export function Heatmap({values=[]}:{values?:number[]}){const reduced=useReducedMotion();const days=Array.from({length:365},(_,i)=>values[i]??0);return <div className="overflow-x-auto"><div className="grid min-w-[620px] grid-flow-col grid-rows-7 gap-1">{days.map((v,i)=><motion.span key={i} title={`${v}% complete`} initial={reduced?false:{opacity:0,scale:.3}} animate={{opacity:1,scale:1}} transition={reduced?{duration:0}:{duration:.16,delay:Math.min(i*.004,.55)}} className={`heat ${v>75?'l3':v>45?'l2':v>0?'l1':''}`}/>)}</div></div>}
