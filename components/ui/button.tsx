import React, { type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' };

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  return <button className={cn('inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition active:scale-[.98] disabled:pointer-events-none disabled:opacity-50', { 'bg-[rgb(var(--primary))] text-white shadow-lg shadow-[rgb(var(--primary)/.22)] hover:brightness-105': variant === 'primary', 'bg-[rgb(var(--primary)/.10)] text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary)/.16)]': variant === 'secondary', 'text-[rgb(var(--muted))] hover:bg-[rgb(var(--ink)/.06)] hover:text-[rgb(var(--ink))]': variant === 'ghost', 'bg-red-500 text-white hover:bg-red-600': variant === 'danger' }, className)} {...props} />;
}
