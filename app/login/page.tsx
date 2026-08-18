'use client'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowRight, LockKeyhole, Sparkles } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Login() {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const router = useRouter()
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(''); setBusy(true)
    const f = new FormData(e.currentTarget)
    const r = await signIn('credentials', { redirect: false, email: f.get('email'), password: f.get('password') })
    setBusy(false)
    if (r?.error) { setError('That email and password do not match.'); return }
    router.push('/dashboard'); router.refresh()
  }
  return <main className="shell flex items-center"><Card className="mx-auto w-full max-w-md overflow-hidden border-brand/20 shadow-xl shadow-brand/5"><CardHeader className="space-y-3 bg-gradient-to-br from-brand/10 via-transparent to-transparent p-6"><a href="/" className="inline-flex items-center gap-2 text-sm font-black tracking-wide text-brand"><Sparkles className="size-4" /> LEVELUP DAILY</a><h1 className="text-3xl font-black tracking-tight">Welcome back</h1><p className="text-sm text-muted-foreground">Keep your streak alive, one honest win at a time.</p></CardHeader><CardContent className="p-6"><form onSubmit={submit} className="space-y-5">{error && <Alert className="border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"><AlertDescription>{error}</AlertDescription></Alert>}<div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" required name="email" type="email" autoComplete="email" /></div><div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" required name="password" type="password" autoComplete="current-password" /></div><Button disabled={busy} className="h-12 w-full" size="lg">{busy ? 'Logging in…' : <><LockKeyhole className="size-4" /> Log in <ArrowRight className="ml-auto size-4" /></>}</Button><p className="text-center text-sm text-muted-foreground">New here? <a className="font-bold text-brand hover:underline" href="/register">Create an account</a></p></form></CardContent></Card></main>
}
