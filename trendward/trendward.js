const data={markets:[["Small-cap momentum","Constructive","+1.8%"],["Liquidity pulse","Elevated","+12%"],["Scanner breadth","31%","+4%"],["Risk state","Selective","—"]],kpis:[["Candidates scanned","184","Illustrative universe"],["Promoted setups","7","Passed early context"],["Strong model states","2","Higher-conviction preview"],["Avg. price","$4.82","Preview candidate set"]],candidates:[{rank:1,symbol:"NOVA",price:1.84,move:7.6,vol:5.8,model:82,state:"Ignition"},{rank:2,symbol:"LUMA",price:3.27,move:5.1,vol:4.2,model:76,state:"Developing"},{rank:3,symbol:"AXIS",price:.91,move:4.3,vol:6.7,model:71,state:"Liquidity"},{rank:4,symbol:"VERA",price:7.45,move:3.8,vol:3.9,model:67,state:"Confirming"},{rank:5,symbol:"MESA",price:12.18,move:2.7,vol:3.1,model:62,state:"Watch"},{rank:6,symbol:"ORBI",price:2.41,move:2.4,vol:2.9,model:59,state:"Watch"},{rank:7,symbol:"KITE",price:4.63,move:2.1,vol:2.7,model:57,state:"Developing"},{rank:8,symbol:"PICO",price:1.22,move:1.9,vol:3.5,model:55,state:"Liquidity"},{rank:9,symbol:"RUNE",price:6.84,move:1.7,vol:2.4,model:52,state:"Watch"},{rank:10,symbol:"ECHO",price:9.14,move:1.5,vol:2.1,model:49,state:"Early"},{rank:11,symbol:"TIDE",price:14.32,move:1.3,vol:1.9,model:46,state:"Early"}],watchlist:[["LUMA","Liquidity is rising while price remains near session highs."],["AXIS","Volume acceleration is strong; price confirmation is still early."],["VERA","Higher lows and VWAP retention are improving."]],signals:[["14:34","NOVA","Model state strengthened after price held above VWAP."],["14:29","LUMA","5-minute liquidity acceleration moved into elevated range."],["14:24","AXIS","Scanner promoted candidate for deeper context."]],catalysts:[["NOVA","Abnormal liquidity + constructive price retention"],["LUMA","Fast dollar-volume expansion"],["AXIS","Low-priced repricing with early confirmation"]]};function fmtPct(v){return`${v>=0?"+":""}${v.toFixed(1)}%`}function setTime(){const el=document.getElementById("localTime");if(el)el.textContent=new Intl.DateTimeFormat([],{hour:"numeric",minute:"2-digit"}).format(new Date())}setTime();setInterval(setTime,3e4);const root=document.documentElement,slider=document.getElementById("accentSlider"),savedHue=localStorage.getItem("trendward-hue");savedHue&&(slider.value=savedHue,root.style.setProperty("--hue",savedHue));document.getElementById("accentValue").textContent=`${slider.value}°`;slider.addEventListener("input",e=>{root.style.setProperty("--hue",e.target.value);document.getElementById("accentValue").textContent=`${e.target.value}°`;localStorage.setItem("trendward-hue",e.target.value);renderAllCharts()});function navTo(section){document.querySelectorAll(".section").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".nav-item").forEach(x=>x.classList.remove("active"));const target=document.getElementById(`section-${section}`);target&&target.classList.add("active");const nav=document.querySelector(`.nav-item[data-section="${section}"]`);nav&&nav.classList.add("active");document.getElementById("sidebar").classList.remove("open");window.scrollTo({top:0,behavior:"smooth"})}document.querySelectorAll("[data-section]").forEach(b=>b.addEventListener("click",()=>navTo(b.dataset.section)));document.querySelectorAll("[data-section-link]").forEach(b=>b.addEventListener("click",()=>navTo(b.dataset.sectionLink)));document.getElementById("marketStrip").innerHTML=data.markets.map(([name,val,chg])=>`<div class="market-chip"><div><strong>${name}</strong><small>Preview metric</small></div><div style="text-align:right"><strong>${val}</strong><small class="${chg.startsWith("-")?"down":"up"}">${chg}</small></div></div>`).join("");document.getElementById("kpiGrid").innerHTML=data.kpis.map(([label,val,sub])=>`<article class="kpi-card"><div class="kpi-label">${label}</div><div class="kpi-value">${val}</div><div class="kpi-sub">${sub}</div></article>`).join("");document.getElementById("candidateTable").innerHTML=data.candidates.map(c=>`<tr><td><div class="rank">${c.rank}</div></td><td><span class="symbol">${c.symbol}</span></td><td>$${c.price.toFixed(2)}</td><td class="up">${fmtPct(c.move)}</td><td>${c.vol.toFixed(1)}×</td><td>${c.model}</td><td><span class="state-badge">${c.state}</span></td></tr>`).join("");document.getElementById("watchlistCards").innerHTML=data.watchlist.map(([s,n])=>`<div class="stack-card"><div class="stack-card-top"><strong>${s}</strong><span class="mini-badge">WATCH</span></div><p>${n}</p></div>`).join("");document.getElementById("signalCards").innerHTML=data.signals.map(([t,s,n])=>`<div class="stack-card"><div class="stack-card-top"><strong>${s}</strong><span class="mini-badge">${t}</span></div><p>${n}</p></div>`).join("");document.getElementById("catalystCards").innerHTML=data.catalysts.map(([s,n])=>`<div class="stack-card"><div class="stack-card-top"><strong>${s}</strong><span class="mini-badge">CONTEXT</span></div><p>${n}</p></div>`).join("");function sparkSvg(values){const w=240,h=52,p=4,min=Math.min(...values),max=Math.max(...values),pts=values.map((v,i)=>{const x=p+i*(w-2*p)/(values.length-1),y=h-p-(v-min)/(max-min||1)*(h-2*p);return`${x},${y}`}).join(" ");return`<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Illustrative trend"><polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`}document.getElementById("scannerCards").innerHTML=data.candidates.map((c,i)=>`<article class="scanner-card"><div class="scanner-card-head"><div><span class="rank">${c.rank}</span></div><span class="state-badge">${c.state}</span></div><div class="price">${c.symbol} <span style="font-size:13px;color:var(--muted);font-weight:600">$${c.price.toFixed(2)}</span></div><div class="spark">${sparkSvg([10+i,13+i,12+i,16+i,18+i,17+i,22+i,25+i])}</div><div class="metric-grid"><div class="metric"><span>5m move</span><strong class="up">${fmtPct(c.move)}</strong></div><div class="metric"><span>Vol accel.</span><strong>${c.vol.toFixed(1)}×</strong></div><div class="metric"><span>Model state</span><strong>${c.model}/100</strong></div><div class="metric"><span>Price band</span><strong>${c.price<2?"Under $2":c.price<5?"$2–$5":"$5–$20"}</strong></div></div></article>`).join("");document.getElementById("watchlistFull").innerHTML=data.watchlist.map(([s,n],i)=>`<div class="large-row"><strong>${s}</strong><span>${["Early","Developing","Confirming"][i]}</span><span>${[58,63,68][i]}/100</span><span class="row-note" style="color:var(--muted)">${n}</span></div>`).join("");document.getElementById("signalsFull").innerHTML=data.signals.concat([["14:19","VERA","Price retained VWAP while 15-minute return improved."],["14:14","MESA","Candidate remained on watch; no stronger confirmation yet."]]).map(([t,s,n],i,arr)=>`<div class="timeline-item"><div class="timeline-time">${t}</div><div class="timeline-dot-col"><div class="timeline-dot"></div>${i<arr.length-1?'<div class="timeline-line"></div>':''}</div><div class="timeline-content"><strong>${s}</strong><p>${n}</p></div></div>`).join("");function lineChart(elId,series,labels,opts={}){const el=document.getElementById(elId);if(!el)return;const w=640,h=260,pL=45,pR=18,pT=18,pB=35,vals=series.flatMap(s=>s.values);let min=opts.min??Math.min(...vals),max=opts.max??Math.max(...vals);min===max&&(min-=1,max+=1);const x=i=>pL+i*(w-pL-pR)/(labels.length-1),y=v=>pT+(max-v)/(max-min)*(h-pT-pB),grid=[0,.25,.5,.75,1].map(q=>{const yy=pT+q*(h-pT-pB),v=max-q*(max-min);return`<line x1="${pL}" y1="${yy}" x2="${w-pR}" y2="${yy}" stroke="rgba(255,255,255,.07)"/><text x="4" y="${yy+4}" fill="#71879a" font-size="10">${opts.suffix?`${v.toFixed(0)}${opts.suffix}`:v.toFixed(0)}</text>`}).join(""),colors=["var(--accent)","var(--accent-2)","var(--green)","var(--orange)"],paths=series.map((s,si)=>{const d=s.values.map((v,i)=>`${i?"L":"M"} ${x(i)} ${y(v)}`).join(" ");return`<path d="${d}" fill="none" stroke="${s.color||colors[si]}" stroke-width="${si===0?3:2}" stroke-linecap="round" stroke-linejoin="round"/>${s.values.map((v,i)=>`<circle cx="${x(i)}" cy="${y(v)}" r="3" fill="${s.color||colors[si]}"/>`).join("")}`}).join(""),xlabels=labels.map((l,i)=>`<text x="${x(i)}" y="${h-10}" fill="#71879a" font-size="10" text-anchor="middle">${l}</text>`).join(""),legend=series.map((s,i)=>`<span style="display:inline-flex;align-items:center;gap:6px;margin-right:12px;font-size:10px;color:#8fa1b3"><i style="width:8px;height:8px;border-radius:50%;background:${s.color||colors[i]};display:inline-block"></i>${s.name}</span>`).join("");el.innerHTML=`<div style="width:100%"><div style="margin:0 0 8px 45px">${legend}</div><svg viewBox="0 0 ${w} ${h}">${grid}${paths}${xlabels}</svg></div>`}function barChart(elId,items){const el=document.getElementById(elId);if(!el)return;const max=Math.max(...items.map(x=>x.value));el.innerHTML=`<div style="width:100%;display:grid;gap:12px">${items.map(x=>`<div><div style="display:flex;justify-content:space-between;font-size:10px;color:#8fa1b3;margin-bottom:6px"><span>${x.label}</span><strong style="color:#dce7ef">${x.value}%</strong></div><div style="height:9px;border-radius:999px;background:rgba(255,255,255,.05);overflow:hidden"><div style="height:100%;width:${x.value/max*100}%;border-radius:999px;background:linear-gradient(90deg,var(--accent),var(--accent-2))"></div></div></div>`).join("")}</div>`}function renderAllCharts(){barChart("probabilityChart",[{label:"10% move model",value:72},{label:"25% move model",value:48},{label:"50% move model",value:26}]);lineChart("journeyChart",[{name:"10% probability",values:[28,33,41,55,64,72]},{name:"25% probability",values:[12,16,21,30,39,48]}],["14:09","14:14","14:19","14:24","14:29","14:34"],{min:0,max:100,suffix:"%"});lineChart("outcomeChart",[{name:"MFE",values:[5.8,10.7,18.4],color:"var(--green)"},{name:"MAE",values:[-2.1,-3.8,-6.2],color:"var(--red)"}],["15m","30m","60m"],{min:-10,max:20,suffix:"%"});lineChart("breadthChart",[{name:"Liquidity expansion",values:[17,21,19,24,29,31]},{name:"Price confirming",values:[10,12,11,15,17,18]}],["10:00","11:00","12:00","13:00","14:00","15:00"],{min:0,max:40,suffix:"%"})}renderAllCharts();document.querySelectorAll(".chip").forEach(chip=>{chip.addEventListener("click",()=>{chip.parentElement.querySelectorAll(".chip").forEach(x=>x.classList.remove("active"));chip.classList.add("active")})});

