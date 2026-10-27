(() => {
  const cfg = window.TRENDWARD_CONFIG || {};
  const statusEl = document.getElementById("dataStatus");

  function esc(v) {
    return String(v ?? "").replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[c]));
  }

  function setStatus(label, tone) {
    if (!statusEl) return;
    const color =
      tone === "ok" ? "var(--green)" :
      tone === "warn" ? "var(--orange)" :
      tone === "bad" ? "var(--red)" : "var(--muted)";
    statusEl.innerHTML =
      `<span class="live-dot" style="background:${color};box-shadow:0 0 12px ${color}"></span>${esc(label)}`;
  }

  function safeArray(v) { return Array.isArray(v) ? v : null; }

  function toneClass(value, name="") {
    const s = String(value ?? "").trim().toLowerCase();
    const n = String(name ?? "").toLowerCase();
    if (!s || s === "—" || s === "-" || s === "scanner cohort" || s.includes("old")) return "neutral";
    if (n.includes("freshness") || s === "stale") return "warn-text";
    if (s.startsWith("-")) return "down";
    if (s.startsWith("+")) return "up";
    return "neutral";
  }

  function fmtScanTime(payload) {
    const raw = payload.scannerScanTime || payload.scannerCapturedAt;
    if (!raw) return "Scanner timestamp unavailable";
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return `Scanner ${raw}`;
    return `Scanner ${d.toLocaleString([], {
      month:"short", day:"numeric", hour:"numeric", minute:"2-digit"
    })}`;
  }

  function freshnessBanner(payload) {
    let el = document.getElementById("dataFreshnessBanner");
    const topbar = document.querySelector(".topbar");
    if (!topbar) return;

    if (!el) {
      el = document.createElement("div");
      el.id = "dataFreshnessBanner";
      el.className = "freshness-banner";
      topbar.insertAdjacentElement("afterend", el);
    }

    const stale = !!payload.stale;
    const age = Number(payload.ageMinutes);
    const ageText = Number.isFinite(age)
      ? (age >= 1440 ? `${(age/1440).toFixed(1)} days old` : `${Math.round(age)} minutes old`)
      : "age unavailable";

    el.classList.toggle("is-stale", stale);
    el.classList.toggle("is-live", !stale);
    el.innerHTML = stale
      ? `<strong>STALE SCANNER DATA</strong><span>${esc(fmtScanTime(payload))} · ${esc(ageText)}. The dashboard is showing the latest captured scanner state, not current market conditions.</span>`
      : (String(window.TRENDWARD_FIXED_TIER || "FREE").toUpperCase() === "FREE"
          ? `<strong>30-MINUTE DELAYED DATA</strong><span>${esc(fmtScanTime(payload))} · Free shows one featured setup on a delayed scanner snapshot.</span>`
          : `<strong>LIVE SCANNER DATA</strong><span>${esc(fmtScanTime(payload))} · customer-safe scanner snapshot.</span>`);
  }

  function renderSnapshot(payload) {
    window.TRENDWARD_PUBLIC_PAYLOAD = payload;

    if (typeof data !== "undefined") {
      for (const key of ["markets","kpis","candidates","watchlist","signals","catalysts"]) {
        const value = safeArray(payload[key]);
        if (value) data[key] = value;
      }
    }

    freshnessBanner(payload);

    const marketStrip = document.getElementById("marketStrip");
    if (marketStrip && data?.markets) {
      marketStrip.innerHTML = data.markets.map(([name,val,chg]) =>
        `<div class="market-chip"><div><strong>${esc(name)}</strong><small>${payload.stale ? "Latest captured scan" : "Customer-safe live scan"}</small></div>` +
        `<div style="text-align:right"><strong>${esc(val)}</strong><small class="${toneClass(chg,name)}">${esc(chg)}</small></div></div>`
      ).join("");
    }

    const kpiGrid = document.getElementById("kpiGrid");
    if (kpiGrid && data?.kpis) {
      kpiGrid.innerHTML = data.kpis.map(([label,val,sub]) =>
        `<article class="kpi-card"><div class="kpi-label">${esc(label)}</div><div class="kpi-value">${esc(val)}</div><div class="kpi-sub">${esc(sub)}</div></article>`
      ).join("");
    }

    // Existing tier logic remains the entitlement/view limiter.
    if (typeof applyTier === "function") applyTier();

    const watch = document.getElementById("watchlistCards");
    if (watch && data?.watchlist) {
      watch.innerHTML = data.watchlist.map(([s,n]) =>
        `<div class="stack-card"><div class="stack-card-top"><strong>${esc(s)}</strong><span class="mini-badge">WATCH</span></div><p>${esc(n)}</p></div>`
      ).join("");
    }

    const sig = document.getElementById("signalCards");
    if (sig && data?.signals) {
      sig.innerHTML = data.signals.map(([t,s,n]) =>
        `<div class="stack-card"><div class="stack-card-top"><strong>${esc(s)}</strong><span class="mini-badge">${esc(t)}</span></div><p>${esc(n)}</p></div>`
      ).join("");
    }

    const cat = document.getElementById("catalystCards");
    if (cat && data?.catalysts) {
      cat.innerHTML = data.catalysts.map(([s,n]) =>
        `<div class="stack-card"><div class="stack-card-top"><strong>${esc(s)}</strong><span class="mini-badge">SCANNER CONTEXT</span></div><p>${esc(n)}</p></div>`
      ).join("");
    }

    if (typeof renderAllCharts === "function") renderAllCharts();
  }

  async function refreshTrendwardData() {
    if (!cfg.liveDataUrl) {
      setStatus("Demo data", "neutral");
      return;
    }

    try {
      const requestUrl = new URL(cfg.liveDataUrl, window.location.href);
      requestUrl.searchParams.set("_", Date.now());
      const fixedTier = String(window.TRENDWARD_FIXED_TIER || "FREE").toUpperCase();
      if (fixedTier === "FREE") requestUrl.searchParams.set("delay_minutes", "30");
      const res = await fetch(requestUrl.toString(), {
        cache: "no-store",
        headers: {"Accept":"application/json"}
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await res.json();

      if (!payload ||
          payload.schemaVersion !== "trendward_public_v1" ||
          !Array.isArray(payload.candidates) ||
          !Array.isArray(payload.kpis)) {
        throw new Error("Unexpected public snapshot schema");
      }

      renderSnapshot(payload);

      if (payload.stale) {
        const age = Number(payload.ageMinutes);
        const ageText = Number.isFinite(age)
          ? (age >= 1440 ? `${(age/1440).toFixed(1)}d old` : `${Math.round(age)}m old`)
          : "stale";
        setStatus(`Stale scanner data · ${ageText}`, "warn");
      } else {
        const raw = payload.scannerScanTime || payload.generatedAt;
        const d = raw ? new Date(raw) : null;
        const when = d && !Number.isNaN(d.getTime())
          ? d.toLocaleTimeString([], {hour:"numeric", minute:"2-digit"})
          : "current";
        const fixedTier = String(window.TRENDWARD_FIXED_TIER || "FREE").toUpperCase();
        setStatus(
          fixedTier === "FREE"
            ? `30m delayed scanner · ${when}`
            : `Live scanner · ${when}`,
          "ok"
        );
      }

      window.dispatchEvent(new CustomEvent("trendward:data", {detail: payload}));
    } catch (err) {
      console.warn("Trendward public data fallback:", err);
      setStatus("Live feed unavailable · demo fallback", "warn");
    }
  }

  refreshTrendwardData();

  const seconds = Number(cfg.refreshSeconds || 0);
  if (seconds >= 30) {
    setInterval(refreshTrendwardData, seconds * 1000);
  }
})();
