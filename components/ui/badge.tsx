import React, { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & { variant?: 'default' | 'secondary' | 'outline' }
export function Badge({ className, variant = 'default', ...props }: BadgeProps) { return <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[.12em]', variant === 'secondary' ? 'bg-muted text-muted-foreground' : variant === 'outline' ? 'border border-border text-foreground' : 'bg-[rgb(var(--primary)/.10)] text-[rgb(var(--primary))]', className)} {...props} />; }
