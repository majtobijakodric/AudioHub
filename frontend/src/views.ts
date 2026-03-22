import type { AppScreen, AuthMode, MenuSection } from './types.ts'

type ActionHandler = (action: string, formData?: FormData) => void

const menuItems: Array<{ id: MenuSection; label: string; blurb: string }> = [
  { id: 'overview', label: 'Overview', blurb: 'Home' },
  { id: 'search', label: 'Search', blurb: 'Discover music' },
  { id: 'downloads', label: 'Downloads', blurb: 'Saved tracks' },
  { id: 'account', label: 'Account', blurb: 'Profile' },
]

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function getSectionMarkup(activeSection: MenuSection, name: string) {
  if (activeSection === 'overview') {
    return `
      <section class="space-y-8">
        <div class="rounded-[2rem] border border-black/10 bg-white p-8 shadow-[0_24px_60px_rgba(0,0,0,0.08)] sm:p-10">
          <p class="text-sm font-medium uppercase tracking-[0.24em] text-black/45">Overview</p>
          <h2 class="mt-4 text-3xl font-semibold tracking-[-0.04em] text-black sm:text-4xl">${escapeHtml(name)}</h2>
          <p class="mt-4 max-w-2xl text-base leading-7 text-black/65">
            Signed in successfully. The main shell is ready for search, downloads, and account screens.
          </p>
        </div>

        <div class="grid gap-4 lg:grid-cols-3">
          <article class="rounded-[1.75rem] border border-black/10 bg-black px-6 py-7 text-white">
            <p class="text-sm uppercase tracking-[0.22em] text-white/60">Session</p>
            <h3 class="mt-3 text-2xl font-semibold tracking-[-0.04em]">Active</h3>
            <p class="mt-3 text-sm leading-6 text-white/70">Your login is stored locally so the app stays open after refresh.</p>
          </article>
          <article class="rounded-[1.75rem] border border-black/10 bg-white px-6 py-7">
            <p class="text-sm uppercase tracking-[0.22em] text-black/45">Shell</p>
            <h3 class="mt-3 text-2xl font-semibold tracking-[-0.04em] text-black">Ready</h3>
            <p class="mt-3 text-sm leading-6 text-black/65">Navigation is in place for the next real app sections.</p>
          </article>
          <article class="rounded-[1.75rem] border border-black/10 bg-white px-6 py-7">
            <p class="text-sm uppercase tracking-[0.22em] text-black/45">Status</p>
            <h3 class="mt-3 text-2xl font-semibold tracking-[-0.04em] text-black">Frontend</h3>
            <p class="mt-3 text-sm leading-6 text-black/65">Auth now supports both sign in and account creation.</p>
          </article>
        </div>
      </section>
    `
  }

  const activeItem = menuItems.find((item) => item.id === activeSection)

  return `
    <section class="rounded-[2rem] border border-dashed border-black/15 bg-white p-8 shadow-[0_24px_60px_rgba(0,0,0,0.05)] sm:p-10">
      <p class="text-sm font-medium uppercase tracking-[0.24em] text-black/45">${activeItem?.label ?? 'Section'}</p>
      <h2 class="mt-4 text-3xl font-semibold tracking-[-0.04em] text-black sm:text-4xl">Coming soon</h2>
      <p class="mt-4 max-w-2xl text-base leading-7 text-black/65">
        ${escapeHtml(activeItem?.label ?? 'This area')} is not wired yet.
      </p>
    </section>
  `
}

function renderAuthTabs(mode: AuthMode) {
  return `
    <div class="inline-flex rounded-2xl border border-black/10 bg-[#f6f6f4] p-1">
      <button
        type="button"
        data-action="show-login"
        class="rounded-[1rem] px-4 py-2 text-sm font-medium transition ${mode === 'login' ? 'bg-black text-white' : 'text-black/60 hover:text-black'}"
      >
        Sign in
      </button>
      <button
        type="button"
        data-action="show-signup"
        class="rounded-[1rem] px-4 py-2 text-sm font-medium transition ${mode === 'signup' ? 'bg-black text-white' : 'text-black/60 hover:text-black'}"
      >
        Register
      </button>
    </div>
  `
}

