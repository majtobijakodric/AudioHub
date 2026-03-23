import { login, probeServer, signup } from './api.ts'
import { createServerFormValues, loadRememberedServer, normalizeServerInput, saveRememberedServer } from './server.ts'
import { clearSession, loadSession, saveSession } from './session.ts'
import { applyTheme, loadTheme, saveTheme, toggleTheme } from './theme.ts'
import type {
  AppAction,
  AppScreen,
  AuthFormValues,
  AuthMode,
  ServerConfig,
  ServerFormValues,
  Theme,
} from './types.ts'
import { renderApp } from './views.ts'

const root = document.querySelector<HTMLDivElement>('#app')

if (!root) {
  throw new Error('App root element was not found')
}

const appRoot = root

function createEmptyAuthValues(): AuthFormValues {
  return {
    name: '',
    email: '',
    password: '',
  }
}

function getErrorText(error: unknown) {
  return error instanceof Error ? error.message : 'Failed to connect to server.'
}

let currentTheme: Theme = loadTheme()
let currentServer: ServerConfig | null = null
let currentScreen: AppScreen = {
  kind: 'connection',
  theme: currentTheme,
  values: createServerFormValues(loadRememberedServer()),
  loading: false,
  error: null,
  notice: null,
}

applyTheme(currentTheme)

function readConnectionValuesFromDom(): ServerFormValues {
  if (currentScreen.kind !== 'connection') {
    return createServerFormValues(currentServer)
  }

  const form = appRoot.querySelector<HTMLFormElement>('[data-connection-form]')

  if (!form) {
    return currentScreen.values
  }

  return {
    host: form.querySelector<HTMLInputElement>('[name="host"]')?.value ?? currentScreen.values.host,
    port: form.querySelector<HTMLInputElement>('[name="port"]')?.value ?? currentScreen.values.port,
  }
}

function getConnectionValues() {
  return currentScreen.kind === 'connection'
    ? readConnectionValuesFromDom()
    : createServerFormValues(currentServer)
}

function readAuthValuesFromDom(): AuthFormValues {
  if (currentScreen.kind !== 'auth') {
    return createEmptyAuthValues()
  }

  const form = appRoot.querySelector<HTMLFormElement>('[data-auth-form]')

  if (!form) {
    return currentScreen.values
  }

  return {
    name: form.querySelector<HTMLInputElement>('[name="name"]')?.value ?? currentScreen.values.name,
    email: form.querySelector<HTMLInputElement>('[name="email"]')?.value ?? currentScreen.values.email,
    password: form.querySelector<HTMLInputElement>('[name="password"]')?.value ?? currentScreen.values.password,
  }
}

function getAuthValues() {
  return currentScreen.kind === 'auth'
    ? readAuthValuesFromDom()
    : createEmptyAuthValues()
}

function showConnection(options?: {
  values?: ServerFormValues
  loading?: boolean
  error?: string | null
  notice?: string | null
}) {
  currentScreen = {
    kind: 'connection',
    theme: currentTheme,
    values: options?.values ?? getConnectionValues(),
    loading: options?.loading ?? false,
    error: options?.error ?? null,
    notice: options?.notice ?? null,
  }
  render()
}

function showAuth(
  mode: AuthMode,
  options?: { error?: string | null; notice?: string | null; values?: AuthFormValues },
) {
  if (!currentServer) {
    showConnection({
      error: 'Connect to a server first.',
      values: getConnectionValues(),
    })
    return
  }

  currentScreen = {
    kind: 'auth',
    theme: currentTheme,
    server: currentServer,
    mode,
    values: options?.values ?? getAuthValues(),
    loading: false,
    error: options?.error ?? null,
    notice: options?.notice ?? null,
  }
  render()
}

function showShell() {
  if (!currentServer) {
    showConnection({
      error: 'Connect to a server first.',
      values: getConnectionValues(),
    })
    return
  }

  const session = loadSession(currentServer.origin)

  if (!session) {
    showAuth('login')
    return
  }

  currentScreen = {
    kind: 'shell',
    theme: currentTheme,
    server: currentServer,
    session,
  }
  render()
}

function syncTheme(nextTheme: Theme) {
  currentTheme = nextTheme
  saveTheme(nextTheme)

  if (currentScreen.kind === 'connection') {
    currentScreen = {
      ...currentScreen,
      theme: nextTheme,
      values: getConnectionValues(),
    }
  } else if (currentScreen.kind === 'auth') {
    currentScreen = {
      ...currentScreen,
      theme: nextTheme,
      values: getAuthValues(),
    }
  } else {
    currentScreen = {
      ...currentScreen,
      theme: nextTheme,
    }
  }

  render()
}

function rememberConnectedServer(server: ServerConfig) {
  const previousServer = currentServer ?? loadRememberedServer()

  if (previousServer && previousServer.origin !== server.origin) {
    clearSession()
  }

  currentServer = server
  saveRememberedServer(server)
}

