
(() => {
  const root = document.documentElement;
  const KEY = "trendward-hue";
  const saved = localStorage.getItem(KEY);
  const hue = Number.isFinite(Number(saved)) ? Number(saved) : 170;
  root.style.setProperty("--hue", hue);

  const slider = document.getElementById("accentSlider");
  const value = document.getElementById("accentValue");
  if (slider) {
    slider.value = String(hue);
    if (value) value.textContent = `${hue}°`;
    slider.addEventListener("input", e => {
      const h = Number(e.target.value);
      root.style.setProperty("--hue", h);
      localStorage.setItem(KEY, String(h));
      if (value) value.textContent = `${h}°`;
    });
  }
  const reset = document.getElementById("resetAccent");
  if (reset) reset.addEventListener("click", () => {
    const h = 170;
    root.style.setProperty("--hue", h);
    localStorage.setItem(KEY, String(h));
    if (slider) slider.value = String(h);
    if (value) value.textContent = `${h}°`;
  });

  const page = document.body.dataset.page;
  document.querySelectorAll("[data-nav]").forEach(a => {
    a.classList.toggle("active", a.dataset.nav === page);
  });

  const modal = document.getElementById("infoModal");
  const title = document.getElementById("modalTitle");
  const body = document.getElementById("modalBody");

  const ABOUT = `
    <p><strong>Trendward</strong> is a market-intelligence workspace focused on lower-priced U.S.-listed equities. It is designed to surface developing setups by combining liquidity acceleration, price confirmation, catalyst and structure context, and historical model evidence.</p>
    <h3>How Trendward thinks</h3>
    <p><strong>Potential energy</strong> asks why a stock may matter: catalysts, float, dilution, filings, earnings, contracts, FDA events, and other structural factors.</p>
    <p><strong>Ignition</strong> watches for changing liquidity: 5-minute and 15-minute volume acceleration, dollar-volume acceleration, abnormal participation, and other state changes.</p>
    <p><strong>Price confirmation</strong> asks whether the market is validating that activity: VWAP retention, proximity to highs, resistance breaks, higher lows, limited giveback, and continued price progress.</p>
    <h3>What the pages do</h3>
    <p><strong>Scanner:</strong> what is changing right now. <strong>Watchlist:</strong> what you chose to keep monitoring. <strong>AI Historical Analytics:</strong> what Trendward saw historically and how comparable setups evolved.</p>
    <p>Trendward is an analytical and research product. It does not guarantee outcomes and customer-facing pages do not expose paper-trading activity.</p>
  `;

  const GLOSSARY = `
    <dl>
      <dt>Discovery</dt><dd>The earliest state where unusual activity or setup characteristics begin to qualify for attention.</dd>
      <dt>Liquidity Expansion</dt><dd>Participation is increasing relative to the stock's recent baseline.</dd>
      <dt>Ignition</dt><dd>Liquidity expansion begins to combine with constructive price behavior.</dd>
      <dt>Promotion</dt><dd>A setup advances into deeper model or scanner consideration.</dd>
      <dt>Confirmation</dt><dd>Price behavior supports the setup through VWAP/high retention, resistance behavior, or continued progress.</dd>
      <dt>Trendward Score</dt><dd>A compact ranking signal used to organize visible setups. It is analytical evidence, not a guarantee or literal probability.</dd>
      <dt>VWAP</dt><dd>Volume-weighted average price. Trendward uses the relationship to VWAP as one indicator of price structure.</dd>
      <dt>From High</dt><dd>Distance from the current or session high, useful for spotting retention versus giveback.</dd>
      <dt>Model Journey</dt><dd>The chronological progression of a setup through captured model/scanner states.</dd>
      <dt>Exact Archive</dt><dd>A historical observation actually captured by the live system.</dd>
      <dt>Cohort Replay</dt><dd>A point-in-time reconstruction using a historical same-time cohort. Useful, but not identical to literal production history.</dd>
      <dt>Single-Symbol Replay</dt><dd>A reconstruction for one stock using historical bars and the frozen feature/model logic. It cannot honestly recreate cohort-relative production ranking by itself.</dd>
      <dt>Historical Analog</dt><dd>A prior setup with comparable characteristics used for context, not as a promise of what the current setup will do.</dd>
      <dt>MFE</dt><dd>Maximum favorable excursion: the largest favorable price move after a historical reference point.</dd>
      <dt>MAE</dt><dd>Maximum adverse excursion: the largest adverse price move after a historical reference point.</dd>
      <dt>Invalidation</dt><dd>Evidence that weakens the setup thesis, such as VWAP loss, price rejection, stalled progress, or new supply risk.</dd>
    </dl>
  `;

  function openModal(kind) {
    if (!modal) return;
    title.textContent = kind === "glossary" ? "Glossary" : "About Trendward";
    body.innerHTML = kind === "glossary" ? GLOSSARY : ABOUT;
    modal.classList.add("open");
  }
  document.querySelectorAll("[data-modal]").forEach(b => {
    b.addEventListener("click", () => openModal(b.dataset.modal));
  });
  document.querySelectorAll("[data-close-modal]").forEach(b => {
    b.addEventListener("click", () => modal?.classList.remove("open"));
  });
  modal?.addEventListener("click", e => {
    if (e.target === modal) modal.classList.remove("open");
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") modal?.classList.remove("open");
  });

  document.querySelectorAll("tbody[data-selectable] tr").forEach(row => {
    row.addEventListener("click", () => {
      row.parentElement.querySelectorAll("tr").forEach(r => r.classList.remove("selected"));
      row.classList.add("selected");
    });
  });
})();


// V2.12 — Core + integrated intelligence add-ons review interactions
(() => {
  const catalog = document.getElementById('addonCatalog');
  document.querySelectorAll('[data-open-addon-catalog]').forEach(btn => btn.addEventListener('click', () => catalog?.classList.add('open')));
  document.querySelectorAll('[data-close-addon-catalog]').forEach(btn => btn.addEventListener('click', () => catalog?.classList.remove('open')));
  catalog?.addEventListener('click', e => { if (e.target === catalog) catalog.classList.remove('open'); });
  document.querySelectorAll('[data-open-addon]').forEach(btn => btn.addEventListener('click', () => catalog?.classList.add('open')));
})();
