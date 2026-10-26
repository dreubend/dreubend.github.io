# Trendward public dashboard v7

Cumulative build:
- Separate Free / Basic / Pro / Premium routes
- Native sidebar and action links
- Right-click / middle-click / copy-link support
- Robust startup routing for hash URLs
- Customer-safe public data-feed foundation

## Routing fix
Opening a link such as `/trendward/#scanner` or `/trendward/pro/#journey`
in a new tab now activates that section on the first page load. No refresh
should be required.

The router runs on DOMContentLoaded, load, hashchange, and browser back/forward.
Normal left-clicks keep the smooth dashboard behavior while alternate browser
navigation remains native.

## Tier routes
- Free: `/trendward/`
- Basic: `/trendward/basic/`
- Pro: `/trendward/pro/`
- Premium: `/trendward/premium/`
