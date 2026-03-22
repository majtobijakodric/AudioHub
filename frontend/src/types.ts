export type LoginRequest = {
  email: string
  password: string
}

export type AuthenticatedUser = {
  id: number
  name: string
  email: string
}

export type LoginResponse = {
  token: string
  user: AuthenticatedUser
}

export type StoredSession = LoginResponse

export type MenuSection = 'overview' | 'search' | 'downloads' | 'account'

export type LoginScreenState = {
  kind: 'login'
  values: LoginRequest
  loading: boolean
  error: string | null
}

export type ShellScreenState = {
  kind: 'shell'
  session: StoredSession
  activeSection: MenuSection
}

export type AppScreen = LoginScreenState | ShellScreenState
