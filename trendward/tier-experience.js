(() => {
  const tier = String(window.TRENDWARD_FIXED_TIER || "FREE").toUpperCase();
  const limits = {FREE:1, BASIC:4, PRO:8, PREMIUM:11};
  const watchDepth = {FREE:1, BASIC:2, PRO:5, PREMIUM:10};
  const signalDepth = {FREE:1, BASIC:3, PRO:5, PREMIUM:8};
  let activePriceFilter = "ALL";

  const HELP = {
    scanner: {
      text: "The Scanner is the ranked set of setups Trendward is monitoring from the latest customer-safe scan.",
      href: "#scanner",
      link: "Stay in Scanner"
    },
    watchlist: {
      text: "The Watchlist keeps additional setups visible while they develop. It uses the same scanner candidate set, not a separate stock list.",
      href: "#watchlist",
      link: "Open Watchlist"
    },
    signals: {
      text: "Signals summarize meaningful state changes in price, liquidity, and model context for the same visible setups.",
      href: "#signals",
      link: "Open Signals"
    },
    journey: {
      text: "Model Journey explains how a setup progressed through discovery, model state, and resolved historical outcomes when those records are available.",
      href: "#journey",
      link: "Open Model Journey"
    },
    pulse: {
      text: "Market Pulse summarizes what the scanner universe is doing overall: breadth, liquidity acceleration, and data freshness.",
      href: "#pulse",
      link: "Open Market Pulse"
    },
    "5m move": {
      text: "The stock's percentage move in the current scanner context. Positive means price rose; negative means it fell.",
      href: "#scanner",
      link: "See Scanner"
    },
    "vol accel.": {
      text: "Volume acceleration compares recent trading activity with its recent baseline. Above 1× means activity is running faster than the baseline.",
      href: "#pulse",
      link: "See Market Pulse"
    },
    "model": {
      text: "A 0–100 display of the scanner's approved 5-minute model score. Higher is stronger model evidence, not a guarantee of a future move.",
      href: "#journey",
      link: "See Model Journey"
    },
    "state": {
      text: "The current scanner role for the setup. Finalist/Selected means it survived more of the scanner's ranking process; Promoted means the 5-minute model elevated it.",
      href: "#journey",
      link: "See Model Journey"
    },
    "price": {
      text: "The captured market price in this scanner snapshot. Free uses a 30-minute-delayed snapshot during live operation.",
      href: "#scanner",
      link: "See Scanner"
    },
    "vwap": {
      text: "VWAP is the volume-weighted average price for the session. Price above VWAP can indicate stronger intraday retention; below VWAP can indicate weaker retention.",
      href: "#journey",
      link: "See Model Journey"
    },
    "mfe / mae": {
      text: "MFE is the best forward price excursion; MAE is the worst forward excursion after the reference point. These are historical price paths, not realized P&L.",
      href: "#journey",
      link: "See Model Journey"
    }
  };

  function payload() { return window.TRENDWARD_PUBLIC_PAYLOAD || null; }
  function allRows() {
    const p = payload();
    return Array.isArray(p?.candidates) ? p.candidates : [];
  }
  function visibleRows() { return allRows().slice(0, limits[tier]); }
  function num(v) { const n = Number(v); return Number.isFinite(n) ? n : null; }
  function money(v) {
    const n = num(v);
    return n === null ? "—" : `$${n < 1 ? n.toFixed(4) : n.toFixed(2)}`;
  }
  function pct(v, digits=1) {
    const n = num(v);
    return n === null ? "—" : `${n >= 0 ? "+" : ""}${n.toFixed(digits)}%`;
  }
  function score(c) {
    const n = num(c?.model ?? c?.model_scores?.score25);
    return n === null ? null : Math.max(0, Math.min(100, n));
  }
  function scanTime() {
    const raw = payload()?.scannerScanTime || payload()?.scannerCapturedAt;
    if (!raw) return "Scanner time";
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return "Scanner time";
    return d.toLocaleTimeString([], {hour:"numeric", minute:"2-digit"});
  }
  function escapeHtml(v) {
    return String(v ?? "").replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[c]));
  }
  function stateNote(c) {
    const bits = [];
    if (num(c.vol) !== null) bits.push(`${num(c.vol).toFixed(2)}× 5m liquidity`);
    if (num(c.price_vs_vwap_pct) !== null) bits.push(`${pct(c.price_vs_vwap_pct)} vs VWAP`);
    if (num(c.distance_from_high_pct) !== null) bits.push(`${pct(c.distance_from_high_pct)} from high`);
    return bits.join(" · ") || c.state || "Scanner setup";
  }

  function watchRows() {
    const rows = visibleRows();
    if (tier === "FREE") return rows.slice(0, 1);
    // Keep the featured #1 visible elsewhere and use the rest as the watch field.
    return rows.slice(1, 1 + watchDepth[tier]);
  }

  function renderCandidateTable() {
    const el = document.getElementById("candidateTable");
    if (!el) return;
    el.innerHTML = visibleRows().map(c => `
      <tr>
        <td><div class="rank">${escapeHtml(c.rank)}</div></td>
        <td><span class="symbol">${escapeHtml(c.symbol)}</span></td>
        <td>${money(c.price)}</td>
        <td class="${num(c.move) !== null && num(c.move) < 0 ? "down" : "up"}">${pct(c.move)}</td>
        <td>${num(c.vol) === null ? "—" : `${num(c.vol).toFixed(2)}×`}</td>
        <td>${score(c) === null ? "—" : score(c).toFixed(0)}</td>
        <td><span class="state-badge">${escapeHtml(c.state || "Watch")}</span></td>
      </tr>`).join("");
  }

  function priceBand(c) {
    const p = num(c.price);
    if (p === null) return "UNKNOWN";
    if (p < 2) return "UNDER2";
    if (p < 5) return "2TO5";
    return "5TO20";
  }

  function filterRows(rows) {
    if (activePriceFilter === "ALL") return rows;
    return rows.filter(c => priceBand(c) === activePriceFilter);
  }

  function sparkSvg(c, i) {
    // A compact shape derived from current approved fields, not a fake price history.
    const base = Math.max(10, score(c) ?? 50);
    const move = Math.max(-20, Math.min(20, num(c.move) ?? 0));
    const liq = Math.max(0, Math.min(12, num(c.vol) ?? 1));
    const vals = [base-8, base-4+liq, base-3, base+move*.15, base+liq*.7, base+move*.25];
    const w=240,h=52,p=5,min=Math.min(...vals),max=Math.max(...vals);
    const pts=vals.map((v,j)=>{
      const x=p+j*(w-2*p)/(vals.length-1);
      const y=h-p-(v-min)/(max-min||1)*(h-2*p);
      return `${x},${y}`;
    }).join(" ");
    return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Scanner context shape for ${escapeHtml(c.symbol)}"><polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  function renderScannerCards() {
    const el = document.getElementById("scannerCards");
    if (!el) return;
    const rows = filterRows(visibleRows());
    if (!rows.length) {
      el.innerHTML = `<div class="panel empty-filter">No visible ${tier.toLowerCase()} setups are in this price band.</div>`;
      return;
    }
    el.innerHTML = rows.map((c,i)=>`
      <article class="scanner-card">
        <div class="scanner-card-head">
          <div><span class="rank">${escapeHtml(c.rank)}</span></div>
          <span class="state-badge">${escapeHtml(c.state || "Watch")}</span>
        </div>
        <div class="price">${escapeHtml(c.symbol)} <span>${money(c.price)}</span></div>
        <div class="spark">${sparkSvg(c,i)}</div>
        <div class="metric-grid">
          <div class="metric"><span>Session move</span><strong class="${num(c.move)!==null && num(c.move)<0?"down":"up"}">${pct(c.move)}</strong></div>
          <div class="metric"><span>5m liquidity</span><strong>${num(c.vol)===null?"—":num(c.vol).toFixed(2)+"×"}</strong></div>
          <div class="metric"><span>25% model</span><strong>${score(c)===null?"—":score(c).toFixed(0)+"/100"}</strong></div>
          <div class="metric"><span>Price band</span><strong>${money(c.price)}</strong></div>
        </div>
      </article>`).join("");
  }

  function setupPriceFilters() {
    document.querySelectorAll("#section-scanner .filter-row .chip").forEach(btn => {
      const text = btn.textContent.trim();
      const key =
        text === "All" ? "ALL" :
        text.includes("Under") ? "UNDER2" :
        text.includes("$2") ? "2TO5" : "5TO20";

      if (btn.dataset.v14Bound === "1") return;
      btn.dataset.v14Bound = "1";
      btn.addEventListener("click", () => {
        activePriceFilter = key;
        document.querySelectorAll("#section-scanner .filter-row .chip").forEach(x=>x.classList.remove("active"));
        btn.classList.add("active");
        renderScannerCards();
      });
    });
  }

  function renderWatchlists() {
    const rows = watchRows();
    const compact = document.getElementById("watchlistCards");
    const full = document.getElementById("watchlistFull");

    if (compact) {
      compact.innerHTML = rows.slice(0, tier==="PREMIUM" ? 6 : rows.length).map(c=>`
        <div class="stack-card">
          <div class="stack-card-top"><strong>${escapeHtml(c.symbol)}</strong><span class="mini-badge">${escapeHtml(c.state || "WATCH")}</span></div>
          <p>${escapeHtml(stateNote(c))}</p>
        </div>`).join("") || `<div class="empty-viz">No secondary watch candidates in this tier.</div>`;
    }

    if (full) {
      full.innerHTML = rows.map(c=>`
        <div class="large-row">
          <strong>${escapeHtml(c.symbol)}</strong>
          <span>${escapeHtml(c.state || "Watch")}</span>
          <span>${score(c)===null?"—":score(c).toFixed(0)+"/100"}</span>
          <span class="row-note">${escapeHtml(stateNote(c))}</span>
        </div>`).join("") || `<div class="empty-viz">No secondary watch candidates in this tier.</div>`;
    }

    const watchHeading = document.querySelector("#section-watchlist .section-heading p");
    if (watchHeading) {
      watchHeading.textContent = tier==="PREMIUM"
        ? `Premium shows up to ${watchDepth.PREMIUM} secondary setups from the same scanner field, alongside the featured setup on Overview.`
        : `This watchlist uses the same candidate field as Overview and Scanner so symbols stay consistent.`;
    }
  }

  function renderSignals() {
    const rows = visibleRows().slice(0, signalDepth[tier]);
    const compact = document.getElementById("signalCards");
    const full = document.getElementById("signalsFull");
    const time = scanTime();

    const message = c => {
      const s = score(c);
      const pieces = [`${c.state || "Watch"}`];
      if (s !== null) pieces.push(`25% model ${s.toFixed(0)}`);
      if (num(c.vol) !== null) pieces.push(`5m liquidity ${num(c.vol).toFixed(2)}×`);
      return pieces.join(" · ");
    };

    if (compact) {
      compact.innerHTML = rows.slice(0,3).map(c=>`
        <div class="stack-card">
          <div class="stack-card-top"><strong>${escapeHtml(c.symbol)}</strong><span class="mini-badge">${escapeHtml(time)}</span></div>
          <p>${escapeHtml(message(c))}</p>
        </div>`).join("");
    }

    if (full) {
      full.innerHTML = rows.map((c,i)=>`
        <div class="timeline-item">
          <div class="timeline-time">${escapeHtml(time)}</div>
          <div class="timeline-dot-col"><div class="timeline-dot"></div>${i<rows.length-1?'<div class="timeline-line"></div>':''}</div>
          <div class="timeline-content"><strong>${escapeHtml(c.symbol)}</strong><p>${escapeHtml(message(c))}</p></div>
        </div>`).join("");
    }
  }

  function renderContextCards() {
    const el = document.getElementById("catalystCards");
    if (!el) return;
    el.innerHTML = visibleRows().slice(0,3).map(c=>`
      <div class="stack-card">
        <div class="stack-card-top"><strong>${escapeHtml(c.symbol)}</strong><span class="mini-badge">SCANNER CONTEXT</span></div>
        <p>${escapeHtml(`${pct(c.move)} session move · ${stateNote(c)}`)}</p>
      </div>`).join("");
    const label = el.closest(".panel")?.querySelector(".panel-label");
    const title = el.closest(".panel")?.querySelector("h3");
    if (label) label.textContent = "CONTEXT";
    if (title) title.textContent = "Why the scanner is watching";
  }

  function renderProbability() {
    const el = document.getElementById("probabilityChart");
    if (!el) return;
    if (tier === "FREE") return;
    const c = visibleRows()[0];
    if (!c) return;
    const entries = [
      ["10% move model", num(c.model_scores?.score10)],
      ["25% move model", num(c.model_scores?.score25)],
      ["50% move model", num(c.model_scores?.score50)]
    ];
    el.innerHTML = `<div class="real-probability-bars">${entries.map(([label,v])=>{
      const value = v===null ? 0 : Math.max(0,Math.min(100,v));
      return `<div><div class="bar-head"><span>${escapeHtml(label)}</span><strong>${v===null?"—":value.toFixed(1)+"%"}</strong></div><div class="bar-track"><i style="width:${value}%"></i></div></div>`;
    }).join("")}<small>Model scores are evidence signals, not forecasts or guarantees.</small></div>`;
  }

  function renderJourneyAndOutcome() {
    if (!(tier==="PRO" || tier==="PREMIUM")) return;
    const c = visibleRows()[0];
    const journey = document.getElementById("journeyChart");
    const outcome = document.getElementById("outcomeChart");

    if (journey && c) {
      const s10 = num(c.model_scores?.score10), s25=num(c.model_scores?.score25), s50=num(c.model_scores?.score50);
      journey.innerHTML = `<div class="journey-current">
        <div class="journey-current-head"><div><span>Current captured model state</span><strong>${escapeHtml(c.symbol)} · ${escapeHtml(c.state || "Watch")}</strong></div><a href="#scanner" data-section-link="scanner">Back to Scanner →</a></div>
        <div class="journey-model-grid">
          <div><span>10% model</span><strong>${s10===null?"—":s10.toFixed(1)+"%"}</strong></div>
          <div><span>25% model</span><strong>${s25===null?"—":s25.toFixed(1)+"%"}</strong></div>
          <div><span>50% model</span><strong>${s50===null?"—":s50.toFixed(1)+"%"}</strong></div>
          <div><span>5m liquidity</span><strong>${num(c.vol)===null?"—":num(c.vol).toFixed(2)+"×"}</strong></div>
        </div>
        <p>Trendward is showing the approved current model snapshot here. A full historical progression is shown only when archived journey observations are available.</p>
      </div>`;
    }

    if (outcome && c) {
      if (c.outcome) {
        const o=c.outcome;
        outcome.innerHTML = `<div class="outcome-grid">
          ${[["15m",o.mfe_15m_pct,o.mae_15m_pct],["30m",o.mfe_30m_pct,o.mae_30m_pct],["60m",o.mfe_60m_pct,o.mae_60m_pct]].map(([h,mfe,mae])=>`
            <div><span>${h}</span><strong class="up">${pct(mfe)}</strong><small class="down">${pct(mae)}</small></div>`).join("")}
        </div>`;
      } else {
        outcome.innerHTML = `<div class="outcome-waiting"><strong>Resolved outcome not available yet</strong><p>The latest setup does not have an approved 15/30/60-minute outcome object in the public snapshot. No illustrative outcome is substituted.</p></div>`;
      }
    }
  }

  function renderMarketPulse() {
    const breadth = document.getElementById("breadthChart");
    const markets = Array.isArray(payload()?.markets) ? payload().markets : [];
    if (!breadth || !markets.length) return;
    breadth.innerHTML = `<div class="pulse-bars">${markets.map(([name,value,note])=>`
      <div><div class="pulse-head"><span>${escapeHtml(name)}</span><strong>${escapeHtml(value)}</strong></div><small>${escapeHtml(note)}</small></div>`).join("")}</div>`;
  }

  function helpIcon(key) {
    const h = HELP[key];
    if (!h) return "";
    return `<a class="help-dot" href="${h.href}" data-help-nav="${h.href.slice(1)}" data-tooltip="${escapeHtml(h.text)} ${escapeHtml(h.link)}." aria-label="Explain ${escapeHtml(key)}">?</a>`;
  }

  function addHelp() {
    if (!(tier==="PRO" || tier==="PREMIUM")) return;

    const sectionMap = {
      scanner:"scanner", watchlist:"watchlist", signals:"signals", journey:"journey", pulse:"pulse"
    };
    Object.entries(sectionMap).forEach(([section,key])=>{
      const h = document.querySelector(`#section-${section} .section-heading h2`);
      if (h && !h.querySelector(".help-dot")) h.insertAdjacentHTML("beforeend", " "+helpIcon(key));
    });

    document.querySelectorAll("#section-scanner th").forEach(th=>{
      const t=th.textContent.trim().toLowerCase();
      const key=t==="5m move"?"5m move":t==="vol accel."?"vol accel.":t==="model"?"model":t==="state"?"state":t==="price"?"price":null;
      if (key && !th.querySelector(".help-dot")) th.insertAdjacentHTML("beforeend", " "+helpIcon(key));
    });

    document.querySelectorAll(".help-dot").forEach(a=>{
      if (a.dataset.v14Help==="1") return;
      a.dataset.v14Help="1";
      a.addEventListener("click", e=>{
        const target=a.dataset.helpNav;
        if (!target) return;
        e.preventDefault();
        location.hash = target;
        if (typeof navTo === "function") navTo(target);
      });
    });
  }

  function addGlossary() {
    const grid = document.querySelector("#section-settings .settings-grid");
    if (!grid || document.getElementById("trendwardGlossary")) return;

    const terms = [
      ["5m liquidity / volume acceleration","How quickly recent trading activity is expanding relative to its baseline. Above 1× means activity is faster than the baseline."],
      ["Model 10 / 25 / 50","Separate 5-minute model scores associated with increasingly large move thresholds. They are model evidence, not guaranteed probabilities of a return."],
      ["Finalist","A setup that survived the scanner's heuristic and context reranking into the finalist group."],
      ["Selected","A finalist marked as selected by the captured scanner process. This does not automatically mean it is a unique #1 trade recommendation."],
      ["Promoted","A setup elevated by the 5-minute ML promotion layer."],
      ["VWAP","Volume-weighted average price. It helps show whether price is holding above or below the session's volume-weighted average."],
      ["Distance from high","How far the captured price is below the session high. Near 0% means price is close to its high."],
      ["MFE","Maximum Favorable Excursion: the best forward price movement after a reference point."],
      ["MAE","Maximum Adverse Excursion: the worst forward price movement after a reference point."],
      ["Market Pulse","A scanner-universe summary of breadth, liquidity state, and freshness rather than a single-stock ranking."],
      ["Model Journey","The setup's progression through discovery/model state and, when resolved, forward outcome context."],
      ["Free delay","The Free plan uses one featured setup from a 30-minute-delayed scanner snapshot during live operation."]
    ];

    const article=document.createElement("article");
    article.className="panel glossary-panel";
    article.id="trendwardGlossary";
    article.innerHTML=`<div class="panel-label">GLOSSARY</div><h3>What Trendward terms mean</h3>
      <p class="settings-copy">Plain-English definitions for the measurements and labels used across the dashboard.</p>
      <div class="glossary-list">${terms.map(([term,def])=>`
        <details><summary>${escapeHtml(term)}</summary><p>${escapeHtml(def)}</p></details>`).join("")}</div>`;
    grid.appendChild(article);
  }

  function removeDuplicateTierBadge() {
    const duplicate = document.getElementById("headerTier");
    if (duplicate) duplicate.remove();
    const badge=document.getElementById("topPlanBadge");
    if (badge) badge.textContent=tier;
    const side=document.getElementById("sidebarTier");
    if (side) side.textContent=tier;
  }

  function updateFreeCopy() {
    if (tier !== "FREE") return;
    const scannerP=document.querySelector("#section-scanner .section-heading p");
    if (scannerP) scannerP.textContent="One featured setup from a real 30-minute-delayed scanner snapshot.";
    const watchP=document.querySelector("#section-watchlist .section-heading p");
    if (watchP) watchP.textContent="One delayed featured setup so Free can study the product without seeing the real-time paid scanner field.";
  }

  function renderEverything() {
    try {
      if (typeof trendwardTier !== "undefined") trendwardTier=tier;
      if (typeof TIER_POLICY !== "undefined") {
        TIER_POLICY.FREE.visible=1;
        TIER_POLICY.BASIC.visible=4;
        TIER_POLICY.PRO.visible=8;
        TIER_POLICY.PREMIUM.visible=11;
      }
    } catch {}

    removeDuplicateTierBadge();
    updateFreeCopy();
    renderCandidateTable();
    renderScannerCards();
    renderWatchlists();
    renderSignals();
    renderContextCards();
    renderProbability();
    renderJourneyAndOutcome();
    renderMarketPulse();
    setupPriceFilters();
    addHelp();
    addGlossary();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderEverything, {once:true});
  } else {
    renderEverything();
  }
  window.addEventListener("trendward:data", renderEverything);
})();