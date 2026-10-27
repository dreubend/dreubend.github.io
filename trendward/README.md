# Trendward public dashboard v13

Real-data polish for the customer-safe scanner API.

- Keeps v12 refresh/hash routing fix.
- Uses https://dashboard.reubendecker.com/api/public/trendward/snapshot.
- Clearly labels stale scanner data and shows scanner capture time.
- Uses neutral styling for descriptive market-strip labels.
- Enforces visible setup depth: Free 1, Basic 4, Pro 8, Premium 11.
- Drives tier visuals from real 5-minute scanner/model/liquidity fields.
- Pro/Premium show resolved 15/30/60m outcomes only when an approved outcome object exists.
- Premium does not fabricate 1-minute evidence; it explicitly shows the layer as unavailable until the public API exposes approved 1-minute fields.
- No paper trades, positions, orders, account data, or private raw model inputs are exposed by the frontend.
