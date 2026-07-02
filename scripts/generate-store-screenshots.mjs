import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outRoot = path.join(root, 'outputs', 'store-screenshots');
const appUrlToken = Date.now();

const baseScenario = {
  principal: '100',
  unit: '万円',
  rate: '1.20',
  method: 'ep',
  years: '10',
  count: '120',
  monthlyPrincipal: '',
  monthlyPrincipalUnit: '円',
  remainderAdjust: 'last',
  repayDay: '17',
  execDate: '2026-07-02',
  bonus: false,
  bonusMonth1: '6',
  bonusMonth2: '12',
  bonusAmount: '',
  wareki: false
};

const screenshotTargets = [
  {
    id: 'google-play-phone',
    label: 'Google Play phone screenshots',
    cssWidth: 360,
    cssHeight: 640,
    deviceScaleFactor: 3,
    format: 'jpeg',
    quality: 92,
    extension: 'jpg'
  },
  {
    id: 'app-store-iphone-6-9',
    label: 'App Store iPhone 6.9 inch screenshots',
    cssWidth: 440,
    cssHeight: 956,
    deviceScaleFactor: 3,
    format: 'png',
    extension: 'png'
  },
  {
    id: 'app-store-iphone-6-5',
    label: 'App Store iPhone 6.5 inch screenshots',
    cssWidth: 414,
    cssHeight: 896,
    deviceScaleFactor: 3,
    format: 'png',
    extension: 'png'
  }
];

const shots = [
  ['01-input-method', setupInputMethod],
  ['02-result-summary', setupResultSummary],
  ['03-repayment-schedule', setupSchedule],
  ['04-compare-summary', setupCompareSummary],
  ['05-compare-schedule', setupCompareSchedule],
  ['06-equal-principal-input', setupEqualPrincipalInput],
  ['07-light-mode-result', page => setupResultSummary(page, { theme: 'light' })]
];

function contentType(file) {
  const ext = path.extname(file).toLowerCase();
  return {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webmanifest': 'application/manifest+json'
  }[ext] || 'application/octet-stream';
}

async function startStaticServer() {
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://127.0.0.1');
      let name = decodeURIComponent(url.pathname);
      if (name === '/') name = '/index.html';
      const resolved = path.resolve(root, `.${name}`);
      if (!resolved.startsWith(root + path.sep) && resolved !== root) {
        response.writeHead(403);
        response.end('Forbidden');
        return;
      }
      const body = await readFile(resolved);
      response.writeHead(200, {
        'Content-Type': contentType(resolved),
        'Cache-Control': 'no-store'
      });
      response.end(body);
    } catch (_) {
      response.writeHead(404);
      response.end('Not found');
    }
  });
  const port = await getFreePort();
  await new Promise(resolve => server.listen(port, '127.0.0.1', resolve));
  return { server, origin: `http://127.0.0.1:${port}` };
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
  });
}

function resolveChromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const candidates = process.platform === 'win32'
    ? [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
      ]
    : process.platform === 'darwin'
      ? [
          '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
          '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
        ]
      : ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
  const found = candidates.find(existsSync);
  if (found) return found;
  throw new Error('Chrome or Edge was not found. Set CHROME_PATH to the browser executable and retry.');
}

async function startChrome() {
  const port = await getFreePort();
  const userDataDir = path.join(os.tmpdir(), `hensai-store-shots-${process.pid}-${Date.now()}`);
  const chrome = spawn(resolveChromePath(), [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--hide-scrollbars',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ], { stdio: 'ignore' });
  chrome.once('exit', code => {
    if (code && code !== 0) console.error(`Chrome exited with code ${code}`);
  });
  const versionUrl = `http://127.0.0.1:${port}/json/version`;
  for (let i = 0; i < 80; i++) {
    try {
      const response = await fetch(versionUrl);
      if (response.ok) {
        const version = await response.json();
        return { chrome, webSocketDebuggerUrl: version.webSocketDebuggerUrl, userDataDir };
      }
    } catch (_) {
      // Wait for the remote debugging endpoint.
    }
    await wait(100);
  }
  chrome.kill();
  throw new Error('Chrome DevTools endpoint did not start.');
}

class CDP {
  constructor(webSocketDebuggerUrl) {
    this.ws = new WebSocket(webSocketDebuggerUrl);
    this.id = 1;
    this.pending = new Map();
    this.events = [];
    this.ws.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        this.pending.get(message.id)(message);
        this.pending.delete(message.id);
      } else {
        this.events.push(message);
      }
    };
  }

  async open() {
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });
  }

  send(method, params = {}, sessionId = undefined) {
    const id = this.id++;
    this.ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, message => {
        if (message.error) reject(new Error(`${method}: ${JSON.stringify(message.error)}`));
        else resolve(message.result);
      });
    });
  }

  close() {
    this.ws.close();
  }
}

