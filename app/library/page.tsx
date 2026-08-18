'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown, Layers3, Plus, Search, Settings2, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Nav } from '@/components/Nav';

type Unit = 'REPS' | 'MINUTES' | 'KM' | 'PAGES' | 'CUSTOM';
type Task = { id:string; name:string; icon:string; category:string; difficultyTag:string; whyThisHabit:string; type:string; baseTarget:number|null; unit:Unit|null };
type HabitOptions = { iconOverride?:string; personalTargetOverride?:string; unitOverride?:Unit };
type LibraryData = { tasks:Task[]; owned:{taskId:string;isPaused:boolean}[]; stacks:{id:string;name:string;description:string;tasks:{task:Task}[]}[] };

const EMOJIS = ['⚡', '💪', '🚶', '🧘', '📚', '🌿', '🥗', '💧', '🛁', '🌞', '🧠', '🎯'];
const UNITS:{value:Unit;label:string}[] = [{value:'REPS',label:'Reps'},{value:'MINUTES',label:'Minutes'},{value:'KM',label:'Kilometres'},{value:'PAGES',label:'Pages'},{value:'CUSTOM',label:'Custom count'}];

export default function Library() {
  const [data,setData] = useState<LibraryData|null>(null);
  const [query,setQuery] = useState('');
  const [filter,setFilter] = useState('ALL');
  const [category,setCategory] = useState('ALL');
  const [notice,setNotice] = useState('');
  const [customizingId,setCustomizingId] = useState<string|null>(null);
  const [options,setOptions] = useState<Record<string,HabitOptions>>({});
  const load = async () => { const response=await fetch('/api/habits'); if(response.ok) setData(await response.json() as LibraryData); };
  useEffect(() => { void load(); }, []);
  const items=useMemo(() => data?.tasks.filter(task => (filter==='ALL'||task.difficultyTag===filter)&&(category==='ALL'||task.category===category)&&task.name.toLowerCase().includes(query.toLowerCase()))??[],[data,filter,category,query]);
  const updateOptions=(taskId:string, patch:Partial<HabitOptions>) => setOptions(current=>({...current,[taskId]:{...current[taskId],...patch}}));

  async function add(taskId:string, override?:HabitOptions) {
    const selected=override??options[taskId]??{};
    const target=selected.personalTargetOverride?.trim();
    const personalTargetOverride=target?Number(target):undefined;
    if(target&&(personalTargetOverride===undefined||!Number.isSafeInteger(personalTargetOverride)||personalTargetOverride<1)){setNotice('Choose a whole-number target of at least 1.');return;}
    const response=await fetch('/api/habits',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({taskId,iconOverride:selected.iconOverride||undefined,personalTargetOverride,unitOverride:selected.unitOverride})});
    setNotice(response.ok?'Habit saved to your daily list.':'Could not save this habit. Check your target and try again.');
    if(response.ok){setCustomizingId(null);await load();}
  }

  if(!data)return <main className="shell"><Card className="animate-pulse p-6"><div className="h-8 w-56 rounded bg-[rgb(var(--primary)/.12)]"/><div className="mt-5 h-12 rounded bg-[rgb(var(--primary)/.08)]"/></Card><Nav/></main>;
  return <main className="shell">
    <header className="mb-6"><p className="eyebrow">BUILD YOUR ROUTINE</p><h1 className="mt-2 text-3xl font-black tracking-tight">Habit library</h1><p className="mt-2 text-[rgb(var(--muted))]">Choose habits that fit the life you actually live.</p></header>
    <div className="relative"><Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[rgb(var(--muted))]"/><input aria-label="Search habits" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search habits" className="h-12 w-full rounded-md border-2 border-border bg-[rgb(var(--surface))] pl-12 pr-4 shadow-[2px_2px_0_rgb(var(--shadow))] outline-none transition focus:bg-[rgb(var(--muted-bg))]"/></div>
    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">{['ALL','EASY','MEDIUM','HARD'].map(value=><Button key={value} type="button" onClick={()=>setFilter(value)} variant={filter===value?'primary':'secondary'} className="shrink-0">{value==='ALL'?'All levels':value[0]+value.slice(1).toLowerCase()}</Button>)}</div>
    <div className="mt-2 flex gap-2 overflow-x-auto pb-1" aria-label="Habit category filters">{['ALL','HEALTH','MENTAL','SELF_CARE','NUTRITION'].map(value=><Button key={value} type="button" onClick={()=>setCategory(value)} variant={category===value?'primary':'secondary'} className="shrink-0">{value==='ALL'?'All categories':value.replace('_',' ')}</Button>)}</div>
    <Card className="mt-6 p-5"><div className="flex items-start gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[rgb(var(--accent)/.14)]"><Layers3 className="h-5 w-5 text-[rgb(var(--accent))]"/></div><div><h2 className="font-black">Habit stacks</h2><p className="mt-1 text-sm text-[rgb(var(--muted))]">One tap for a ready-made rhythm.</p></div></div>{data.stacks.map(stack=><div key={stack.id} className="mt-4 flex items-center gap-3 border-t-2 border-border pt-4"><div className="min-w-0 flex-1"><b>{stack.name}</b><p className="mt-1 text-sm text-[rgb(var(--muted))]">{stack.description}</p></div><Button variant="secondary" onClick={()=>void Promise.all(stack.tasks.map(item=>add(item.task.id,{})))}><Plus className="h-4 w-4"/>Add</Button></div>)}</Card>
    {notice&&<p role="status" className="mt-4 border-2 border-border bg-[rgb(var(--muted-bg))] p-3 text-sm font-semibold text-[rgb(var(--foreground))] shadow-[2px_2px_0_rgb(var(--shadow))]">{notice}</p>}
    <div className="neo-stagger mt-6 grid gap-3">{items.map(task=>{
      const present=data.owned.some(owned=>owned.taskId===task.id&&!owned.isPaused);const isCustomizing=customizingId===task.id;const selected=options[task.id]??{};const displayIcon=selected.iconOverride??task.icon;
      return <Card className="p-4" key={task.id}><div className="flex gap-3"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[rgb(var(--primary)/.10)] text-2xl" aria-hidden="true">{displayIcon}</div><div className="min-w-0 flex-1"><Badge>{task.category.replace('_',' ')} · {task.difficultyTag}</Badge><h2 className="mt-2 font-extrabold">{task.name}</h2><p className="mt-1 text-sm leading-6 text-[rgb(var(--muted))]"><Sparkles className="mr-1 inline h-3.5 w-3.5 text-[rgb(var(--accent))]"/>{task.whyThisHabit}</p></div></div>
        <div className="mt-4 flex flex-wrap gap-2"><Button variant="secondary" size="sm" type="button" aria-expanded={isCustomizing} onClick={()=>setCustomizingId(isCustomizing?null:task.id)}><Settings2 className="h-4 w-4"/>Customize<ChevronDown className={`h-3.5 w-3.5 transition-transform ${isCustomizing?'rotate-180':''}`}/></Button><Button size="sm" type="button" onClick={()=>void add(task.id)}>{present?<><Check className="h-4 w-4"/>Save changes</>:<><Plus className="h-4 w-4"/>Add habit</>}</Button></div>
        {isCustomizing&&<fieldset className="mt-4 border-t-2 border-border pt-4"><legend className="sr-only">Customize {task.name}</legend><p className="text-xs font-black uppercase tracking-wide text-[rgb(var(--muted))]">Choose an icon</p><div className="mt-2 grid grid-cols-6 gap-2" role="radiogroup" aria-label={`Icon for ${task.name}`}>{EMOJIS.map(emoji=><button key={emoji} type="button" role="radio" aria-checked={displayIcon===emoji} aria-label={`Use ${emoji} for ${task.name}`} onClick={()=>updateOptions(task.id,{iconOverride:emoji})} className={`grid aspect-square place-items-center border-2 text-lg shadow-[2px_2px_0_rgb(var(--shadow))] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${displayIcon===emoji?'border-border bg-[rgb(var(--accent))]':'border-border bg-[rgb(var(--surface))]'}`}>{emoji}</button>)}</div>
          {task.type==='PROGRESSIVE'&&<div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="grid gap-1.5 text-sm font-black">Personal daily target <span className="font-medium text-[rgb(var(--muted))]">optional</span><input aria-label={`Personal target for ${task.name}`} inputMode="numeric" min="1" step="1" type="number" value={selected.personalTargetOverride??''} onChange={event=>updateOptions(task.id,{personalTargetOverride:event.target.value})} placeholder={task.baseTarget?`Formula starts at ${task.baseTarget}`:'Set a daily target'} className="h-11 rounded-md border-2 border-border bg-[rgb(var(--surface))] px-3 text-sm font-semibold shadow-[2px_2px_0_rgb(var(--shadow))] outline-none"/></label><label className="grid gap-1.5 text-sm font-black">Unit<select aria-label={`Unit for ${task.name}`} value={selected.unitOverride??task.unit??'CUSTOM'} onChange={event=>updateOptions(task.id,{unitOverride:event.target.value as Unit})} className="h-11 rounded-md border-2 border-border bg-[rgb(var(--surface))] px-3 text-sm font-semibold shadow-[2px_2px_0_rgb(var(--shadow))] outline-none">{UNITS.map(unit=><option key={unit.value} value={unit.value}>{unit.label}</option>)}</select></label></div>}
          <p className="mt-3 text-xs leading-5 text-[rgb(var(--muted))]">Your target replaces level scaling until you clear it. You can adjust it any time by saving new choices.</p></fieldset>}
      </Card>;
    })}{items.length===0&&<Card className="p-7 text-center"><div className="text-3xl">🔎</div><h2 className="mt-3 font-black">No habits match that search</h2><p className="mt-1 text-sm text-[rgb(var(--muted))]">Try another word, category, or difficulty level.</p></Card>}</div><Nav/>
  </main>;
}
