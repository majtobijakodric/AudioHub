import type { AppAction, AppScreen, AuthMode, Theme } from './types.ts'

type ActionHandler = (action: AppAction, formData?: FormData) => void

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function renderThemeToggle(theme: Theme) {
  const nextThemeLabel = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'

  return `
    <button
      type="button"
      class="theme-toggle"
      data-action="toggle-theme"
      title="${nextThemeLabel}"
      aria-label="${nextThemeLabel}"
    >
      <span class="theme-toggle-label">Theme</span>
      <span class="theme-toggle-track" data-theme="${theme}">
        <span class="theme-toggle-thumb"></span>
        <span class="theme-toggle-option ${theme === 'light' ? 'is-active' : ''}">Light</span>
        <span class="theme-toggle-option ${theme === 'dark' ? 'is-active' : ''}">Dark</span>
      </span>
    </button>
  `
}

function renderStatusMessages(error: string | null, notice: string | null) {
  if (!error && !notice) {
    return ''
  }

  return `
    <div class="status-stack" aria-live="polite">
      ${notice ? `<p class="status-banner is-notice">${escapeHtml(notice)}</p>` : ''}
      ${error ? `<p class="status-banner is-error">${escapeHtml(error)}</p>` : ''}
    </div>
  `
}

function renderFrame(content: string, theme: Theme, options?: { showThemeToggle?: boolean }) {
  const headerMarkup = options?.showThemeToggle
    ? `
        <header class="page-topbar fade-item" style="--delay: 0ms;">
          <div class="page-topbar-spacer" aria-hidden="true"></div>
          ${renderThemeToggle(theme)}
        </header>
      `
    : ''

  return `
    <main class="page-shell">
      <div class="page-frame">
        ${headerMarkup}

        ${content}
      </div>
    </main>
  `
}

function renderConnection(screen: Extract<AppScreen, { kind: 'connection' }>) {
  const isDisabled = screen.loading ? 'disabled aria-busy="true"' : ''
  const buttonLabel = screen.loading ? 'Checking server...' : 'Connect'

  return renderFrame(`
    <div class="connection-stage">
      <section class="panel connection-panel connection-panel-centered fade-item" style="--delay: 70ms;">
        <div class="panel-header">
          <div class="panel-copy">
            <div class="connection-title-row">
              <h1 class="section-title connection-title">Connect to an AudioHub backend</h1>
              <span class="tooltip-anchor tooltip-top-right title-hint" tabindex="0" aria-label="About this frontend">
                Why
                <span class="tooltip-bubble">
                  This is the frontend. It can connect to any AudioHub backend you want to use.
                </span>
              </span>
            </div>
          </div>
        </div>

        <form class="form-grid connection-form" data-form="connection" data-connection-form="true" novalidate>
          <label class="field field-host">
            <span class="field-label">
              <span class="tooltip-anchor tooltip-top-left" tabindex="0">
                Host or IP
                <span class="tooltip-bubble">
                  Write or paste the IP address or the hostname of the server.
                </span>
              </span>
            </span>
            <input
              class="field-input"
              type="text"
              name="host"
              placeholder=""
              autocomplete="url"
              spellcheck="false"
              value="${escapeHtml(screen.values.host)}"
              ${isDisabled}
            />
          </label>

          <label class="field field-port">
            <span class="field-label">
              <span class="tooltip-anchor tooltip-top-left" tabindex="0">
                Port
                <span class="tooltip-bubble">
                  The default port is 8080. If you changed the port on the backend, change it here too.
                </span>
              </span>
            </span>
            <input
              class="field-input"
              type="text"
              name="port"
              inputmode="numeric"
              placeholder="8080"
              autocomplete="off"
              value="${escapeHtml(screen.values.port)}"
              ${isDisabled}
            />
          </label>

          ${renderStatusMessages(screen.error, screen.notice)}

          <div class="form-actions">
            <button class="primary-button" type="submit" ${isDisabled}>
              ${buttonLabel}
            </button>
          </div>
        </form>
      </section>
    </div>
  `, screen.theme)
}

function renderAuthTabs(mode: AuthMode) {
  return `
    <div class="auth-tabs" role="tablist" aria-label="Authentication">
      <button
        type="button"
        class="auth-tab ${mode === 'login' ? 'is-active' : ''}"
        data-action="show-login"
        role="tab"
        aria-selected="${mode === 'login'}"
      >
        Sign in
      </button>
      <button
        type="button"
        class="auth-tab ${mode === 'signup' ? 'is-active' : ''}"
        data-action="show-signup"
        role="tab"
        aria-selected="${mode === 'signup'}"
      >
        Register
      </button>
    </div>
  `
}

