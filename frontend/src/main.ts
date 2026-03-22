import './style.css'
import { login, signup } from './api.ts'
import { clearSession, loadSession, saveSession } from './session.ts'
import type { AppScreen, AuthMode, MenuSection } from './types.ts'
import { renderApp } from './views.ts'

const root = document.querySelector<HTMLDivElement>('#app')

if (!root) {
  throw new Error('App root element was not found')
}

const appRoot = root

let currentScreen: AppScreen = {
  kind: 'auth',
  mode: 'login',
  values: {
    name: '',
    email: '',
    password: '',
  },
  loading: false,
  error: null,
  notice: null,
}

function getAuthValues() {
  return currentScreen.kind === 'auth'
    ? currentScreen.values
    : { name: '', email: '', password: '' }
}

function showAuth(mode: AuthMode, options?: { error?: string | null; notice?: string | null; values?: { name: string; email: string; password: string } }) {
  currentScreen = {
    kind: 'auth',
    mode,
    values: options?.values ?? getAuthValues(),
    loading: false,
    error: options?.error ?? null,
    notice: options?.notice ?? null,
  }
  render()
}

function showShell(section: MenuSection = 'overview') {
  const session = loadSession()

  if (!session) {
    showAuth('login')
    return
  }

  currentScreen = {
    kind: 'shell',
    session,
    activeSection: section,
  }
  render()
}

async function handleLoginSubmit(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    currentScreen = {
      kind: 'auth',
      mode: 'login',
      values: { name: '', email, password },
      loading: false,
      error: 'Enter both email and password.',
      notice: null,
    }
    render()
    return
  }

  currentScreen = {
    kind: 'auth',
    mode: 'login',
    values: { name: '', email, password },
    loading: true,
    error: null,
    notice: null,
  }
  render()

  try {
    const session = await login({ email, password })
    saveSession(session)
    showShell('overview')
  } catch (error) {
    currentScreen = {
      kind: 'auth',
      mode: 'login',
      values: { name: '', email, password },
      loading: false,
      error: error instanceof Error ? error.message : 'Login failed.',
      notice: null,
    }
    render()
  }
}

async function handleSignupSubmit(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!name || !email || !password) {
    currentScreen = {
      kind: 'auth',
      mode: 'signup',
      values: { name, email, password },
      loading: false,
      error: 'Enter your name, email, and password.',
      notice: null,
    }
    render()
    return
  }

  currentScreen = {
    kind: 'auth',
    mode: 'signup',
    values: { name, email, password },
    loading: true,
    error: null,
    notice: null,
  }
  render()

  try {
    await signup({ name, email, password })
    showAuth('login', {
      notice: 'Account created. You can sign in now.',
      values: { name: '', email, password: '' },
    })
  } catch (error) {
    currentScreen = {
      kind: 'auth',
      mode: 'signup',
      values: { name, email, password },
      loading: false,
      error: error instanceof Error ? error.message : 'Registration failed.',
      notice: null,
    }
    render()
  }
}

function handleAction(action: string, formData?: FormData) {
  if (action === 'submit-login' && formData) {
    void handleLoginSubmit(formData)
    return
  }

  if (action === 'submit-signup' && formData) {
    void handleSignupSubmit(formData)
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
    showAuth('login')
    return
  }

  if (
    action === 'overview' ||
    action === 'search' ||
    action === 'downloads' ||
    action === 'account'
  ) {
    showShell(action)
  }
}

function render() {
  renderApp(appRoot, currentScreen, handleAction)
}

if (loadSession()) {
  showShell('overview')
} else {
  render()
}
