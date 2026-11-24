
(() => {
  "use strict";

  const VALID_PAGES = new Set(["scanner","watchlist","historical","settings"]);
  const HUE_STORAGE_KEY = "trendward-hue";

  const addonData = {
    scanner:[
      ["Structural Intelligence","Catalyst & Structure","Warrants, convertibles, shelf capacity, float-change history, issuance timeline, supply-risk scoring."],
      ["Advanced Historical Intelligence","Historical Outcomes & Analogs","Cohort breakdowns by phase, catalyst, float, RVOL and time-of-day; best matches; time-to-peak/failure; deeper MFE/MAE."],
      ["Advanced AI Intelligence","AI Model Intelligence","Cross-model agreement, confidence decomposition, what changed, what differs from analogs, scenario explanations."],
      ["Short-Side Intelligence","Risk / Invalidation","Short interest, borrow context and squeeze structure where licensed."],
      ["Power User Tools","Scanner workflow","Compound alerts, custom scanner conditions, saved layouts and custom ranking filters."]
    ],
    watchlist:[
      ["Structural Intelligence","Structure Summary","Detailed filing/supply history, warrants, convertibles and float changes."],
      ["Advanced Historical Intelligence","Historical Context","Deeper cohorts, best analogs and timing distributions."],
      ["Advanced AI Intelligence","Watchlist reasoning","What changed since adding the stock and why the setup strengthened or weakened."],
      ["Short-Side Intelligence","Risk context","Borrow/short pressure and squeeze structure where licensed."],
      ["Power User Tools","Alerts & watch workflow","Compound conditions, custom triggers, multi-watchlist logic and saved layouts."]
    ],
    historical:[
      ["Advanced Historical Intelligence","Historical Analog Summary","Outcome by phase, catalyst, float, RVOL, time-of-day, time-to-peak/failure and best-match analogs."],
      ["Structural Intelligence","Catalyst & Structure Context","Point-in-time shelf, ATM, warrants, convertibles and float/supply reconstruction."],
      ["Advanced AI Intelligence","AI interpretation","Confidence decomposition, what differs from analogs, scenario explanations and evidence sensitivity."],
      ["Historical Short-Side Intelligence","Historical risk context","Point-in-time short/borrow context where licensed and available."],
      ["Replay Research Tools","Research workflow","Custom cohorts, saved comparisons and advanced historical replay controls."]
    ],
    settings:[
      ["Structural Intelligence","Scanner + Watchlist","Detailed structure and supply context."],
      ["Advanced Historical Intelligence","Historical Analysis","Deeper historical cohorts and analog research."],
      ["Advanced AI Intelligence","Model interpretation","Richer model reasoning and evidence decomposition."],
      ["Short-Side Intelligence","Risk context","Borrow and short-side context where licensed."],
      ["Power User Tools","Workflow","Advanced filters, alerts and saved research layouts."]
    ]
  };

  function currentPage(){
    const raw=(location.hash||"#scanner").slice(1).trim().toLowerCase();
    return VALID_PAGES.has(raw) ? raw : "scanner";
  }

  function showPage(page, push=false){
    const target=VALID_PAGES.has(page) ? page : "scanner";
    document.body.dataset.page=target;

    document.querySelectorAll(".production-page-section").forEach(section=>{
      section.classList.toggle("active", section.dataset.pageSection===target);
    });

    document.querySelectorAll(".main-nav a").forEach(a=>{
      a.classList.toggle("active", a.dataset.nav===target);
    });

    if(push && location.hash !== `#${target}`){
      history.pushState(null,"",`#${target}`);
    }

    document.title =
      target==="historical" ? "Trendward | AI Historical Analysis" :
      target==="watchlist" ? "Trendward | Watchlist" :
      target==="settings" ? "Trendward | Settings" :
      "Trendward | Scanner";

    window.scrollTo({top:0,behavior:"auto"});
  }

  function bindNavigation(){
    document.querySelectorAll(".main-nav a[data-nav]").forEach(a=>{
      a.addEventListener("click",e=>{
        e.preventDefault();
        showPage(a.dataset.nav,true);
      });
    });
    window.addEventListener("hashchange",()=>showPage(currentPage(),false));
    showPage(currentPage(),false);
  }

  function clampHue(value){
    const n=Number(value);
    if(!Number.isFinite(n)) return 178;
    return Math.max(0,Math.min(360,n));
  }

  function applyTrendwardHue(value){
    const hue=clampHue(value);
    const root=document.documentElement;
    root.style.setProperty("--hue",hue);
    document.body.setAttribute("data-accent-hue",String(Math.round(hue)));
    root.style.setProperty("--accent",`hsl(${hue} 90% 48%)`);
    root.style.setProperty("--accent-2",`hsl(${hue} 95% 62%)`);
    root.style.setProperty("--accent-3",`hsl(${hue} 78% 38%)`);
    root.style.setProperty("--accent-soft",`hsl(${hue} 90% 48% / .12)`);
    root.style.setProperty("--accent-glow",`hsl(${hue} 95% 55% / .24)`);
    localStorage.setItem(HUE_STORAGE_KEY,String(hue));
    document.querySelectorAll("[data-hue-value]").forEach(el=>{
      el.textContent=`${Math.round(hue)}°`;
    });
    document.querySelectorAll('input[type="range"][data-accent-slider],#accentHue,#hueSlider').forEach(el=>{
      el.value=hue;
    });
  }

  function bindHue(){
    const saved=localStorage.getItem(HUE_STORAGE_KEY);
    const initial=saved!==null ? saved : 178;
    applyTrendwardHue(initial);

    document.querySelectorAll('input[type="range"][data-accent-slider],#accentHue,#hueSlider').forEach(slider=>{
      slider.addEventListener("input",e=>applyTrendwardHue(e.target.value));
      slider.addEventListener("change",e=>applyTrendwardHue(e.target.value));
    });
    document.querySelectorAll("[data-reset-hue]").forEach(btn=>{
      btn.addEventListener("click",()=>applyTrendwardHue(178));
    });
  }

  function openAddons(){
    const page=currentPage();
    const modal=document.getElementById("addonModal");
    const host=document.getElementById("addonGrid");
    if(!modal||!host)return;
    host.innerHTML=(addonData[page]||[]).map(x=>`
      <article class="addon-card">
        <span class="enhances">Enhances: ${x[1]}</span>
        <h3>${x[0]}</h3>
        <p>${x[2]}</p>
        <button class="btn" type="button">Optional add-on</button>
      </article>`).join("");
    modal.classList.add("open");
  }

  function bindAddonModal(){
    document.querySelectorAll("[data-open-addons]").forEach(b=>b.addEventListener("click",openAddons));
    document.querySelectorAll("#addonModal [data-close-addon]").forEach(b=>b.addEventListener("click",()=>{
      document.getElementById("addonModal")?.classList.remove("open");
    }));
    document.getElementById("addonModal")?.addEventListener("click",e=>{
      if(e.target===e.currentTarget)e.currentTarget.classList.remove("open");
    });
  }

  const LEGAL = {
    about:`<p><strong>Trendward</strong> is a market-intelligence workspace from Reuben Decker LLC focused on lower-priced U.S.-listed equities, liquidity acceleration, price confirmation, catalyst and structure context, and historical model evidence.</p>`,
    glossary:`<p><strong>Discovery</strong> identifies unusual activity worth monitoring.</p><p><strong>Ignition</strong> describes accelerating liquidity with early price response.</p><p><strong>Confirmation</strong> means price structure is beginning to support the setup.</p><p><strong>MFE / MAE</strong> summarize historical favorable and adverse price excursion after a reference point; they are not realized customer P&amp;L.</p>`,
    terms:`<p><strong>Lawyer review pending.</strong> Final Terms of Service will be published after professional review.</p>`,
    billing:`<p><strong>Planning draft.</strong> Final pricing, renewal, cancellation, taxes, and refund terms will be shown before purchase and finalized after legal review.</p>`,
    privacy:`<p><strong>Privacy review pending.</strong> Production authentication, analytics, payment processing, and data-retention practices will be finalized before publication.</p>`,
    risk:`<p>Securities trading can result in substantial losses. Trendward outputs do not guarantee future performance. Historical MFE/MAE is not customer P&amp;L.</p>`
  };

  function closeAuthBackdrop(){
    const backdrop=document.getElementById("modalBackdrop");
    if(backdrop)backdrop.hidden=true;
  }

  function bindProductionModals(){
    document.querySelectorAll("[data-close-auth]").forEach(btn=>btn.addEventListener("click",closeAuthBackdrop));
    const backdrop=document.getElementById("modalBackdrop");
    backdrop?.addEventListener("click",e=>{
      if(e.target===backdrop)closeAuthBackdrop();
    });

    document.querySelectorAll("[data-footer-modal]").forEach(a=>{
      a.addEventListener("click",e=>{
        e.preventDefault();
        const legalModal=document.getElementById("legalModal");
        const authModal=document.getElementById("authModal");
        const backdrop=document.getElementById("modalBackdrop");
        if(!legalModal||!backdrop)return;
        if(authModal)authModal.hidden=true;
        legalModal.hidden=false;
        backdrop.hidden=false;
        const title=document.getElementById("legalTitle");
        const body=document.getElementById("legalBody");
        if(title)title.textContent=a.textContent.trim();
        if(body)body.innerHTML=LEGAL[a.dataset.footerModal]||"";
      });
    });
  }

  document.addEventListener("DOMContentLoaded",()=>{
    bindNavigation();
    bindHue();
    bindAddonModal();
    bindProductionModals();
  });
})();
