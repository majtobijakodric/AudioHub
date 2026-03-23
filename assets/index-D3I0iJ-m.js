(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=(void 0)?.trim()??``,t=`http://localhost:8080/api`,n=`Failed to connect to server.`,r=5e3;function i(n){return n?.apiBaseUrl.trim()||e||t}function a(e){return e&&typeof e==`object`&&`message`in e&&typeof e.message==`string`&&e.message.trim().length>0?e.message.trim():null}function o(e,t){return e===400?`Please enter a valid email and password.`:e===401?`The password is incorrect.`:e===404?`No account was found for that email.`:e>=500?n:a(t)??`Unable to sign in right now.`}function s(e,t){return e===400?`Enter your name, email, and password.`:e===409?`An account with that email already exists.`:e>=500?n:a(t)??`Unable to create the account right now.`}async function c(e,t){let i=new AbortController,a=window.setTimeout(()=>i.abort(),r);try{return await fetch(e,{...t,signal:i.signal})}catch{throw Error(n)}finally{window.clearTimeout(a)}}async function l(e){try{return await e.json()}catch{return null}}function ee(e){return e&&typeof e==`object`&&`ok`in e&&e.ok===!0&&`service`in e&&e.service===`audiohub`}async function u(e,t,r){let a;try{a=await c(`${i(e)}${t}`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(r)})}catch(e){throw e instanceof Error?e:Error(n)}let o=await l(a);return{response:a,payload:o}}async function te(e){let t=await c(`${i(e)}/health`,{headers:{Accept:`application/json`}}),r=await l(t);if(!t.ok||!ee(r))throw Error(n)}async function d(e,t){let{response:r,payload:i}=await u(t,`/auth/login`,e);if(!r.ok)throw Error(o(r.status,i));if(!i||typeof i!=`object`||!(`token`in i)||typeof i.token!=`string`||!(`user`in i)||!i.user||typeof i.user!=`object`)throw Error(n);let a=i.user,s=typeof a.email==`string`&&a.email.trim().length>0?a.email.trim():e.email,c=typeof a.name==`string`&&a.name.trim().length>0?a.name.trim():s.split(`@`)[0]||`AudioHub User`,l=typeof a.id==`number`&&Number.isFinite(a.id)?a.id:0;return{token:i.token,user:{id:l,name:c,email:s}}}async function ne(e,t){let{response:n,payload:r}=await u(t,`/auth/signup`,e);if(!n.ok)throw Error(s(n.status,r))}var f=`audiohub.server`,p=8080,m=(void 0)?.trim()??``,re=new Set([`localhost`,`127.0.0.1`,`[::1]`,`0.0.0.0`]);function h(){return{host:``,port:String(p)}}function ie(e){let t=e.trim();if(!t)return null;if(t.includes(`://`))try{return new URL(t)}catch{return null}try{return new URL(`http://${t}`)}catch{return null}}function ae(e){let t=Number.parseInt(e,10);if(!Number.isInteger(t)||t<1||t>65535)throw Error(`Enter a valid backend port.`);return t}function g(e){return re.has(e.toLowerCase())}function oe(e){if(!e)return null;if(typeof e==`string`)try{return _(e,``)}catch{return null}if(typeof e!=`object`)return null;let t=e,n=typeof t.host==`string`?t.host:``,r=t.port,i=typeof r==`number`?String(r):typeof r==`string`?r:``;try{return _(n,i)}catch{return null}}function se(){if(!m)return null;try{return _(m,``)}catch{return null}}function _(e,t){let n=ie(e);if(!n||!n.hostname)throw Error(`Enter a backend host or IP address.`);let r=n.hostname.trim();if(!r)throw Error(`Enter a backend host or IP address.`);let i=ae(t.trim()||n.port||String(p)),a=`${g(r)?`http:`:`https:`}//${r}:${i}`;return{host:r,port:i,origin:a,apiBaseUrl:`${a}/api`}}function v(e=null){let t=e??se();return t?{host:t.host,port:String(t.port)}:h()}function y(){try{let e=window.localStorage.getItem(f);return e?oe(JSON.parse(e))||(window.localStorage.removeItem(f),null):null}catch{try{window.localStorage.removeItem(f)}catch{}return null}}function ce(e){try{window.localStorage.setItem(f,JSON.stringify({host:e.host,port:e.port}))}catch{}}var b=`audiohub.session`,le=30;function x(){try{window.localStorage.removeItem(b)}catch{}}function ue(e){if(!e||typeof e!=`object`)return null;let t=e,n=typeof t.email==`string`?t.email.trim():``;if(!n)return null;let r=n.split(`@`)[0]||`AudioHub User`,i=typeof t.name==`string`&&t.name.trim().length>0?t.name.trim():r;return{id:typeof t.id==`number`&&Number.isFinite(t.id)?t.id:0,name:i,email:n}}function S(e){if(!e||typeof e!=`object`)return null;let t=e,n=typeof t.token==`string`?t.token.trim():``,r=ue(t.user),i=typeof t.serverOrigin==`string`?t.serverOrigin.trim():``;return!n||!r||!i?null:{token:n,user:r,serverOrigin:i}}function C(){return window.location.protocol===`https:`}function w(){let e=[`${b}=`,`Path=/`,`Expires=Thu, 01 Jan 1970 00:00:00 GMT`,`SameSite=Lax`];C()&&e.push(`Secure`),document.cookie=e.join(`; `)}function T(){let e=`${b}=`,t=(document.cookie?document.cookie.split(`; `):[]).find(t=>t.startsWith(e));if(!t)return null;try{let n=t.slice(e.length);return S(JSON.parse(decodeURIComponent(n)))||(w(),null)}catch{return w(),null}}function de(){try{let e=window.localStorage.getItem(b);return e?S(JSON.parse(e))||(x(),null):null}catch{return x(),null}}function E(e){let t=T();if(t)return e&&t.serverOrigin!==e?(O(),null):t;let n=de();return n?e&&n.serverOrigin!==e?(O(),null):(D(n),x(),n):null}function D(e){let t=S(e);if(!t){O();return}let n=new Date;n.setDate(n.getDate()+le);let r=[`${b}=${encodeURIComponent(JSON.stringify(t))}`,`Path=/`,`Expires=${n.toUTCString()}`,`SameSite=Lax`];C()&&r.push(`Secure`),document.cookie=r.join(`; `),x()}function O(){w(),x()}var k=`audiohub.theme`;function A(){return window.matchMedia(`(prefers-color-scheme: dark)`).matches?`dark`:`light`}function j(e){document.documentElement.dataset.theme=e,document.documentElement.style.colorScheme=e===`dark`?`dark`:`light`}function fe(){try{let e=window.localStorage.getItem(k);return e===`dark`||e===`light`?e:A()}catch{return A()}}function pe(e){j(e);try{window.localStorage.setItem(k,e)}catch{}}function me(e){return e===`dark`?`light`:`dark`}function M(e){return e.replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`).replaceAll(`'`,`&#39;`)}function N(e){let t=e===`dark`?`Switch to light theme`:`Switch to dark theme`;return`
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
  `}function P(e,t){return!e&&!t?``:`
    <div class="status-stack" aria-live="polite">
      ${t?`<p class="status-banner is-notice">${M(t)}</p>`:``}
      ${e?`<p class="status-banner is-error">${M(e)}</p>`:``}
    </div>
  `}function F(e,t,n){return`
    <main class="page-shell">
      <div class="page-frame">
        ${n?.showThemeToggle?`
        <header class="page-topbar fade-item" style="--delay: 0ms;">
          <div class="page-topbar-spacer" aria-hidden="true"></div>
          ${N(t)}
        </header>
      `:``}

        ${e}
      </div>
    </main>
  `}function I(e){let t=e.loading?`disabled aria-busy="true"`:``,n=e.loading?`Checking server...`:`Connect`;return F(`
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
              value="${M(e.values.host)}"
              ${t}
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
              value="${M(e.values.port)}"
              ${t}
            />
          </label>

          ${P(e.error,e.notice)}

          <div class="form-actions">
            <button class="primary-button" type="submit" ${t}>
              ${n}
            </button>
          </div>
        </form>
      </section>
    </div>
  `,e.theme)}function L(e){return`
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
  `}function R(e){let t=e.mode===`signup`,n=e.loading?`disabled aria-busy="true"`:``,r=t?`Create an account`:`Sign in`,i=t?`This account will be created on the connected backend.`:`Authentication is now scoped to the backend you just verified.`,a=e.loading?t?`Creating account...`:`Signing in...`:t?`Create account`:`Sign in`,o=t?`new-password`:`current-password`;return F(`
    <section class="panel auth-panel fade-item" style="--delay: 70ms;">
      <div class="panel-header">
        <div class="panel-copy">
          <p class="eyebrow">Authentication</p>
          <h1 class="section-title">${r}</h1>
          <p class="body-copy">${i}</p>
        </div>
        <button type="button" class="secondary-button" data-action="change-server">
          Change server
        </button>
      </div>

      <div class="server-chip" aria-label="Connected backend">
        <span class="server-chip-label">Backend</span>
        <span class="server-chip-value">${M(e.server.origin)}</span>
      </div>

      ${L(e.mode)}

      <form class="form-grid auth-form" data-form="${t?`signup`:`login`}" data-auth-form="true" novalidate>
        ${t?`
          <label class="field field-span">
            <span class="field-label">Name</span>
            <input
              class="field-input"
              type="text"
              name="name"
              placeholder="Your name"
              autocomplete="name"
              value="${M(e.values.name)}"
              ${n}
            />
          </label>
        `:``}

        <label class="field field-span">
          <span class="field-label">Email</span>
          <input
            class="field-input"
            type="email"
            name="email"
            placeholder="name@example.com"
            autocomplete="email"
            value="${M(e.values.email)}"
            ${n}
          />
        </label>

        <label class="field field-span">
          <span class="field-label">Password</span>
          <input
            class="field-input"
            type="password"
            name="password"
            placeholder="${t?`Choose a password`:`Enter your password`}"
            autocomplete="${o}"
            value="${M(e.values.password)}"
            ${n}
          />
        </label>

        ${P(e.error,e.notice)}

        <div class="form-actions">
          <button class="primary-button" type="submit" ${n}>
            ${a}
          </button>
        </div>
      </form>
    </section>
  `,e.theme)}function he(e){return F(`
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
          <h2 class="detail-title">${M(e.server.origin)}</h2>
          <p class="detail-copy">${M(e.server.apiBaseUrl)}</p>
        </article>

        <article class="info-card">
          <p class="detail-label">Account</p>
          <h2 class="detail-title">${M(e.session.user.name)}</h2>
          <p class="detail-copy">${M(e.session.user.email)}</p>
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
  `,e.theme,{showThemeToggle:!0})}function ge(e,t,n){t.kind===`connection`?e.innerHTML=I(t):t.kind===`auth`?e.innerHTML=R(t):e.innerHTML=he(t);let r=e.querySelector(`[data-form="connection"]`);r&&r.addEventListener(`submit`,e=>{e.preventDefault(),n(`submit-connection`,new FormData(r))});let i=e.querySelector(`[data-form="login"]`);i&&i.addEventListener(`submit`,e=>{e.preventDefault(),n(`submit-login`,new FormData(i))});let a=e.querySelector(`[data-form="signup"]`);a&&a.addEventListener(`submit`,e=>{e.preventDefault(),n(`submit-signup`,new FormData(a))}),e.querySelectorAll(`[data-action]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.action;t&&n(t)})})}var z=document.querySelector(`#app`);if(!z)throw Error(`App root element was not found`);var B=z;function V(){return{name:``,email:``,password:``}}function H(e){return e instanceof Error?e.message:`Failed to connect to server.`}var U=fe(),W=null,G={kind:`connection`,theme:U,values:v(y()),loading:!1,error:null,notice:null};j(U);function _e(){if(G.kind!==`connection`)return v(W);let e=B.querySelector(`[data-connection-form]`);return e?{host:e.querySelector(`[name="host"]`)?.value??G.values.host,port:e.querySelector(`[name="port"]`)?.value??G.values.port}:G.values}function K(){return G.kind===`connection`?_e():v(W)}function ve(){if(G.kind!==`auth`)return V();let e=B.querySelector(`[data-auth-form]`);return e?{name:e.querySelector(`[name="name"]`)?.value??G.values.name,email:e.querySelector(`[name="email"]`)?.value??G.values.email,password:e.querySelector(`[name="password"]`)?.value??G.values.password}:G.values}function q(){return G.kind===`auth`?ve():V()}function J(e){G={kind:`connection`,theme:U,values:e?.values??K(),loading:e?.loading??!1,error:e?.error??null,notice:e?.notice??null},$()}function Y(e,t){if(!W){J({error:`Connect to a server first.`,values:K()});return}G={kind:`auth`,theme:U,server:W,mode:e,values:t?.values??q(),loading:!1,error:t?.error??null,notice:t?.notice??null},$()}function X(){if(!W){J({error:`Connect to a server first.`,values:K()});return}let e=E(W.origin);if(!e){Y(`login`);return}G={kind:`shell`,theme:U,server:W,session:e},$()}function Z(e){U=e,pe(e),G=G.kind===`connection`?{...G,theme:e,values:K()}:G.kind===`auth`?{...G,theme:e,values:q()}:{...G,theme:e},$()}function ye(e){let t=W??y();t&&t.origin!==e.origin&&O(),W=e,ce(e)}async function Q(e,t){let n;try{n=_(e.host,e.port)}catch(t){J({values:{host:e.host.trim(),port:e.port.trim()||`8080`},error:H(t),notice:null});return}let r=v(n);J({values:r,loading:!0,error:null,notice:t?.loadingNotice??null});try{await te(n)}catch(e){J({values:r,loading:!1,error:H(e),notice:null});return}if(ye(n),E(n.origin)){X();return}Y(`login`,{values:V()})}async function be(e){await Q({host:String(e.get(`host`)??``),port:String(e.get(`port`)??``)})}async function xe(e){if(!W){J({error:`Connect to a server first.`});return}let t=String(e.get(`email`)??``).trim(),n=String(e.get(`password`)??``),r={...q(),email:t,password:n};if(!t||!n){G={kind:`auth`,theme:U,server:W,mode:`login`,values:r,loading:!1,error:`Enter both email and password.`,notice:null},$();return}G={kind:`auth`,theme:U,server:W,mode:`login`,values:r,loading:!0,error:null,notice:null},$();try{D({...await d({email:t,password:n},W),serverOrigin:W.origin}),X()}catch(e){G={kind:`auth`,theme:U,server:W,mode:`login`,values:r,loading:!1,error:H(e),notice:null},$()}}async function Se(e){if(!W){J({error:`Connect to a server first.`});return}let t=String(e.get(`name`)??``),n=String(e.get(`email`)??``).trim(),r=String(e.get(`password`)??``),i={name:t,email:n,password:r};if(!t.trim()||!n||!r){G={kind:`auth`,theme:U,server:W,mode:`signup`,values:i,loading:!1,error:`Enter your name, email, and password.`,notice:null},$();return}G={kind:`auth`,theme:U,server:W,mode:`signup`,values:i,loading:!0,error:null,notice:null},$();try{await ne({name:t.trim(),email:n,password:r},W)}catch(e){G={kind:`auth`,theme:U,server:W,mode:`signup`,values:i,loading:!1,error:H(e),notice:null},$();return}try{D({...await d({email:n,password:r},W),serverOrigin:W.origin}),X()}catch(e){Y(`login`,{error:H(e),notice:`Account created. Sign in to continue.`,values:{name:``,email:n,password:``}})}}function Ce(e,t){if(e===`submit-connection`&&t){be(t);return}if(e===`submit-login`&&t){xe(t);return}if(e===`submit-signup`&&t){Se(t);return}if(e===`toggle-theme`){Z(me(U));return}if(e===`show-login`){Y(`login`,{values:q()});return}if(e===`show-signup`){Y(`signup`,{values:q()});return}if(e===`logout`){O(),Y(`login`,{notice:`You have been signed out.`,values:V()});return}e===`change-server`&&J({values:v(W??y()),notice:null,error:null})}function $(){ge(B,G,Ce)}async function we(){let e=y();if(!e){$();return}await Q(v(e),{loadingNotice:`Checking the saved backend...`})}we();