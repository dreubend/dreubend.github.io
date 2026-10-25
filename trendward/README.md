# Trendward public dashboard preview

Target URL: `https://reubendecker.com/trendward/`

This is a standalone public product-preview dashboard with illustrative data only. It is intentionally separate from the private VPS scanner dashboard.

## Deploy
Copy the `trendward/` folder into the GitHub Pages repository that serves `reubendecker.com`, then commit and push.

```bash
mkdir -p trendward
cp -a /path/to/package/* trendward/
git add trendward
git commit -m "Add Trendward public dashboard preview"
git push
```

## Keep private
Never put `.env`, `*.sqlite3`, `*.db`, IBKR credentials, API keys, tokens, private logs, paper-trade records, or private certificates into this public directory.

## Transition plan
- `reubendecker.com/trendward/` — public Trendward product/demo experience.
- `dashboard.reubendecker.com` — keep existing private service unchanged for now.
- Later, repurpose `dashboard.reubendecker.com` into internal product-usage / operations analytics.
- Do not delete `/history` until this public page has been deployed and tested.

## Next stage
After the visual direction is approved, wire this page to a deliberately customer-safe API or a periodically generated public snapshot. Do not directly expose the existing private dashboard API.
