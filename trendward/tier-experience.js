(() => {
  const tier = String(window.TRENDWARD_FIXED_TIER || "FREE").toUpperCase();
  const LIMITS = {FREE:1, BASIC:4, PRO:8, PREMIUM:11, PREMIER:11};
  const WATCH_MAX = {FREE:1, BASIC:4, PRO:8, PREMIUM:11, PREMIER:11};
  const AUTO_LIMIT = {FREE:1, BASIC:4, PRO:8, PREMIUM:11, PREMIER:11};
  const UPGRADE_ORDER = ["FREE","BASIC","PRO","PREMIUM","PREMIER"];
  const PLAN_PATH = {
    FREE:"/trendward/",
    BASIC:"/trendward/basic/",
    PRO:"/trendward/pro/",
    PREMIUM:"/trendward/premium/",
    PREMIER:"/trendward/premier/"
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
    PREMIUM:["move","liquidity5","model25","price","vwap","fromHigh","model10","model50","liquidity15","spread","dollar5","dollar15","rank10","rank25","rank50","firstPromotion"],
    PREMIER:["move","liquidity5","model25","price","vwap","fromHigh","model10","model50","liquidity15","spread","dollar5","dollar15","rank10","rank25","rank50","firstPromotion"]
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
    if(!(tier==="PRO"||tier==="PREMIUM"||tier==="PREMIER")) return "";
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

      const metricHtml = (tier==="PREMIUM" || tier==="PREMIER")
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
    const raw=localStorage.getItem(watchKey());
    let saved=[];

    if(raw===null){
      saved=currentSymbols().slice(0,WATCH_MAX[tier]);
    }else{
      try{ saved=JSON.parse(raw||"[]"); }catch{}
    }

    const current=new Set(currentSymbols());

    saved=(Array.isArray(saved)?saved:[])
      .filter(s=>current.has(s))
      .slice(0,WATCH_MAX[tier]);

    localStorage.setItem(
      watchKey(),
      JSON.stringify(saved)
    );

    return saved;
  }
  function saveManualWatch(arr){ localStorage.setItem(watchKey(),JSON.stringify(arr.slice(0,WATCH_MAX[tier]))); }

  function autoEnabled(){ return localStorage.getItem(watchModeKey())==="auto"; }
  function setAuto(on){ localStorage.setItem(watchModeKey(),on?"auto":"manual"); }

  function watchedSymbols(){

    if(tier==="FREE"){
      return visibleRows().slice(0,1).map(c=>c.symbol);
    }

    if(
      (tier==="PRO" || tier==="PREMIUM" || tier==="PREMIER")
      && autoEnabled()
    ){
      return visibleRows()
        .slice(0,AUTO_LIMIT[tier])
        .map(c=>c.symbol);
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

    const isAuto=(tier==="PRO"||tier==="PREMIUM"||tier==="PREMIER") && autoEnabled();
    const canAuto=(tier==="PRO"||tier==="PREMIUM"||tier==="PREMIER");
    controls.innerHTML=`
      <span class="watch-mode">${isAuto?"AUTO-CURRENT":"MANUAL"}</span>
      ${canAuto?`<button class="chip ${isAuto?"active":""}" id="autoCurrentBtn">${isAuto?"Switch to Manual":"Switch to Auto-current"}</button>`:""}
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
    const rows=visibleRows();
    const item=c=>`${c.state||"Watch"} · ${score(c)===null?"model —":`25% model ${score(c).toFixed(0)}`} · ${num(c.vol)===null?"liquidity —":`5m liquidity ${num(c.vol).toFixed(2)}×`}`;
    if(compact) compact.innerHTML=rows.slice(0,3).map(c=>`<div class="stack-card"><div class="stack-card-top"><strong>${esc(c.symbol)}</strong><span class="mini-badge">${esc(scanTime())}</span></div><p>${esc(item(c))}</p></div>`).join("");
    if(full) full.innerHTML=rows.map((c,i)=>`<div class="timeline-item"><div class="timeline-time">${esc(scanTime())}</div><div class="timeline-dot-col"><div class="timeline-dot"></div>${i<rows.length-1?'<div class="timeline-line"></div>':''}</div><div class="timeline-content"><strong>${esc(c.symbol)}</strong><p>${esc(item(c))}</p></div></div>`).join("");
  }

  function renderOverviewCards(){
    const rows=visibleRows();

    const watch=document.getElementById("watchlistCards");
    const signals=document.getElementById("signalCards");
    const catalysts=document.getElementById("catalystCards");

    if(watch){
      watch.innerHTML=rows.map(c=>{
        const context=plainWhy(c) || `${c.state||"Watch"} · ${money(c.price)}`;
        return `<div class="stack-card">
          <div class="stack-card-top">
            <strong>${esc(c.symbol)}</strong>
            <span class="mini-badge">WATCH</span>
          </div>
          <p>${esc(context)}</p>
        </div>`;
      }).join("");
    }

    if(signals){
      signals.innerHTML=rows.map(c=>{
        const item=`${c.state||"Watch"} · ${score(c)===null?"model —":`25% model ${score(c).toFixed(0)}`} · ${num(c.vol)===null?"liquidity —":`5m liquidity ${num(c.vol).toFixed(2)}×`}`;
        return `<div class="stack-card">
          <div class="stack-card-top">
            <strong>${esc(c.symbol)}</strong>
            <span class="mini-badge">${esc(scanTime())}</span>
          </div>
          <p>${esc(item)}</p>
        </div>`;
      }).join("");
    }

    if(catalysts){
      catalysts.innerHTML=rows.map(c=>{
        const move=num(c.move);
        const liq=num(c.vol);

        const context=[
          c.state || "Watch",
          move===null ? null : `${pct(move)} session move`,
          liq===null ? null : `${liq.toFixed(2)}× 5m liquidity`
        ].filter(Boolean).join(" · ");

        return `<div class="stack-card">
          <div class="stack-card-top">
            <strong>${esc(c.symbol)}</strong>
            <span class="mini-badge">CONTEXT</span>
          </div>
          <p>${esc(context)}</p>
        </div>`;
      }).join("");
    }
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
    if(!(tier==="PRO"||tier==="PREMIUM"||tier==="PREMIER")) return;
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


  function renderMinuteIntelligence(){
    if(tier!=="PREMIER") return;
    const live=document.getElementById("minuteLiveGrid");
    const historical=document.getElementById("minuteHistoricalGrid");
    const status=document.getElementById("minuteFeedStatus");
    const minute=payload()?.oneMinute || payload()?.one_minute || null;

    const plannedLive = [
      ["1m price movement","Minute-by-minute price change and progress"],
      ["1m liquidity acceleration","Whether trading activity is accelerating or cooling"],
      ["VWAP / high retention","Whether price is holding important intraday structure"],
      ["Re-acceleration","A renewed burst after a pause or pullback"],
      ["Giveback / exhaustion","Loss of price progress despite continuing activity"],
      ["Momentum state","Strengthening, holding, cooling, or fading"]
    ];

    const plannedHistorical = [
      ["First 1m ignition","First archived minute where the setup visibly accelerated"],
      ["VWAP holds / losses","Key structural holds and failures through the path"],
      ["Breakout attempts","Archived attempts to extend through resistance or highs"],
      ["Re-acceleration points","Later renewed activity after consolidation"],
      ["MFE / MAE context","Forward favorable/adverse movement around key 1m states"],
      ["5m ↔ 1m comparison","What the 5-minute scanner saw versus the minute-level path"]
    ];

    if(status){
      status.innerHTML = minute
        ? `<span class="live-dot"></span> 1-minute customer-safe feed detected`
        : `<span class="minute-wait-dot"></span> 1-minute feed not connected yet`;
    }

    function renderList(el, items, kind){
      if(!el) return;
      if(minute && Array.isArray(minute[kind]) && minute[kind].length){
        el.innerHTML=minute[kind].map(item=>`
          <article class="minute-card">
            <span>${esc(item.label || item.name || "1-minute metric")}</span>
            <strong>${esc(item.value ?? "—")}</strong>
            <small>${esc(item.note || item.detail || "")}</small>
          </article>`).join("");
      } else {
        el.innerHTML=items.map(([title,note])=>`
          <article class="minute-card minute-card-pending">
            <span>${esc(title)}</span>
            <strong>Pending feed</strong>
            <small>${esc(note)}</small>
          </article>`).join("");
      }
    }

    renderList(live,plannedLive,"live");
    renderList(historical,plannedHistorical,"historical");
  }


  function titleForSection(section){
    const names={
      overview:["Trendward · Research Cockpit","Market Intelligence Dashboard"],
      scanner:["Trendward","Scanner"],
      watchlist:["Trendward","Watchlist"],
      signals:["Trendward","Signals"],
      journey:["Trendward","Model Journey"],
      pulse:["Trendward","Market Pulse"],
      minute:["Trendward","1-Minute Intelligence"],
      settings:["Trendward","Settings"]
    };
    return names[section] || names.overview;
  }

  function applyPageTitle(section){
    const [brand,page]=titleForSection(section);
    const topbar=document.querySelector(".topbar");
    if(!topbar)return;
    const eyebrow=topbar.querySelector(".eyebrow");
    const h1=topbar.querySelector("h1");
    if(eyebrow) eyebrow.textContent=brand;
    if(h1) h1.textContent=page;
  }

  function currentSectionFromHash(){
    const raw=(location.hash||"#overview").replace("#","");
    return ["overview","scanner","watchlist","signals","journey","pulse","minute","settings"].includes(raw)
      ? raw : "overview";
  }

  function bindPageTitles(){
    applyPageTitle(currentSectionFromHash());
    if(window.__trendwardTitleBound)return;
    window.__trendwardTitleBound=true;
    window.addEventListener("hashchange",()=>applyPageTitle(currentSectionFromHash()));
    document.querySelectorAll("[data-section],[data-section-link]").forEach(el=>{
      el.addEventListener("click",()=>{
        const s=el.dataset.section || el.dataset.sectionLink;
        if(s) setTimeout(()=>applyPageTitle(s),0);
      });
    });
  }

  function momentumLabel(c){
    const v=num(c.price_vs_vwap_pct), h=num(c.distance_from_high_pct), l5=num(c.vol), l15=num(c.volume_accel_15m);
    let score=0;
    if(v!==null) score += v>3?2:v>=0?1:-1;
    if(h!==null) score += h>-10?2:h>-25?1:-1;
    if(l5!==null) score += l5>=1.5?2:l5>=1?1:l5<0.7?-1:0;
    if(l15!==null) score += l15>=1.5?1:l15<0.7?-1:0;
    if(score>=5)return "Strengthening";
    if(score>=2)return "Holding";
    if(score>=0)return "Mixed";
    return "Cooling";
  }

  function plainWhy(c){
    const bits=[];
    const v=num(c.price_vs_vwap_pct), h=num(c.distance_from_high_pct), l5=num(c.vol), l15=num(c.volume_accel_15m), m=score(c);
    if(v!==null) bits.push(v>=0?`${Math.abs(v).toFixed(1)}% above VWAP`:`${Math.abs(v).toFixed(1)}% below VWAP`);
    if(h!==null) bits.push(`${Math.abs(h).toFixed(1)}% below the session high`);
    if(l5!==null) bits.push(`5m liquidity ${l5.toFixed(2)}×`);
    if(l15!==null) bits.push(`15m liquidity ${l15.toFixed(2)}×`);
    if(m!==null) bits.push(`25% model ${m.toFixed(0)}/100`);
    return bits.join(" · ");
  }

  function renderWatchlistDepth(){
    const section=document.getElementById("section-watchlist");
    if(!section)return;
    let panel=document.getElementById("watchlistInsightPanel");
    if(!panel){
      panel=document.createElement("article");
      panel.id="watchlistInsightPanel";
      panel.className="panel watch-insight-panel";
      section.appendChild(panel);
    }

    const selected=new Set(watchedSymbols());
    const rows=visibleRows().filter(c=>selected.has(c.symbol));

    if(!rows.length){
      panel.innerHTML=`<div class="panel-label">WATCH CONTEXT</div><h3>Current watch intelligence</h3><p class="settings-copy">Select a current Scanner setup to see deeper watch context here.</p>`;
      return;
    }

    panel.innerHTML=`<div class="panel-header"><div><div class="panel-label">WATCH CONTEXT</div><h3>Why these setups are still worth watching</h3></div><span class="mini-badge">${rows.length} CURRENT</span></div>
      <div class="watch-intel-grid">
        ${rows.map(c=>`
          <article class="watch-intel-card">
            <div class="watch-intel-top"><strong>${esc(c.symbol)}</strong><span class="momentum-state ${momentumLabel(c).toLowerCase()}">${momentumLabel(c)}</span></div>
            <div class="watch-intel-price">${money(c.price)} <span>${pct(c.move)}</span></div>
            <div class="watch-intel-metrics">
              <div><span>State</span><strong>${esc(c.state||"Watch")}</strong></div>
              <div><span>Vs VWAP</span><strong>${pct(c.price_vs_vwap_pct)}</strong></div>
              <div><span>From high</span><strong>${pct(c.distance_from_high_pct)}</strong></div>
              <div><span>5m liq</span><strong>${num(c.vol)===null?"—":num(c.vol).toFixed(2)+"×"}</strong></div>
              <div><span>15m liq</span><strong>${num(c.volume_accel_15m)===null?"—":num(c.volume_accel_15m).toFixed(2)+"×"}</strong></div>
              <div><span>25% model</span><strong>${score(c)===null?"—":score(c).toFixed(0)+"/100"}</strong></div>
            </div>
            <p>${esc(plainWhy(c))}</p>
          </article>`).join("")}
      </div>`;
  }

  function renderSignalDepth(){
    const section=document.getElementById("section-signals");
    if(!section)return;
    let panel=document.getElementById("signalEvidencePanel");
    if(!panel){
      panel=document.createElement("article");
      panel.id="signalEvidencePanel";
      panel.className="panel signal-evidence-panel";
      section.appendChild(panel);
    }

    const rows=visibleRows();
    const events=[];
    rows.forEach(c=>{
      const t=scanTime();
      events.push({symbol:c.symbol,type:"State",value:c.state||"Watch",note:`Current scanner state at ${t}`});
      if(num(c.vol)!==null) events.push({symbol:c.symbol,type:"Liquidity",value:`${num(c.vol).toFixed(2)}×`,note:num(c.vol)>=1?"5m activity is at/above baseline":"5m activity is below baseline"});
      if(num(c.price_vs_vwap_pct)!==null) events.push({symbol:c.symbol,type:"Structure",value:pct(c.price_vs_vwap_pct),note:num(c.price_vs_vwap_pct)>=0?"Price is above VWAP":"Price is below VWAP"});
      if(c.first_promotion_utc){
        const d=new Date(c.first_promotion_utc);
        events.push({symbol:c.symbol,type:"Promotion",value:Number.isNaN(d.getTime())?"Archived":d.toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}),note:"First archived 5-minute model promotion"});
      }
    });

    panel.innerHTML=`<div class="panel-header"><div><div class="panel-label">EVIDENCE STREAM</div><h3>What the scanner is saying now</h3></div><span class="mini-badge">CURRENT SNAPSHOT</span></div>
      <p class="signal-disclaimer">These are current evidence reads from the captured scanner snapshot. Historical change events appear only when the API has an actual timestamp, such as first promotion.</p>
      <div class="signal-evidence-grid">
        ${events.map(e=>`
          <div class="signal-evidence-row">
            <strong>${esc(e.symbol)}</strong>
            <span class="signal-type">${esc(e.type)}</span>
            <b>${esc(e.value)}</b>
            <small>${esc(e.note)}</small>
          </div>`).join("")}
      </div>`;
  }

  function renderJourneyDepth(){
    const section=document.getElementById("section-journey");
    if(!section)return;

    let panel=document.getElementById("journeyTruthPanel");

    if(!panel){
      panel=document.createElement("article");
      panel.id="journeyTruthPanel";
      panel.className="panel journey-truth-panel";
      section.appendChild(panel);
    }

    const rows=visibleRows();

    if(!rows.length){
      panel.innerHTML=
        '<div class="panel-label">MODEL JOURNEY</div>' +
        '<h3>Waiting for current setups</h3>';
      return;
    }

    panel.innerHTML=`
      <div class="panel-header">
        <div>
          <div class="panel-label">VERIFIED MODEL JOURNEYS</div>
          <h3>${rows.length} setup${rows.length===1?"":"s"} in this tier</h3>
        </div>
        <span class="mini-badge">${rows.length} SETUP${rows.length===1?"":"S"}</span>
      </div>

      <div class="tier-journey-list">
        ${rows.map(c=>{

          const promotion=
            c.first_promotion_utc
              ? new Date(c.first_promotion_utc)
              : null;

          const promotionText=
            promotion && !Number.isNaN(promotion.getTime())
              ? promotion.toLocaleString([],{
                  month:"short",
                  day:"numeric",
                  hour:"numeric",
                  minute:"2-digit"
                })
              : "No archived promotion time";

          const outcome=c.outcome||null;

          return `
            <article class="tier-journey-card">

              <div class="panel-header">
                <div>
                  <div class="panel-label">MODEL JOURNEY</div>
                  <h3>${esc(c.symbol)} progression</h3>
                </div>

                <span class="state-badge">
                  ${esc(c.state||"Watch")}
                </span>
              </div>

              <div class="journey-timeline-v19">

                <div class="journey-v19-node complete">
                  <span>1</span>
                  <div>
                    <strong>Scanner appearance</strong>
                    <small>
                      Rank #${esc(c.rank)} &middot; ${money(c.price)}
                    </small>
                  </div>
                </div>

                <i></i>

                <div class="journey-v19-node ${c.first_promotion_utc?"complete":"pending"}">
                  <span>2</span>
                  <div>
                    <strong>First archived promotion</strong>
                    <small>${esc(promotionText)}</small>
                  </div>
                </div>

                <i></i>

                <div class="journey-v19-node ${c.finalist?"complete":"pending"}">
                  <span>3</span>
                  <div>
                    <strong>Finalist context</strong>
                    <small>
                      ${c.finalist
                        ?"Captured as a finalist"
                        :"Not a finalist in this snapshot"}
                    </small>
                  </div>
                </div>

                <i></i>

                <div class="journey-v19-node ${outcome?"complete":"pending"}">
                  <span>4</span>
                  <div>
                    <strong>Resolved outcome</strong>
                    <small>
                      ${outcome
                        ?"15 / 30 / 60-minute outcome available"
                        :"Waiting for resolved outcome"}
                    </small>
                  </div>
                </div>

              </div>

              <div class="journey-model-state-grid">

                <div>
                  <span>10% model</span>
                  <strong>
                    ${num(c.model_scores?.score10)===null
                      ?"--"
                      :num(c.model_scores.score10).toFixed(1)+"/100"}
                  </strong>
                </div>

                <div>
                  <span>25% model</span>
                  <strong>
                    ${num(c.model_scores?.score25)===null
                      ?"--"
                      :num(c.model_scores.score25).toFixed(1)+"/100"}
                  </strong>
                </div>

                <div>
                  <span>50% model</span>
                  <strong>
                    ${num(c.model_scores?.score50)===null
                      ?"--"
                      :num(c.model_scores.score50).toFixed(1)+"/100"}
                  </strong>
                </div>

                <div>
                  <span>5m liquidity</span>
                  <strong>
                    ${num(c.vol)===null
                      ?"--"
                      :num(c.vol).toFixed(2)+"x"}
                  </strong>
                </div>

                <div>
                  <span>Vs VWAP</span>
                  <strong>${pct(c.price_vs_vwap_pct)}</strong>
                </div>

                <div>
                  <span>From high</span>
                  <strong>${pct(c.distance_from_high_pct)}</strong>
                </div>

              </div>

            </article>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderPulseDepth(){
    const section=document.getElementById("section-pulse");
    if(!section)return;
    let panel=document.getElementById("marketPulseDepth");
    if(!panel){
      panel=document.createElement("div");
      panel.id="marketPulseDepth";
      panel.className="pulse-depth-wrap";
      section.appendChild(panel);
    }

    const rows=visibleRows();
    if(!rows.length){
      panel.innerHTML=`<article class="panel"><div class="panel-label">ENVIRONMENT</div><h3>Waiting for scanner universe data</h3></article>`;
      return;
    }

    const count=rows.length;
    const aboveVwap=rows.filter(c=>num(c.price_vs_vwap_pct)!==null && num(c.price_vs_vwap_pct)>=0).length;
    const nearHigh=rows.filter(c=>num(c.distance_from_high_pct)!==null && num(c.distance_from_high_pct)>=-10).length;
    const promoted=rows.filter(c=>String(c.state||"").toUpperCase()==="PROMOTED").length;
    const finalists=rows.filter(c=>c.finalist).length;
    const liqExpand=rows.filter(c=>num(c.vol)!==null && num(c.vol)>=1).length;
    const modelVals=rows.map(score).filter(v=>v!==null).sort((a,b)=>a-b);
    const medianModel=modelVals.length ? modelVals[Math.floor(modelVals.length/2)] : null;
    const liqVals=rows.map(c=>num(c.vol)).filter(v=>v!==null).sort((a,b)=>a-b);
    const medianLiq=liqVals.length ? liqVals[Math.floor(liqVals.length/2)] : null;

    let state="Quiet";
    const energy=(aboveVwap/count)+(nearHigh/count)+(liqExpand/count)+(finalists/Math.max(1,count));
    if(energy>=2.4) state="Explosive";
    else if(energy>=1.8) state="Active";
    else if(energy>=1.25) state="Building";
    else if(energy>=0.8) state="Mixed";

    const summary=`${aboveVwap} of ${count} setups are at/above VWAP, ${liqExpand} have 5-minute liquidity at or above baseline, ${nearHigh} are within 10% of their session highs, and ${finalists} are finalists.`;

    panel.innerHTML=`<article class="panel pulse-environment">
        <div class="panel-header"><div><div class="panel-label">SCANNER ENVIRONMENT</div><h3>${esc(state)}</h3></div><span class="market-state-badge">${esc(state)}</span></div>
        <p>${esc(summary)}</p>
        <div class="pulse-stat-grid">
          <div><span>Visible universe</span><strong>${count}</strong></div>
          <div><span>Above VWAP</span><strong>${aboveVwap}/${count}</strong></div>
          <div><span>Near session high</span><strong>${nearHigh}/${count}</strong></div>
          <div><span>5m liquidity ≥ 1×</span><strong>${liqExpand}/${count}</strong></div>
          <div><span>Promoted</span><strong>${promoted}</strong></div>
          <div><span>Finalists</span><strong>${finalists}</strong></div>
          <div><span>Median 25% model</span><strong>${medianModel===null?"—":medianModel.toFixed(0)+"/100"}</strong></div>
          <div><span>Median 5m liquidity</span><strong>${medianLiq===null?"—":medianLiq.toFixed(2)+"×"}</strong></div>
        </div>
      </article>
      <article class="panel pulse-buckets">
        <div class="panel-label">WHERE THE STRENGTH IS</div>
        <h3>Price-band distribution</h3>
        <div class="pulse-band-grid">
          ${[
            ["Under $2",rows.filter(c=>num(c.price)!==null&&num(c.price)<2).length],
            ["$2–$5",rows.filter(c=>num(c.price)!==null&&num(c.price)>=2&&num(c.price)<5).length],
            ["$5–$20",rows.filter(c=>num(c.price)!==null&&num(c.price)>=5&&num(c.price)<=20).length]
          ].map(([label,n])=>`<div><span>${label}</span><strong>${n}</strong><i style="width:${Math.max(4,n/count*100)}%"></i></div>`).join("")}
        </div>
      </article>`;
  }


  function renderSetupCountBadges(){

    const count=visibleRows().length;

    const sections=[
      "scanner",
      "watchlist",
      "signals",
      "journey",
      "pulse"
    ];

    sections.forEach(name=>{

      const heading=
        document.querySelector(
          `#section-${name} .section-heading`
        );

      if(!heading)return;

      let badge=
        heading.querySelector(
          ".tier-setup-count"
        );

      if(!badge){

        badge=document.createElement("span");
        badge.className=
          "mini-badge tier-setup-count";

        heading.appendChild(badge);
      }

      badge.textContent=
        `${count} SETUP${count===1?"":"S"}`;

    });
  }
  function renderEverything(){
    renderSetupCountBadges();
    renderUpgradeMenu();
    renderCandidateTable();
    renderScanner();
    setupPriceFilters();
    renderWatchlist();
    renderSignals();
    renderOverviewCards();
    renderHelp();
    renderFreeCopy();
    renderMinuteIntelligence();
    bindPageTitles();
    renderWatchlistDepth();
    renderSignalDepth();
    renderJourneyDepth();
    renderPulseDepth();

    const badge=document.getElementById("topPlanBadge"); if(badge) badge.textContent=tier;
    const side=document.getElementById("sidebarTier"); if(side) side.textContent=tier;
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",renderEverything,{once:true});
  else renderEverything();
  window.addEventListener("trendward:data",renderEverything);

  /* ===== TRENDWARD_DATA_RERENDER_V29 ===== */
  window.addEventListener("trendward:data", () => {
    renderEverything();
  });
  window.TRENDWARD_RENDER_ALL = renderEverything;

})();