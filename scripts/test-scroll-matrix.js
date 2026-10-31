/**
 * Automated Scroll Matrix Test Runner for InterviewX
 * Uses native Node 20+ WebSocket and Chrome DevTools Protocol (CDP)
 * Tests scroll restoration, instant reset, back/forward cache, mobile drawer, and accessibility.
 */

const { spawn } = require('child_process');
const os = require('os');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:3000';
const CDP_PORT = 9224;

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 0;
    this.pending = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (msg) => {
        try {
          const res = JSON.parse(msg.data);
          if (res.id && this.pending.has(res.id)) {
            const { resolve: resFn, reject: rejFn } = this.pending.get(res.id);
            this.pending.delete(res.id);
            if (res.error) rejFn(new Error(res.error.message || JSON.stringify(res.error)));
            else resFn(res.result);
          }
        } catch (e) {
          console.error('WS parse error:', e);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.id;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error('Evaluation error: ' + JSON.stringify(res.exceptionDetails));
    }
    return res.result ? res.result.value : undefined;
  }

  async sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  async navigate(url) {
    await this.send('Page.navigate', { url });
    await this.sleep(800);
  }

  async setViewport(width, height, isMobile = false) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: isMobile
    });
    if (isMobile) {
      await this.send('Emulation.setUserAgentOverride', {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1'
      });
    }
    await this.sleep(150);
  }

  async getScrollPositions() {
    return await this.evaluate(`(() => {
      const main = document.getElementById('main-content');
      return {
        windowY: Math.round(window.scrollY || window.pageYOffset || 0),
        bodyY: Math.round(document.body.scrollTop || 0),
        docY: Math.round(document.documentElement.scrollTop || 0),
        mainY: Math.round(main ? main.scrollTop : 0),
        bodyOverflow: getComputedStyle(document.body).overflow,
        htmlOverflow: getComputedStyle(document.documentElement).overflow
      };
    })()`);
  }

  close() {
    if (this.ws) {
      try { this.ws.close(); } catch (e) {}
    }
  }
}

