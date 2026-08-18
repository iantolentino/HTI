'use client'
import { useEffect } from 'react'
type Palette={id:string;colors:{secondary?:string;accent?:string};owned:boolean}
export function ThemeSync(){useEffect(()=>{let active=true;Promise.all([fetch('/api/me'),fetch('/api/palettes')]).then(async([me,palettes])=>[me.ok?await me.json() as {darkMode?:boolean}:null,palettes.ok?await palettes.json() as {activePaletteId?:string;palettes:Palette[]}:null] as const).then(([me,data])=>{if(!active)return;if(me)document.documentElement.classList.toggle('dark',me.darkMode!==false);const palette=data?.palettes.find(item=>item.id===data.activePaletteId);if(palette){document.documentElement.style.setProperty('--accent',palette.colors.accent??palette.colors.secondary??'255 90 54')}}).catch(()=>undefined);return()=>{active=false}},[]);return null}
