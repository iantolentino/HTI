import React, { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn('rounded-2xl border border-[rgb(var(--ink)/.08)] bg-[rgb(var(--surface))] shadow-[0_12px_40px_rgb(24_28_40/.06)]', className)} {...props} />; }