// ===== Trendward v2 enhancements =====
const TIER_POLICY={FREE:{title:"Free",visible:1,prob:false,journey:false,outcomes:false,summary:"1 featured setup."},BASIC:{title:"Basic",visible:4,prob:true,journey:false,outcomes:false,summary:"Up to 4 scanner setups."},PRO:{title:"Pro",visible:8,prob:true,journey:true,outcomes:true,summary:"Up to 8 scanner setups."},PREMIUM:{title:"Premium",visible:11,prob:true,journey:true,outcomes:true,summary:"All available scanner setups."},PREMIER:{title:"Premier",visible:11,prob:true,journey:true,outcomes:true,summary:"All available scanner setups plus 1-minute intelligence."}};
let trendwardTier=String(window.TRENDWARD_FIXED_TIER||"FREE").toUpperCase();
function closeMenuV2(){document.getElementById("sidebar").classList.remove("open");document.getElementById("mobileBackdrop").classList.remove("show");document.body.classList.remove("menu-open")}
document.getElementById("mobileMenu").addEventListener("click",()=>{const open=document.getElementById("sidebar").classList.toggle("open");document.getElementById("mobileBackdrop").classList.toggle("show",open);document.body.classList.toggle("menu-open",open)});
document.getElementById("mobileBackdrop").addEventListener("click",closeMenuV2);document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeMenuV2();closeModalV2()}});document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",closeMenuV2));
function lockV2(id,on,msg){const el=document.getElementById(id);if(!el)return;el.classList.toggle("show",on);el.innerHTML=on?`<strong>Upgrade preview:</strong> ${msg}`:""}
function applyTier(){const p=TIER_POLICY[trendwardTier];const side=document.getElementById("sidebarTier"),badge=document.getElementById("topPlanBadge"),select=document.getElementById("planSelect"),summary=document.getElementById("planSummary");if(side)side.textContent=trendwardTier;if(badge)badge.textContent=trendwardTier;if(select)select.value=trendwardTier;if(summary)summary.innerHTML=`<strong style="color:var(--text)">${p.title}</strong><br>${p.summary}`;document.getElementById("candidateTable").innerHTML=data.candidates.slice(0,p.visible).map(c=>`<tr><td><div class="rank">${c.rank}</div></td><td><span class="symbol">${c.symbol}</span></td><td>$${c.price.toFixed(2)}</td><td class="up">${fmtPct(c.move)}</td><td>${c.vol.toFixed(1)}×</td><td>${c.model}</td><td><span class="state-badge">${c.state}</span></td></tr>`).join("");document.querySelectorAll("#scannerCards .scanner-card").forEach((card,i)=>card.style.display=i<p.visible?"block":"none");lockV2("candidateLock",p.visible<data.candidates.length,`${data.candidates.length-p.visible} more scanner setups are visible in higher tiers.`);lockV2("probabilityLock",!p.prob,"Probability detail begins with Basic.");lockV2("journeyLock",!p.journey,"The 5-minute Model Journey is available in Pro and Premium.");lockV2("outcomeLock",!p.outcomes,"Resolved 15m / 30m / 60m outcome context is available in Pro and Premium.");document.getElementById("probabilityChart").style.display=p.prob?"flex":"none";document.getElementById("journeyChart").style.display=p.journey?"flex":"none";document.getElementById("outcomeChart").style.display=p.outcomes?"flex":"none"}
const planSelect=document.getElementById("planSelect");if(planSelect)planSelect.value=trendwardTier;applyTier();
const mb=document.getElementById("modalBackdrop"),am=document.getElementById("authModal"),lm=document.getElementById("legalModal");let authMode="login";function openAuthV2(mode){authMode=mode;lm.hidden=true;am.hidden=false;mb.hidden=false;document.getElementById("authTitle").textContent=mode==="signup"?"Create preview account":"Log in";document.getElementById("authSubmit").textContent=mode==="signup"?"Create account":"Log in";document.getElementById("nameLabel").hidden=mode!=="signup"}window.openAuthV2=openAuthV2;function closeModalV2(){mb.hidden=true}document.getElementById("loginBtn").addEventListener("click",()=>openAuthV2("login"));document.getElementById("signupBtn").addEventListener("click",()=>openAuthV2("signup"));document.getElementById("settingsLoginBtn").addEventListener("click",()=>openAuthV2("login"));document.querySelectorAll("[data-close-modal]").forEach(b=>b.addEventListener("click",closeModalV2));mb.addEventListener("click",e=>{if(e.target===mb)closeModalV2()});// Legacy browser-only preview authentication removed.
// /trendward/auth.js now owns form submission and server authentication.
const legal={about:"<p>Trendward is a developing market-intelligence product from Reuben Decker LLC focused on lower-priced U.S.-listed equities, liquidity acceleration, price confirmation, and historical model context.</p>",terms:"<p><strong>Lawyer review pending.</strong> Final Terms of Service will be published after professional review.</p>",billing:"<p><strong>Planning draft.</strong> Final pricing, renewal, cancellation, taxes, and refund terms will be shown before purchase and finalized after legal review.</p>",privacy:"<p><strong>Privacy review pending.</strong> Production authentication, analytics, payment processing, and data-retention practices will be finalized before publication.</p>",risk:"<p>Securities trading can result in substantial losses. Trendward outputs do not guarantee future performance. Historical MFE/MAE is not customer P&amp;L.</p>"};document.querySelectorAll("[data-footer-modal]").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();am.hidden=true;lm.hidden=false;mb.hidden=false;document.getElementById("legalTitle").textContent=a.textContent;document.getElementById("legalBody").innerHTML=legal[a.dataset.footerModal]}));


