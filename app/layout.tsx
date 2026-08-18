import './globals.css';import type {Metadata} from 'next';import {ThemeSync} from '@/components/ThemeSync';
export const metadata:Metadata={title:'LevelUp Daily',description:'Build a life you want to level up.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en" className="dark"><body><ThemeSync/>{children}</body></html>}