class AppPage {
  constructor(cdp, origin, target, sessionId, targetId) {
    this.cdp = cdp;
    this.origin = origin;
    this.target = target;
    this.sessionId = sessionId;
    this.targetId = targetId;
  }

  async goto(seed = {}) {
    await this.cdp.send('Page.addScriptToEvaluateOnNewDocument', {
      source: seedScript(seed)
    }, this.sessionId);
    await this.cdp.send('Page.navigate', {
      url: `${this.origin}/index.html?storeShot=${encodeURIComponent(this.target.id)}&t=${appUrlToken}-${Date.now()}`
    }, this.sessionId);
    await this.waitFor('document.readyState === "complete"');
    await this.waitFor('!document.querySelector("#splash")');
    await wait(160);
  }

  async evaluate(expression) {
    const result = await this.cdp.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true
    }, this.sessionId);
    if (result.exceptionDetails) {
      throw new Error(JSON.stringify(result.exceptionDetails, null, 2));
    }
    return result.result.value;
  }

  async waitFor(expression, timeout = 6000) {
    const started = Date.now();
    while (Date.now() - started < timeout) {
      const value = await this.evaluate(`Boolean(${expression})`);
      if (value) return;
      await wait(75);
    }
    throw new Error(`Timed out waiting for: ${expression}`);
  }

  async click(selector) {
    const safe = JSON.stringify(selector);
    await this.waitFor(`document.querySelector(${safe})`);
    await this.evaluate(`document.querySelector(${safe}).click()`);
    await wait(180);
  }

  async setValue(selector, value) {
    const safeSelector = JSON.stringify(selector);
    const safeValue = JSON.stringify(value);
    await this.waitFor(`document.querySelector(${safeSelector})`);
    await this.evaluate(`(() => {
      const el = document.querySelector(${safeSelector});
      el.value = ${safeValue};
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    })()`);
    await wait(80);
  }

  async scrollTo(selector) {
    const safe = JSON.stringify(selector);
    await this.waitFor(`document.querySelector(${safe})`);
    await this.evaluate(`document.querySelector(${safe}).scrollIntoView({ block: 'start', inline: 'nearest' })`);
    await wait(220);
  }

  async screenshot(file) {
    await this.evaluate(`(() => {
      document.documentElement.style.scrollBehavior = 'auto';
      document.body.style.caretColor = 'transparent';
    })()`);
    await wait(200);
    const params = {
      format: this.target.format,
      fromSurface: true,
      captureBeyondViewport: false
    };
    if (this.target.quality) params.quality = this.target.quality;
    const { data } = await this.cdp.send('Page.captureScreenshot', params, this.sessionId);
    await writeFile(file, Buffer.from(data, 'base64'));
  }

  async close() {
    await this.cdp.send('Target.closeTarget', { targetId: this.targetId });
  }
}

function seedScript(seed) {
  return `(() => {
    const seed = ${JSON.stringify(seed)};
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('hensai_v236_theme', seed.theme || 'dark');
    localStorage.setItem('hensai_v236_date_mode', 'western');
    if (seed.current) localStorage.setItem('hensai_v236_current', JSON.stringify(seed.current));
    if (seed.history) localStorage.setItem('hensai_v236_history', JSON.stringify(seed.history));
    if (seed.saved) localStorage.setItem('hensai_v236_saved', JSON.stringify(seed.saved));
  })();`;
}

async function createPage(cdp, origin, target) {
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  await cdp.send('Runtime.enable', {}, sessionId);
  await cdp.send('Page.enable', {}, sessionId);
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: target.cssWidth,
    height: target.cssHeight,
    deviceScaleFactor: target.deviceScaleFactor,
    mobile: true
  }, sessionId);
  await cdp.send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }]
  }, sessionId);
  return new AppPage(cdp, origin, target, sessionId, targetId);
}

