
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
  // ============================================================
  // V2.11 — Tiered modular intelligence
  // ============================================================

  const TIER_KEY = "trendward-review-tier";
  const MODULE_KEY_PREFIX = "trendward-modules-";
  const TIER_ORDER = { PRO: 1, PREMIUM: 2, PREMIER: 3 };
  const TIER_ICON = { PRO: "◆", PREMIUM: "✦", PREMIER: "♛" };

  const MODULES = {
    scanner: [
      {id:"promotion_reason", tier:"PRO", title:"Promotion Reason", value:"Liquidity + price aligned", note:"Why YFOR advanced from discovery into deeper scanner consideration."},
      {id:"liquidity_velocity", tier:"PRO", title:"Liquidity Velocity", value:"Accelerating", note:"5m participation is expanding faster than the prior 15m baseline."},
      {id:"price_response", tier:"PRO", title:"Price Response Quality", value:"Strong", note:"Price is progressing with liquidity instead of stalling into volume."},
      {id:"time_ignition", tier:"PRO", title:"Time Since Ignition", value:"12 min", note:"Elapsed time since the setup entered the ignition state."},
      {id:"invalidation_distance", tier:"PRO", title:"Invalidation Distance", value:"-4.7%", note:"Distance from the current price to the primary structural invalidation level."},

      {id:"rank_change", tier:"PREMIUM", title:"Scanner Rank Change", value:"#7 → #1", note:"Movement through the scanner ranking during the last 15 minutes."},
      {id:"rvol_accel", tier:"PREMIUM", title:"RVOL Acceleration", value:"2.1x → 6.8x", note:"Relative-volume expansion across the current monitoring window."},
      {id:"distance_vwap", tier:"PREMIUM", title:"Distance from VWAP", value:"+4.8%", note:"Current price relationship to volume-weighted average price."},
      {id:"distance_high", tier:"PREMIUM", title:"Distance from Session High", value:"-2.1%", note:"Measures how much of the move is being retained near the high."},
      {id:"catalyst_freshness", tier:"PREMIUM", title:"Catalyst Freshness", value:"13 min", note:"Time since the newest detected catalyst entered the setup context."},
      {id:"float_supply", tier:"PREMIUM", title:"Float / Supply Risk", value:"Low–Moderate", note:"Context from float size, available supply and known issuance structure."},
      {id:"dilution_risk", tier:"PREMIUM", title:"Dilution Risk", value:"No active ATM found", note:"Known shelf, ATM and other near-term supply considerations."},

      {id:"borrow_short", tier:"PREMIER", title:"Borrow / Short Interest", value:"Elevated", note:"Short-side structure and borrow context where available."},
      {id:"analog_match", tier:"PREMIER", title:"Historical Analog Match", value:"84% similarity", note:"Similarity to archived historical setup cohorts."},
      {id:"model_confidence", tier:"PREMIER", title:"Model Confidence", value:"High", note:"Agreement across heuristic, model, analog and tape context."},
      {id:"setup_age", tier:"PREMIER", title:"Setup Age", value:"22 min", note:"Time since the setup first entered Trendward discovery."}
    ],

    watchlist: [
      {id:"reason_added", tier:"PRO", title:"Reason Added", value:"Early ignition", note:"The original reason this setup was saved to the watchlist."},
      {id:"waiting_for", tier:"PRO", title:"Waiting For", value:"Break $3.55", note:"The next explicit condition that would strengthen the setup."},
      {id:"distance_trigger", tier:"PRO", title:"Distance to Trigger", value:"1.8%", note:"How far price is from the next important watch condition."},
      {id:"watch_age", tier:"PRO", title:"Watch Age", value:"18 min", note:"How long the setup has been on this watchlist."},
      {id:"priority", tier:"PRO", title:"Priority", value:"High · #1", note:"Current attention priority within the user's saved setups."},

      {id:"status_change", tier:"PREMIUM", title:"Status Change", value:"Watching → Strengthening", note:"Most recent meaningful watch-state transition."},
      {id:"last_change", tier:"PREMIUM", title:"Last Meaningful Change", value:"VWAP reclaimed", note:"The event that most recently changed the setup's monitoring state."},
      {id:"remove_condition", tier:"PREMIUM", title:"Remove Condition", value:"Lose $3.18 + weak volume", note:"Condition that would make the setup no longer worth monitoring."},
      {id:"alert_levels", tier:"PREMIUM", title:"Alert Levels", value:"$3.18 / $3.55 / $3.82", note:"Key downside, trigger and continuation levels."},
      {id:"catalyst_age", tier:"PREMIUM", title:"Catalyst Age", value:"31 min", note:"Time since the primary catalyst was detected."},
      {id:"price_trigger", tier:"PREMIUM", title:"Price vs Trigger", value:"$3.42 / $3.55", note:"Current price compared with the next trigger level."},
      {id:"volume_trigger", tier:"PREMIUM", title:"Volume vs Trigger", value:"82% of threshold", note:"Progress toward the user's volume confirmation threshold."},

      {id:"vwap_relation", tier:"PREMIER", title:"VWAP Relationship", value:"+4.8% · holding", note:"Current structural relationship to VWAP."},
      {id:"analog_match", tier:"PREMIER", title:"Historical Analog Match", value:"84% similarity", note:"Historical context for the watched setup."},
      {id:"personal_notes", tier:"PREMIER", title:"Notes Snapshot", value:"Breakout watch", note:"Pinned user note shown directly on the watchlist workspace."},
      {id:"next_catalyst", tier:"PREMIER", title:"Next Scheduled Catalyst", value:"Earnings · 6 days", note:"Nearest known scheduled event that may affect the thesis."}
    ],

    historical: [
      {id:"time_peak", tier:"PRO", title:"Median Time to Peak", value:"47 min", note:"Median time for comparable setups to reach their best favorable excursion."},
      {id:"time_failure", tier:"PRO", title:"Median Time to Failure", value:"19 min", note:"Median time for failed analogs to lose their setup structure."},
      {id:"by_phase", tier:"PRO", title:"Outcome by Detection Phase", value:"Ignition strongest", note:"How outcomes differed depending on the state when Trendward first detected the setup."},
      {id:"by_catalyst", tier:"PRO", title:"Outcome by Catalyst Type", value:"Contracts +12.4% median", note:"Historical outcome differences across catalyst categories."},
      {id:"best_analogs", tier:"PRO", title:"Best-Matching Analogs", value:"YFOR-24 · BDRX-19 · VEEA-31", note:"Highest-similarity archived setups for the selected historical pattern."},

      {id:"by_float", tier:"PREMIUM", title:"Outcome by Float Bucket", value:"5–20M strongest", note:"Historical outcome distribution segmented by float size."},
      {id:"by_rvol", tier:"PREMIUM", title:"Outcome by RVOL", value:">5x RVOL: +11.2% median", note:"Performance differences across relative-volume bands."},
      {id:"by_vol_accel", tier:"PREMIUM", title:"Outcome by Volume Acceleration", value:">4x accel strongest", note:"Historical outcomes grouped by liquidity acceleration strength."},
      {id:"fidelity_coverage", tier:"PREMIUM", title:"Fidelity Coverage", value:"18 exact · 21 cohort · 8 replay", note:"How much of the evidence is exact archive versus reconstructed replay."},
      {id:"median_excursion", tier:"PREMIUM", title:"Median MFE / MAE", value:"+8.7% / -3.2%", note:"Typical favorable and adverse excursions across comparable setups."},
      {id:"failure_rate", tier:"PREMIUM", title:"Failure Rate", value:"38%", note:"Share of comparable setups that failed or remained effectively flat."},
      {id:"repricing_duration", tier:"PREMIUM", title:"Repricing Duration", value:"34 min median", note:"Typical duration of the main repricing window."},

      {id:"what_different", tier:"PREMIER", title:"What Was Different", value:"Current float lower; catalyst fresher", note:"Key ways the selected setup differs from its closest historical cohort."},
      {id:"peak_distribution", tier:"PREMIER", title:"Peak Return Distribution", value:"P25 +3.8% · P50 +8.7% · P75 +17.4%", note:"Distribution of peak favorable outcomes across analogs."},
      {id:"drawdown_distribution", tier:"PREMIER", title:"Drawdown Distribution", value:"P50 -3.2% · P75 -5.9%", note:"Distribution of adverse movement before resolution."},
      {id:"by_environment", tier:"PREMIER", title:"Outcome by Market Environment", value:"Selective Risk-On strongest", note:"How the setup historically behaved in different market environments."},
      {id:"by_score", tier:"PREMIER", title:"Outcome by Setup Score", value:"90+ cohort: +13.1% median", note:"Historical outcome differences across Trendward score bands."},
      {id:"by_time", tier:"PREMIER", title:"Outcome by Time of Day", value:"10:00–11:00 ET strongest", note:"Historical outcome differences based on when the setup emerged."}
    ]
  };

  function getTier() {
    const t = localStorage.getItem(TIER_KEY);
    return TIER_ORDER[t] ? t : "PREMIER";
  }

  function setTier(tier) {
    if (!TIER_ORDER[tier]) return;
    localStorage.setItem(TIER_KEY, tier);
    updateTierUI();
    if (["scanner","watchlist","historical"].includes(page)) {
      renderModuleCards();
      renderCustomizeCatalog();
    }
    renderSettingsTierPreview();
  }

  function moduleAllowed(module, tier = getTier()) {
    return TIER_ORDER[tier] >= TIER_ORDER[module.tier];
  }

  function availableCount(pageName, tier = getTier()) {
    return (MODULES[pageName] || []).filter(m => moduleAllowed(m, tier)).length;
  }

  function getSelected(pageName) {
    const key = MODULE_KEY_PREFIX + pageName;
    const stored = localStorage.getItem(key);
    if (stored) {
      try { return JSON.parse(stored); } catch {}
    }
    // Strong defaults that demonstrate personalization without overwhelming the page.
    const defaults = {
      scanner: ["promotion_reason","liquidity_velocity","rank_change","model_confidence"],
      watchlist: ["reason_added","waiting_for","distance_trigger","status_change"],
      historical: ["time_peak","best_analogs","fidelity_coverage","what_different"]
    };
    return defaults[pageName] || [];
  }

  function saveSelected(pageName, ids) {
    localStorage.setItem(MODULE_KEY_PREFIX + pageName, JSON.stringify(ids));
  }

  function updateTierUI() {
    const tier = getTier();
    document.querySelectorAll(".tier-chip").forEach(el => {
      el.textContent = `${TIER_ICON[tier]} ${tier}`;
      el.title = "Preview tier";
      el.classList.add("tier-chip-clickable");
    });
  }

  function moduleCardHTML(m) {
    return `
      <article class="custom-module-card" data-module-id="${m.id}">
        <div class="custom-module-top">
          <span class="module-tier module-tier-${m.tier.toLowerCase()}">${m.tier}</span>
          <button class="module-remove" data-remove-module="${m.id}" title="Remove module">×</button>
        </div>
        <h3>${m.title}</h3>
        <strong class="custom-module-value">${m.value}</strong>
        <p>${m.note}</p>
      </article>`;
  }

  function renderModuleCards() {
    const host = document.getElementById("customIntelligenceGrid");
    const count = document.getElementById("customModuleCount");
    if (!host || !MODULES[page]) return;

    const tier = getTier();
    let selected = getSelected(page).filter(id => {
      const m = MODULES[page].find(x => x.id === id);
      return m && moduleAllowed(m, tier);
    });

    host.innerHTML = selected.length
      ? selected.map(id => moduleCardHTML(MODULES[page].find(m => m.id === id))).join("")
      : `<div class="custom-empty"><strong>No optional modules added yet.</strong><span>Choose Add Intelligence to personalize this page.</span></div>`;

    if (count) count.textContent = `${selected.length} added · ${availableCount(page, tier)} available on ${tier}`;

    host.querySelectorAll("[data-remove-module]").forEach(btn => {
      btn.addEventListener("click", () => {
        const next = getSelected(page).filter(id => id !== btn.dataset.removeModule);
        saveSelected(page, next);
        renderModuleCards();
        renderCustomizeCatalog();
      });
    });
  }

  function renderCustomizeCatalog() {
    const list = document.getElementById("moduleCatalog");
    const select = document.getElementById("tierPreviewSelect");
    if (!list || !MODULES[page]) return;

    const tier = getTier();
    if (select) select.value = tier;
    const selected = getSelected(page);

    list.innerHTML = MODULES[page].map(m => {
      const allowed = moduleAllowed(m, tier);
      const active = selected.includes(m.id) && allowed;
      return `
        <button class="module-choice ${active ? "active" : ""} ${allowed ? "" : "locked"}"
                data-module-choice="${m.id}" ${allowed ? "" : "disabled"}>
          <span class="choice-main">
            <strong>${m.title}</strong>
            <small>${m.note}</small>
          </span>
          <span class="choice-side">
            <span class="module-tier module-tier-${m.tier.toLowerCase()}">${m.tier}</span>
            <b>${allowed ? (active ? "Added ✓" : "+ Add") : "Locked"}</b>
          </span>
        </button>`;
    }).join("");

    list.querySelectorAll("[data-module-choice]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.moduleChoice;
        const m = MODULES[page].find(x => x.id === id);
        if (!m || !moduleAllowed(m)) return;
        const current = getSelected(page);
        const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
        saveSelected(page, next);
        renderModuleCards();
        renderCustomizeCatalog();
      });
    });
  }

  function openCustomize() {
    const modal = document.getElementById("customizeModal");
    if (!modal) return;
    renderCustomizeCatalog();
    modal.classList.add("open");
  }

  function buildCustomIntelligence() {
    if (!["scanner","watchlist","historical"].includes(page)) return;
    const footer = document.querySelector(".footer");
    if (!footer) return;

    const section = document.createElement("section");
    section.className = "custom-intelligence";
    section.innerHTML = `
      <div class="custom-intelligence-head">
        <div>
          <div class="eyebrow">Personalized workspace</div>
          <h2>My Intelligence Modules</h2>
          <p id="customModuleCount"></p>
        </div>
        <button class="add-intelligence-btn" data-open-customize>＋ Add Intelligence</button>
      </div>
      <div class="custom-intelligence-grid" id="customIntelligenceGrid"></div>`;
    footer.parentNode.insertBefore(section, footer);

    const overlay = document.createElement("div");
    overlay.className = "modal-backdrop customize-backdrop";
    overlay.id = "customizeModal";
    overlay.innerHTML = `
      <section class="modal customize-modal">
        <div class="modal-head">
          <div>
            <div class="eyebrow">Page customization</div>
            <h2>Add Intelligence</h2>
          </div>
          <button class="close-modal" data-close-customize>×</button>
        </div>
        <div class="customize-tier-row">
          <div>
            <strong>Review tier preview</strong>
            <small>Switch tiers to see which modules each plan unlocks.</small>
          </div>
          <select class="control tier-preview-select" id="tierPreviewSelect">
            <option value="PRO">Pro</option>
            <option value="PREMIUM">Premium</option>
            <option value="PREMIER">Premier</option>
          </select>
        </div>
        <div class="tier-summary">
          <span><b>Pro</b> core personalization</span>
          <span><b>Premium</b> deeper context</span>
          <span><b>Premier</b> complete catalog</span>
        </div>
        <div class="module-catalog" id="moduleCatalog"></div>
        <div class="customize-footer">
          <button class="chip-btn" id="resetModules">Reset page modules</button>
          <button class="add-intelligence-btn" data-close-customize>Done</button>
        </div>
      </section>`;
    document.body.appendChild(overlay);

    document.querySelectorAll("[data-open-customize]").forEach(b => b.addEventListener("click", openCustomize));
    document.querySelectorAll("[data-close-customize]").forEach(b => b.addEventListener("click", () => overlay.classList.remove("open")));
    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.classList.remove("open"); });

    document.getElementById("tierPreviewSelect")?.addEventListener("change", e => setTier(e.target.value));
    document.getElementById("resetModules")?.addEventListener("click", () => {
      localStorage.removeItem(MODULE_KEY_PREFIX + page);
      renderModuleCards();
      renderCustomizeCatalog();
    });

    // Secondary access point near the main page table/archive.
    const toolbar = document.querySelector(".single-flow-layout .card-titlebar .toolbar");
    if (toolbar) {
      const quick = document.createElement("button");
      quick.className = "chip-btn intelligence-quick-btn";
      quick.setAttribute("data-open-customize", "");
      quick.textContent = "＋ Intelligence";
      quick.addEventListener("click", openCustomize);
      toolbar.appendChild(quick);
    }

    renderModuleCards();
    renderCustomizeCatalog();
  }

  function renderSettingsTierPreview() {
    if (page !== "settings") return;
    let panel = document.getElementById("tierPreviewPanel");
    if (!panel) {
      const layout = document.querySelector(".settings-layout");
      if (!layout) return;
      panel = document.createElement("section");
      panel.className = "card settings-panel";
      panel.id = "tierPreviewPanel";
      panel.innerHTML = `
        <div class="eyebrow">Review mode</div>
        <h2>Tier preview</h2>
        <p>Preview how optional intelligence modules expand from Pro to Premium to Premier. This review control is for the prototype and does not change billing.</p>
        <div class="tier-preview-buttons">
          <button data-set-tier="PRO">◆ Pro</button>
          <button data-set-tier="PREMIUM">✦ Premium</button>
          <button data-set-tier="PREMIER">♛ Premier</button>
        </div>
        <div class="tier-preview-stats" id="tierPreviewStats"></div>`;
      layout.appendChild(panel);
      panel.querySelectorAll("[data-set-tier]").forEach(btn => btn.addEventListener("click", () => setTier(btn.dataset.setTier)));
    }

    const tier = getTier();
    panel.querySelectorAll("[data-set-tier]").forEach(btn => btn.classList.toggle("active", btn.dataset.setTier === tier));
    const stats = document.getElementById("tierPreviewStats");
    if (stats) {
      stats.innerHTML = `
        <div><span>Scanner modules</span><strong>${availableCount("scanner", tier)} / ${MODULES.scanner.length}</strong></div>
        <div><span>Watchlist modules</span><strong>${availableCount("watchlist", tier)} / ${MODULES.watchlist.length}</strong></div>
        <div><span>Historical modules</span><strong>${availableCount("historical", tier)} / ${MODULES.historical.length}</strong></div>`;
    }
  }

  updateTierUI();
  buildCustomIntelligence();
  renderSettingsTierPreview();

  document.querySelectorAll(".tier-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      if (["scanner","watchlist","historical"].includes(page)) openCustomize();
    });
  });

})();
