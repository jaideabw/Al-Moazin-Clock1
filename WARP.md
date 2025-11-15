# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands
- Install deps: `npm install`
- Dev server (port 9002): `npm run dev`
- Type check: `npm run typecheck`
- Lint: `npm run lint`
- Build static export to `dist/`: `npm run build` (uses Next.js `output: 'export'` + `distDir: 'dist'`)
- Genkit local dev (AI flows):
  - `npm run genkit:dev`
  - `npm run genkit:watch`
- Notes:
  - This project uses static export; to serve the built site, host the `dist/` directory with any static file server (e.g. `npx serve dist`). `next start` is not used for static exports.
  - No test runner is configured (no `test` script). There is at least one test file under `src/lib/__tests__/prayerTimes.test.ts`; add Jest/Vitest if you intend to run tests.

## Project structure and architecture
- Framework: Next.js App Router + TypeScript + Tailwind CSS (shadcn/ui). Primary source lives under `src/`.
- Entrypoint UI:
  - `src/app/page.tsx` renders the main clock component `src/components/AlMoazinClock.tsx`.
  - `src/app/layout.tsx` loads global styles (`src/app/globals.css`) and Toaster.
- Core domain (AlMoazinClock): `src/components/AlMoazinClock.tsx`
  - Acts as a self‑contained state machine for prayer flow phases: `idle` → `adhan` (audio only, background) → `iqamaCountdown` → `phoneImage` → `azkar` → back to `idle`.
  - Maintains a single `settings` object (with mosque name, city/country, prayer times, offsets, iqama timings, volumes, colors, images, etc.). Persists settings in `localStorage` (splits media fields into a separate `alMoazinMediaFiles` object).
  - Timekeeping: a 1s ticking clock (client-only), with helper formatters for time, Gregorian, and Hijri dates.
  - Audio: `<audio ref>` is pre‑unlocked on first user interaction; picks Fajr or general Adhan file; respects `volume`/`isMuted`.
  - Prayer time updates:
    - Online: `fetchPrayerTimesAndWeather(force?: boolean)` calls Aladhan API (`timingsByCity`) using the mapped timezone/method from `src/lib/locations.ts`, applies user offsets, updates `settings`, and caches a normalized payload in `localStorage` (`alMoazinPrayerTimes`). Schedules the next refresh for the next Fajr, plus periodic 6h refresh and a midnight refresh.
    - Offline: `updatePrayerTimesLocally()` estimates today’s times from cached values with small day‑to‑day adjustments and applies user offsets; saves back to cache.
  - Remote configuration (for live control):
    - If `settings.remoteSyncEnabled` and `settings.remoteConfigUrl` are set, `fetchAndApplyRemoteConfig()` fetches JSON and applies changes to location, offsets, shuruq offset, and iqama timings, then calls `fetchPrayerTimesAndWeather(true)`.
    - Accepted keys in the remote JSON (case-insensitive variants shown):
      - Location: `country`/`Country`, `city`/`City`
      - Offsets (minutes): `fajrOffset|fajr`, `dhuhrOffset|dhuhr`, `asrOffset|asr`, `maghribOffset|maghrib`, `ishaOffset|isha`
      - Shuruq offset (minutes): `shuruqOffset`
      - Iqama minutes: `iqamaFajr`, `iqamaDhuhr`, `iqamaAsr`, `iqamaMaghrib`, `iqamaIsha`
- Supporting code:
  - Hooks: `src/hooks/use-clock-simple.ts` (current time tick), `src/hooks/use-toast.ts` (shadcn toast).
  - Location/time helpers: `src/lib/locations.ts`, `src/lib/utils.ts`, `src/lib/prayerTimes.ts`, plus data/utilities under `src/utils/*`.
  - UI kit: `src/components/ui/*` (shadcn components).
  - Additional clock variants and panels: `src/components/*` (e.g., `SettingsPanel.tsx`, other clock UIs).
  - AI/Genkit flows (optional): `src/ai/flows/*` (e.g., `prayer-times-flow.ts`, `weather-flow.ts`), wired by `src/ai/dev.ts` and `src/ai/genkit.ts`.

## Build/runtime configuration
- Next.js configuration:
  - `next.config.js` is the active config (JS takes precedence over TS). It sets:
    - `output: 'export'` (static export), `distDir: 'dist'`, `trailingSlash: true`, `images.unoptimized: true`, and `assetPrefix: './'` for relative assets (USB/offline use).
  - `next.config.ts` exists but is ignored at runtime due to the JS config. It relaxes type/ESLint errors during build and whitelists remote image patterns.
- TypeScript: `tsconfig.json` uses path alias `@/* → ./src/*` and `moduleResolution: bundler` (Next.js defaults).
- Styling: Tailwind with HSL CSS variables in `src/app/globals.css`; Tailwind config in `tailwind.config.ts` (dark mode via class, fonts set to Literata).

## Gotchas and tips specific to this repo
- Dev vs static export: `assetPrefix: './'` and `output: 'export'` are ideal for static hosting, but during `npm run dev` they can break HMR WebSocket paths. Consider conditionally applying these only in production:
  - `const isDev = process.env.NODE_ENV === 'development'` and set `assetPrefix: isDev ? undefined : './'`, and avoid `output: 'export'` in dev.
- Hook dependency order: In `AlMoazinClock.tsx`, define `fetchPrayerTimesAndWeather` before `fetchAndApplyRemoteConfig` or avoid referencing it in the latter’s dependency array to prevent "Cannot access '...'
  before initialization".
