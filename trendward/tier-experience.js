(() => {
  const tier = String(window.TRENDWARD_FIXED_TIER || "FREE").toUpperCase();
  const LIMITS = {FREE:1, BASIC:4, PRO:8, PREMIUM:11};
  const WATCH_MAX = {FREE:1, BASIC:3, PRO:5, PREMIUM:10};
  const AUTO_LIMIT = {FREE:0, BASIC:0, PRO:5, PREMIUM:10};
  const UPGRADE_ORDER = ["FREE","BASIC","PRO","PREMIUM"];
  const PLAN_PATH = {
    FREE:"/trendward/",
    BASIC:"/trendward/basic/",
    PRO:"/trendward/pro/",
    PREMIUM:"/trendward/premium/"
  };

  let activePriceFilter = "ALL";
  const metricBySymbol = {};

  function payload(){ return window.TRENDWARD_PUBLIC_PAYLOAD || null; }
  function allRows(){
    const rows = Array.isArray(payload()?.candidates) ? payload().candidates.slice() : [];
    return rows.sort((a,b) => {
      const stateWeight = x => String(x?.state||"").toUpperCase()==="SELECTED" ? 0 :
                               String(x?.state||"").toUpperCase()==="PROMOTED" ? 1 : 2;
      return stateWeight(a)-stateWeight(b) || Number(a.rank||999)-Number(b.rank||999);
    });
  }
  function visibleRows(){ return allRows().slice(0, LIMITS[tier]); }
  function featuredRow(){
    return allRows().find(c => ["SELECTED","PROMOTED"].includes(String(c.state||"").toUpperCase())) || allRows()[0] || null;
  }
  function num(v){ const n=Number(v); return Number.isFinite(n)?n:null; }
  function esc(v){ return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
  function money(v){ const n=num(v); return n===null?"—":`$${n<1?n.toFixed(4):n.toFixed(2)}`; }
  function pct(v){ const n=num(v); return n===null?"—":`${n>=0?"+":""}${n.toFixed(1)}%`; }
  function score(c){ const n=num(c?.model ?? c?.model_scores?.score25); return n===null?null:Math.max(0,Math.min(100,n)); }
  function scanTime(){
    const raw=payload()?.scannerScanTime || payload()?.scannerCapturedAt;
    if(!raw) return "Scanner time";
    const d=new Date(raw); if(Number.isNaN(d.getTime())) return "Scanner time";
    return d.toLocaleTimeString([],{hour:"numeric",minute:"2-digit"});
  }

  const METRIC_KEYS = {
    FREE:["move","liquidity5","model25","price"],
    BASIC:["move","liquidity5","model25","price","vwap","fromHigh"],
    PRO:["move","liquidity5","model25","price","vwap","fromHigh","model10","model50","liquidity15","spread"],
    PREMIUM:["move","liquidity5","model25","price","vwap","fromHigh","model10","model50","liquidity15","spread","dollar5","dollar15","rank10","rank25","rank50","firstPromotion"]
  };

  function metricSpec(c,key){
    const specs = {
      move:{label:"Session move",short:"Session move",group:"Price & Structure",unit:"%",value:num(c.move),min:-100,max:Math.max(100,Math.ceil(Math.abs(num(c.move)||0)/25)*25),display:pct(c.move),explain:"Captured percentage move for the stock in this scanner snapshot."},
      liquidity5:{label:"5m liquidity acceleration",short:"5m liquidity",group:"Liquidity",unit:"×",value:num(c.vol),min:0,max:Math.max(6,Math.ceil((num(c.vol)||0)+1)),display:num(c.vol)===null?"—":`${num(c.vol).toFixed(2)}×`,explain:"Recent 5-minute trading activity relative to its baseline. 1× is the baseline."},
      model25:{label:"25% model score",short:"25% model",group:"Model Intelligence",unit:"/100",value:score(c),min:0,max:100,display:score(c)===null?"—":`${score(c).toFixed(0)}/100`,explain:"Approved 5-minute model evidence for the 25% move target. It is not a guarantee."},
      price:{label:"Captured price",short:"Price",group:"Price & Structure",unit:"$",value:num(c.price),min:0,max:Math.max(20,Math.ceil((num(c.price)||0)/5)*5),display:money(c.price),explain:"Captured market price for this scanner snapshot."},
      vwap:{label:"Price vs VWAP",short:"Vs VWAP",group:"Price & Structure",unit:"%",value:num(c.price_vs_vwap_pct),min:-50,max:50,display:pct(c.price_vs_vwap_pct),explain:"How far price is above or below the session volume-weighted average price."},
      fromHigh:{label:"Distance from session high",short:"From high",group:"Price & Structure",unit:"%",value:num(c.distance_from_high_pct),min:-100,max:0,display:pct(c.distance_from_high_pct),explain:"How far the captured price sits below the session high. Closer to 0% means stronger high retention."},
      model10:{label:"10% model score",short:"10% model",group:"Model Intelligence",unit:"/100",value:num(c.model_scores?.score10),min:0,max:100,display:num(c.model_scores?.score10)===null?"—":`${num(c.model_scores?.score10).toFixed(0)}/100`,explain:"Approved 5-minute model evidence for the 10% move target."},
      model50:{label:"50% model score",short:"50% model",group:"Model Intelligence",unit:"/100",value:num(c.model_scores?.score50),min:0,max:100,display:num(c.model_scores?.score50)===null?"—":`${num(c.model_scores?.score50).toFixed(0)}/100`,explain:"Approved 5-minute model evidence for the 50% move target."},
      liquidity15:{label:"15m liquidity acceleration",short:"15m liquidity",group:"Liquidity",unit:"×",value:num(c.volume_accel_15m),min:0,max:Math.max(6,Math.ceil((num(c.volume_accel_15m)||0)+1)),display:num(c.volume_accel_15m)===null?"—":`${num(c.volume_accel_15m).toFixed(2)}×`,explain:"Recent 15-minute trading activity relative to its baseline."},
      spread:{label:"Spread",short:"Spread",group:"Price & Structure",unit:"%",value:num(c.spread_pct),min:0,max:Math.max(5,Math.ceil((num(c.spread_pct)||0)+1)),display:num(c.spread_pct)===null?"—":`${num(c.spread_pct).toFixed(2)}%`,explain:"Bid-ask spread as a percentage. Lower is generally easier to trade."},
      dollar5:{label:"5m dollar volume",short:"5m $ volume",group:"Liquidity",unit:"$",value:num(c.dollar_volume_5m),min:0,max:Math.max(100000,num(c.dollar_volume_5m)||0),display:num(c.dollar_volume_5m)===null?"—":`$${Math.round(num(c.dollar_volume_5m)).toLocaleString()}`,explain:"Approximate dollars traded over the most recent 5-minute scanner window."},
      dollar15:{label:"15m dollar volume",short:"15m $ volume",group:"Liquidity",unit:"$",value:num(c.dollar_volume_15m),min:0,max:Math.max(250000,num(c.dollar_volume_15m)||0),display:num(c.dollar_volume_15m)===null?"—":`$${Math.round(num(c.dollar_volume_15m)).toLocaleString()}`,explain:"Approximate dollars traded over the most recent 15-minute scanner window."},
      rank10:{label:"10% model rank",short:"10% rank",group:"Model Intelligence",unit:"rank",value:num(c.model_ranks?.rank10),min:1,max:Math.max(10,num(c.model_ranks?.rank10)||10),display:num(c.model_ranks?.rank10)===null?"—":`#${Math.round(num(c.model_ranks?.rank10))}`,explain:"Relative model rank within the captured cohort for the 10% move target. Lower rank is stronger."},
      rank25:{label:"25% model rank",short:"25% rank",group:"Model Intelligence",unit:"rank",value:num(c.model_ranks?.rank25),min:1,max:Math.max(10,num(c.model_ranks?.rank25)||10),display:num(c.model_ranks?.rank25)===null?"—":`#${Math.round(num(c.model_ranks?.rank25))}`,explain:"Relative model rank within the captured cohort for the 25% move target. Lower rank is stronger."},
      rank50:{label:"50% model rank",short:"50% rank",group:"Model Intelligence",unit:"rank",value:num(c.model_ranks?.rank50),min:1,max:Math.max(10,num(c.model_ranks?.rank50)||10),display:num(c.model_ranks?.rank50)===null?"—":`#${Math.round(num(c.model_ranks?.rank50))}`,explain:"Relative model rank within the captured cohort for the 50% move target. Lower rank is stronger."},
      firstPromotion:{label:"First promotion time",short:"First promoted",group:"Model Intelligence",unit:"time",value:null,min:0,max:1,display:(()=>{if(!c.first_promotion_utc)return"—";const d=new Date(c.first_promotion_utc);return Number.isNaN(d.getTime())?"—":d.toLocaleTimeString([],{hour:"numeric",minute:"2-digit"});})(),explain:"First archived time this symbol was promoted by the 5-minute model layer."}
    };
    return specs[key] || specs.move;
  }

  function whySetup(c){
    if(!(tier==="PRO"||tier==="PREMIUM")) return "";
    const parts=[];
    const m25=score(c), m50=num(c.model_scores?.score50), vwap=num(c.price_vs_vwap_pct), liq5=num(c.vol), liq15=num(c.volume_accel_15m), high=num(c.distance_from_high_pct), spr=num(c.spread_pct);
    if(m25!==null) parts.push(`25% model ${m25.toFixed(0)}/100`);
    if(m50!==null) parts.push(`50% model ${m50.toFixed(0)}/100`);
    if(vwap!==null) parts.push(`${vwap>=0?Math.abs(vwap).toFixed(1)+"% above":Math.abs(vwap).toFixed(1)+"% below"} VWAP`);
    if(high!==null) parts.push(`${Math.abs(high).toFixed(1)}% below the session high`);
    if(liq5!==null) parts.push(`5m liquidity ${liq5.toFixed(2)}×`);
    if(liq15!==null) parts.push(`15m liquidity ${liq15.toFixed(2)}×`);
    if(spr!==null) parts.push(`spread ${spr.toFixed(2)}%`);
    return parts.length ? `${c.symbol} is ${String(c.state||"being monitored").toLowerCase()}. ${parts.slice(0,tier==="PRO"?5:7).join(", ")}.` : "";
  }

  function bulletChart(c,key){
    const s=metricSpec(c,key);
    if(key==="firstPromotion"){
      return `<div class="bullet-chart time-chart">
        <div class="bullet-chart-title"><span>${esc(s.label)}</span><strong>${esc(s.display)}</strong></div>
        <div class="time-axis"><span>Earlier detection</span><i></i><span>Later detection</span></div>
        <small>${esc(s.explain)}</small>
      </div>`;
    }
    if(s.value===null) return `<div class="metric-chart-empty">No ${esc(s.label)} value in this snapshot.</div>`;
    const span=(s.max-s.min)||1;
    let pos=(s.value-s.min)/span*100;
    if(["rank10","rank25","rank50"].includes(key)) pos=100-pos;
    pos=Math.max(0,Math.min(100,pos));
    const zeroPos=s.min<0?Math.max(0,Math.min(100,(0-s.min)/span*100)):0;
    const ticks=Array.from({length:5},(_,i)=>s.min+i*span/4);
    const tickText=v=>{
      if(s.unit==="%") return `${Math.round(v)}%`;
      if(s.unit==="×") return `${v.toFixed(v<10?1:0)}×`;
      if(s.unit==="$"){
        if(v>=1_000_000) return `$${(v/1_000_000).toFixed(1)}M`;
        if(v>=1_000) return `$${Math.round(v/1_000)}K`;
        return `$${Math.round(v)}`;
      }
      if(s.unit==="rank") return `#${Math.max(1,Math.round(v))}`;
      return `${Math.round(v)}`;
    };
    return `<div class="bullet-chart" aria-label="${esc(s.label)} ${esc(s.display)}">
      <div class="bullet-chart-title"><span>${esc(s.label)}</span><strong>${esc(s.display)}</strong></div>
      <div class="bullet-stage">
        ${s.min<0?`<i class="zero-line" style="left:${zeroPos}%"></i>`:""}
        <div class="bullet-track"></div>
        <i class="value-point" style="left:${pos}%"></i>
      </div>
      <div class="bullet-ticks">${ticks.map(v=>`<span>${esc(tickText(v))}</span>`).join("")}</div>
      <small>${esc(s.explain)}</small>
    </div>`;
  }

  function priceBand(c){
    const p=num(c.price); if(p===null)return "UNKNOWN";
    return p<2?"UNDER2":p<5?"2TO5":"5TO20";
  }
  function filteredRows(rows){
    return activePriceFilter==="ALL"?rows:rows.filter(c=>priceBand(c)===activePriceFilter);
  }

  function renderScanner(){
    const el=document.getElementById("scannerCards"); if(!el)return;
    let rows=visibleRows();
    if(tier==="FREE"){ const f=featuredRow(); rows=f?[f]:[]; }
    rows=filteredRows(rows);

    if(!rows.length){
      el.innerHTML=`<div class="panel empty-filter">No visible setups are in this price band.</div>`;
      return;
    }

    const keys=METRIC_KEYS[tier];

    el.innerHTML=rows.map(c=>{
      const key=metricBySymbol[c.symbol] || keys[0];
      const specs=keys.map(k=>[k,metricSpec(c,k)]);

      const metricHtml = tier==="PREMIUM"
        ? ["Price & Structure","Liquidity","Model Intelligence"].map(group=>{
            const subset=specs.filter(([,s])=>s.group===group);
            if(!subset.length)return "";
            return `<div class="metric-group">
              <div class="metric-group-title">${esc(group)}</div>
              <div class="metric-grid premium-metric-grid">
                ${subset.map(([mk,s])=>`
                  <button class="metric metric-switch ${key===mk?"active":""}" data-symbol="${esc(c.symbol)}" data-metric="${mk}">
                    <span>${esc(s.short)}</span><strong>${esc(s.display)}</strong>
                  </button>`).join("")}
              </div>
            </div>`;
          }).join("")
        : `<div class="metric-grid tiered-metric-grid tiered-${tier.toLowerCase()}">
            ${specs.map(([mk,s])=>`
              <button class="metric metric-switch ${key===mk?"active":""}" data-symbol="${esc(c.symbol)}" data-metric="${mk}">
                <span>${esc(s.short)}</span><strong>${esc(s.display)}</strong>
              </button>`).join("")}
          </div>`;

      const why=whySetup(c);

      return `<article class="scanner-card expanded-scanner-card" data-symbol="${esc(c.symbol)}">
        <div class="scanner-card-head">
          <div><span class="rank">${esc(c.rank)}</span></div>
          <span class="state-badge">${esc(c.state||"Watch")}</span>
        </div>
        <div class="price">${esc(c.symbol)} <span>${money(c.price)}</span></div>
        <div class="interactive-metric-chart">${bulletChart(c,key)}</div>
        ${metricHtml}
        ${why?`<div class="why-setup"><div class="why-setup-label">WHY THIS SETUP?</div><p>${esc(why)}</p></div>`:""}
      </article>`;
    }).join("");

    el.querySelectorAll(".metric-switch").forEach(btn=>{
      btn.addEventListener("click",()=>{
        metricBySymbol[btn.dataset.symbol]=btn.dataset.metric;
        const c=rows.find(x=>x.symbol===btn.dataset.symbol);
        const card=btn.closest(".scanner-card");
        card.querySelector(".interactive-metric-chart").innerHTML=bulletChart(c,btn.dataset.metric);
        card.querySelectorAll(".metric-switch").forEach(x=>x.classList.toggle("active",x===btn));
      });
    });
  }

  function setupPriceFilters(){
    document.querySelectorAll("#section-scanner .filter-row .chip").forEach(btn=>{
      const t=btn.textContent.trim();
      const key=t==="All"?"ALL":t.includes("Under")?"UNDER2":t.includes("$2")?"2TO5":"5TO20";
      if(btn.dataset.v15Bound==="1") return;
      btn.dataset.v15Bound="1";
      btn.addEventListener("click",()=>{
        activePriceFilter=key;
        document.querySelectorAll("#section-scanner .filter-row .chip").forEach(x=>x.classList.remove("active"));
        btn.classList.add("active");
        renderScanner();
      });
    });
  }

  function watchKey(){ return `trendward-watchlist-${tier.toLowerCase()}`; }
  function watchModeKey(){ return `trendward-watchmode-${tier.toLowerCase()}`; }
  function currentSymbols(){ return visibleRows().map(c=>c.symbol); }
  function loadManualWatch(){
    let saved=[];
    try{ saved=JSON.parse(localStorage.getItem(watchKey())||"[]"); }catch{}
    const current=new Set(currentSymbols());
    saved=(Array.isArray(saved)?saved:[]).filter(s=>current.has(s)).slice(0,WATCH_MAX[tier]);
    localStorage.setItem(watchKey(),JSON.stringify(saved));
    return saved;
  }
  function saveManualWatch(arr){ localStorage.setItem(watchKey(),JSON.stringify(arr.slice(0,WATCH_MAX[tier]))); }

  function autoEnabled(){ return localStorage.getItem(watchModeKey())==="auto"; }
  function setAuto(on){ localStorage.setItem(watchModeKey(),on?"auto":"manual"); }

  function watchedSymbols(){
    if((tier==="PRO" || tier==="PREMIUM") && autoEnabled()){
      return visibleRows().slice(0,AUTO_LIMIT[tier]).map(c=>c.symbol);
    }
    return loadManualWatch();
  }

  function renderWatchlist(){
    const heading=document.querySelector("#section-watchlist .section-heading");
    const full=document.getElementById("watchlistFull"); if(!full)return;

    let controls=document.getElementById("watchControlsV15");
    if(!controls){
      controls=document.createElement("div");
      controls.id="watchControlsV15";
      controls.className="watch-controls";
      heading?.appendChild(controls);
    }

    const isAuto=(tier==="PRO"||tier==="PREMIUM") && autoEnabled();
    const canAuto=(tier==="PRO"||tier==="PREMIUM");
    controls.innerHTML=`
      <span class="watch-mode">${isAuto?"AUTO-CURRENT":"MANUAL"}</span>
      ${canAuto?`<button class="chip ${isAuto?"active":""}" id="autoCurrentBtn">${isAuto?"Use manual":"Auto-current"}</button>`:""}
      ${tier==="PRO"?`<button class="chip upsell-inline" data-upgrade="PREMIUM">Want all current setups? Premium →</button>`:""}
    `;

    const selected=new Set(watchedSymbols());
    const rows=visibleRows().filter(c=>selected.has(c.symbol));

    const chooser = isAuto ? "" : `<div class="watch-picker">
      <div class="watch-picker-head"><div><strong>Select from current Scanner</strong><small>Selections automatically disappear if they fall out of your tier's current Scanner.</small></div><span>${selected.size}/${WATCH_MAX[tier]}</span></div>
      <div class="watch-picker-grid">
        ${visibleRows().map(c=>{
          const on=selected.has(c.symbol);
          return `<button class="watch-pick ${on?"selected":""}" data-watch-symbol="${esc(c.symbol)}">
            <span>${esc(c.symbol)}</span><small>${esc(c.state||"Watch")} · ${money(c.price)}</small><b>${on?"Remove":"Select"}</b>
          </button>`;
        }).join("")}
      </div>
    </div>`;

    const list = rows.length ? `<div class="watch-current-list">
      ${rows.map(c=>`<div class="large-row">
        <strong>${esc(c.symbol)}</strong>
        <span>${esc(c.state||"Watch")}</span>
        <span>${score(c)===null?"—":`${score(c).toFixed(0)}/100`}</span>
        <span class="row-note">${num(c.vol)===null?"":`${num(c.vol).toFixed(2)}× 5m liquidity · `}${num(c.price_vs_vwap_pct)===null?"":`${pct(c.price_vs_vwap_pct)} vs VWAP`}</span>
      </div>`).join("")}
    </div>` : `<div class="empty-viz">${isAuto?"No current scanner setups available.":"Select a current Scanner setup to add it to your Watchlist."}</div>`;

    full.innerHTML=chooser+list;

    const autoBtn=document.getElementById("autoCurrentBtn");
    if(autoBtn) autoBtn.addEventListener("click",()=>{ setAuto(!isAuto); renderWatchlist(); });

    full.querySelectorAll("[data-watch-symbol]").forEach(btn=>{
      btn.addEventListener("click",()=>{
        let arr=loadManualWatch();
        const s=btn.dataset.watchSymbol;
        if(arr.includes(s)) arr=arr.filter(x=>x!==s);
        else {
          if(arr.length>=WATCH_MAX[tier]){
            if(tier==="PRO") openUpgrade("PREMIUM");
            return;
          }
          arr.push(s);
        }
        saveManualWatch(arr);
        renderWatchlist();
      });
    });

    controls.querySelectorAll("[data-upgrade]").forEach(b=>b.addEventListener("click",()=>openUpgrade(b.dataset.upgrade)));
  }

  function renderSignals(){
    const full=document.getElementById("signalsFull");
    const compact=document.getElementById("signalCards");
    const rows=visibleRows().slice(0,tier==="FREE"?1:tier==="BASIC"?3:tier==="PRO"?5:8);
    const item=c=>`${c.state||"Watch"} · ${score(c)===null?"model —":`25% model ${score(c).toFixed(0)}`} · ${num(c.vol)===null?"liquidity —":`5m liquidity ${num(c.vol).toFixed(2)}×`}`;
    if(compact) compact.innerHTML=rows.slice(0,3).map(c=>`<div class="stack-card"><div class="stack-card-top"><strong>${esc(c.symbol)}</strong><span class="mini-badge">${esc(scanTime())}</span></div><p>${esc(item(c))}</p></div>`).join("");
    if(full) full.innerHTML=rows.map((c,i)=>`<div class="timeline-item"><div class="timeline-time">${esc(scanTime())}</div><div class="timeline-dot-col"><div class="timeline-dot"></div>${i<rows.length-1?'<div class="timeline-line"></div>':''}</div><div class="timeline-content"><strong>${esc(c.symbol)}</strong><p>${esc(item(c))}</p></div></div>`).join("");
  }

  function renderCandidateTable(){
    const el=document.getElementById("candidateTable"); if(!el)return;
    let rows=visibleRows();
    if(tier==="FREE"){ const f=featuredRow(); rows=f?[f]:[]; }
    el.innerHTML=rows.map(c=>`<tr><td><div class="rank">${esc(c.rank)}</div></td><td><span class="symbol">${esc(c.symbol)}</span></td><td>${money(c.price)}</td><td class="${num(c.move)!==null&&num(c.move)<0?"down":"up"}">${pct(c.move)}</td><td>${num(c.vol)===null?"—":num(c.vol).toFixed(2)+"×"}</td><td>${score(c)===null?"—":score(c).toFixed(0)}</td><td><span class="state-badge">${esc(c.state||"Watch")}</span></td></tr>`).join("");
  }

  function openUpgrade(target){
    const modal=document.getElementById("authModal");
    const backdrop=document.getElementById("modalBackdrop");
    if(typeof window.openAuthV2==="function") window.openAuthV2("signup");
    else if(document.getElementById("signupBtn")) document.getElementById("signupBtn").click();
    if(modal){
      const title=modal.querySelector("#authTitle");
      if(title) title.textContent=`Sign up for ${target.charAt(0)+target.slice(1).toLowerCase()}`;
      let note=document.getElementById("upgradeTargetNote");
      if(!note){
        note=document.createElement("div"); note.id="upgradeTargetNote"; note.className="upgrade-target-note";
        modal.querySelector(".modal-card")?.insertBefore(note, modal.querySelector("form"));
      }
      if(note) note.textContent=`Upgrade target: ${target.charAt(0)+target.slice(1).toLowerCase()}. Billing is not active in this preview yet.`;
    }
  }

  function renderUpgradeMenu(){
    const badge=document.getElementById("topPlanBadge"); if(!badge)return;
    let wrap=document.getElementById("planUpgradeWrap");
    if(!wrap){
      wrap=document.createElement("div"); wrap.id="planUpgradeWrap"; wrap.className="plan-upgrade-wrap";
      badge.parentNode.insertBefore(wrap,badge);
      wrap.appendChild(badge);
    }
    const idx=UPGRADE_ORDER.indexOf(tier);
    const higher=UPGRADE_ORDER.slice(idx+1);
    const old=wrap.querySelector(".plan-upgrade-menu"); if(old)old.remove();
    if(!higher.length){ badge.classList.add("no-upgrades"); return; }
    badge.classList.add("has-upgrades");
    const menu=document.createElement("div"); menu.className="plan-upgrade-menu";
    menu.innerHTML=higher.map(p=>`<button data-upgrade="${p}"><strong>${p.charAt(0)+p.slice(1).toLowerCase()}</strong><span>Sign up for ${p.charAt(0)+p.slice(1).toLowerCase()}</span></button>`).join("");
    wrap.appendChild(menu);
    menu.querySelectorAll("[data-upgrade]").forEach(b=>b.addEventListener("click",()=>openUpgrade(b.dataset.upgrade)));
  }

  const HELP = {
    scanner:"Scanner ranks the setups currently visible in your plan. The card graph shows one captured metric at a time; click a box below it to switch metrics.",
    watchlist:"Watchlist is your current subset of Scanner setups. Manual selections disappear automatically when a symbol leaves your current Scanner.",
    signals:"Signals summarize current scanner/model state changes for the same symbols shown in Scanner.",
    journey:"Model Journey explains how a setup progressed through model states and, when available, what happened afterward.",
    pulse:"Market Pulse summarizes the scanner universe rather than one stock."
  };
  function renderHelp(){
    if(!(tier==="PRO"||tier==="PREMIUM")) return;
    Object.entries(HELP).forEach(([section,text])=>{
      const heading=document.querySelector(`#section-${section} .section-heading`);
      if(!heading)return;
      let btn=heading.querySelector(".page-help-v15");
      if(btn)return;
      btn=document.createElement("button");
      btn.className="page-help-v15";
      btn.type="button";
      btn.innerHTML=`?<span>${esc(text)}</span>`;
      heading.appendChild(btn);
    });
    document.querySelectorAll(".metric-switch").forEach(btn=>{
      btn.title="Click to show this metric in the chart above.";
    });
  }

  function renderFreeCopy(){
    if(tier!=="FREE")return;
    const f=featuredRow();
    const h=document.querySelector("#section-scanner .section-heading p");
    if(h) h.textContent=`One #1 selected/promoted setup from the 30-minute-delayed scanner snapshot${f?`: ${f.symbol}`:""}.`;
  }

  function renderEverything(){
    renderUpgradeMenu();
    renderCandidateTable();
    renderScanner();
    setupPriceFilters();
    renderWatchlist();
    renderSignals();
    renderHelp();
    renderFreeCopy();

    const badge=document.getElementById("topPlanBadge"); if(badge) badge.textContent=tier;
    const side=document.getElementById("sidebarTier"); if(side) side.textContent=tier;
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",renderEverything,{once:true});
  else renderEverything();
  window.addEventListener("trendward:data",renderEverything);
})();