async function connectToServer(
  values: ServerFormValues,
  options?: { loadingNotice?: string | null },
) {
  let normalizedServer: ServerConfig

  try {
    normalizedServer = normalizeServerInput(values.host, values.port)
  } catch (error) {
    showConnection({
      values: {
        host: values.host.trim(),
        port: values.port.trim() || '8080',
      },
      error: getErrorText(error),
      notice: null,
    })
    return
  }

  const normalizedValues = createServerFormValues(normalizedServer)

  showConnection({
    values: normalizedValues,
    loading: true,
    error: null,
    notice: options?.loadingNotice ?? null,
  })

  try {
    await probeServer(normalizedServer)
  } catch (error) {
    showConnection({
      values: normalizedValues,
      loading: false,
      error: getErrorText(error),
      notice: null,
    })
    return
  }

  rememberConnectedServer(normalizedServer)

  if (loadSession(normalizedServer.origin)) {
    showShell()
    return
  }

  showAuth('login', {
    values: createEmptyAuthValues(),
  })
}

async function handleConnectionSubmit(formData: FormData) {
  const values = {
    host: String(formData.get('host') ?? ''),
    port: String(formData.get('port') ?? ''),
  }

  await connectToServer(values)
}

async function handleLoginSubmit(formData: FormData) {
  if (!currentServer) {
    showConnection({
      error: 'Connect to a server first.',
    })
    return
  }

  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const values = {
    ...getAuthValues(),
    email,
    password,
  }

  if (!email || !password) {
    currentScreen = {
      kind: 'auth',
      theme: currentTheme,
      server: currentServer,
      mode: 'login',
      values,
      loading: false,
      error: 'Enter both email and password.',
      notice: null,
    }
    render()
    return
  }

  currentScreen = {
    kind: 'auth',
    theme: currentTheme,
    server: currentServer,
    mode: 'login',
    values,
    loading: true,
    error: null,
    notice: null,
  }
  render()

  try {
    const session = await login({ email, password }, currentServer)
    saveSession({ ...session, serverOrigin: currentServer.origin })
    showShell()
  } catch (error) {
    currentScreen = {
      kind: 'auth',
      theme: currentTheme,
      server: currentServer,
      mode: 'login',
      values,
      loading: false,
      error: getErrorText(error),
      notice: null,
    }
    render()
  }
}

async function handleSignupSubmit(formData: FormData) {
  if (!currentServer) {
    showConnection({
      error: 'Connect to a server first.',
    })
    return
  }

  const name = String(formData.get('name') ?? '')
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const values = { name, email, password }

  if (!name.trim() || !email || !password) {
    currentScreen = {
      kind: 'auth',
      theme: currentTheme,
      server: currentServer,
      mode: 'signup',
      values,
      loading: false,
      error: 'Enter your name, email, and password.',
      notice: null,
    }
    render()
    return
  }

  currentScreen = {
    kind: 'auth',
    theme: currentTheme,
    server: currentServer,
    mode: 'signup',
    values,
    loading: true,
    error: null,
    notice: null,
  }
  render()

  try {
    await signup({ name: name.trim(), email, password }, currentServer)
  } catch (error) {
    currentScreen = {
      kind: 'auth',
      theme: currentTheme,
      server: currentServer,
      mode: 'signup',
      values,
      loading: false,
      error: getErrorText(error),
      notice: null,
    }
    render()
    return
  }

  try {
    const session = await login({ email, password }, currentServer)
    saveSession({ ...session, serverOrigin: currentServer.origin })
    showShell()
  } catch (error) {
    showAuth('login', {
      error: getErrorText(error),
      notice: 'Account created. Sign in to continue.',
      values: { name: '', email, password: '' },
    })
  }
}

function handleAction(action: AppAction, formData?: FormData) {
  if (action === 'submit-connection' && formData) {
    void handleConnectionSubmit(formData)
    return
  }

  if (action === 'submit-login' && formData) {
    void handleLoginSubmit(formData)
    return
  }

  if (action === 'submit-signup' && formData) {
    void handleSignupSubmit(formData)
    return
  }

  if (action === 'toggle-theme') {
    syncTheme(toggleTheme(currentTheme))
    return
  }

  if (action === 'show-login') {
    showAuth('login', { values: getAuthValues() })
    return
  }

  if (action === 'show-signup') {
    showAuth('signup', { values: getAuthValues() })
    return
  }

  if (action === 'logout') {
    clearSession()
    showAuth('login', {
      notice: 'You have been signed out.',
      values: createEmptyAuthValues(),
    })
    return
  }

  if (action === 'change-server') {
    showConnection({
      values: createServerFormValues(currentServer ?? loadRememberedServer()),
      notice: null,
      error: null,
    })
  }
}

function render() {
  renderApp(appRoot, currentScreen, handleAction)
}

async function initializeApp() {
  const rememberedServer = loadRememberedServer()

  if (!rememberedServer) {
    render()
    return
  }

  await connectToServer(createServerFormValues(rememberedServer), {
    loadingNotice: 'Checking the saved backend...',
  })
}

void initializeApp()