// v5: real-link navigation support. This preserves browser behaviors such as
// right-click/open-in-new-tab, middle-click, copy link, and bookmarking.
(function(){
  const validSections = new Set(["overview","scanner","watchlist","signals","journey","pulse","settings"]);
  function sectionFromHash(){
    const section = (window.location.hash || "#overview").slice(1).toLowerCase();
    return validSections.has(section) ? section : "overview";
  }
  function openHashSection(){
    const section = sectionFromHash();
    if(typeof navTo === "function") navTo(section);
  }
  window.addEventListener("hashchange", openHashSection);
  if(window.location.hash) {
    if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", openHashSection, {once:true});
    else openHashSection();
  }
})();


// ===== Trendward v7 robust startup routing =====
(function(){
  const validSections = new Set([
    "overview","scanner","watchlist","signals","journey","pulse","settings"
  ]);

  function sectionFromLocation(){
    const raw = (window.location.hash || "").replace(/^#/, "").trim().toLowerCase();
    return validSections.has(raw) ? raw : "overview";
  }

  function showSectionFromUrl(options = {}){
    const section = sectionFromLocation();

    document.querySelectorAll(".section").forEach(el => {
      el.classList.toggle("active", el.id === `section-${section}`);
    });

    document.querySelectorAll(".nav-item").forEach(el => {
      el.classList.toggle("active", el.dataset.section === section);
      if (el.dataset.section === section) {
        el.setAttribute("aria-current", "page");
      } else {
        el.removeAttribute("aria-current");
      }
    });

    const sidebar = document.getElementById("sidebar");
    const backdrop = document.getElementById("mobileBackdrop");
    if (sidebar) sidebar.classList.remove("open");
    if (backdrop) backdrop.classList.remove("show");
    document.body.classList.remove("menu-open");

    if (options.scrollTop !== false) {
      window.scrollTo({top:0, left:0, behavior:"auto"});
    }
  }

  // Normal left-click keeps the SPA feel, but because these are real <a>
  // elements, browser-native right-click / middle-click / copy-link still work.
  document.addEventListener("click", function(e){
    const link = e.target.closest('a[data-section], a[data-section-link]');
    if (!link) return;

    // Preserve browser-native alternate navigation.
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (link.target && link.target !== "_self") return;

    let url;
    try { url = new URL(link.href, window.location.href); } catch { return; }

    if (url.origin !== window.location.origin || url.pathname !== window.location.pathname) {
      return;
    }

    const requested = (url.hash || "").replace(/^#/, "").toLowerCase();
    if (!validSections.has(requested)) return;

    e.preventDefault();

    if (window.location.hash !== `#${requested}`) {
      history.pushState(null, "", `#${requested}`);
    }
    showSectionFromUrl();
  });

  window.addEventListener("hashchange", () => showSectionFromUrl());
  window.addEventListener("popstate", () => showSectionFromUrl());

  // Run after DOM parsing, then once more after load to beat any older
  // initialization code that might re-activate Overview.
  function initialRoute(){
    requestAnimationFrame(() => showSectionFromUrl({scrollTop:false}));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialRoute, {once:true});
  } else {
    initialRoute();
  }

  window.addEventListener("load", () => {
    requestAnimationFrame(() => showSectionFromUrl({scrollTop:false}));
  }, {once:true});
})();



// ===== Trendward v8 resilient mobile-menu controls =====
(function(){
  const button = document.getElementById("mobileMenu");
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("mobileBackdrop");
  if (!button || !sidebar || !backdrop) return;

  function isOpen(){
    return sidebar.classList.contains("open");
  }

  function setOpen(open){
    sidebar.classList.toggle("open", open);
    backdrop.classList.toggle("show", open);
    document.body.classList.toggle("menu-open", open);
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  // Capture-phase handler makes the control reliable even if older
  // dashboard handlers are also present.
  button.addEventListener("click", function(e){
    e.preventDefault();
    e.stopImmediatePropagation();
    setOpen(!isOpen());
  }, true);

  button.addEventListener("pointerup", function(e){
    e.stopPropagation();
  });

  backdrop.addEventListener("click", function(e){
    e.preventDefault();
    setOpen(false);
  }, true);

  window.addEventListener("resize", function(){
    if (window.innerWidth > 900) setOpen(false);
  });

  button.setAttribute("aria-expanded", "false");
})();


// ===== Trendward v9 viewport-safe menu guard =====
(function(){
  const btn = document.getElementById("mobileMenu");
  if (!btn) return;

  function keepButtonUsable(){
    if (window.innerWidth <= 700){
      btn.style.pointerEvents = "auto";
      btn.style.visibility = "visible";
      btn.style.opacity = "1";
    } else {
      btn.style.removeProperty("visibility");
      btn.style.removeProperty("opacity");
    }
  }

  keepButtonUsable();
  window.addEventListener("resize", keepButtonUsable, {passive:true});
  window.addEventListener("orientationchange", keepButtonUsable, {passive:true});
})();


// ===== Trendward v12 refresh-safe route authority =====
(function(){
  const valid=new Set(["overview","scanner","watchlist","signals","journey","pulse","settings"]);
  function applyRoute(){
    const raw=(location.hash||"#overview").slice(1).trim().toLowerCase();
    const section=valid.has(raw)?raw:"overview";
    document.querySelectorAll(".section").forEach(el=>el.classList.toggle("active",el.id===`section-${section}`));
    document.querySelectorAll(".nav-item").forEach(el=>{
      const active=el.dataset.section===section;
      el.classList.toggle("active",active);
      if(active) el.setAttribute("aria-current","page"); else el.removeAttribute("aria-current");
    });
  }
  applyRoute();
  queueMicrotask(applyRoute);
  requestAnimationFrame(applyRoute);
  window.addEventListener("load",applyRoute);
  window.addEventListener("hashchange",applyRoute);
  window.addEventListener("popstate",applyRoute);
  setTimeout(applyRoute,0);
})();
