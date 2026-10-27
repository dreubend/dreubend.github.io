(() => {
  const tier = window.TRENDWARD_FIXED_TIER || "FREE";
  const limitByTier = {FREE:1, BASIC:4, PRO:8, PREMIUM:11};

  try {
    if (typeof trendwardTier !== "undefined") trendwardTier = tier;
    if (typeof TIER_POLICY !== "undefined") {
      TIER_POLICY.FREE.visible = 1;
      TIER_POLICY.BASIC.visible = 4;
      TIER_POLICY.PRO.visible = 8;
      TIER_POLICY.PREMIUM.visible = 11;
      TIER_POLICY.FREE.prob = false;
      TIER_POLICY.BASIC.prob = true;
      TIER_POLICY.PRO.prob = true;
      TIER_POLICY.PREMIUM.prob = true;
      TIER_POLICY.FREE.journey = false;
      TIER_POLICY.BASIC.journey = false;
      TIER_POLICY.PRO.journey = true;
      TIER_POLICY.PREMIUM.journey = true;
      TIER_POLICY.FREE.outcomes = false;
      TIER_POLICY.BASIC.outcomes = false;
      TIER_POLICY.PRO.outcomes = true;
      TIER_POLICY.PREMIUM.outcomes = true;
    }
    if (typeof applyTier === "function") applyTier();
  } catch(e) {
    console.warn("Trendward tier sync:", e);
  }

  const meta = {
    FREE:{name:"Free",strap:"Daily snapshot",overview:"One featured setup and a simple read on why it matters.",scanner:"A focused look at one featured scanner setup.",watch:"One developing setup.",signals:"Latest major state change.",journey:"Snapshot only — no full historical path.",pulse:"Simple scanner-universe state.",settings:"Core account and appearance controls."},
    BASIC:{name:"Basic",strap:"Active scanner",overview:"Up to four setups with real 5-minute model and liquidity context.",scanner:"Up to four current setups with 5-minute model context.",watch:"Two developing setups with clearer state progression.",signals:"More scanner state changes and 5-minute context.",journey:"Compact setup progression; full historical journey remains locked.",pulse:"Scanner breadth plus intraday liquidity state.",settings:"Basic subscription features and 5-minute intelligence."},
    PRO:{name:"Pro",strap:"Historical intelligence",overview:"Up to eight setups with deeper model comparison and resolved outcomes when available.",scanner:"Up to eight setups with richer model comparison.",watch:"Four featured/archive candidates and deeper context.",signals:"Expanded scanner state-change history.",journey:"Full 5-minute Model Journey with resolved 15/30/60-minute outcomes when available.",pulse:"Broader scanner-universe and model-state context.",settings:"Pro historical access and outcome controls."},
    PREMIUM:{name:"Premium",strap:"Research cockpit",overview:"Up to eleven setups with the deepest approved scanner context.",scanner:"Eleven-setup research view with the deepest approved public fields.",watch:"Deep archive/variety view plus leading scanner setups.",signals:"Full approved state-change stream.",journey:"Full journey and outcomes; 1-minute evidence appears only after it is added to the public API.",pulse:"Deepest approved market-state and scanner-universe view.",settings:"Premium research controls and advanced evidence preferences."}
  }[tier];

  function payload(){ return window.TRENDWARD_PUBLIC_PAYLOAD || null; }
  function rows(){
    const src = payload()?.candidates || (typeof data !== "undefined" ? data.candidates : []);
    return Array.isArray(src) ? src.slice(0, limitByTier[tier]) : [];
  }
  function primary(){ return rows()[0] || null; }
  function num(v, fallback=0){ const n=Number(v); return Number.isFinite(n)?n:fallback; }
  function clamp(v){ return Math.max(0, Math.min(100, num(v))); }
  function money(v){ const n=Number(v); return Number.isFinite(n) ? `$${n<1?n.toFixed(4):n.toFixed(2)}` : "—"; }
  function signed(v,suffix="%"){ const n=Number(v); return Number.isFinite(n) ? `${n>=0?"+":""}${n.toFixed(1)}${suffix}` : "—"; }
  function staleTag(){ return payload()?.stale ? `<span class="data-state-tag stale">STALE SNAPSHOT</span>` : `<span class="data-state-tag live">LIVE</span>`; }

  function pctBar(label,value,hint=""){
    value=clamp(value);
    return `<div class="viz-row"><div class="viz-row-head"><span>${label}</span><strong>${value.toFixed(0)}%</strong></div><div class="viz-track"><i style="width:${value}%"></i></div>${hint?`<small>${hint}</small>`:""}</div>`;
  }

  function ring(value,label){
    value=clamp(value);
    return `<div class="mini-ring" style="--value:${value}"><div><strong>${value.toFixed(0)}</strong><span>${label}</span></div></div>`;
  }

  function candidateBars(){
    const rs=rows();
    if(!rs.length) return `<div class="empty-viz">Waiting for scanner candidates.</div>`;
    return rs.map(c=>{
      const score=clamp(c.model ?? c.model_scores?.score25);
      return `<div class="candidate-viz-row">
        <div><strong>${c.symbol}</strong><small>${money(c.price)} · ${c.state || "Watch"}</small></div>
        <div class="candidate-viz-bar"><i style="width:${score}%"></i></div><b>${score.toFixed(0)}</b>
      </div>`;
    }).join("");
  }

  function heatTiles(){
    const rs=rows();
    if(!rs.length) return `<div class="empty-viz">Waiting for scanner candidates.</div>`;
    return `<div class="heat-grid">${rs.map(c=>{
      const score=clamp(c.model ?? c.model_scores?.score25);
      const vol=Number(c.vol);
      return `<div class="heat-tile" style="--heat:${Math.max(18,score)}%">
        <strong>${c.symbol}</strong><span>${score.toFixed(0)}</span>
        <small>${Number.isFinite(vol)?vol.toFixed(2)+"× 5m liq":"liquidity —"}</small>
      </div>`;
    }).join("")}</div>`;
  }

  function renderOverview(){
    const el=document.getElementById("tierOverviewVisual"); if(!el)return;
    const p=primary();
    if(!p){ el.innerHTML=`<div class="visual-card">Waiting for scanner data.</div>`; return; }

    const model=clamp(p.model ?? p.model_scores?.score25);
    const liq=Math.min(100, Math.max(0, num(p.vol)*20));
    const confirmation=Math.max(0,Math.min(100,50+num(p.price_vs_vwap_pct)*3+num(p.distance_from_high_pct)*0.5));

    if(tier==="FREE"){
      el.innerHTML=`<div class="tier-banner"><div><span>${meta.strap}</span><h2>${p.symbol} · ${money(p.price)}</h2><p>${p.state || "Scanner setup"} · ${signed(p.move)} session move. One clean setup-strength view.</p>${staleTag()}</div>${ring(model,"model")}</div>`;
    } else if(tier==="BASIC"){
      el.innerHTML=`<div class="tier-banner"><div><span>${meta.strap}</span><h2>${p.symbol} · 5-minute context</h2><p>${meta.overview}</p>${staleTag()}</div><div class="viz-stack">${pctBar("5m liquidity",liq,`${num(p.vol).toFixed(2)}× acceleration`)}${pctBar("Price confirmation",confirmation,`${signed(p.price_vs_vwap_pct)} vs VWAP`)}${pctBar("25% model",model)}</div></div>`;
    } else if(tier==="PRO"){
      const s50=clamp(p.model_scores?.score50);
      el.innerHTML=`<div class="tier-banner"><div><span>${meta.strap}</span><h2>${p.symbol} · current vs deeper model context</h2><p>${meta.overview}</p>${staleTag()}</div><div class="visual-pair">${ring(model,"25% model")}${ring(s50,"50% model")}</div></div>`;
    } else {
      const s10=clamp(p.model_scores?.score10), s25=model, s50=clamp(p.model_scores?.score50);
      el.innerHTML=`<div class="tier-banner premium-banner"><div><span>${meta.strap}</span><h2>${p.symbol} · deepest approved public view</h2><p>${meta.overview}</p>${staleTag()}</div><div class="viz-stack">${pctBar("10% model",s10)}${pctBar("25% model",s25)}${pctBar("50% model",s50)}<small class="evidence-note">1-minute evidence: not yet exposed by the customer-safe API.</small></div></div>`;
    }
  }

  function renderScanner(){
    const el=document.getElementById("tierScannerVisual"); if(!el)return;
    const p=primary();
    if(tier==="FREE"){
      el.innerHTML=p?`<div class="visual-card single-feature"><div><span class="viz-kicker">FEATURED SETUP</span><h3>${p.symbol}</h3><p>${money(p.price)} · ${signed(p.move)} · ${p.state || "Watch"}</p></div>${ring(p.model ?? p.model_scores?.score25,"model")}</div>`:`<div class="empty-viz">Waiting for scanner data.</div>`;
    } else if(tier==="BASIC"){
      el.innerHTML=`<div class="visual-card"><div class="visual-card-head"><div><span class="viz-kicker">REAL 5-MINUTE MODEL</span><h3>Top four public setups</h3></div>${staleTag()}</div>${candidateBars()}</div>`;
    } else {
      el.innerHTML=`<div class="visual-card"><div class="visual-card-head"><div><span class="viz-kicker">${tier==="PRO"?"MODEL HEAT":"RESEARCH FIELD"}</span><h3>${tier==="PRO"?"Eight-setup analytical view":"Eleven-setup deep view"}</h3></div>${staleTag()}</div>${heatTiles()}${tier==="PREMIUM"?`<div class="evidence-strip evidence-unavailable"><div><strong>1-minute evidence layer</strong><small>Waiting for an approved 1-minute field from the public API — no simulated values are shown.</small></div></div>`:""}</div>`;
    }
  }

  function renderWatchlist(){
    const el=document.getElementById("tierWatchlistVisual"); if(!el)return;
    const rs=rows();
    const avg=rs.length?rs.reduce((a,c)=>a+clamp(c.model ?? c.model_scores?.score25),0)/rs.length:0;
    const copy={FREE:"1 featured setup",BASIC:"Up to 4 scanner setups",PRO:"Up to 8 analytical setups",PREMIUM:"Up to 11 deep-view setups"}[tier];
    el.innerHTML=`<div class="metric-ribbon"><div><span>Visible setup depth</span><strong>${rs.length}</strong><small>${copy}</small></div><div>${pctBar("Average 25% model",avg)}</div><div><span class="viz-kicker">REAL PAYLOAD</span><strong>${rs.filter(x=>x.finalist).length} finalists</strong><small>${rs.filter(x=>x.ml_capped_top10).length} ML top-10 promoted</small></div></div>`;
  }

  function renderSignals(){
    const el=document.getElementById("tierSignalsVisual"); if(!el)return;
    const rs=rows();
    const count=Math.min(rs.length,{FREE:1,BASIC:3,PRO:5,PREMIUM:7}[tier]);
    const p=primary();
    const score=p?clamp(p.model ?? p.model_scores?.score25):0;
    el.innerHTML=`<div class="signal-visual"><div class="signal-orbit">${ring(score,"lead model")}</div><div><span class="viz-kicker">SCANNER STATE</span><h3>${count} visible signal layers</h3><p>${meta.signals}</p><div class="signal-dots">${Array.from({length:Math.max(1,count)},(_,i)=>`<i style="opacity:${1-i/(count+2)}"></i>`).join("")}</div></div></div>`;
  }

  function renderJourney(){
    const el=document.getElementById("tierJourneyVisual"); if(!el)return;
    const p=primary();
    const outcome=p?.outcome || null;

    if(tier==="FREE"){
      el.innerHTML=`<div class="journey-preview-viz"><div class="journey-node done">Discover</div><span></span><div class="journey-node active">Current snapshot</div><span class="locked-line"></span><div class="journey-node locked">History 🔒</div></div>`;
      return;
    }
    if(tier==="BASIC"){
      el.innerHTML=`<div class="journey-preview-viz"><div class="journey-node done">Discover</div><span></span><div class="journey-node done">5m model</div><span></span><div class="journey-node active">${p?.state || "Current"}</div><span class="locked-line"></span><div class="journey-node locked">Full journey 🔒</div></div>`;
      return;
    }

    if(!outcome){
      el.innerHTML=`<div class="visual-card outcome-pending"><span class="viz-kicker">${tier==="PRO"?"HISTORICAL OUTCOME":"DEEP EXPERIENCE"}</span><h3>Resolved outcome pending</h3><p>No approved 15/30/60-minute outcome object is present for this latest captured setup. Trendward will show it here when the public API has a resolved record.</p>${tier==="PREMIUM"?`<p class="evidence-note">1-minute evidence is also not yet present in the public payload.</p>`:""}</div>`;
      return;
    }

    const items=[["15m",outcome.mfe_15m_pct,outcome.mae_15m_pct],["30m",outcome.mfe_30m_pct,outcome.mae_30m_pct],["60m",outcome.mfe_60m_pct,outcome.mae_60m_pct]];
    el.innerHTML=`<div class="visual-card"><span class="viz-kicker">FORWARD EXCURSION ENVELOPE</span><h3>${p.symbol} resolved movement</h3><div class="outcome-mini-grid">${items.map(([h,mfe,mae])=>`<div><span>${h}</span><strong class="up">${signed(mfe)}</strong><small class="down">${signed(mae)}</small></div>`).join("")}</div><p class="evidence-note">Historical price excursion, not realized P&amp;L.</p>${tier==="PREMIUM"?`<p class="evidence-note">1-minute evidence will appear when the approved public field is available.</p>`:""}</div>`;
  }

  function renderPulse(){
    const el=document.getElementById("tierPulseVisual"); if(!el)return;
    const pld=payload();
    const market=Array.isArray(pld?.markets)?pld.markets:[];
    const max={FREE:2,BASIC:3,PRO:4,PREMIUM:4}[tier];
    const cards=market.slice(0,max);
    el.innerHTML=`<div class="pulse-visual-grid">${cards.map(([a,b,c])=>`<div><span>${a}</span><strong>${b}</strong><small>${c}</small></div>`).join("")}</div>${tier==="PREMIUM"?`<p class="evidence-note">Ignition/exhaustion and 1-minute pulse fields will appear only after they are explicitly added to the customer-safe API.</p>`:""}`;
  }

  function renderSettings(){
    const el=document.getElementById("tierSettingsVisual"); if(!el)return;
    const features={
      FREE:["1 featured setup","Snapshot model view","Core appearance settings"],
      BASIC:["Up to 4 setups","Real 5-minute ML detail","Developing setup context"],
      PRO:["Up to 8 setups","Full 5-minute Model Journey","15/30/60m outcomes when resolved"],
      PREMIUM:["Up to 11 setups","Deep approved scanner fields","1-minute evidence when API-approved"]
    }[tier];
    el.innerHTML=`<div class="settings-tier-card"><div><span class="viz-kicker">${meta.name.toUpperCase()} PLAN</span><h3>${meta.settings}</h3></div><div class="feature-pills">${features.map(x=>`<span>✓ ${x}</span>`).join("")}</div></div>`;
  }

  function updateHeadings(){
    const hero=document.querySelector("#section-overview .hero-panel h2");
    const lead=document.querySelector("#section-overview .hero-panel .lead");
    if(hero) hero.textContent={
      FREE:"See the strongest setup without the noise.",
      BASIC:"Follow momentum as the setup develops.",
      PRO:"Study the setup, the model, and what happened next.",
      PREMIUM:"Research the deepest approved scanner evidence."
    }[tier];
    if(lead) lead.textContent=meta.overview;

    const headings={scanner:meta.scanner,watchlist:meta.watch,signals:meta.signals,journey:meta.journey,pulse:meta.pulse,settings:meta.settings};
    Object.entries(headings).forEach(([id,copy])=>{
      const p=document.querySelector(`#section-${id} .section-heading p`);
      if(p) p.textContent=copy;
    });

    const header=document.querySelector(".topbar h1");
    if(header) header.textContent=`${meta.name} Intelligence Dashboard`;
  }

  function renderAll(){
    try {
      if(typeof trendwardTier!=="undefined") trendwardTier=tier;
      if(typeof applyTier==="function") applyTier();
    } catch {}
    updateHeadings();
    renderOverview(); renderScanner(); renderWatchlist(); renderSignals();
    renderJourney(); renderPulse(); renderSettings();

    ["topPlanBadge","sidebarTier","headerTier"].forEach(id=>{
      const x=document.getElementById(id); if(x)x.textContent=tier;
    });
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",renderAll,{once:true});
  else renderAll();

  window.addEventListener("trendward:data",renderAll);
})();