async function setupInputMethod(page) {
  await page.goto();
  await page.waitFor('document.querySelector("#wizardLayer.open [data-step=\\"0\\"].active")');
}

async function setupResultSummary(page, options = {}) {
  await page.goto({ current: baseScenario, theme: options.theme || 'dark' });
  await page.waitFor('document.querySelector("#singleView:not([hidden]) .resultHero")');
}

async function setupSchedule(page) {
  await setupResultSummary(page);
  await page.click('#toggleSchedule');
  await page.waitFor('document.querySelector(".scheduleMobileItem")');
  await page.scrollTo('.scheduleCard');
}

async function setupCompareSummary(page) {
  await setupResultSummary(page);
  await createComparison(page);
  await page.waitFor('document.querySelector("#compareView:not([hidden]) .compareDeltaHero")');
}

async function setupCompareSchedule(page) {
  await setupCompareSummary(page);
  await page.click('#toggleCompareSchedules');
  await page.waitFor('document.querySelector(".compareDetailTable .scheduleCountCell")');
  await page.scrollTo('.compareDetailCard');
}

async function setupEqualPrincipalInput(page) {
  await page.goto();
  await page.waitFor('document.querySelector("#wizardLayer.open [data-step=\\"0\\"].active")');
  await page.click('#wEG');
  await page.waitFor('document.querySelector("#wizardLayer.open [data-step=\\"1\\"].active")');
  await page.click('#unitSeg [data-unit="円"]');
  await page.setValue('#wPrincipal', '1000000');
  await page.click('#wizardNext');
  await page.waitFor('document.querySelector("#wizardLayer.open [data-step=\\"2\\"].active")');
  await page.setValue('#wRate', '1.20');
  await page.click('#wizardNext');
  await page.waitFor('document.querySelector("#wizardLayer.open [data-step=\\"3\\"].active")');
  await page.setValue('#wCount', '120');
  await page.setValue('#wMonthlyPrincipal', '8333');
  await page.waitFor('document.querySelector("#monthlyPrincipalRemainder").textContent.trim().length > 0');
}

async function createComparison(page) {
  await page.click('#startCompare');
  await page.waitFor('document.querySelector("#wizardLayer.open [data-step=\\"0\\"].active")');
  await page.click('#wizardNext');
  await page.waitFor('document.querySelector("#wizardLayer.open [data-step=\\"1\\"].active")');
  await page.setValue('#wPrincipal', '100');
  await page.click('#wizardNext');
  await page.waitFor('document.querySelector("#wizardLayer.open [data-step=\\"2\\"].active")');
  await page.setValue('#wRate', '1.70');
  await page.click('#wizardNext');
  await page.waitFor('document.querySelector("#wizardLayer.open [data-step=\\"3\\"].active")');
  await page.setValue('#wYears', '10');
  await page.click('#wizardNext');
  await page.waitFor('document.querySelector("#wizardLayer.open [data-step=\\"4\\"].active")');
  await page.setValue('#wRepayDay', '17');
  await page.setValue('#wExecDate', '2026-07-02');
  await page.click('#wizardNext');
  await page.waitFor('document.querySelector("#compareView:not([hidden])")');
}

