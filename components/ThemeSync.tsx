'use client'

import { useEffect } from 'react'

export type ThemeChange = { darkMode: boolean; accent?: string | null }
export const themeChangeEvent = 'levelup:theme-change'

export function applyTheme({ darkMode, accent }: ThemeChange) {
  const root = document.documentElement
  root.classList.toggle('dark', darkMode)
  if (accent) root.style.setProperty('--accent', accent)
  else root.style.removeProperty('--accent')
}

export function ThemeSync() {
  useEffect(() => {
    let active = true
    const onThemeChange = (event: Event) => applyTheme((event as CustomEvent<ThemeChange>).detail)
    window.addEventListener(themeChangeEvent, onThemeChange)
    void Promise.all([fetch('/api/me'), fetch('/api/palettes')])
      .then(async ([meResponse, palettesResponse]) => {
        if (!meResponse.ok || !active) return
        const me = await meResponse.json() as { darkMode: boolean }
        const paletteData = palettesResponse.ok
          ? await palettesResponse.json() as { activePaletteId: string | null; palettes: { id: string; name: string; colors: { accent?: string } }[] }
          : null
        const palette = paletteData?.palettes.find(item => item.id === paletteData.activePaletteId)
        applyTheme({ darkMode: me.darkMode, accent: palette?.name === 'Concrete' ? null : palette?.colors.accent ?? null })
      })
      .catch(() => undefined)
    return () => { active = false; window.removeEventListener(themeChangeEvent, onThemeChange) }
  }, [])
  return null
}
