import type { StoredSession } from './types.ts'

const storageKey = 'audiohub.session'

export function loadSession(): StoredSession | null {
  const rawValue = window.localStorage.getItem(storageKey)

  if (!rawValue) {
    return null
  }

  try {
    const parsed = JSON.parse(rawValue) as StoredSession

    if (
      typeof parsed?.token !== 'string' ||
      !parsed.user ||
      typeof parsed.user.email !== 'string'
    ) {
      clearSession()
      return null
    }

    return parsed
  } catch {
    clearSession()
    return null
  }
}

export function saveSession(session: StoredSession) {
  window.localStorage.setItem(storageKey, JSON.stringify(session))
}

export function clearSession() {
  window.localStorage.removeItem(storageKey)
}
