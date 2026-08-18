import React, { type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'default' | 'lg' };

export function Button({ className, variant = 'primary', size = 'default', ...props }: ButtonProps) {
  return <button className={cn('inline-flex items-center justify-center gap-2 rounded-md border-2 border-border text-sm font-black shadow-[3px_3px_0_rgb(var(--shadow))] transition-[transform,box-shadow,background] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:pointer-events-none disabled:opacity-50', { 'min-h-9 px-3 text-xs': size === 'sm', 'min-h-11 px-4': size === 'default', 'min-h-12 px-5': size === 'lg', 'bg-accent text-foreground': variant === 'primary', 'bg-card text-foreground': variant === 'secondary', 'bg-muted text-foreground': variant === 'ghost', 'bg-red-500 text-white': variant === 'danger' }, className)} {...props} />;
}
