import { chromium } from "playwright";
import { glob } from "glob";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// --- Load env (.env.local first, .env fallback) ---
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
for (const f of [".env.local", ".env"]) {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const BASE_URL  = process.env.SCREENSHOT_BASE_URL  || "http://localhost:3000";
const EMAIL     = process.env.SCREENSHOT_EMAIL;
const PASSWORD  = process.env.SCREENSHOT_PASSWORD;
const OUT_DIR   = path.join(root, "screenshots", "output");
const PAGE_WAIT = 1500; // ms extra após networkidle (animações framer-motion)

if (!EMAIL || !PASSWORD) {
  console.error("Missing SCREENSHOT_EMAIL / SCREENSHOT_PASSWORD in .env.local");
  process.exit(1);
}

// --- Discover routes from Next.js App Router ---
function discoverRoutes() {
  const files = glob.sync("src/app/**/page.{tsx,jsx,ts,js}", { cwd: root });
  const routes = new Set();
  for (const f of files) {
    let r = f
      .replace(/^src\/app/, "")
      .replace(/\/page\.(tsx|jsx|ts|js)$/, "")
      .replace(/\/\([^)]+\)/g, ""); // strips (auth), (private), (sidebar)...
    if (r === "") r = "/";
    if (r.includes("[")) continue; // skip dynamic routes
    routes.add(r);
  }
  return [...routes].sort();
}

// --- Filename safe slug from route ---
function slug(route) {
  if (route === "/") return "home";
  return route.replace(/^\//, "").replace(/\//g, "_");
}

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile",  width: 390,  height: 844, isMobile: true, deviceScaleFactor: 2 },
];

async function login(page) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
  await page.fill('input[type="email"]',    EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await Promise.all([
    page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 20000 }),
    page.click('button[type="submit"]'),
  ]);
}

async function shoot(page, route, viewportName) {
  const url = `${BASE_URL}${route}`;
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(PAGE_WAIT);
  const file = path.join(OUT_DIR, `${slug(route)}.${viewportName}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const allRoutes = discoverRoutes();
  // public (no login needed) vs private
  const publicRoutes  = allRoutes.filter((r) => /^\/(login|register|recover-password|plans|checkout|termos-de-uso|politica-de-privacidade|v0)/.test(r));
  const privateRoutes = allRoutes.filter((r) => !publicRoutes.includes(r));

  console.log(`Found ${allRoutes.length} routes (${publicRoutes.length} public, ${privateRoutes.length} private)`);

  const browser = await chromium.launch();

  for (const vp of VIEWPORTS) {
    console.log(`\n=== ${vp.name} (${vp.width}x${vp.height}) ===`);
    const ctx  = await browser.newContext({ viewport: vp, deviceScaleFactor: vp.deviceScaleFactor || 1 });
    const page = await ctx.newPage();

    // --- public first (no login) ---
    for (const r of publicRoutes) {
      try { console.log(" •", r, "→", path.basename(await shoot(page, r, vp.name))); }
      catch (e) { console.warn(" ✗", r, e.message); }
    }

    // --- login then private ---
    try {
      await login(page);
      console.log(" ↳ logged in");
    } catch (e) {
      console.error("Login failed:", e.message);
      await ctx.close();
      continue;
    }

    for (const r of privateRoutes) {
      try { console.log(" •", r, "→", path.basename(await shoot(page, r, vp.name))); }
      catch (e) { console.warn(" ✗", r, e.message); }
    }

    await ctx.close();
  }

  await browser.close();
  console.log(`\n✓ done → ${OUT_DIR}`);
})();