async function captureFeatureGraphic(cdp, origin) {
  const target = {
    id: 'google-play-feature-graphic',
    cssWidth: 1024,
    cssHeight: 500,
    deviceScaleFactor: 1,
    format: 'jpeg',
    quality: 94,
    extension: 'jpg'
  };
  const page = await createPage(cdp, origin, target);
  const outDir = path.join(outRoot, 'google-play');
  await mkdir(outDir, { recursive: true });
  try {
    await page.goto({ current: baseScenario });
    await page.evaluate(`(() => {
      document.body.innerHTML = \`
        <main class="featureShot">
          <section>
            <div class="eyebrow">REPAYMENT SIMULATION</div>
            <h1>返済試算</h1>
            <p>月々の返済額、総返済額、予定表、A/B比較を端末内で確認。</p>
          </section>
          <aside>
            <img src="./proposal_logo_light_transparent.png" alt="">
            <div class="miniCard"><span>月々返済額</span><strong>8,770円</strong></div>
            <div class="miniCard"><span>利息総額</span><strong>52,400円</strong></div>
          </aside>
        </main>\`;
      const style = document.createElement('style');
      style.textContent = \`
        html,body{width:1024px;height:500px;margin:0;overflow:hidden;background:#06142d;color:#f6fbff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
        .featureShot{position:relative;box-sizing:border-box;width:1024px;height:500px;padding:58px 72px;display:grid;grid-template-columns:1.18fr .82fr;gap:42px;align-items:center;background:radial-gradient(circle at 82% 12%,rgba(168,231,255,.30),transparent 34%),linear-gradient(135deg,#06142d,#0d3270 58%,#1359b7)}
        .featureShot:after{content:"";position:absolute;right:-64px;bottom:-114px;width:350px;height:350px;border-radius:50%;border:1px solid rgba(190,232,255,.30);box-shadow:0 0 0 34px rgba(94,177,255,.07)}
        .eyebrow{font-size:22px;letter-spacing:.12em;color:#a8e7ff;font-weight:800}
        h1{margin:14px 0 0;font-size:84px;line-height:1;font-weight:950;letter-spacing:0}
        p{margin:24px 0 0;max-width:560px;font-size:30px;line-height:1.45;color:#dbeeff;font-weight:700}
        aside{position:relative;z-index:1;display:grid;gap:18px;justify-items:stretch}
        img{width:160px;height:160px;justify-self:end;filter:drop-shadow(0 18px 28px rgba(0,0,0,.25))}
        .miniCard{padding:22px 24px;border:1px solid rgba(217,239,255,.36);border-radius:24px;background:rgba(255,255,255,.13);backdrop-filter:blur(8px)}
        .miniCard span{display:block;color:#bdeaff;font-size:20px;font-weight:900}
        .miniCard strong{display:block;margin-top:8px;font-size:38px;line-height:1;color:#fff;font-weight:950}
      \`;
      document.head.appendChild(style);
    })()`);
    const file = path.join(outDir, 'feature-graphic-1024x500.jpg');
    await page.screenshot(file);
    return { file: relative(file), ...imageSize(await readFile(file)) };
  } finally {
    await page.close();
  }
}

async function captureAll() {
  await rm(outRoot, { recursive: true, force: true });
  await mkdir(outRoot, { recursive: true });
  const { server, origin } = await startStaticServer();
  const chrome = await startChrome();
  const cdp = new CDP(chrome.webSocketDebuggerUrl);
  const manifest = {
    generatedAt: new Date().toISOString(),
    outputDirectory: relative(outRoot),
    assets: []
  };
  try {
    await cdp.open();
    manifest.assets.push(await captureFeatureGraphic(cdp, origin));
    for (const target of screenshotTargets) {
      const targetDir = path.join(outRoot, target.id);
      await mkdir(targetDir, { recursive: true });
      for (const [name, setup] of shots) {
        const page = await createPage(cdp, origin, target);
        const file = path.join(targetDir, `${name}.${target.extension}`);
        try {
          await setup(page);
          await page.screenshot(file);
          const size = imageSize(await readFile(file));
          manifest.assets.push({
            file: relative(file),
            target: target.id,
            label: target.label,
            shot: name,
            ...size
          });
          console.log(`${relative(file)} ${size.width}x${size.height}`);
        } finally {
          await page.close();
        }
      }
    }
    const manifestFile = path.join(outRoot, 'manifest.json');
    await writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    console.log(`Wrote ${relative(manifestFile)}`);
  } finally {
    try {
      cdp.close();
    } catch (_) {
      // Ignore shutdown races.
    }
    if (!chrome.chrome.killed) {
      chrome.chrome.kill();
      await wait(400);
    }
    await new Promise(resolve => server.close(resolve));
    try {
      await rm(chrome.userDataDir, { recursive: true, force: true });
    } catch (error) {
      console.warn(`Skipped temporary Chrome profile cleanup: ${error.message}`);
    }
  }
}

function imageSize(buffer) {
  if (buffer[0] === 0x89 && buffer.toString('ascii', 1, 4) === 'PNG') {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      if (marker >= 0xc0 && marker <= 0xc3) {
        return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
      }
      offset += 2 + length;
    }
  }
  return { width: 0, height: 0 };
}

function relative(file) {
  return path.relative(root, file).replaceAll(path.sep, '/');
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

await captureAll().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
