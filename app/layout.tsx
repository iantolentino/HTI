import './globals.css';import type {Metadata} from 'next';import {ThemeSync} from '@/components/ThemeSync';
export const metadata:Metadata={title:'LevelUp Daily',description:'Build a life you want to level up.',icons:{icon:[{url:'/favicon.ico'},{url:'/icon.png',type:'image/png',sizes:'32x32'}],apple:[{url:'/apple-icon.png',type:'image/png',sizes:'180x180'}]}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en" className="dark"><body><ThemeSync/>{children}</body></html>}