function renderAuth(screen: Extract<AppScreen, { kind: 'auth' }>) {
  const isDisabled = screen.loading ? 'disabled aria-busy="true"' : ''
  const isSignup = screen.mode === 'signup'
  const title = isSignup ? 'Create account' : 'Sign in'
  const subtitle = isSignup
    ? 'Create your AudioHub account.'
    : 'Access your AudioHub account.'
  const buttonLabel = screen.loading
    ? (isSignup ? 'Creating account...' : 'Signing in...')
    : (isSignup ? 'Create account' : 'Sign in')
  const errorMarkup = screen.error
    ? `<p class="rounded-2xl border border-black/10 bg-black px-4 py-3 text-sm text-white">${escapeHtml(screen.error)}</p>`
    : ''
  const noticeMarkup = screen.notice
    ? `<p class="rounded-2xl border border-black/10 bg-[#f7f7f5] px-4 py-3 text-sm text-black">${escapeHtml(screen.notice)}</p>`
    : ''

  return `
    <main class="min-h-screen bg-[#f5f5f3] px-4 py-6 text-black sm:px-6 lg:px-8">
      <div class="mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl items-stretch overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_30px_90px_rgba(0,0,0,0.08)]">
        <section class="hidden w-[42%] border-r border-black/10 bg-[#f7f7f5] px-10 py-12 lg:flex lg:flex-col lg:justify-between">
          <div>
            <p class="text-sm uppercase tracking-[0.3em] text-black/40">AudioHub</p>
            <h1 class="mt-6 max-w-sm text-5xl font-semibold tracking-[-0.06em] text-black">Access your library.</h1>
            <p class="mt-6 max-w-md text-base leading-7 text-white/70">
              Sign in or create an account to open the app.
            </p>
          </div>
          <div class="rounded-[1.75rem] border border-black/10 bg-white p-6 text-sm leading-6 text-black/60">
            <p class="font-medium text-black">Current app sections</p>
            <p class="mt-3">Overview</p>
            <p>Search</p>
            <p>Downloads</p>
            <p>Account</p>
          </div>
        </section>

        <section class="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div class="w-full max-w-md">
            ${renderAuthTabs(screen.mode)}
            <p class="mt-8 text-sm font-medium uppercase tracking-[0.3em] text-black/40">Authentication</p>
            <h1 class="mt-4 text-4xl font-semibold tracking-[-0.05em] text-black">${title}</h1>
            <p class="mt-4 text-base leading-7 text-black/60">
              ${subtitle}
            </p>

            <form class="mt-10 space-y-5" data-form="${isSignup ? 'signup' : 'login'}">
              ${isSignup ? `
                <label class="block space-y-2">
                  <span class="text-sm font-medium text-black/70">Name</span>
                  <input
                    class="w-full rounded-2xl border border-black/10 bg-[#f7f7f5] px-4 py-3 text-base text-black outline-none transition focus:border-black focus:bg-white"
                    type="text"
                    name="name"
                    placeholder="Your name"
                    autocomplete="name"
                    value="${escapeHtml(screen.values.name)}"
                    ${isDisabled}
                  />
                </label>
              ` : ''}
              <label class="block space-y-2">
                <span class="text-sm font-medium text-black/70">Email</span>
                <input
                  class="w-full rounded-2xl border border-black/10 bg-[#f7f7f5] px-4 py-3 text-base text-black outline-none transition focus:border-black focus:bg-white"
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  autocomplete="email"
                  value="${escapeHtml(screen.values.email)}"
                  ${isDisabled}
                />
              </label>
              <label class="block space-y-2">
                <span class="text-sm font-medium text-black/70">Password</span>
                <input
                  class="w-full rounded-2xl border border-black/10 bg-[#f7f7f5] px-4 py-3 text-base text-black outline-none transition focus:border-black focus:bg-white"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  autocomplete="current-password"
                  value="${escapeHtml(screen.values.password)}"
                  ${isDisabled}
                />
              </label>
              ${noticeMarkup}
              ${errorMarkup}
              <button
                class="flex w-full items-center justify-center rounded-2xl bg-black px-5 py-3.5 text-base font-medium text-white transition hover:bg-black/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:bg-black/60"
                type="submit"
                ${isDisabled}
              >
                ${buttonLabel}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  `
}

function renderShell(screen: Extract<AppScreen, { kind: 'shell' }>) {
  const initials = screen.session.user.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'AU'

  return `
    <main class="min-h-screen bg-[#f5f5f3] p-4 text-black sm:p-6">
      <div class="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_30px_90px_rgba(0,0,0,0.08)]">
        <aside class="flex w-full max-w-full flex-col border-b border-black/10 bg-[#fbfbfa] p-5 md:max-w-[18rem] md:border-b-0 md:border-r md:p-6">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">${escapeHtml(initials)}</div>
            <div class="min-w-0">
              <p class="truncate text-base font-semibold text-black">${escapeHtml(screen.session.user.name)}</p>
              <p class="truncate text-sm text-black/50">${escapeHtml(screen.session.user.email)}</p>
            </div>
          </div>

          <nav class="mt-8 grid gap-2">
            ${menuItems.map((item) => `
              <button
                type="button"
                data-action="${item.id}"
                class="flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                  item.id === screen.activeSection
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 bg-white text-black hover:border-black/25'
                }"
              >
                <span>
                  <span class="block text-sm font-medium">${item.label}</span>
                  <span class="mt-1 block text-xs ${item.id === screen.activeSection ? 'text-white/65' : 'text-black/45'}">${item.blurb}</span>
                </span>
              </button>
            `).join('')}
          </nav>

          <button
            type="button"
            data-action="logout"
            class="mt-8 inline-flex items-center justify-center rounded-2xl border border-black/10 px-4 py-3 text-sm font-medium text-black transition hover:border-black hover:bg-black hover:text-white md:mt-auto"
          >
            Log out
          </button>
        </aside>

        <section class="flex-1 p-5 sm:p-8 lg:p-10">
          <div class="mb-8 flex flex-col gap-4 border-b border-black/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="text-sm uppercase tracking-[0.24em] text-black/40">Dashboard</p>
              <h1 class="mt-3 text-4xl font-semibold tracking-[-0.05em] text-black">AudioHub</h1>
            </div>
            <p class="max-w-xl text-sm leading-6 text-black/55">
              Auth is connected. The remaining sections are ready to be wired to real data.
            </p>
          </div>
          ${getSectionMarkup(screen.activeSection, screen.session.user.name)}
        </section>
      </div>
    </main>
  `
}

export function renderApp(root: HTMLDivElement, screen: AppScreen, onAction: ActionHandler) {
  root.innerHTML = screen.kind === 'auth' ? renderAuth(screen) : renderShell(screen)

  const form = root.querySelector<HTMLFormElement>('[data-form="login"]')

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault()
      onAction('submit-login', new FormData(form))
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
      const action = element.dataset.action

      if (action) {
        onAction(action)
      }
    })
  })
}
