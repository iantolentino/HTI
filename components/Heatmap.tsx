import React from 'react';
export function Heatmap({values=[]}:{values?:number[]}){const days=Array.from({length:365},(_,i)=>values[i]??0);return <div className="overflow-x-auto"><div className="grid min-w-[620px] grid-flow-col grid-rows-7 gap-1">{days.map((v,i)=><span key={i} title={`${v}% complete`} className={`heat ${v>75?'l3':v>45?'l2':v>0?'l1':''}`}/>)}</div></div>}
