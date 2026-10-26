# Trendward public dashboard v3

Target: `https://reubendecker.com/trendward/`

## v3 changes
- Removed the prominent Free / Basic / Pro / Premium selector from the dashboard Overview.
- Moved plan simulation into Settings as a compact dropdown.
- Added a small current-plan badge near account controls.
- Fixed duplicate mobile-menu event handling and kept tap-outside-to-close behavior.
- Guarded the optional local-time element so JavaScript does not stop if that header element is absent.
- Tier preview now also limits Scanner cards, not only the Overview table.
- Retains browser-only preview authentication and the customer-safe live-data hook.

The preview login is not production authentication. Do not connect this GitHub Pages site directly to private scanner APIs or credentials.
