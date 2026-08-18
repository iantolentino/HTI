import './globals.css';import type {Metadata} from 'next';
export const metadata:Metadata={title:'LevelUp Daily',description:'Build a life you want to level up.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
