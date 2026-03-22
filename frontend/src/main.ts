import './style.css'
import { login } from './api.ts'
import { clearSession, loadSession, saveSession } from './session.ts'
import type { AppScreen, MenuSection } from './types.ts'
import { renderApp } from './views.ts'

const root = document.querySelector<HTMLDivElement>('#app')

if (!root) {
  throw new Error('App root element was not found')
}

const appRoot = root

let currentScreen: AppScreen = {
  kind: 'login',
  values: {
    email: '',
    password: '',
  },
  loading: false,
  error: null,
}

function showLogin(error: string | null = null) {
  currentScreen = {
    kind: 'login',
    values: currentScreen.kind === 'login'
      ? currentScreen.values
      : { email: '', password: '' },
    loading: false,
    error,
  }
  render()
}

function showShell(section: MenuSection = 'overview') {
  const session = loadSession()

  if (!session) {
    showLogin()
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
      kind: 'login',
      values: { email, password },
      loading: false,
      error: 'Enter both email and password.',
    }
    render()
    return
  }

  currentScreen = {
    kind: 'login',
    values: { email, password },
    loading: true,
    error: null,
  }
  render()

  try {
    const session = await login({ email, password })
    saveSession(session)
    showShell('overview')
  } catch (error) {
    currentScreen = {
      kind: 'login',
      values: { email, password },
      loading: false,
      error: error instanceof Error ? error.message : 'Login failed.',
    }
    render()
  }
}

function handleAction(action: string, formData?: FormData) {
  if (action === 'submit-login' && formData) {
    void handleLoginSubmit(formData)
    return
  }

  if (action === 'logout') {
    clearSession()
    showLogin()
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
