'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { ArrowRight, Sparkles, UserPlus } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Register() {
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const router = useRouter()
  async function submit(e: React.FormEvent<HTMLFormElement>) { e.preventDefault(); setBusy(true); setError(''); const form = new FormData(e.currentTarget); const email = String(form.get('email')); const password = String(form.get('password')); const r = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, displayName: form.get('displayName'), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }) }); if (!r.ok) { setBusy(false); setError((await r.json()).error); return } const login = await signIn('credentials', { redirect: false, email, password }); setBusy(false); if (login?.error) { setError('Account created, but sign-in failed. Please log in.'); return } router.push('/onboarding') }
  return <main className="shell flex items-center"><Card className="mx-auto w-full max-w-md overflow-hidden border-brand/20 shadow-xl shadow-brand/5"><CardHeader className="space-y-3 bg-gradient-to-br from-brand/10 via-transparent to-transparent p-6"><a href="/" className="inline-flex items-center gap-2 text-sm font-black tracking-wide text-brand"><Sparkles className="size-4" /> LEVELUP DAILY</a><h1 className="text-3xl font-black tracking-tight">Begin your run</h1><p className="text-sm text-muted-foreground">Your first seven days are a grace period. Just show up.</p></CardHeader><CardContent className="p-6"><form onSubmit={submit} className="space-y-5">{error && <Alert className="border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"><AlertDescription>{error}</AlertDescription></Alert>}<div className="space-y-2"><Label htmlFor="displayName">Display name</Label><Input id="displayName" required name="displayName" minLength={2} placeholder="Your name" autoComplete="name" /></div><div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" required name="email" type="email" placeholder="you@example.com" autoComplete="email" /></div><div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" required name="password" type="password" minLength={8} placeholder="At least 8 characters" autoComplete="new-password" /></div><Button disabled={busy} className="h-12 w-full" size="lg">{busy ? 'Creating…' : <><UserPlus className="size-4" /> Create account <ArrowRight className="ml-auto size-4" /></>}</Button><p className="text-center text-sm text-muted-foreground">Already play? <a className="font-bold text-brand hover:underline" href="/login">Log in</a></p></form></CardContent></Card></main>
}
