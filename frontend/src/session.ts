import type { AuthenticatedUser, StoredSession } from './types.ts'

const sessionKey = 'audiohub.session'
const sessionDurationDays = 30

function clearLegacyStorage() {
  try {
    window.localStorage.removeItem(sessionKey)
  } catch {
    // Ignore storage failures so the app can keep working with cookies.
  }
}

function normalizeUser(value: unknown): AuthenticatedUser | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const user = value as Record<string, unknown>
  const email = typeof user.email === 'string' ? user.email.trim() : ''

  if (!email) {
    return null
  }

  const fallbackName = email.split('@')[0] || 'AudioHub User'
  const name = typeof user.name === 'string' && user.name.trim().length > 0
    ? user.name.trim()
    : fallbackName
  const id = typeof user.id === 'number' && Number.isFinite(user.id)
    ? user.id
    : 0

  return { id, name, email }
}

function normalizeSession(value: unknown): StoredSession | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const parsed = value as Record<string, unknown>
  const token = typeof parsed.token === 'string' ? parsed.token.trim() : ''
  const user = normalizeUser(parsed.user)
  const serverOrigin = typeof parsed.serverOrigin === 'string' ? parsed.serverOrigin.trim() : ''

  if (!token || !user || !serverOrigin) {
    return null
  }

  return { token, user, serverOrigin }
}

function isSecureProtocol() {
  return window.location.protocol === 'https:'
}

function clearCookie() {
  const parts = [
    `${sessionKey}=`,
    'Path=/',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    'SameSite=Lax',
  ]

  if (isSecureProtocol()) {
    parts.push('Secure')
  }

  document.cookie = parts.join('; ')
}

function readCookieSession(): StoredSession | null {
  const cookiePrefix = `${sessionKey}=`
  const cookies = document.cookie ? document.cookie.split('; ') : []
  const storedCookie = cookies.find((cookie) => cookie.startsWith(cookiePrefix))

  if (!storedCookie) {
    return null
  }

  try {
    const rawValue = storedCookie.slice(cookiePrefix.length)
    const parsed = JSON.parse(decodeURIComponent(rawValue))
    const session = normalizeSession(parsed)

    if (!session) {
      clearCookie()
      return null
    }

    return session
  } catch {
    clearCookie()
    return null
  }
}

function readLegacySession(): StoredSession | null {
  try {
    const rawValue = window.localStorage.getItem(sessionKey)

    if (!rawValue) {
      return null
    }

    const parsed = JSON.parse(rawValue)
    const session = normalizeSession(parsed)

    if (!session) {
      clearLegacyStorage()
      return null
    }

    return session
  } catch {
    clearLegacyStorage()
    return null
  }
}

export function loadSession(expectedServerOrigin?: string | null): StoredSession | null {
  const cookieSession = readCookieSession()

  if (cookieSession) {
    if (expectedServerOrigin && cookieSession.serverOrigin !== expectedServerOrigin) {
      clearSession()
      return null
    }

    return cookieSession
  }

  const legacySession = readLegacySession()

  if (!legacySession) {
    return null
  }

  if (expectedServerOrigin && legacySession.serverOrigin !== expectedServerOrigin) {
    clearSession()
    return null
  }

  saveSession(legacySession)
  clearLegacyStorage()
  return legacySession
}

export function saveSession(session: StoredSession) {
  const normalizedSession = normalizeSession(session)

  if (!normalizedSession) {
    clearSession()
    return
  }

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + sessionDurationDays)

  const parts = [
    `${sessionKey}=${encodeURIComponent(JSON.stringify(normalizedSession))}`,
    'Path=/',
    `Expires=${expiresAt.toUTCString()}`,
    'SameSite=Lax',
  ]

  if (isSecureProtocol()) {
    parts.push('Secure')
  }

  document.cookie = parts.join('; ')
  clearLegacyStorage()
}

export function clearSession() {
  clearCookie()
  clearLegacyStorage()
}
