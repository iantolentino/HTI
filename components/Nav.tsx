'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChartNoAxesCombined, Home, LibraryBig, Palette, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { href: '/dashboard', label: 'Today', Icon: Home },
  { href: '/library', label: 'Library', Icon: LibraryBig },
  { href: '/analytics', label: 'Progress', Icon: ChartNoAxesCombined },
  { href: '/palettes', label: 'Rewards', Icon: Palette },
  { href: '/settings', label: 'Profile', Icon: UserRound },
];

export function Nav({deemphasizeDiscovery=false}:{deemphasizeDiscovery?:boolean}) {
  const pathname = usePathname();
  return <nav className="bottom-nav" aria-label="Primary navigation">{items.map(({ href, label, Icon }) => { const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`)); const hidden = deemphasizeDiscovery && !active && href !== '/dashboard' && href !== '/settings'; if (hidden) return null; return <Link key={href} className={cn('navlink', active && 'active')} aria-current={active ? 'page' : undefined} href={href}><span className="nav-icon"><Icon aria-hidden="true" /></span><span>{label}</span></Link> })}</nav>;
}
