import type { LoginRequest, LoginResponse, ServerConfig, SignupRequest } from './types.ts'

const devFallbackApiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ?? ''
const defaultApiBaseUrl = 'http://localhost:8080/api'

const connectionErrorMessage = 'Failed to connect to server.'
const connectionTimeoutMs = 5000

function resolveApiBaseUrl(server?: ServerConfig): string {
  const runtimeApiBaseUrl = server?.apiBaseUrl.trim()

  if (runtimeApiBaseUrl) {
    return runtimeApiBaseUrl
  }

  if (devFallbackApiBaseUrl) {
    return devFallbackApiBaseUrl
  }

  return defaultApiBaseUrl
}

function getPayloadMessage(payload: unknown): string | null {
  if (
    payload &&
    typeof payload === 'object' &&
    'message' in payload &&
    typeof payload.message === 'string' &&
    payload.message.trim().length > 0
  ) {
    return payload.message.trim()
  }

  return null
}

function getLoginErrorMessage(status: number, payload: unknown): string {
  if (status === 400) return 'Please enter a valid email and password.'
  if (status === 401) return 'The password is incorrect.'
  if (status === 404) return 'No account was found for that email.'
  if (status >= 500) return connectionErrorMessage

  return getPayloadMessage(payload) ?? 'Unable to sign in right now.'
}

function getSignupErrorMessage(status: number, payload: unknown): string {
  if (status === 400) return 'Enter your name, email, and password.'
  if (status === 409) return 'An account with that email already exists.'
  if (status >= 500) return connectionErrorMessage

  return getPayloadMessage(payload) ?? 'Unable to create the account right now.'
}

async function fetchWithTimeout(input: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), connectionTimeoutMs)

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    })
  } catch {
    throw new Error(connectionErrorMessage)
  } finally {
    window.clearTimeout(timeoutId)
  }
}

async function readResponsePayload(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return null
  }
}

function isHealthPayload(payload: unknown) {
  return (
    payload &&
    typeof payload === 'object' &&
    'ok' in payload &&
    payload.ok === true &&
    'service' in payload &&
    payload.service === 'audiohub'
  )
}

async function requestJson(
  server: ServerConfig | undefined,
  path: string,
  payload: LoginRequest | SignupRequest,
) {
  let response: Response

  try {
    response = await fetchWithTimeout(`${resolveApiBaseUrl(server)}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  } catch (error) {
    throw error instanceof Error ? error : new Error(connectionErrorMessage)
  }

  const responsePayload = await readResponsePayload(response)

  return { response, payload: responsePayload }
}

export async function probeServer(server?: ServerConfig): Promise<void> {
  const response = await fetchWithTimeout(`${resolveApiBaseUrl(server)}/health`, {
    headers: {
      Accept: 'application/json',
    },
  })
  const payload = await readResponsePayload(response)

  if (!response.ok || !isHealthPayload(payload)) {
    throw new Error(connectionErrorMessage)
  }
}

export async function login(credentials: LoginRequest, server?: ServerConfig): Promise<LoginResponse> {
  const { response, payload } = await requestJson(server, '/auth/login', credentials)

  if (!response.ok) {
    throw new Error(getLoginErrorMessage(response.status, payload))
  }

  if (
    !payload ||
    typeof payload !== 'object' ||
    !('token' in payload) ||
    typeof payload.token !== 'string' ||
    !('user' in payload) ||
    !payload.user ||
    typeof payload.user !== 'object'
  ) {
    throw new Error(connectionErrorMessage)
  }

  const user = payload.user as Record<string, unknown>
  const email = typeof user.email === 'string' && user.email.trim().length > 0
    ? user.email.trim()
    : credentials.email
  const name = typeof user.name === 'string' && user.name.trim().length > 0
    ? user.name.trim()
    : email.split('@')[0] || 'AudioHub User'
  const id = typeof user.id === 'number' && Number.isFinite(user.id)
    ? user.id
    : 0

  return {
    token: payload.token,
    user: {
      id,
      name,
      email,
    },
  }
}

export async function signup(credentials: SignupRequest, server?: ServerConfig): Promise<void> {
  const { response, payload } = await requestJson(server, '/auth/signup', credentials)

  if (!response.ok) {
    throw new Error(getSignupErrorMessage(response.status, payload))
  }
}
