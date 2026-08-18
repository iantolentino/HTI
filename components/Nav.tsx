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

export function Nav() {
  const pathname = usePathname();
  return <nav className="bottom-nav" aria-label="Primary navigation">{items.map(({ href, label, Icon }) => <Link key={href} className={cn('navlink', pathname === href && 'active')} href={href}><Icon aria-hidden="true" /><span>{label}</span></Link>)}</nav>;
}
