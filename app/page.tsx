import Link from 'next/link';
import { ArrowRight, Check, Flame, Sparkles, Trophy, Zap } from 'lucide-react';

const features = [
  { icon: Zap, title: 'Earn real EXP', text: 'Small actions become visible momentum.' },
  { icon: Flame, title: 'Build your rhythm', text: 'Streaks reward consistency, never perfection.' },
  { icon: Trophy, title: 'Unlock your style', text: 'New palettes appear as you level up.' },
];

export default function Landing() {
  return <main className="shell flex min-h-screen flex-col justify-center py-8">
    <section className="px-2 py-4 sm:px-8 sm:py-10">
      <div className="max-w-3xl">
        <div className="flex items-center gap-2 text-sm font-black tracking-[.12em] text-brand"><span className="grid h-9 w-9 place-items-center border-2 border-border bg-accent text-foreground"><Sparkles className="h-5 w-5" /></span> LEVELUP DAILY</div>
        <p className="eyebrow mt-12">A gentler way to grow</p>
        <h1 className="mt-3 text-4xl font-black leading-[1.05] tracking-[-.04em] sm:text-6xl">Tiny actions.<br /><span className="text-brand">A stronger you.</span></h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">Turn the habits that matter into a daily adventure. Earn EXP, find your rhythm, and grow without the guilt.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link className="btn btn-primary" href="/register">Start your journey <ArrowRight className="h-4 w-4" /></Link><Link className="btn btn-secondary" href="/login">I already have an account</Link></div>
      </div>
      <div className="mt-12 grid gap-3 sm:grid-cols-3">{features.map(({ icon: Icon, title, text }) => <article key={title} className="card bg-card p-4"><Icon className="h-5 w-5 text-accent" /><b className="mt-4 block">{title}</b><p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p></article>)}</div>
      <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t-2 border-border pt-6 text-sm text-muted-foreground"><span className="flex items-center gap-2"><Check className="h-4 w-4 text-[rgb(var(--success))]" />7-day grace period</span><span className="flex items-center gap-2"><Check className="h-4 w-4 text-[rgb(var(--success))]" />No shame, just data</span><span className="flex items-center gap-2"><Check className="h-4 w-4 text-[rgb(var(--success))]" />Built for your phone</span></div>
    </section>
  </main>;
}
