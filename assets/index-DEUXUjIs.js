(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=(void 0)?.trim()||`http://localhost:8080/api`,t=`Failed to connect to server.`;function n(e){return e&&typeof e==`object`&&`message`in e&&typeof e.message==`string`&&e.message.trim().length>0?e.message.trim():null}function r(e,r){return e===400?`Please enter a valid email and password.`:e===401?`The password is incorrect.`:e===404?`No account was found for that email.`:e>=500?t:n(r)??`Unable to sign in right now.`}function i(e,r){return e===400?`Enter your name, email, and password.`:e===409?`An account with that email already exists.`:e>=500?t:n(r)??`Unable to create the account right now.`}async function a(n,r){let i;try{i=await fetch(`${e}${n}`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(r)})}catch{throw Error(t)}let a=null;try{a=await i.json()}catch{a=null}return{response:i,payload:a}}async function o(e){let{response:n,payload:i}=await a(`/auth/login`,e);if(!n.ok)throw Error(r(n.status,i));if(!i||typeof i!=`object`||!(`token`in i)||typeof i.token!=`string`||!(`user`in i)||!i.user||typeof i.user!=`object`)throw Error(t);let o=i.user,s=typeof o.email==`string`&&o.email.trim().length>0?o.email.trim():e.email,c=typeof o.name==`string`&&o.name.trim().length>0?o.name.trim():s.split(`@`)[0]||`AudioHub User`,l=typeof o.id==`number`&&Number.isFinite(o.id)?o.id:0;return{token:i.token,user:{id:l,name:c,email:s}}}async function s(e){let{response:t,payload:n}=await a(`/auth/signup`,e);if(!t.ok)throw Error(i(t.status,n))}var c=`audiohub.session`,l=30;function u(){try{window.localStorage.removeItem(c)}catch{}}function d(e){if(!e||typeof e!=`object`)return null;let t=e,n=typeof t.email==`string`?t.email.trim():``;if(!n)return null;let r=n.split(`@`)[0]||`AudioHub User`,i=typeof t.name==`string`&&t.name.trim().length>0?t.name.trim():r;return{id:typeof t.id==`number`&&Number.isFinite(t.id)?t.id:0,name:i,email:n}}function f(e){if(!e||typeof e!=`object`)return null;let t=e,n=typeof t.token==`string`?t.token.trim():``,r=d(t.user);return!n||!r?null:{token:n,user:r}}function p(){return window.location.protocol===`https:`}function m(){let e=[`${c}=`,`Path=/`,`Expires=Thu, 01 Jan 1970 00:00:00 GMT`,`SameSite=Lax`];p()&&e.push(`Secure`),document.cookie=e.join(`; `)}function h(){let e=`${c}=`,t=(document.cookie?document.cookie.split(`; `):[]).find(t=>t.startsWith(e));if(!t)return null;try{let n=t.slice(e.length);return f(JSON.parse(decodeURIComponent(n)))||(m(),null)}catch{return m(),null}}function g(){try{let e=window.localStorage.getItem(c);return e?f(JSON.parse(e))||(u(),null):null}catch{return u(),null}}function _(){let e=h();if(e)return e;let t=g();return t?(v(t),u(),t):null}function v(e){let t=f(e);if(!t){y();return}let n=new Date;n.setDate(n.getDate()+l);let r=[`${c}=${encodeURIComponent(JSON.stringify(t))}`,`Path=/`,`Expires=${n.toUTCString()}`,`SameSite=Lax`];p()&&r.push(`Secure`),document.cookie=r.join(`; `),u()}function y(){m(),u()}var b=`audiohub.theme`;function x(e){document.documentElement.dataset.theme=e,document.documentElement.style.colorScheme=e===`dark`?`dark`:`light`}function S(){try{return window.localStorage.getItem(b)===`dark`?`dark`:`light`}catch{return`light`}}function C(e){x(e);try{window.localStorage.setItem(b,e)}catch{}}function w(e){return e===`dark`?`light`:`dark`}var T=[{id:`overview`,label:`Overview`,blurb:`Main room`},{id:`search`,label:`Search`,blurb:`YouTube discovery`},{id:`downloads`,label:`Downloads`,blurb:`Saved audio`},{id:`account`,label:`Account`,blurb:`Session details`}],E={search:{eyebrow:`Search`,title:`Discovery is staged and ready.`,copy:`This surface is reserved for the next phase, where search results from YouTube will be brought into the signed-in experience.`,endpoint:`POST /api/youtube/search`,status:`UI placeholder, backend endpoint available`},downloads:{eyebrow:`Downloads`,title:`Downloads will live here.`,copy:`The signed-in shell already makes room for saved tracks, download progress, and repair states backed by the existing song endpoint.`,endpoint:`POST /api/songs/download`,status:`UI placeholder, backend endpoint available`},account:{eyebrow:`Account`,title:`Profile controls come next.`,copy:`This section is ready for profile editing, session controls, and future account preferences once the backend expands beyond login and signup.`,endpoint:`Current session only`,status:`UI placeholder, auth session active`}};function D(e){return e.replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`).replaceAll(`'`,`&#39;`)}function O(e){return e.split(` `).map(e=>e.trim()).filter(Boolean).slice(0,2).map(e=>e[0]?.toUpperCase()??``).join(``)||`AH`}function k(e){let[t]=e.trim().split(/\s+/);return t||`there`}function A(e){let t=e===`dark`?`Switch to light theme`:`Switch to dark theme`;return`
    <button
      type="button"
      class="theme-toggle"
      data-action="toggle-theme"
      title="${t}"
      aria-label="${t}"
    >
      <span class="theme-toggle-label">Theme</span>
      <span class="theme-toggle-track" data-theme="${e}">
        <span class="theme-toggle-thumb"></span>
        <span class="theme-toggle-option ${e===`light`?`is-active`:``}">Light</span>
        <span class="theme-toggle-option ${e===`dark`?`is-active`:``}">Dark</span>
      </span>
    </button>
  `}function j(e){return`
    <div class="auth-tabs" role="tablist" aria-label="Authentication">
      <button
        type="button"
        class="auth-tab ${e===`login`?`is-active`:``}"
        data-action="show-login"
        role="tab"
        aria-selected="${e===`login`}"
      >
        Sign in
      </button>
      <button
        type="button"
        class="auth-tab ${e===`signup`?`is-active`:``}"
        data-action="show-signup"
        role="tab"
        aria-selected="${e===`signup`}"
      >
        Register
      </button>
    </div>
  `}function M(e,t){return!e&&!t?``:`
    <div class="status-stack" aria-live="polite">
      ${t?`<p class="status-banner is-notice">${D(t)}</p>`:``}
      ${e?`<p class="status-banner is-error">${D(e)}</p>`:``}
    </div>
  `}function N(e){let t=e.mode===`signup`,n=e.loading?`disabled aria-busy="true"`:``,r=t?`Create your account`:`Sign in to continue`,i=t?`Enter a few details and the app will take you straight into the main shell.`:`Open AudioHub with a simple, quiet sign-in flow and stay there across refreshes.`,a=e.loading?t?`Creating account...`:`Signing in...`:t?`Create account`:`Sign in`,o=t?`new-password`:`current-password`;return`
    <main class="page-shell">
      <div class="page-frame auth-frame">
        <header class="page-topbar fade-item" style="--delay: 0ms;">
          <div class="brand-lockup">
            <span class="brand-mark">AH</span>
            <div>
              <p class="brand-name">AudioHub</p>
              <p class="brand-subtitle">Black and cream access layer</p>
            </div>
          </div>
          ${A(e.theme)}
        </header>

        <div class="auth-layout">
          <section class="app-panel hero-panel fade-item" style="--delay: 90ms;">
            <div class="hero-orbit" aria-hidden="true"></div>
            <p class="eyebrow">Frontend auth</p>
            <div class="hero-copy">
              <h1 class="display-title">A calmer entry into your music app.</h1>
              <p class="lead-copy">
                Apple-leaning typography, monochrome surfaces, and a responsive shell that keeps the experience quiet instead of cluttered.
              </p>
            </div>

            <div class="hero-metrics">
              <article class="hero-metric is-inverse">
                <p class="detail-label">Session</p>
                <h2 class="detail-title">Cookie-backed</h2>
                <p class="detail-copy">Refreshes and new tabs reopen the signed-in shell without bouncing the user back to auth.</p>
              </article>
              <article class="hero-metric">
                <p class="detail-label">Theme</p>
                <h2 class="detail-title">Light or dark</h2>
                <p class="detail-copy">The interface persists the selected theme before first paint to avoid a flash on load.</p>
              </article>
            </div>

            <div class="hero-list">
              <div class="hero-list-item">
                <span class="endpoint-pill">Overview</span>
                <p class="body-copy">The signed-in landing screen is real and ready now.</p>
              </div>
              <div class="hero-list-item">
                <span class="endpoint-pill">Search</span>
                <p class="body-copy">Reserved for the existing YouTube search endpoint in the next phase.</p>
              </div>
              <div class="hero-list-item">
                <span class="endpoint-pill">Downloads</span>
                <p class="body-copy">Reserved for the current song download endpoint in the next phase.</p>
              </div>
            </div>
          </section>

          <section class="app-panel auth-panel fade-item" style="--delay: 160ms;">
            <div class="auth-panel-head">
              ${j(e.mode)}
              <p class="eyebrow">Authentication</p>
              <h2 class="section-title">${r}</h2>
              <p class="body-copy">${i}</p>
            </div>

            <form class="auth-form" data-form="${t?`signup`:`login`}" data-auth-form="true" novalidate>
              ${t?`
                <label class="field">
                  <span class="field-label">Name</span>
                  <input
                    class="field-input"
                    type="text"
                    name="name"
                    placeholder="Your name"
                    autocomplete="name"
                    value="${D(e.values.name)}"
                    ${n}
                  />
                </label>
              `:``}
              <label class="field">
                <span class="field-label">Email</span>
                <input
                  class="field-input"
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  autocomplete="email"
                  value="${D(e.values.email)}"
                  ${n}
                />
              </label>
              <label class="field">
                <span class="field-label">Password</span>
                <input
                  class="field-input"
                  type="password"
                  name="password"
                  placeholder="${t?`Choose a password`:`Enter your password`}"
                  autocomplete="${o}"
                  value="${D(e.values.password)}"
                  ${n}
                />
              </label>
              ${M(e.error,e.notice)}
              <button class="primary-button" type="submit" ${n}>
                ${a}
              </button>
            </form>

            <p class="auth-footnote">
              The current phase wires login and registration end to end, then hands the user off to a polished signed-in shell.
            </p>
          </section>
        </div>
      </div>
    </main>
  `}function P(e){return`
    <section class="section-stack">
      <article class="app-panel feature-hero">
        <p class="eyebrow">Overview</p>
        <h2 class="display-title">Welcome back, ${D(k(e.user.name))}.</h2>
        <p class="lead-copy">
          You are already in the signed-in shell. The browser keeps your session in a cookie, so refreshes and new windows reopen this page instead of the auth form.
        </p>

        <div class="overview-grid">
          <article class="detail-card is-inverse">
            <p class="detail-label">Session</p>
            <h3 class="detail-title">Active</h3>
            <p class="detail-copy">Stored as a client-managed cookie with a 30-day lifetime and automatic cleanup if the data becomes invalid.</p>
          </article>
          <article class="detail-card">
            <p class="detail-label">Search</p>
            <h3 class="detail-title">Next phase ready</h3>
            <p class="detail-copy">The UI is staged to connect to the existing YouTube search endpoint without reshaping the signed-in experience.</p>
          </article>
          <article class="detail-card">
            <p class="detail-label">Downloads</p>
            <h3 class="detail-title">Slot reserved</h3>
            <p class="detail-copy">Downloaded audio and repair states can be layered onto this shell as soon as the next frontend slice is wired.</p>
          </article>
        </div>
      </article>

      <div class="placeholder-grid">
        <article class="app-panel placeholder-card">
          <p class="detail-label">Current identity</p>
          <h3 class="placeholder-title">${D(e.user.name)}</h3>
          <p class="detail-copy">${D(e.user.email)}</p>
        </article>
        <article class="app-panel placeholder-card">
          <p class="detail-label">Theme system</p>
          <h3 class="placeholder-title">Persistent</h3>
          <p class="detail-copy">Light and dark surfaces stay aligned across auth and the signed-in shell.</p>
        </article>
        <article class="app-panel placeholder-card">
          <p class="detail-label">Failure copy</p>
          <h3 class="placeholder-title">Standardized</h3>
          <p class="detail-copy">Network and transport failures now resolve to "Failed to connect to server." instead of the browser default.</p>
        </article>
      </div>
    </section>
  `}function F(e){let t=E[e];return`
    <section class="section-stack">
      <article class="app-panel feature-hero">
        <p class="eyebrow">${D(t.eyebrow)}</p>
        <h2 class="section-title">${D(t.title)}</h2>
        <p class="lead-copy">${D(t.copy)}</p>
      </article>

      <div class="placeholder-grid">
        <article class="app-panel placeholder-card">
          <p class="detail-label">Backend contract</p>
          <span class="endpoint-pill">${D(t.endpoint)}</span>
          <p class="detail-copy">The current backend already exposes the contract this section will use later.</p>
        </article>
        <article class="app-panel placeholder-card">
          <p class="detail-label">Current status</p>
          <h3 class="placeholder-title">${D(t.status)}</h3>
          <p class="detail-copy">This phase focuses on auth, persistence, theme handling, and a stable signed-in frame.</p>
        </article>
        <article class="app-panel placeholder-card">
          <p class="detail-label">Design direction</p>
          <h3 class="placeholder-title">Ready to extend</h3>
          <p class="detail-copy">The shell and section rhythm are already in place so later API wiring can stay visually consistent.</p>
        </article>
      </div>
    </section>
  `}function I(e,t){return e===`overview`?P(t):F(e)}function L(e){return`
    <main class="page-shell">
      <div class="page-frame shell-frame">
        <aside class="app-panel shell-rail fade-item" style="--delay: 0ms;">
          <div class="brand-lockup">
            <span class="brand-mark">AH</span>
            <div>
              <p class="brand-name">AudioHub</p>
              <p class="brand-subtitle">Signed-in shell</p>
            </div>
          </div>

          <div class="profile-chip">
            <span class="avatar-mark">${D(O(e.session.user.name))}</span>
            <div class="profile-copy">
              <p class="profile-name">${D(e.session.user.name)}</p>
              <p class="profile-email">${D(e.session.user.email)}</p>
            </div>
          </div>

          <p class="rail-note">
            The app opens here after login and stays here across refreshes while the cookie is valid.
          </p>

          <nav class="nav-grid" aria-label="Signed-in sections">
            ${T.map(t=>`
              <button
                type="button"
                data-action="${t.id}"
                class="nav-button ${t.id===e.activeSection?`is-active`:``}"
                aria-current="${t.id===e.activeSection?`page`:`false`}"
              >
                <span class="nav-button-label">${D(t.label)}</span>
                <span class="nav-button-blurb">${D(t.blurb)}</span>
              </button>
            `).join(``)}
          </nav>

          <button type="button" class="secondary-button" data-action="logout">
            Log out
          </button>
        </aside>

        <section class="shell-main fade-item" style="--delay: 100ms;">
          <header class="app-panel shell-header">
            <div class="header-copy">
              <p class="eyebrow">Dashboard</p>
              <h1 class="section-title">AudioHub in a cleaner frame</h1>
              <p class="body-copy">
                Auth is live, the shell is persistent, and the remaining sections are staged around the backend that already exists.
              </p>
            </div>
            <div class="header-actions">
              <span class="status-pill">Signed in</span>
              ${A(e.theme)}
            </div>
          </header>

          ${I(e.activeSection,e.session)}
        </section>
      </div>
    </main>
  `}function R(e,t,n){e.innerHTML=t.kind===`auth`?N(t):L(t);let r=e.querySelector(`[data-form="login"]`);r&&r.addEventListener(`submit`,e=>{e.preventDefault(),n(`submit-login`,new FormData(r))});let i=e.querySelector(`[data-form="signup"]`);i&&i.addEventListener(`submit`,e=>{e.preventDefault(),n(`submit-signup`,new FormData(i))}),e.querySelectorAll(`[data-action]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.action;t&&n(t)})})}var z=document.querySelector(`#app`);if(!z)throw Error(`App root element was not found`);var B=z;function V(){return{name:``,email:``,password:``}}function H(e){return e instanceof Error?e.message:`Failed to connect to server.`}var U=S();x(U);var W={kind:`auth`,theme:U,mode:`login`,values:V(),loading:!1,error:null,notice:null};function G(){if(W.kind!==`auth`)return V();let e=B.querySelector(`[data-auth-form]`);return e?{name:e.querySelector(`[name="name"]`)?.value??W.values.name,email:e.querySelector(`[name="email"]`)?.value??W.values.email,password:e.querySelector(`[name="password"]`)?.value??W.values.password}:W.values}function K(){return W.kind===`auth`?G():V()}function q(e,t){W={kind:`auth`,theme:U,mode:e,values:t?.values??K(),loading:!1,error:t?.error??null,notice:t?.notice??null},$()}function J(e=`overview`){let t=_();if(!t){q(`login`);return}W={kind:`shell`,theme:U,session:t,activeSection:e},$()}function Y(e){U=e,C(e),W=W.kind===`auth`?{...W,theme:e,values:K()}:{...W,theme:e},$()}async function X(e){let t=String(e.get(`email`)??``).trim(),n=String(e.get(`password`)??``),r={...K(),email:t,password:n};if(!t||!n){W={kind:`auth`,theme:U,mode:`login`,values:r,loading:!1,error:`Enter both email and password.`,notice:null},$();return}W={kind:`auth`,theme:U,mode:`login`,values:r,loading:!0,error:null,notice:null},$();try{v(await o({email:t,password:n})),J(`overview`)}catch(e){W={kind:`auth`,theme:U,mode:`login`,values:r,loading:!1,error:H(e),notice:null},$()}}async function Z(e){let t=String(e.get(`name`)??``),n=String(e.get(`email`)??``).trim(),r=String(e.get(`password`)??``),i={name:t,email:n,password:r};if(!t.trim()||!n||!r){W={kind:`auth`,theme:U,mode:`signup`,values:i,loading:!1,error:`Enter your name, email, and password.`,notice:null},$();return}W={kind:`auth`,theme:U,mode:`signup`,values:i,loading:!0,error:null,notice:null},$();try{await s({name:t.trim(),email:n,password:r})}catch(e){W={kind:`auth`,theme:U,mode:`signup`,values:i,loading:!1,error:H(e),notice:null},$();return}try{v(await o({email:n,password:r})),J(`overview`)}catch(e){q(`login`,{error:H(e),notice:`Account created. Sign in to continue.`,values:{name:``,email:n,password:``}})}}function Q(e,t){if(e===`submit-login`&&t){X(t);return}if(e===`submit-signup`&&t){Z(t);return}if(e===`toggle-theme`){Y(w(U));return}if(e===`show-login`){q(`login`,{values:K()});return}if(e===`show-signup`){q(`signup`,{values:K()});return}if(e===`logout`){y(),q(`login`,{notice:`You have been signed out.`,values:V()});return}(e===`overview`||e===`search`||e===`downloads`||e===`account`)&&J(e)}function $(){R(B,W,Q)}_()?J(`overview`):$();