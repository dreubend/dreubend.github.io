// Trendward Review V2.14 - versioned asset to prevent stale JS

const page=document.body.dataset.page;
document.querySelectorAll('.main-nav a').forEach(a=>{if(a.dataset.nav===page)a.classList.add('active')});
const addonData={
 scanner:[['Structural Intelligence','Catalyst & Structure','Warrants, convertibles, shelf capacity, float-change history, issuance timeline, supply-risk scoring.'],['Advanced Historical Intelligence','Historical Outcomes & Analogs','Cohort breakdowns by phase, catalyst, float, RVOL and time-of-day; best matches; time-to-peak/failure; deeper MFE/MAE.'],['Advanced AI Intelligence','Why Trendward Cares / AI Model Intelligence','Cross-model agreement, confidence decomposition, what changed, what differs from analogs, scenario explanations.'],['Short-Side Intelligence','Risk / Invalidation','Short interest, borrow context and squeeze structure where licensed.'],['Power User Tools','Scanner workflow','Compound alerts, custom scanner conditions, saved layouts and custom ranking filters.']],
 watchlist:[['Structural Intelligence','Structure Summary','Detailed filing/supply history, warrants, convertibles and float changes.'],['Advanced Historical Intelligence','Historical Context','Deeper cohorts, best analogs and timing distributions.'],['Advanced AI Intelligence','Watchlist reasoning','What changed since adding the stock and why the setup strengthened or weakened.'],['Short-Side Intelligence','Risk context','Borrow/short pressure and squeeze structure where licensed.'],['Power User Tools','Alerts & watch workflow','Compound conditions, custom triggers, multi-watchlist logic and saved layouts.']],
 historical:[['Advanced Historical Intelligence','Historical Analog Summary','Outcome by phase, catalyst, float, RVOL, time-of-day, time-to-peak/failure and best-match analogs.'],['Structural Intelligence','Catalyst & Structure Context','Point-in-time shelf, ATM, warrants, convertibles and float/supply reconstruction.'],['Advanced AI Intelligence','AI interpretation','Confidence decomposition, what differs from analogs, scenario explanations and evidence sensitivity.'],['Historical Short-Side Intelligence','Historical risk context','Point-in-time short/borrow context where licensed and available.'],['Replay Research Tools','Research workflow','Custom cohorts, saved comparisons and advanced historical replay controls.']]
};
function openAddons(){const modal=document.getElementById('addonModal');const host=document.getElementById('addonGrid');if(!modal||!host)return;host.innerHTML=(addonData[page]||[]).map(x=>`<article class="addon-card"><span class="enhances">Enhances: ${x[1]}</span><h3>${x[0]}</h3><p>${x[2]}</p><button class="btn">Optional add-on</button></article>`).join('');modal.classList.add('open')}
document.querySelectorAll('[data-open-addons]').forEach(b=>b.addEventListener('click',openAddons));document.querySelectorAll('[data-close-modal]').forEach(b=>b.addEventListener('click',()=>b.closest('.modal-backdrop').classList.remove('open')));document.querySelectorAll('.modal-backdrop').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open')}));


// ============================================================
// V2.15 — shared accent color control
// ============================================================
const HUE_STORAGE_KEY = "trendward-hue";

function clampHue(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 178;
  return Math.max(0, Math.min(360, n));
}

function applyTrendwardHue(value) {
  const hue = clampHue(value);
  const root = document.documentElement;

  root.style.setProperty("--hue", hue);
  document.body?.setAttribute("data-accent-hue", String(Math.round(hue)));
  root.style.setProperty("--accent", `hsl(${hue} 90% 48%)`);
  root.style.setProperty("--accent-2", `hsl(${hue} 95% 62%)`);
  root.style.setProperty("--accent-3", `hsl(${hue} 78% 38%)`);
  root.style.setProperty("--accent-soft", `hsl(${hue} 90% 48% / .12)`);
  root.style.setProperty("--accent-glow", `hsl(${hue} 95% 55% / .24)`);

  localStorage.setItem(HUE_STORAGE_KEY, String(hue));

  document.querySelectorAll("[data-hue-value]").forEach(el => {
    el.textContent = `${Math.round(hue)}°`;
  });

  document.querySelectorAll('input[type="range"][data-accent-slider], #accentHue, #hueSlider').forEach(el => {
    if (String(el.value) !== String(hue)) el.value = hue;
  });
}

function initTrendwardHue() {
  const saved = localStorage.getItem(HUE_STORAGE_KEY);
  const initial = saved !== null ? saved : 178;
  applyTrendwardHue(initial);

  const sliders = document.querySelectorAll(
    'input[type="range"][data-accent-slider], #accentHue, #hueSlider'
  );

  sliders.forEach(slider => {
    slider.value = clampHue(initial);

    const onHueInput = (event) => {
      applyTrendwardHue(event.target.value);
    };

    slider.addEventListener("input", onHueInput);
    slider.addEventListener("change", onHueInput);
  });

  document.querySelectorAll("[data-reset-hue]").forEach(btn => {
    btn.addEventListener("click", () => applyTrendwardHue(178));
  });
}

document.addEventListener("DOMContentLoaded", initTrendwardHue);

