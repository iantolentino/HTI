import React, { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn('rounded-md border-2 border-border bg-card text-card-foreground shadow-[4px_4px_0_rgb(var(--shadow))]', className)} {...props} />; }
export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />; }
export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn('p-6 pt-0', className)} {...props} />; }
export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn('flex items-center p-6 pt-0', className)} {...props} />; }
