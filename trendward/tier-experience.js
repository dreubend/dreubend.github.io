
(() => {
  const tier = window.TRENDWARD_FIXED_TIER || "FREE";

  // Make the route authoritative. This fixes older preview logic that remembered
  // the last locally selected tier.
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

  const tierMeta = {
    FREE: {
      name:"Free",
      strap:"Daily snapshot",
      overview:"One featured setup and a simple read on why it matters.",
      scanner:"A focused look at the strongest featured setup.",
      watch:"One developing setup.",
      signals:"Latest major state change.",
      journey:"Snapshot only — no full historical path.",
      pulse:"Current universe state.",
      settings:"Core account and appearance controls.",
      colorLabel:"Snapshot"
    },
    BASIC: {
      name:"Basic",
      strap:"Active scanner",
      overview:"More setups plus 5-minute model context.",
      scanner:"Up to four current setups with probability context.",
      watch:"Two developing setups with clearer state progression.",
      signals:"More state changes and 5-minute context.",
      journey:"Compact setup progression, without the full historical experience.",
      pulse:"Market pulse plus intraday breadth visuals.",
      settings:"Basic subscription features and 5-minute intelligence.",
      colorLabel:"5m model"
    },
    PRO: {
      name:"Pro",
      strap:"Historical intelligence",
      overview:"A broader scanner view with historical/model context.",
      scanner:"Up to eight setups with richer model comparison.",
      watch:"Four featured/archive candidates and deeper context.",
      signals:"Expanded state-change history.",
      journey:"Full 5-minute Model Journey with resolved outcomes.",
      pulse:"Intraday breadth, setup distribution, and market-state history.",
      settings:"Pro historical access and outcome controls.",
      colorLabel:"Journey"
    },
    PREMIUM: {
      name:"Premium",
      strap:"Research cockpit",
      overview:"The deepest scanner and archive experience.",
      scanner:"The full eleven-setup view with 1-minute evidence layer.",
      watch:"Deep archive/variety view plus the true #1 setup.",
      signals:"Full state-change stream with compact 1-minute evidence.",
      journey:"Full journey, outcomes, and 1-minute evidence context.",
      pulse:"Deepest market-state and scanner-universe visualization.",
      settings:"Premium research controls and advanced evidence preferences.",
      colorLabel:"1m evidence"
    }
  };

  const m = tierMeta[tier];

  function pctBar(label, value, hint="") {
    return `<div class="viz-row">
      <div class="viz-row-head"><span>${label}</span><strong>${value}%</strong></div>
      <div class="viz-track"><i style="width:${Math.max(0,Math.min(100,value))}%"></i></div>
      ${hint ? `<small>${hint}</small>` : ""}
    </div>`;
  }

  function ring(value, label) {
    return `<div class="mini-ring" style="--value:${value}">
      <div><strong>${value}</strong><span>${label}</span></div>
    </div>`;
  }

  function spark(values) {
    const w=220,h=60,p=4,min=Math.min(...values),max=Math.max(...values);
    const pts=values.map((v,i)=>`${p+i*(w-2*p)/(values.length-1)},${h-p-(v-min)/(max-min||1)*(h-2*p)}`).join(" ");
    return `<svg viewBox="0 0 ${w} ${h}" class="tier-spark">
      <polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  }

  function candidateBars(limit) {
    const rows = (typeof data !== "undefined" ? data.candidates : []).slice(0,limit);
    return rows.map(c => `<div class="candidate-viz-row">
      <div><strong>${c.symbol}</strong><small>$${Number(c.price).toFixed(2)} · ${c.state}</small></div>
      <div class="candidate-viz-bar"><i style="width:${c.model}%"></i></div>
      <b>${c.model}</b>
    </div>`).join("");
  }

  function heatTiles(limit) {
    const rows = (typeof data !== "undefined" ? data.candidates : []).slice(0,limit);
    return `<div class="heat-grid">${rows.map(c => {
      const strength = Math.max(18, Math.min(100, c.model));
      return `<div class="heat-tile" style="--heat:${strength}%">
        <strong>${c.symbol}</strong><span>${c.model}</span><small>${c.vol.toFixed(1)}× vol</small>
      </div>`;
    }).join("")}</div>`;
  }

  function renderOverview() {
    const el=document.getElementById("tierOverviewVisual"); if(!el)return;
    const blocks = {
      FREE: `<div class="tier-banner"><div><span>${m.strap}</span><h2>One setup. One clear read.</h2><p>${m.overview}</p></div>${ring(82,"setup")}</div>`,
      BASIC: `<div class="tier-banner"><div><span>${m.strap}</span><h2>Track the setup as it develops.</h2><p>${m.overview}</p></div><div class="viz-stack">${pctBar("Liquidity",86)}${pctBar("Price confirmation",71)}${pctBar("5m model",76)}</div></div>`,
      PRO: `<div class="tier-banner"><div><span>${m.strap}</span><h2>Compare current strength with historical model context.</h2><p>${m.overview}</p></div><div class="visual-pair">${ring(82,"current")}${ring(68,"historical")}</div></div>`,
      PREMIUM: `<div class="tier-banner premium-banner"><div><span>${m.strap}</span><h2>Current setup + archive + one-minute evidence.</h2><p>${m.overview}</p></div><div class="micro-chart"><small>1m evidence pulse</small>${spark([22,28,26,38,45,41,54,63,61,74,82])}</div></div>`
    };
    el.innerHTML = blocks[tier];
  }

  function renderScanner() {
    const el=document.getElementById("tierScannerVisual"); if(!el)return;
    const lim={FREE:1,BASIC:4,PRO:8,PREMIUM:11}[tier];
    let visual;
    if(tier==="FREE") visual=`<div class="visual-card single-feature"><div><span class="viz-kicker">FEATURED SETUP</span><h3>NOVA</h3><p>Simple setup-strength view without deeper probability detail.</p></div>${ring(82,"strength")}</div>`;
    if(tier==="BASIC") visual=`<div class="visual-card"><div class="visual-card-head"><div><span class="viz-kicker">MODEL COMPARISON</span><h3>Top four</h3></div><small>5-minute context</small></div>${candidateBars(lim)}</div>`;
    if(tier==="PRO") visual=`<div class="visual-card"><div class="visual-card-head"><div><span class="viz-kicker">SETUP HEAT</span><h3>Current candidate field</h3></div><small>Current + historical context</small></div>${heatTiles(lim)}</div>`;
    if(tier==="PREMIUM") visual=`<div class="visual-card"><div class="visual-card-head"><div><span class="viz-kicker">FULL SCANNER FIELD</span><h3>Eleven-candidate research view</h3></div><small>Includes 1m evidence layer</small></div>${heatTiles(lim)}<div class="evidence-strip">${spark([18,22,27,24,36,43,48,52,61,69,76,82])}<div><strong>1m evidence acceleration</strong><small>Compact evidence layer for the leading setup</small></div></div></div>`;
    el.innerHTML=visual;
  }

  function renderWatchlist() {
    const el=document.getElementById("tierWatchlistVisual"); if(!el)return;
    const copy = {
      FREE:["1","One developing setup"],
      BASIC:["2","Two developing setups"],
      PRO:["4","Featured + archive variety"],
      PREMIUM:["10+1","Ten archive/variety + true #1"]
    }[tier];
    el.innerHTML=`<div class="metric-ribbon">
      <div><span>Visible watch depth</span><strong>${copy[0]}</strong><small>${copy[1]}</small></div>
      <div>${pctBar("Average model strength",{FREE:58,BASIC:63,PRO:69,PREMIUM:74}[tier])}</div>
      <div>${spark({FREE:[22,27,30,31,35],BASIC:[20,26,35,39,45,48],PRO:[18,28,34,49,55,63,68],PREMIUM:[16,24,31,38,47,59,66,74]}[tier])}</div>
    </div>`;
  }

  function renderSignals() {
    const el=document.getElementById("tierSignalsVisual"); if(!el)return;
    const count={FREE:1,BASIC:3,PRO:5,PREMIUM:7}[tier];
    const labels={
      FREE:"Major state change",
      BASIC:"5-minute state changes",
      PRO:"Expanded setup timeline",
      PREMIUM:"State changes + one-minute evidence"
    };
    el.innerHTML=`<div class="signal-visual">
      <div class="signal-orbit">${ring({FREE:61,BASIC:70,PRO:78,PREMIUM:86}[tier],"signal")}</div>
      <div><span class="viz-kicker">${labels[tier]}</span><h3>${count} visible signal layers</h3>
      <p>${m.signals}</p><div class="signal-dots">${Array.from({length:count},(_,i)=>`<i style="opacity:${1-i/(count+2)}"></i>`).join("")}</div></div>
    </div>`;
  }

  function renderJourney() {
    const el=document.getElementById("tierJourneyVisual"); if(!el)return;
    if(tier==="FREE") {
      el.innerHTML=`<div class="journey-preview-viz"><div class="journey-node done">Discover</div><span></span><div class="journey-node active">Now</div><span class="locked-line"></span><div class="journey-node locked">History 🔒</div></div>`;
    } else if(tier==="BASIC") {
      el.innerHTML=`<div class="journey-preview-viz"><div class="journey-node done">Discover</div><span></span><div class="journey-node done">Ignition</div><span></span><div class="journey-node active">5m model</div><span class="locked-line"></span><div class="journey-node locked">Full journey 🔒</div></div>`;
    } else if(tier==="PRO") {
      el.innerHTML=`<div class="journey-premium-viz"><div><span class="viz-kicker">5-MINUTE MODEL JOURNEY</span><h3>Probability progression</h3>${spark([28,33,41,55,64,72])}</div><div>${ring(18,"60m MFE")}</div></div>`;
    } else {
      el.innerHTML=`<div class="journey-premium-viz"><div><span class="viz-kicker">DEEP EXPERIENCE</span><h3>5m journey + 1m evidence</h3>${spark([25,31,36,43,51,57,63,70,76,80,86])}</div><div class="visual-pair">${ring(18,"60m MFE")}${ring(86,"1m pulse")}</div></div>`;
    }
  }

  function renderPulse() {
    const el=document.getElementById("tierPulseVisual"); if(!el)return;
    const cards={
      FREE:[["Breadth","31%"],["Risk","Selective"]],
      BASIC:[["Breadth","31%"],["Liquidity","+12%"],["Confirming","18%"]],
      PRO:[["Breadth","31%"],["Liquidity","+12%"],["Confirming","18%"],["High conviction","2"]],
      PREMIUM:[["Breadth","31%"],["Liquidity","+12%"],["Confirming","18%"],["High conviction","2"],["1m ignition","6"],["Exhaustion flags","1"]]
    }[tier];
    el.innerHTML=`<div class="pulse-visual-grid">${cards.map(([a,b])=>`<div><span>${a}</span><strong>${b}</strong></div>`).join("")}</div>`;
  }

  function renderSettings() {
    const el=document.getElementById("tierSettingsVisual"); if(!el)return;
    const features={
      FREE:["1 featured setup","Snapshot model view","Core appearance settings"],
      BASIC:["Up to 4 setups","5-minute ML detail","2-item archive/variety view"],
      PRO:["Up to 8 setups","Full 5-minute Model Journey","15/30/60m resolved outcomes"],
      PREMIUM:["11-setup deep view","1-minute evidence layer","Deep archive + advanced filters"]
    }[tier];
    el.innerHTML=`<div class="settings-tier-card">
      <div><span class="viz-kicker">${m.name.toUpperCase()} PLAN</span><h3>${m.settings}</h3></div>
      <div class="feature-pills">${features.map(x=>`<span>✓ ${x}</span>`).join("")}</div>
    </div>`;
  }

  function updateHeadings(){
    const hero=document.querySelector("#section-overview .hero-panel h2");
    const lead=document.querySelector("#section-overview .hero-panel .lead");
    if(hero) hero.textContent={
      FREE:"See the strongest setup without the noise.",
      BASIC:"Follow momentum as the setup develops.",
      PRO:"Study the setup, the model, and what happened next.",
      PREMIUM:"Research the full setup from ignition through one-minute evidence."
    }[tier];
    if(lead) lead.textContent=m.overview;

    const headings = {
      scanner:m.scanner, watchlist:m.watch, signals:m.signals,
      journey:m.journey, pulse:m.pulse, settings:m.settings
    };
    Object.entries(headings).forEach(([id,copy])=>{
      const p=document.querySelector(`#section-${id} .section-heading p`);
      if(p) p.textContent=copy;
    });

    const header=document.querySelector(".topbar h1");
    if(header) header.textContent=`${m.name} Intelligence Dashboard`;
  }

  function renderAllTierExperience(){
    try {
      if (typeof trendwardTier !== "undefined") trendwardTier=tier;
      if (typeof applyTier === "function") applyTier();
    } catch {}
    updateHeadings();
    renderOverview(); renderScanner(); renderWatchlist(); renderSignals();
    renderJourney(); renderPulse(); renderSettings();

    const top=document.getElementById("topPlanBadge");
    const side=document.getElementById("sidebarTier");
    const hdr=document.getElementById("headerTier");
    [top,side,hdr].forEach(x=>{if(x)x.textContent=tier;});
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded", renderAllTierExperience, {once:true});
  } else {
    renderAllTierExperience();
  }
  window.addEventListener("trendward:data", renderAllTierExperience);
})();
