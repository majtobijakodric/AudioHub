import type { LoginRequest, StoredSession } from './types.ts'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim()
  || 'http://localhost:8080/api'

function getErrorMessage(status: number, payload: unknown): string {
  if (
    payload &&
    typeof payload === 'object' &&
    'message' in payload &&
    typeof payload.message === 'string' &&
    payload.message.trim().length > 0
  ) {
    return payload.message
  }

  if (status === 400) return 'Please enter a valid email and password.'
  if (status === 401) return 'The password is incorrect.'
  if (status === 404) return 'No account was found for that email.'
  if (status >= 500) return 'The server is unavailable right now. Please try again.'

  return 'Unable to sign in right now.'
}

export async function login(credentials: LoginRequest): Promise<StoredSession> {
  const response = await fetch(`${apiBaseUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  let payload: unknown = null

  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(response.status, payload))
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
    throw new Error('The login response is missing required fields.')
  }

  const user = payload.user as Record<string, unknown>

  return {
    token: payload.token,
    user: {
      id: typeof user.id === 'number' ? user.id : 0,
      name: typeof user.name === 'string' ? user.name : 'User',
      email: typeof user.email === 'string' ? user.email : credentials.email,
    },
  }
}
