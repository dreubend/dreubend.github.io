(() => {
  const LIMITS = {
    FREE:1,
    BASIC:4,
    PRO:8,
    PREMIUM:11,
    PREMIER:11
  };

  const tier = String(
    window.TRENDWARD_FIXED_TIER || "FREE"
  ).toUpperCase();

  const esc = value =>
    String(value ?? "")
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;");

  const num = value => {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };

  const pct = value => {
    const n = num(value);
    if(n === null) return "--";
    return `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
  };

  function payload(){
    return window.TRENDWARD_PUBLIC_PAYLOAD || null;
  }

  function rows(){
    const list = Array.isArray(payload()?.candidates)
      ? payload().candidates.slice()
      : [];

    list.sort((a,b) =>
      (num(a.rank) ?? 999) - (num(b.rank) ?? 999)
    );

    return list.slice(0, LIMITS[tier] || 1);
  }

  function score(c){
    return num(c?.model_scores?.score25) ?? num(c?.model);
  }

  function phase(c){
    const move = num(c.move) ?? 0;
    const liq = num(c.vol);
    const accel15 = num(c.volume_accel_15m);
    const vwap = num(c.price_vs_vwap_pct);
    const high = num(c.distance_from_high_pct);

    if(
      (vwap !== null && vwap <= -5) ||
      (high !== null && high <= -20)
    ){
      return "Rejected / Fading";
    }

    if(
      accel15 !== null &&
      accel15 >= 1.5 &&
      liq !== null &&
      liq >= 1
    ){
      return "Re-acceleration";
    }

    if(
      vwap !== null &&
      vwap >= 3 &&
      high !== null &&
      high >= -10 &&
      liq !== null &&
      liq >= 1
    ){
      return "Continuation";
    }

    if(
      move >= 40 &&
      high !== null &&
      high >= -12
    ){
      return "Extended";
    }

    if(
      liq !== null &&
      liq >= 1.5 &&
      move > 0
    ){
      return "Ignition";
    }

    if(
      liq !== null &&
      liq >= 1 &&
      move >= 0
    ){
      return "Early Setup";
    }

    if(
      (liq !== null && liq < .8) ||
      move < 0
    ){
      return "Cooling";
    }

    return "Developing";
  }

  function structure(c){
    const vwap = num(c.price_vs_vwap_pct);
    const high = num(c.distance_from_high_pct);

    if(vwap === null && high === null) return "Limited data";

    if(
      vwap !== null && vwap >= 0 &&
      high !== null && high >= -10
    ){
      return "Holding structure";
    }

    if(
      vwap !== null && vwap >= 0
    ){
      return "Above VWAP";
    }

    if(
      high !== null && high <= -20
    ){
      return "High rejection";
    }

    return "Mixed";
  }

  function scanDate(){
    const raw =
      payload()?.scannerScanTime ||
      payload()?.scannerCapturedAt ||
      payload()?.generatedAt;

    const d = raw ? new Date(raw) : new Date();

    return Number.isNaN(d.getTime())
      ? new Date()
      : d;
  }

  function environment(){
    const list = rows();
    const count = list.length || 1;

    const aboveVwap = list.filter(c =>
      num(c.price_vs_vwap_pct) !== null &&
      num(c.price_vs_vwap_pct) >= 0
    ).length;

    const nearHigh = list.filter(c =>
      num(c.distance_from_high_pct) !== null &&
      num(c.distance_from_high_pct) >= -10
    ).length;

    const liquid = list.filter(c =>
      num(c.vol) !== null &&
      num(c.vol) >= 1
    ).length;

    const finalists = list.filter(c => !!c.finalist).length;

    const modelValues =
      list.map(score)
        .filter(v => v !== null)
        .sort((a,b) => a-b);

    const medianModel = modelValues.length
      ? modelValues[Math.floor(modelValues.length / 2)]
      : null;

    const energy =
      aboveVwap / count +
      nearHigh / count +
      liquid / count +
      finalists / count;

    let state = "Quiet";

    if(energy >= 2.4) state = "Explosive";
    else if(energy >= 1.8) state = "Active";
    else if(energy >= 1.25) state = "Building";
    else if(energy >= .8) state = "Mixed";

    const rating = Math.round(
      (
        (aboveVwap / count) * .27 +
        (nearHigh / count) * .23 +
        (liquid / count) * .25 +
        (finalists / count) * .10 +
        ((medianModel ?? 0) / 100) * .15
      ) * 100
    );

    const explanations = {
      Explosive:
        "Several visible setups are showing liquidity, price confirmation, and strong positioning at the same time. Opportunity is broad, but fast moves can also become extended quickly.",

      Active:
        "Multiple setups are showing constructive liquidity and price behavior. Trendward is seeing enough confirmation to warrant closer attention across the scanner.",

      Building:
        "The scanner is beginning to strengthen. Some setups are improving, but confirmation is not yet broad across the visible universe.",

      Mixed:
        "The evidence is split. Some stocks are strengthening while others are losing liquidity, VWAP, or proximity to their highs.",

      Quiet:
        "The visible scanner is not showing broad confirmation yet. Liquidity and price structure remain selective, so fewer setups are demonstrating strong follow-through."
    };

    return {
      count,
      aboveVwap,
      nearHigh,
      liquid,
      finalists,
      medianModel,
      state,
      rating,
      explanation: explanations[state]
    };
  }

  function hideOldPages(){
    ["journey","pulse"].forEach(name => {
      const nav = document.querySelector(
        `.nav-item[data-section="${name}"]`
      );

      if(nav) nav.style.display = "none";

      const section = document.getElementById(
        `section-${name}`
      );

      if(section) section.style.display = "none";
    });
  }

  function updateOverviewHero(){
    const section =
      document.getElementById("section-overview");

    if(!section) return;

    const hero = section.querySelector(".hero-panel");

    if(hero){
      const eyebrow = hero.querySelector(".eyebrow");
      const title = hero.querySelector("h2");
      const lead = hero.querySelector(".lead");

      if(eyebrow) eyebrow.textContent = "WHAT TRENDWARD IS";

      if(title){
        title.textContent =
          "Market intelligence that explains what is developing, strengthening, or fading.";
      }

      if(lead){
        lead.textContent =
          "Trendward combines price behavior, liquidity, model context, structure, and archived scanner evidence so you can understand not only which stocks stand out, but why they stand out and where they appear to be in the setup lifecycle.";
      }
    }

    section
      .querySelectorAll(":scope > .kpi-grid, :scope > .content-grid")
      .forEach(el => el.remove());

    const env = environment();
    const scorePanel = section.querySelector(".score-panel");

    if(scorePanel){
      const number = scorePanel.querySelector(".score-number");
      const caption = scorePanel.querySelector(".score-caption");
      const meta = scorePanel.querySelector(".score-meta");

      if(number) number.textContent = env.rating;
      if(caption) caption.textContent = "Environment score";

      if(meta){
        meta.innerHTML = `
          <div>
            <span>Scanner state</span>
            <strong>${esc(env.state)}</strong>
          </div>
          <div>
            <span>Above VWAP</span>
            <strong>${env.aboveVwap}/${env.count}</strong>
          </div>
          <div>
            <span>Liquidity ≥ 1×</span>
            <strong>${env.liquid}/${env.count}</strong>
          </div>
        `;
      }

      let explanation =
        scorePanel.querySelector(".preview-state-explanation");

      if(!explanation){
        explanation = document.createElement("p");
        explanation.className =
          "preview-state-explanation";
        scorePanel.appendChild(explanation);
      }

      explanation.textContent = env.explanation;
    }
  }

  function overviewMarket(){
    const section =
      document.getElementById("section-overview");

    if(!section) return;

    let wrap =
      document.getElementById("overviewIntelligence");

    if(!wrap){
      wrap = document.createElement("div");
      wrap.id = "overviewIntelligence";
      wrap.className = "overview-intelligence-v40";
      section.appendChild(wrap);
    }

    const list = rows();
    const env = environment();

    const under2 = list.filter(c =>
      num(c.price) !== null && num(c.price) < 2
    ).length;

    const two5 = list.filter(c =>
      num(c.price) !== null &&
      num(c.price) >= 2 &&
      num(c.price) < 5
    ).length;

    const five20 = list.filter(c =>
      num(c.price) !== null &&
      num(c.price) >= 5 &&
      num(c.price) <= 20
    ).length;

    const bar = (label,value,total) => {
      const width = total
        ? Math.max(3, value / total * 100)
        : 0;

      return `
        <div class="overview-bar-row">
          <span>${esc(label)}</span>
          <div><i style="width:${width}%"></i></div>
          <strong>${value}/${total}</strong>
        </div>
      `;
    };

    wrap.innerHTML = `
      <div class="overview-market-grid">

        <article class="panel overview-environment">
          <div class="panel-label">SCANNER ENVIRONMENT</div>
          <h3>${esc(env.state)}</h3>
          <p>${esc(env.explanation)}</p>

          <div class="pulse-stat-grid">
            <div>
              <span>Visible universe</span>
              <strong>${env.count}</strong>
            </div>
            <div>
              <span>Above VWAP</span>
              <strong>${env.aboveVwap}/${env.count}</strong>
            </div>
            <div>
              <span>Near session high</span>
              <strong>${env.nearHigh}/${env.count}</strong>
            </div>
            <div>
              <span>5m liquidity ≥ 1×</span>
              <strong>${env.liquid}/${env.count}</strong>
            </div>
            <div>
              <span>Finalists</span>
              <strong>${env.finalists}</strong>
            </div>
            <div>
              <span>Median 25% model</span>
              <strong>${
                env.medianModel === null
                  ? "--"
                  : env.medianModel.toFixed(0) + "/100"
              }</strong>
            </div>
          </div>
        </article>

        <article class="panel">
          <div class="panel-label">UNIVERSE STATE</div>
          <h3>Where confirmation is showing</h3>

          <div class="overview-bars">
            ${bar("Above VWAP",env.aboveVwap,env.count)}
            ${bar("Near session high",env.nearHigh,env.count)}
            ${bar("Liquidity ≥ 1×",env.liquid,env.count)}
            ${bar("Finalists",env.finalists,env.count)}
          </div>
        </article>

      </div>

      <article class="panel overview-strength">
        <div class="panel-label">WHERE THE STRENGTH IS</div>
        <h3>Visible setups by price band</h3>

        <div class="overview-price-bands">
          <div>
            <span>Under $2</span>
            <strong>${under2}</strong>
          </div>
          <div>
            <span>$2-$5</span>
            <strong>${two5}</strong>
          </div>
          <div>
            <span>$5-$20</span>
            <strong>${five20}</strong>
          </div>
        </div>
      </article>

      <div id="overviewJourneyPanels"></div>
    `;

    moveJourneyPanels();
  }

  function moveJourneyPanels(){
    const target =
      document.getElementById("overviewJourneyPanels");

    if(!target) return;

    const journey =
      document.getElementById("section-journey");

    if(!journey) return;

    const progression =
      document.getElementById("journeyChart")
        ?.closest("article");

    const outcome =
      document.getElementById("outcomeChart")
        ?.closest("article");

    const milestones =
      journey.querySelector(
        ".journey-grid article:not(.span-2)"
      );

    const items = [
      progression,
      milestones,
      outcome
    ].filter(Boolean);

    if(!items.length) return;

    let grid =
      target.querySelector(".overview-journey-grid");

    if(!grid){
      grid = document.createElement("div");
      grid.className = "overview-journey-grid";
      target.appendChild(grid);
    }

    items.forEach(item => {
      if(item.parentElement !== grid){
        grid.appendChild(item);
      }
    });
  }

  function phaseReason(c){
    const p = phase(c);
    const move = num(c.move);
    const liq = num(c.vol);
    const accel15 = num(c.volume_accel_15m);
    const vwap = num(c.price_vs_vwap_pct);
    const high = num(c.distance_from_high_pct);

    if(p === "Rejected / Fading"){
      if(vwap !== null && vwap <= -5){
        return `Price is ${Math.abs(vwap).toFixed(1)}% below VWAP, showing meaningful loss of intraday structure.`;
      }

      if(high !== null && high <= -20){
        return `Price is ${Math.abs(high).toFixed(1)}% below its session high, showing significant giveback.`;
      }

      return "Price confirmation has weakened enough for Trendward to treat the setup as fading.";
    }

    if(p === "Re-acceleration"){
      return `Liquidity is accelerating again${accel15 !== null ? ` (${accel15.toFixed(2)}× over 15m)` : ""}, suggesting renewed participation after the initial move.`;
    }

    if(p === "Continuation"){
      return `Price is holding constructive structure${vwap !== null ? ` at ${pct(vwap)} vs VWAP` : ""}${high !== null ? ` and ${pct(high)} from the session high` : ""}.`;
    }

    if(p === "Extended"){
      return `The stock has already moved strongly${move !== null ? ` (${pct(move)} this session)` : ""}, so Trendward sees strength but also greater extension risk.`;
    }

    if(p === "Ignition"){
      return `Liquidity has expanded quickly${liq !== null ? ` to ${liq.toFixed(2)}×` : ""} while price is beginning to confirm.`;
    }

    if(p === "Early Setup"){
      return "Liquidity and price behavior are beginning to improve, but the move has not yet reached full confirmation.";
    }

    if(p === "Cooling"){
      return "Participation or price progress has weakened, so the setup currently has less momentum than stronger scanner candidates.";
    }

    return "The stock is showing some constructive evidence, but Trendward does not yet have enough confirmation to classify it more strongly.";
  }

  function evidenceItems(c){
    const items = [];

    if(c.state){
      items.push(["State", c.state]);
    }

    if(num(c.vol) !== null){
      items.push([
        "5m Liquidity",
        `${num(c.vol).toFixed(2)}×`
      ]);
    }

    if(num(c.volume_accel_15m) !== null){
      items.push([
        "15m Liquidity",
        `${num(c.volume_accel_15m).toFixed(2)}×`
      ]);
    }

    if(num(c.price_vs_vwap_pct) !== null){
      items.push([
        "Vs VWAP",
        pct(c.price_vs_vwap_pct)
      ]);
    }

    if(num(c.distance_from_high_pct) !== null){
      items.push([
        "From High",
        pct(c.distance_from_high_pct)
      ]);
    }

    if(num(c.spread_pct) !== null){
      items.push([
        "Spread",
        `${num(c.spread_pct).toFixed(2)}%`
      ]);
    }

    if(score(c) !== null){
      items.push([
        "25% Model",
        `${score(c).toFixed(0)}/100`
      ]);
    }

    if(num(c?.model_scores?.score10) !== null){
      items.push([
        "10% Model",
        `${num(c.model_scores.score10).toFixed(0)}/100`
      ]);
    }

    if(num(c?.model_scores?.score50) !== null){
      items.push([
        "50% Model",
        `${num(c.model_scores.score50).toFixed(0)}/100`
      ]);
    }

    if(num(c.move) !== null){
      items.push([
        "Session Move",
        pct(c.move)
      ]);
    }

    if(num(c.dollar_volume_5m) !== null){
      items.push([
        "5m $ Volume",
        `${Math.round(num(c.dollar_volume_5m)).toLocaleString()}`
      ]);
    }

    if(num(c.dollar_volume_15m) !== null){
      items.push([
        "15m $ Volume",
        `${Math.round(num(c.dollar_volume_15m)).toLocaleString()}`
      ]);
    }

    items.push([
      "Structure",
      structure(c)
    ]);

    if(c.first_promotion_utc){
      const d = new Date(c.first_promotion_utc);

      if(!Number.isNaN(d.getTime())){
        items.push([
          "First Promotion",
          d.toLocaleString([],{
            month:"short",
            day:"numeric",
            hour:"numeric",
            minute:"2-digit"
          })
        ]);
      }
    }

    return items;
  }

  function enhanceScanner(){
    const list = rows();

    const cards = [
      ...document.querySelectorAll(
        "#scannerCards .scanner-card"
      )
    ];

    cards.forEach((card,index) => {
      const c = list[index];
      if(!c) return;

      card
        .querySelectorAll(".scanner-intelligence-v40")
        .forEach(el => el.remove());

      const setupPhase = phase(c);
      const evidence = evidenceItems(c);

      const block = document.createElement("div");
      block.className = "scanner-intelligence-v40";

      block.innerHTML = `
        <div class="scanner-phase-block">

          <div class="scanner-phase-row">
            <span>SETUP PHASE</span>
            <strong class="scanner-phase-badge">
              ${esc(setupPhase)}
            </strong>
          </div>

          <p class="scanner-phase-reason">
            ${esc(phaseReason(c))}
          </p>

        </div>

        <div class="scanner-evidence-title">
          EVIDENCE STREAM
        </div>

        <div class="scanner-evidence-grid">

          ${evidence.map(([label,value]) => `
            <div>
              <span>${esc(label)}</span>
              <strong>${esc(value)}</strong>
            </div>
          `).join("")}

        </div>
      `;

      card.appendChild(block);
    });
  }
  function renderSignalTimeline(){
    const full =
      document.getElementById("signalsFull");

    if(!full) return;

    const list = rows();
    if(!list.length) return;

    const now = scanDate();

    const promotions =
      list
        .map(c =>
          c.first_promotion_utc
            ? new Date(c.first_promotion_utc)
            : null
        )
        .filter(d =>
          d && !Number.isNaN(d.getTime())
        );

    let start =
      promotions.length
        ? new Date(
            Math.min(...promotions.map(d => d.getTime()))
          )
        : new Date(now.getTime() - 60 * 60 * 1000);

    if(start >= now){
      start = new Date(now.getTime() - 60 * 60 * 1000);
    }

    const duration =
      Math.max(1, now.getTime() - start.getTime());

    const pos = d =>
      Math.max(
        0,
        Math.min(
          100,
          (d.getTime() - start.getTime()) /
          duration * 100
        )
      );

    full.className = "signal-history-v40";

    full.innerHTML = `
      <article class="panel signal-history-panel">

        <div class="signal-history-header">
          <div>
            <div class="panel-label">
              HISTORICAL SIGNAL TIMELINE
            </div>
            <h3>How the visible setups reached the current scan</h3>
          </div>

          <strong id="signalTimelineClock">
            ${esc(now.toLocaleString())}
          </strong>
        </div>

        <p class="signal-history-note">
          This timeline uses verified archived promotion timestamps
          and the latest available scanner snapshot. Missing intraday
          history is not invented.
        </p>

        <div class="signal-axis">
          <span>${esc(start.toLocaleTimeString([],{
            hour:"numeric",
            minute:"2-digit"
          }))}</span>
          <span>${esc(now.toLocaleTimeString([],{
            hour:"numeric",
            minute:"2-digit"
          }))}</span>
        </div>

        <div class="signal-matrix">
          <div class="signal-now-line" id="signalNowLine"></div>

          ${list.map(c => {
            const promo =
              c.first_promotion_utc
                ? new Date(c.first_promotion_utc)
                : null;

            const hasPromo =
              promo &&
              !Number.isNaN(promo.getTime());

            return `
              <div class="signal-stock-row">
                <div class="signal-symbol">
                  <strong>${esc(c.symbol)}</strong>
                  <small>#${esc(c.rank)} · ${esc(phase(c))}</small>
                </div>

                <div class="signal-track">
                  ${
                    hasPromo
                      ? `<i class="signal-event promotion"
                           style="left:${pos(promo)}%"
                           title="First archived promotion"></i>`
                      : ""
                  }

                  <i class="signal-event current"
                     style="left:100%"
                     title="Current scanner snapshot"></i>
                </div>
              </div>
            `;
          }).join("")}
        </div>

        <div class="signal-slider-wrap">
          <input
            id="signalTimelineSlider"
            type="range"
            min="0"
            max="100"
            value="100"
            step="1"
            aria-label="Signal timeline position"
          />

          <button
            type="button"
            class="ghost-btn"
            id="signalTimelineNow"
          >
            Now
          </button>
        </div>

        <div class="signal-legend">
          <span><i class="promotion"></i> Archived promotion</span>
          <span><i class="current"></i> Current scan</span>
        </div>

      </article>
    `;

    const slider =
      document.getElementById("signalTimelineSlider");

    const line =
      document.getElementById("signalNowLine");

    const clock =
      document.getElementById("signalTimelineClock");

    const update = () => {
      const value = Number(slider?.value || 100);

      if(line){
        line.style.left = `${value}%`;
      }

      const time =
        new Date(
          start.getTime() +
          duration * value / 100
        );

      if(clock){
        clock.textContent =
          value === 100
            ? `Now · ${now.toLocaleString()}`
            : time.toLocaleString();
      }
    };

    slider?.addEventListener("input",update);

    document
      .getElementById("signalTimelineNow")
      ?.addEventListener("click",() => {
        slider.value = "100";
        update();
      });

    update();
  }

  function render(){
    hideOldPages();
    updateOverviewHero();
    overviewMarket();
    enhanceScanner();
    renderSignalTimeline();
  }

  function scheduleRender(){
    setTimeout(render,0);
  }

  if(document.readyState === "loading"){
    document.addEventListener(
      "DOMContentLoaded",
      scheduleRender,
      {once:true}
    );
  } else {
    scheduleRender();
  }

  window.addEventListener(
    "trendward:data",
    scheduleRender
  );
  window.TRENDWARD_SETUP_PHASE = phase;
  window.TRENDWARD_PHASE_REASON = phaseReason;

})();