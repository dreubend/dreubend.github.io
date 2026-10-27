# Trendward public dashboard v17

Adds the planned Premier tier at $75/month.

Tier boundary:
- Premium ($50): deepest approved 5-minute scanner intelligence.
- Premier ($75): everything in Premium plus a dedicated 1-Minute Intelligence workspace.

Premier route:
- /trendward/premier/

Premier 1-Minute Intelligence page:
1. Live 1-minute intelligence first:
   - price movement
   - liquidity acceleration
   - VWAP/high retention
   - re-acceleration
   - giveback/exhaustion
   - momentum state
2. Historical 1-minute intelligence below:
   - first 1m ignition
   - VWAP holds/losses
   - breakout attempts
   - re-acceleration points
   - MFE/MAE context
   - 5m versus 1m comparison

Current state:
- The customer-safe API does not yet expose approved one-minute fields.
- The Premier page therefore shows explicit Pending feed states rather than invented values.
- The renderer is ready to consume payload.oneMinute.live and payload.oneMinute.historical arrays later.
- Premium copy no longer claims to include one-minute evidence.
