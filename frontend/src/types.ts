export type LoginRequest = {
  email: string
  password: string
}

export type SignupRequest = {
  name: string
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

export type AuthMode = 'login' | 'signup'

export type AuthFormValues = {
  name: string
  email: string
  password: string
}

export type AuthScreenState = {
  kind: 'auth'
  mode: AuthMode
  values: AuthFormValues
  loading: boolean
  error: string | null
  notice: string | null
}

export type ShellScreenState = {
  kind: 'shell'
  session: StoredSession
  activeSection: MenuSection
}

export type AppScreen = AuthScreenState | ShellScreenState
