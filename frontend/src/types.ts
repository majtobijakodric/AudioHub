export type Theme = 'light' | 'dark'

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

export type ServerFormValues = {
  host: string
  port: string
}

export type ServerConfig = {
  host: string
  port: number
  origin: string
  apiBaseUrl: string
}

export type RememberedServer = ServerConfig

export type StoredSession = LoginResponse & {
  serverOrigin: string
}

export type AppAction =
  | 'submit-connection'
  | 'submit-login'
  | 'submit-signup'
  | 'show-login'
  | 'show-signup'
  | 'toggle-theme'
  | 'logout'
  | 'change-server'

export type AuthMode = 'login' | 'signup'

export type AuthFormValues = {
  name: string
  email: string
  password: string
}

type ScreenBase = {
  theme: Theme
}

export type ConnectionScreenState = ScreenBase & {
  kind: 'connection'
  values: ServerFormValues
  loading: boolean
  error: string | null
  notice: string | null
}

export type AuthScreenState = ScreenBase & {
  kind: 'auth'
  server: ServerConfig
  mode: AuthMode
  values: AuthFormValues
  loading: boolean
  error: string | null
  notice: string | null
}

export type ShellScreenState = ScreenBase & {
  kind: 'shell'
  server: ServerConfig
  session: StoredSession
}

export type AppScreen = ConnectionScreenState | AuthScreenState | ShellScreenState