function renderAuth(screen: Extract<AppScreen, { kind: 'auth' }>) {
  const isSignup = screen.mode === 'signup'
  const isDisabled = screen.loading ? 'disabled aria-busy="true"' : ''
  const title = isSignup ? 'Create an account' : 'Sign in'
  const subtitle = isSignup
    ? 'This account will be created on the connected backend.'
    : 'Authentication is now scoped to the backend you just verified.'
  const buttonLabel = screen.loading
    ? (isSignup ? 'Creating account...' : 'Signing in...')
    : (isSignup ? 'Create account' : 'Sign in')
  const passwordAutocomplete = isSignup ? 'new-password' : 'current-password'

  return renderFrame(`
    <section class="panel auth-panel fade-item" style="--delay: 70ms;">
      <div class="panel-header">
        <div class="panel-copy">
          <p class="eyebrow">Authentication</p>
          <h1 class="section-title">${title}</h1>
          <p class="body-copy">${subtitle}</p>
        </div>
        <button type="button" class="secondary-button" data-action="change-server">
          Change server
        </button>
      </div>

      <div class="server-chip" aria-label="Connected backend">
        <span class="server-chip-label">Backend</span>
        <span class="server-chip-value">${escapeHtml(screen.server.origin)}</span>
      </div>

      ${renderAuthTabs(screen.mode)}

      <form class="form-grid auth-form" data-form="${isSignup ? 'signup' : 'login'}" data-auth-form="true" novalidate>
        ${isSignup ? `
          <label class="field field-span">
            <span class="field-label">Name</span>
            <input
              class="field-input"
              type="text"
              name="name"
              placeholder="Your name"
              autocomplete="name"
              value="${escapeHtml(screen.values.name)}"
              ${isDisabled}
            />
          </label>
        ` : ''}

        <label class="field field-span">
          <span class="field-label">Email</span>
          <input
            class="field-input"
            type="email"
            name="email"
            placeholder="name@example.com"
            autocomplete="email"
            value="${escapeHtml(screen.values.email)}"
            ${isDisabled}
          />
        </label>

        <label class="field field-span">
          <span class="field-label">Password</span>
          <input
            class="field-input"
            type="password"
            name="password"
            placeholder="${isSignup ? 'Choose a password' : 'Enter your password'}"
            autocomplete="${passwordAutocomplete}"
            value="${escapeHtml(screen.values.password)}"
            ${isDisabled}
          />
        </label>

        ${renderStatusMessages(screen.error, screen.notice)}

        <div class="form-actions">
          <button class="primary-button" type="submit" ${isDisabled}>
            ${buttonLabel}
          </button>
        </div>
      </form>
    </section>
  `, screen.theme)
}

function renderShell(screen: Extract<AppScreen, { kind: 'shell' }>) {
  return renderFrame(`
    <section class="panel shell-panel fade-item" style="--delay: 70ms;">
      <div class="panel-header shell-header">
        <div class="panel-copy">
          <p class="eyebrow">Signed in</p>
          <h1 class="section-title">AudioHub is connected</h1>
          <p class="body-copy">
            This session stays tied to the selected backend. Switching servers returns you to connection setup first.
          </p>
        </div>

        <div class="button-row">
          <button type="button" class="secondary-button" data-action="change-server">
            Change server
          </button>
          <button type="button" class="primary-button primary-button-inline" data-action="logout">
            Log out
          </button>
        </div>
      </div>

      <div class="info-grid">
        <article class="info-card">
          <p class="detail-label">Backend</p>
          <h2 class="detail-title">${escapeHtml(screen.server.origin)}</h2>
          <p class="detail-copy">${escapeHtml(screen.server.apiBaseUrl)}</p>
        </article>

        <article class="info-card">
          <p class="detail-label">Account</p>
          <h2 class="detail-title">${escapeHtml(screen.session.user.name)}</h2>
          <p class="detail-copy">${escapeHtml(screen.session.user.email)}</p>
        </article>

        <article class="info-card">
          <p class="detail-label">Session</p>
          <h2 class="detail-title">Scoped to this server</h2>
          <p class="detail-copy">
            Refreshes keep you here while the stored session still matches this backend origin.
          </p>
        </article>
      </div>
    </section>
  `, screen.theme, { showThemeToggle: true })
}

export function renderApp(root: HTMLDivElement, screen: AppScreen, onAction: ActionHandler) {
  if (screen.kind === 'connection') {
    root.innerHTML = renderConnection(screen)
  } else if (screen.kind === 'auth') {
    root.innerHTML = renderAuth(screen)
  } else {
    root.innerHTML = renderShell(screen)
  }

  const connectionForm = root.querySelector<HTMLFormElement>('[data-form="connection"]')

  if (connectionForm) {
    connectionForm.addEventListener('submit', (event) => {
      event.preventDefault()
      onAction('submit-connection', new FormData(connectionForm))
    })
  }

  const loginForm = root.querySelector<HTMLFormElement>('[data-form="login"]')

  if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault()
      onAction('submit-login', new FormData(loginForm))
    })
  }

  const signupForm = root.querySelector<HTMLFormElement>('[data-form="signup"]')

  if (signupForm) {
    signupForm.addEventListener('submit', (event) => {
      event.preventDefault()
      onAction('submit-signup', new FormData(signupForm))
    })
  }

  root.querySelectorAll<HTMLElement>('[data-action]').forEach((element) => {
    element.addEventListener('click', () => {
      const action = element.dataset.action as AppAction | undefined

      if (action) {
        onAction(action)
      }
    })
  })
}
