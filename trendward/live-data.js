
(() => {
  const cfg = window.TRENDWARD_CONFIG || {};
  const statusEl = document.getElementById("dataStatus");

  function setStatus(label, tone) {
    if (!statusEl) return;
    const color = tone === "ok" ? "var(--green)" : tone === "warn" ? "var(--orange)" : "var(--muted)";
    statusEl.innerHTML = `<span class="live-dot" style="background:${color};box-shadow:0 0 12px ${color}"></span>${label}`;
  }

  function safeArray(v) { return Array.isArray(v) ? v : null; }

  function renderSnapshot(payload) {
    if (typeof data !== "undefined") {
      for (const key of ["markets","kpis","candidates","watchlist","signals","catalysts"]) {
        const value = safeArray(payload[key]);
        if (value) data[key] = value;
      }
    }

    const marketStrip = document.getElementById("marketStrip");
    if (marketStrip && data?.markets) {
      marketStrip.innerHTML = data.markets.map(([name,val,chg]) =>
        `<div class="market-chip"><div><strong>${name}</strong><small>Customer-safe snapshot</small></div>` +
        `<div style="text-align:right"><strong>${val}</strong><small class="${String(chg).startsWith("-")?"down":"up"}">${chg}</small></div></div>`
      ).join("");
    }

    const kpiGrid = document.getElementById("kpiGrid");
    if (kpiGrid && data?.kpis) {
      kpiGrid.innerHTML = data.kpis.map(([label,val,sub]) =>
        `<article class="kpi-card"><div class="kpi-label">${label}</div><div class="kpi-value">${val}</div><div class="kpi-sub">${sub}</div></article>`
      ).join("");
    }

    // Existing tier logic performs the customer-view rendering and limits.
    if (typeof applyTier === "function") applyTier();

    const watch = document.getElementById("watchlistCards");
    if (watch && data?.watchlist) {
      watch.innerHTML = data.watchlist.map(([s,n]) =>
        `<div class="stack-card"><div class="stack-card-top"><strong>${s}</strong><span class="mini-badge">WATCH</span></div><p>${n}</p></div>`
      ).join("");
    }

    const sig = document.getElementById("signalCards");
    if (sig && data?.signals) {
      sig.innerHTML = data.signals.map(([t,s,n]) =>
        `<div class="stack-card"><div class="stack-card-top"><strong>${s}</strong><span class="mini-badge">${t}</span></div><p>${n}</p></div>`
      ).join("");
    }

    const cat = document.getElementById("catalystCards");
    if (cat && data?.catalysts) {
      cat.innerHTML = data.catalysts.map(([s,n]) =>
        `<div class="stack-card"><div class="stack-card-top"><strong>${s}</strong><span class="mini-badge">CONTEXT</span></div><p>${n}</p></div>`
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
      const sep = cfg.liveDataUrl.includes("?") ? "&" : "?";
      const res = await fetch(`${cfg.liveDataUrl}${sep}_=${Date.now()}`, {
        cache: "no-store",
        headers: {"Accept":"application/json"}
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await res.json();

      // Minimal schema guard: reject anything that does not look like the
      // deliberately small customer-safe contract.
      if (!payload || !Array.isArray(payload.candidates) || !Array.isArray(payload.kpis)) {
        throw new Error("Unexpected public snapshot schema");
      }

      renderSnapshot(payload);
      const when = payload.generatedAt
        ? new Date(payload.generatedAt).toLocaleTimeString([], {hour:"numeric", minute:"2-digit"})
        : "current";
      const label = payload.marketStatus === "live"
        ? `Live data · ${when}`
        : `Customer-safe snapshot · ${when}`;
      setStatus(label, "ok");
    } catch (err) {
      console.warn("Trendward public data fallback:", err);
      setStatus("Demo fallback", "warn");
    }
  }

  refreshTrendwardData();

  const seconds = Number(cfg.refreshSeconds || 0);
  if (seconds >= 30) {
    setInterval(refreshTrendwardData, seconds * 1000);
  }
})();
