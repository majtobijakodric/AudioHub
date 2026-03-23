import type { RememberedServer, ServerConfig, ServerFormValues } from './types.ts'

const rememberedServerKey = 'audiohub.server'
const defaultPort = 8080
const devFallbackApiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ?? ''
const localDevelopmentHosts = new Set(['localhost', '127.0.0.1', '[::1]', '0.0.0.0'])

function createDefaultValues(): ServerFormValues {
  return {
    host: '',
    port: String(defaultPort),
  }
}

function parseServerLikeValue(value: string): URL | null {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return null
  }

  if (trimmedValue.includes('://')) {
    try {
      return new URL(trimmedValue)
    } catch {
      return null
    }
  }

  try {
    return new URL(`http://${trimmedValue}`)
  } catch {
    return null
  }
}

function normalizePort(portInput: string): number {
  const normalizedPort = Number.parseInt(portInput, 10)

  if (!Number.isInteger(normalizedPort) || normalizedPort < 1 || normalizedPort > 65535) {
    throw new Error('Enter a valid backend port.')
  }

  return normalizedPort
}

function isLocalDevelopmentHost(host: string) {
  return localDevelopmentHosts.has(host.toLowerCase())
}

function normalizeStoredServer(value: unknown): RememberedServer | null {
  if (!value) {
    return null
  }

  if (typeof value === 'string') {
    try {
      return normalizeServerInput(value, '')
    } catch {
      return null
    }
  }

  if (typeof value !== 'object') {
    return null
  }

  const parsed = value as Record<string, unknown>
  const host = typeof parsed.host === 'string' ? parsed.host : ''
  const portValue = parsed.port
  const port = typeof portValue === 'number' ? String(portValue) : typeof portValue === 'string' ? portValue : ''

  try {
    return normalizeServerInput(host, port)
  } catch {
    return null
  }
}

function readDevFallbackServer(): ServerConfig | null {
  if (!devFallbackApiBaseUrl) {
    return null
  }

  try {
    return normalizeServerInput(devFallbackApiBaseUrl, '')
  } catch {
    return null
  }
}

export function normalizeServerInput(hostInput: string, portInput: string): ServerConfig {
  const parsedValue = parseServerLikeValue(hostInput)

  if (!parsedValue || !parsedValue.hostname) {
    throw new Error('Enter a backend host or IP address.')
  }

  const host = parsedValue.hostname.trim()

  if (!host) {
    throw new Error('Enter a backend host or IP address.')
  }

  const resolvedPortInput = portInput.trim() || parsedValue.port || String(defaultPort)
  const port = normalizePort(resolvedPortInput)
  const protocol = isLocalDevelopmentHost(host) ? 'http:' : 'https:'
  const origin = `${protocol}//${host}:${port}`

  return {
    host,
    port,
    origin,
    apiBaseUrl: `${origin}/api`,
  }
}

export function createServerFormValues(server: ServerConfig | null = null): ServerFormValues {
  const fallbackServer = server ?? readDevFallbackServer()

  if (!fallbackServer) {
    return createDefaultValues()
  }

  return {
    host: fallbackServer.host,
    port: String(fallbackServer.port),
  }
}

export function loadRememberedServer(): RememberedServer | null {
  try {
    const rawValue = window.localStorage.getItem(rememberedServerKey)

    if (!rawValue) {
      return null
    }

    const parsed = JSON.parse(rawValue)
    const rememberedServer = normalizeStoredServer(parsed)

    if (!rememberedServer) {
      window.localStorage.removeItem(rememberedServerKey)
      return null
    }

    return rememberedServer
  } catch {
    try {
      window.localStorage.removeItem(rememberedServerKey)
    } catch {
      // Ignore storage failures so the app can continue using runtime state.
    }

    return null
  }
}

export function saveRememberedServer(server: ServerConfig) {
  try {
    window.localStorage.setItem(
      rememberedServerKey,
      JSON.stringify({
        host: server.host,
        port: server.port,
      }),
    )
  } catch {
    // Ignore storage failures so the app can continue using runtime state.
  }
}
