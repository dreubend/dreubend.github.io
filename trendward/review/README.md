# Trendward UI Prototype V2

This prototype implements the approved visual direction:

- **Scanner** — based on the “Trendward Neon Trading Scanner” reference.
- **Watchlist** — based on the “Trendward Watchlist Dashboard” reference, with the far-left sidebar removed.
- **AI Historical Analytics** — based on the “Trendward Historical Intelligence Dashboard” reference.
- **Signals removed** from the shared top navigation.
- **Settings** includes a working hue slider. The accent value persists in `localStorage` and updates all pages.
- **Overview content moved into About** in the footer.
- **Glossary** is a separate footer modal.

This is an isolated UI prototype using sample data. It does not connect to live Trendward APIs, IBKR, billing, authentication, or paper-trading data.

## Preview

From the parent folder:

```powershell
python -m http.server 8080
```

Then open:

- `/Trendward_UI_Prototype_V2/scanner.html`
- `/Trendward_UI_Prototype_V2/watchlist.html`
- `/Trendward_UI_Prototype_V2/historical.html`
- `/Trendward_UI_Prototype_V2/settings.html`

## Production migration notes

When this visual version is approved, map fields to the existing customer-safe `/api/trendward/snapshot` data rather than replacing scanner logic. Keep actual paper trades private and keep historical fidelity labels explicit.


## V2.6 layout fix
Lower intelligence cards now flow across the full page beneath the two primary columns, eliminating dead-space caused by unequal column heights.


## V2.8 watchlist table normalization
The Watchlist table now uses the same font size, row height, symbol sizing, badge sizing, and score-pill sizing as Scanner and AI Historical Analytics.


## V2.9 mobile responsive pass
Phone layouts now use compact navigation, 2-column pulse metrics, horizontal-scroll tables with sticky rank/symbol columns, full-width detail cards/charts, vertical Model Journey steps, single-column lower intelligence cards, and mobile-friendly footer/modals. Desktop behavior is unchanged above 820px.
