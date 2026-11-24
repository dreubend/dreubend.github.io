# Trendward V2.16 Production Integration Staging

This package is intended to deploy under `/trendward/next/` only.

## Purpose
- Validate the approved V2.16 production shell on the real website.
- Keep all values static/sample during this stage.
- Do not load `live-data.js`, `auth.js`, `tier-experience.js`, or `trendward-restructure.js` yet.
- Do not alter the existing `/trendward/`, `/trendward/pro/`, `/trendward/premium/`, or `/trendward/premier/` pages.

## Preserved production architecture for later reconnection
The existing production source package was inspected before this staging build. The next integration phase will map the customer-safe `trendward_public_v1` snapshot into the approved Scanner, Watchlist and Historical layouts while preserving existing authentication and backend entitlements.

## Current staging routes
- `/trendward/next/` -> Scanner
- `/trendward/next/scanner.html`
- `/trendward/next/watchlist.html`
- `/trendward/next/historical.html`
- `/trendward/next/settings.html`
