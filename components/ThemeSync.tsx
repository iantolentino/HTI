'use client'
import { useEffect } from 'react'
export function ThemeSync(){useEffect(()=>{let active=true;fetch('/api/me').then(async response=>response.ok?await response.json() as {darkMode?:boolean}:null).then(me=>{if(active&&me)document.documentElement.classList.toggle('dark',me.darkMode===true)}).catch(()=>undefined);return()=>{active=false}},[]);return null}
