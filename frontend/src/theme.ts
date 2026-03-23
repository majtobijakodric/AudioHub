import type { Theme } from './types.ts'

const themeStorageKey = 'audiohub.theme'

function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme === 'dark' ? 'dark' : 'light'
}

export function loadTheme(): Theme {
  try {
    const storedTheme = window.localStorage.getItem(themeStorageKey)
    if (storedTheme === 'dark' || storedTheme === 'light') {
      return storedTheme
    }

    return getSystemTheme()
  } catch {
    return getSystemTheme()
  }
}

export function saveTheme(theme: Theme) {
  applyTheme(theme)

  try {
    window.localStorage.setItem(themeStorageKey, theme)
  } catch {
    // Ignore storage failures so the UI can continue rendering.
  }
}

export function toggleTheme(theme: Theme): Theme {
  return theme === 'dark' ? 'light' : 'dark'
}