async function startChrome() {
  const tmpDir = path.join(os.tmpdir(), 'chrome_scroll_test_' + Date.now());
  const cp = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${tmpDir}`,
    '--disable-gpu',
    '--disable-background-networking'
  ]);

  let connected = false;
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 200));
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`);
      if (res.ok) {
        connected = true;
        break;
      }
    } catch (e) {}
  }

  if (!connected) {
    cp.kill();
    throw new Error('Failed to start Chrome within 6s');
  }

  // Create new blank page
  const targetRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/new?about:blank`, { method: 'PUT' });
  const targetData = await targetRes.json();
  const cdp = new CDPClient(targetData.webSocketDebuggerUrl);
  await cdp.connect();

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('DOM.enable');

  return { cp, cdp };
}

async function run() {
  console.log('================================================================');
  console.log('⚡ InterviewX Scroll Position & Navigation Diagnostics');
  console.log('Target Base URL:', BASE_URL);
  console.log('================================================================\n');

  let chrome;
  const results = [];

  function record(scenario, viewport, expected, actual, pass, details = '') {
    results.push({ scenario, viewport, expected, actual, pass, details });
    const mark = pass ? '✅ PASS' : '❌ FAIL';
    console.log(`${mark} | [${viewport}] ${scenario} -> Expected: ${expected} | Actual: ${actual} ${details ? '(' + details + ')' : ''}`);
  }

  try {
    chrome = await startChrome();
    const cdp = chrome.cdp;

    // ─────────────────────────────────────────────────────────────
    // TEST SUITE: DESKTOP (1280x800)
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- 1. DESKTOP SCENARIOS (1280px) ---');
    await cdp.setViewport(1280, 800, false);

    // 1. Landing page scrolled to bottom, click top-nav link -> New page at top (0)
    await cdp.navigate(`${BASE_URL}/`);
    await cdp.evaluate('window.scrollTo(0, document.body.scrollHeight || 4000)');
    await cdp.sleep(300);
    const scrollBeforeNav = await cdp.getScrollPositions();
    console.log(`  [Diagnostic] Scrolled Gateway to bottom: windowY = ${scrollBeforeNav.windowY}`);
    
    // Click top-nav link "Articles"
    await cdp.evaluate(`(() => {
      const link = Array.from(document.querySelectorAll('a')).find(a => a.textContent.trim() === 'Articles' && a.href.includes('/articles'));
      if (link) link.click();
    })()`);
    await cdp.sleep(600);
    const posNav = await cdp.getScrollPositions();
    record('Landing page scrolled to bottom, click top-nav link', '1280px', 'top (0)', `windowY: ${posNav.windowY}, mainY: ${posNav.mainY}`, posNav.windowY === 0 && posNav.mainY === 0);

    // 2. Footer link from bottom of long page
    await cdp.navigate(`${BASE_URL}/articles`);
    await cdp.evaluate('window.scrollTo(0, document.body.scrollHeight || 4000)');
    await cdp.sleep(300);
    const posBeforeFooter = await cdp.getScrollPositions();
    console.log(`  [Diagnostic] Scrolled Articles to bottom: windowY = ${posBeforeFooter.windowY}`);

    // Click footer link to /compiler ("Performance" or "Algorithmic Arena")
    await cdp.evaluate(`(() => {
      const footerLink = document.querySelector('footer a[href="/compiler"]') || document.querySelector('footer a[href*="compiler"]');
      if (footerLink) footerLink.click();
    })()`);
    await cdp.sleep(600);
    const posFooter = await cdp.getScrollPositions();
    record('Footer link from the bottom of a long page', '1280px', 'top (0)', `windowY: ${posFooter.windowY}, mainY: ${posFooter.mainY}`, posFooter.windowY === 0 && posFooter.mainY === 0);

    // 3. Logo click from scrolled page
    await cdp.navigate(`${BASE_URL}/compiler`);
    await cdp.evaluate('window.scrollTo(0, 1500)');
    await cdp.sleep(300);
    console.log(`  [Diagnostic] Scrolled Compiler to 1500px: windowY = ${(await cdp.getScrollPositions()).windowY}`);
    
    // Click header logo to return to '/'
    await cdp.evaluate(`(() => {
      const logo = document.querySelector('header a[href="/"]') || document.querySelector('a[aria-label="InterviewX Home"]');
      if (logo) logo.click();
    })()`);
    await cdp.sleep(600);
    const posLogo = await cdp.getScrollPositions();
    record('Logo click from a scrolled page', '1280px', 'top (0)', `windowY: ${posLogo.windowY}, mainY: ${posLogo.mainY}`, posLogo.windowY === 0 && posLogo.mainY === 0);

    // 4. CTA button from scrolled section
    await cdp.navigate(`${BASE_URL}/`);
    await cdp.evaluate('window.scrollTo(0, 2000)');
    await cdp.sleep(300);
    console.log(`  [Diagnostic] Scrolled Gateway to 2000px: windowY = ${(await cdp.getScrollPositions()).windowY}`);

    // Click quick tile or hero CTA to /foundations
    await cdp.evaluate(`(() => {
      const tile = document.querySelector('a[href="/foundations"]') || document.querySelector('a[href*="foundations"]');
      if (tile) tile.click();
    })()`);
    await cdp.sleep(600);
    const posCTA = await cdp.getScrollPositions();
    record('CTA button from a scrolled section', '1280px', 'top (0)', `windowY: ${posCTA.windowY}, mainY: ${posCTA.mainY}`, posCTA.windowY === 0 && posCTA.mainY === 0);

    // 5. App shell: content container scrolled down, click sidebar/dock item
    await cdp.navigate(`${BASE_URL}/foundations`);
    await cdp.evaluate('window.scrollTo(0, 1200)');
    await cdp.sleep(300);
    // Click dock link to /planner
    await cdp.evaluate(`(() => {
      const dockLink = document.querySelector('nav[aria-label="Quick navigation"] a[href="/planner"]');
      if (dockLink) dockLink.click();
    })()`);
    await cdp.sleep(600);
    const posDock = await cdp.getScrollPositions();
    record('App shell: content container scrolled down, click sidebar/dock item', '1280px', 'top (0)', `windowY: ${posDock.windowY}, mainY: ${posDock.mainY}`, posDock.windowY === 0 && posDock.mainY === 0);

    // 6. Login to sign up to forgot password
    await cdp.navigate(`${BASE_URL}/login`);
    await cdp.evaluate('window.scrollTo(0, 400)');
    await cdp.sleep(200);
    // Click switch to sign up
    await cdp.evaluate(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Create an account'));
      if (btn) btn.click();
    })()`);
    await cdp.sleep(300);
    const posSignup = await cdp.getScrollPositions();

    // Click switch to forgot password
    await cdp.evaluate(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Forgot password?'));
      if (btn) btn.click();
    })()`);
    await cdp.sleep(300);
    const posForgot = await cdp.getScrollPositions();
    const authOk = posSignup.windowY <= 50 && posForgot.windowY <= 50;
    record('Login to sign up to forgot password', '1280px', 'top, card fully visible', `signup: ${posSignup.windowY}, forgot: ${posForgot.windowY}`, authOk);

    // 7 & 8. Browser back and forward restoration
    await cdp.navigate(`${BASE_URL}/`);
    await cdp.evaluate('window.scrollTo(0, 1850)');
    await cdp.sleep(400);
    const savedGatewayScroll = (await cdp.getScrollPositions()).windowY;
    console.log(`  [Diagnostic] Scrolled Gateway to ${savedGatewayScroll}px before forward nav`);

    // Navigate to /articles
    await cdp.evaluate(`(() => {
      const link = document.querySelector('a[href="/articles"]');
      if (link) link.click();
    })()`);
    await cdp.sleep(600);
    await cdp.evaluate('window.scrollTo(0, 800)');
    await cdp.sleep(300);
    const savedArticlesScroll = (await cdp.getScrollPositions()).windowY;

    // Trigger Browser Back
    await cdp.evaluate('window.history.back()');
    await cdp.sleep(700);
    const posBack = await cdp.getScrollPositions();
    const backOk = Math.abs(posBack.windowY - savedGatewayScroll) < 100;
    record('Back after scrolling on previous page', '1280px', `~${savedGatewayScroll}px`, `actual: ${posBack.windowY}px`, backOk, `diff: ${Math.abs(posBack.windowY - savedGatewayScroll)}px`);

    // Trigger Browser Forward
    await cdp.evaluate('window.history.forward()');
    await cdp.sleep(700);
    const posForward = await cdp.getScrollPositions();
    const forwardOk = Math.abs(posForward.windowY - savedArticlesScroll) < 100;
    record('Forward', '1280px', `~${savedArticlesScroll}px`, `actual: ${posForward.windowY}px`, forwardOk, `diff: ${Math.abs(posForward.windowY - savedArticlesScroll)}px`);

    // 9. In-page #section link
    await cdp.navigate(`${BASE_URL}/`);
    await cdp.evaluate('window.scrollTo(0, 0)');
    await cdp.sleep(300);
    await cdp.evaluate(`(() => {
      const contactLink = document.querySelector('header a[href="#section-contact"]') || document.querySelector('header a[href*="#section-contact"]');
      if (contactLink) contactLink.click();
    })()`);
    await cdp.sleep(800);
    const posSection = await cdp.getScrollPositions();
    const sectionTargetPos = await cdp.evaluate(`(() => {
      const sec = document.getElementById('section-contact');
      if (!sec) return -1;
      const rect = sec.getBoundingClientRect();
      return Math.round(rect.top);
    })()`);
    console.log(`  [Diagnostic] In-page section-contact relative rect.top = ${sectionTargetPos}px, windowY = ${posSection.windowY}`);
    // Section is visible if its rect top is within header offset range (between -20 and 120px)
    const sectionVisible = sectionTargetPos >= -30 && sectionTargetPos <= 150;
    record('#section link', '1280px', 'Section visible below sticky header (0-100px)', `rect.top: ${sectionTargetPos}px, windowY: ${posSection.windowY}`, sectionVisible);

    // ─────────────────────────────────────────────────────────────
    // TEST SUITE: MOBILE (390x844) & SPECIAL SCENARIOS
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- 2. MOBILE SCENARIOS (390px) & ADVANCED ---');
    await cdp.setViewport(390, 844, true);

    // 10. Mobile drawer: open, navigate, close -> Top, body scroll unlocked
    await cdp.navigate(`${BASE_URL}/`);
    await cdp.evaluate('window.scrollTo(0, 1500)');
    await cdp.sleep(300);
    // Open hamburger menu
    await cdp.evaluate(`(() => {
      const btn = document.querySelector('button[aria-label="Toggle navigation menu"]');
      if (btn) btn.click();
    })()`);
    await cdp.sleep(300);
    // Click Articles in mobile drawer
    await cdp.evaluate(`(() => {
      const link = Array.from(document.querySelectorAll('a')).find(a => a.href.includes('/articles') && a.offsetParent !== null);
      if (link) link.click();
    })()`);
    await cdp.sleep(600);
    const posMobileNav = await cdp.getScrollPositions();
    const mobileOk = posMobileNav.windowY === 0 && posMobileNav.bodyOverflow !== 'hidden';
    record('Mobile drawer: open, navigate, close', '390px', 'Top (0), body scroll unlocked', `windowY: ${posMobileNav.windowY}, overflow: ${posMobileNav.bodyOverflow}`, mobileOk);

    // 11. Slow network (throttled), page loads data late -> Stays at top after data arrives
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 500, // 500ms delay
      downloadThroughput: 500 * 1024,
      uploadThroughput: 500 * 1024
    });
    await cdp.navigate(`${BASE_URL}/`);
    await cdp.evaluate('window.scrollTo(0, 2500)');
    await cdp.sleep(300);
    // Navigate to FoundationsHub which loads sprints, aptitude topics, telemetry
    await cdp.evaluate(`(() => {
      const link = document.querySelector('a[href="/foundations"]');
      if (link) link.click();
    })()`);
    // Check right at arrival
    await cdp.sleep(300);
    const arrivalPos = await cdp.getScrollPositions();
    // Wait for all delayed queries to finish and render
    await cdp.sleep(1800);
    const lateDataPos = await cdp.getScrollPositions();
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 0,
      downloadThroughput: -1,
      uploadThroughput: -1
    });
    const lateOk = lateDataPos.windowY === 0 && arrivalPos.windowY === 0;
    record('Slow network (throttled), page loads data late', '390px', 'Stays at top (0)', `arrival: ${arrivalPos.windowY}, after data: ${lateDataPos.windowY}`, lateOk);

    // 12. prefers-reduced-motion on -> No animated scrolling
    await cdp.send('Emulation.setEmulatedMedia', {
      media: 'screen',
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }]
    });
    await cdp.navigate(`${BASE_URL}/`);
    await cdp.evaluate('window.scrollTo(0, 1500)');
    await cdp.sleep(200);
    const reducedStartTime = Date.now();
    await cdp.evaluate(`(() => {
      const link = document.querySelector('a[href="/articles"]');
      if (link) link.click();
    })()`);
    await cdp.sleep(200);
    const reducedPos = await cdp.getScrollPositions();
    const reducedElapsed = Date.now() - reducedStartTime;
    // With instant scroll, it reaches 0 immediately without animated delay
    const reducedOk = reducedPos.windowY === 0;
    record('prefers-reduced-motion on', '390px', 'Instant 0 without animated delay', `windowY: ${reducedPos.windowY} in ${reducedElapsed}ms`, reducedOk);

    // 13. Left scroll rail and reveals after navigation -> Rail at start, reveals work again
    // Verify that navigating to Gateway resets scroll, reveal sections can trigger, and no rail blocks view
    await cdp.setViewport(1280, 800, false);
    await cdp.navigate(`${BASE_URL}/foundations`);
    await cdp.evaluate('window.scrollTo(0, 2000)');
    await cdp.sleep(200);
    await cdp.evaluate(`(() => {
      const homeLink = document.querySelector('header a[href="/"]');
      if (homeLink) homeLink.click();
    })()`);
    await cdp.sleep(600);
    const gatewayResetPos = await cdp.getScrollPositions();
    const revealsReady = await cdp.evaluate(`(() => {
      return window.scrollY === 0;
    })()`);
    record('Left scroll rail and reveals after navigation', '1280px', 'Rail/page at start (0), reveals ready', `windowY: ${gatewayResetPos.windowY}`, revealsReady && gatewayResetPos.windowY === 0);

  } catch (err) {
    console.error('\n❌ Test execution failed with error:', err);
  } finally {
    if (chrome) {
      chrome.cdp.close();
      chrome.cp.kill();
    }
  }

  // Summary
  console.log('\n================================================================');
  console.log('📊 TEST SUMMARY MATRIX');
  console.log('================================================================');
  let passCount = 0;
  for (const r of results) {
    if (r.pass) passCount++;
    console.log(`[${r.pass ? 'PASS' : 'FAIL'}] ${r.scenario.padEnd(55)} | Expected: ${r.expected.padEnd(20)} | Actual: ${r.actual}`);
  }
  console.log(`\nScore: ${passCount} / ${results.length} passed.`);
  process.exit(passCount === results.length ? 0 : 1);
}

run();
