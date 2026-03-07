import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import puppeteer from 'puppeteer';

const DIST_DIR = path.resolve(process.cwd(), 'dist');

const ROUTES = [
  // Root (redirects to /lt or /en in-app; saved as dist/index.html)
  '/',
  // Main indexable pages
  '/lt/',
  '/en/',
  '/lt/planai/',
  '/en/plans/',
  '/lt/svorio-metimo-programa/',
  '/en/weight-loss-program/',
  '/lt/dovanu-kuponas/',
  '/en/gift-card/',
  '/lt/privatumas/',
  '/en/privacy/',
  '/lt/taisykles/',
  '/en/terms/',
  '/lt/grazinimas/',
  '/en/refunds/',
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForHttpOk(url, timeoutMs = 20_000) {
  const start = Date.now();
  // simple fetch loop; works in Node 18+
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const resp = await fetch(url, { redirect: 'follow' });
      if (resp.ok) return;
    } catch {
      // ignore
    }

    if (Date.now() - start > timeoutMs) {
      throw new Error(`Timed out waiting for ${url}`);
    }
    await sleep(200);
  }
}

function routeToOutputFile(route) {
  const clean = String(route).replace(/^\//, '').replace(/\/+$/, '');
  // "lt" -> dist/lt/index.html
  // "lt/planai" -> dist/lt/planai/index.html
  const dir = path.join(DIST_DIR, clean);
  return path.join(dir, 'index.html');
}

function routeToNavigate(route) {
  // Our SPA root (/) immediately client-redirects to /lt or /en, which produces
  // an effectively empty HTML snapshot. For SEO/prerendering we want a real
  // homepage at dist/index.html, so we render the canonical LT homepage.
  if (route === '/') return '/lt';
  return route;
}

function startPreviewServer(port) {
  const viteBin = path.resolve(process.cwd(), 'node_modules', 'vite', 'bin', 'vite.js');
  const child = spawn(process.execPath, [viteBin, 'preview', '--strictPort', '--port', String(port)], {
    stdio: 'inherit',
    env: process.env,
  });

  return child;
}

async function main() {
  const port = Number(process.env.PRERENDER_PORT || 4173);
  const baseUrl = `http://localhost:${port}`;

  console.log(`[prerender] Starting vite preview on ${baseUrl}`);
  const server = startPreviewServer(port);

  const shutdown = async () => {
    try {
      server.kill();
    } catch {
      // ignore
    }
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  try {
    await waitForHttpOk(`${baseUrl}/`, 30_000);

    console.log('[prerender] Launching headless browser');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 720 });

      // Prevent Stripe from injecting dynamic iframes into the DOM during prerender.
      // Those iframes include preview-origin referrers (localhost) which we don't want
      // baked into static HTML.
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const url = req.url();
        if (url.includes('stripe.com') || url.includes('stripe.network')) {
          req.abort();
          return;
        }
        req.continue();
      });

      for (const route of ROUTES) {
        const navigateRoute = routeToNavigate(route);
        const url = `${baseUrl}${navigateRoute}`;
        console.log(`[prerender] Rendering ${route}`);

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
        // Give React/Helmet time to update <head> and layout.
        await page.waitForSelector('#root', { timeout: 30_000 });
        await sleep(1200);

        // Remove 3rd-party dynamic elements that are not useful for SEO and can
        // bake preview-origin refs (e.g., Stripe's injected iframes with localhost referrers).
        await page.evaluate(() => {
          document
            .querySelectorAll(
              'iframe[name^="__privateStripe"], iframe[src*="js.stripe.com"], script[src*="js.stripe.com"]'
            )
            .forEach((el) => el.remove());
        });

        // Give any pending tasks a moment, then sweep again.
        await sleep(50);
        await page.evaluate(() => {
          document
            .querySelectorAll(
              'iframe[name^="__privateStripe"], iframe[src*="js.stripe.com"], script[src*="js.stripe.com"]'
            )
            .forEach((el) => el.remove());
        });

        const html = await page.content();
        const outFile = routeToOutputFile(route);
        await mkdir(path.dirname(outFile), { recursive: true });
        await writeFile(outFile, html, 'utf8');
      }

      console.log('[prerender] Done');
    } finally {
      await browser.close();
    }
  } finally {
    await shutdown();
  }
}

main().catch((err) => {
  console.error('[prerender] Failed:', err);
  process.exitCode = 1;
});
