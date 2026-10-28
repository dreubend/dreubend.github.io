(() => {
  const API="https://dashboard.reubendecker.com/api/trendward";
  const state={user:null,desiredTier:"FREE"};

  async function api(path,opts={}){
    const res=await fetch(API+path,{credentials:"include",headers:{"Content-Type":"application/json",...(opts.headers||{})},...opts});
    let body=null; try{body=await res.json()}catch{}
    if(!res.ok) throw new Error(body?.detail||body?.message||`HTTP ${res.status}`);
    return body;
  }

  function label(t){return t.charAt(0)+t.slice(1).toLowerCase()}
  function update(){
    document.body.classList.toggle("authenticated",!!state.user);
    const login=document.getElementById("loginBtn"), signup=document.getElementById("signupBtn"), badge=document.getElementById("topPlanBadge");
    if(state.user){
      if(login) login.textContent=state.user.username||"Account";
      if(signup) signup.textContent="Log out";
      if(badge) badge.textContent=String(state.user.effective_tier||"FREE").toUpperCase();
    }else{
      if(login) login.textContent="Log in";
      if(signup) signup.textContent="Sign up";
    }
    document.querySelectorAll(".plan-upgrade-menu button[data-upgrade]").forEach(btn=>{
      const t=String(btn.dataset.upgrade||"").toUpperCase();
      const span=btn.querySelector("span");
      if(span) span.textContent=state.user?`Upgrade to ${label(t)}`:`Sign up for ${label(t)}`;
    });
  }

  function setMode(mode,tier=null){
    if(tier) state.desiredTier=tier;
    const modal=document.getElementById("authModal"); if(!modal)return;
    modal.dataset.authMode=mode;
    const title=modal.querySelector("#authTitle");
    if(title) title.textContent=mode==="signup"?"Create your Trendward account":"Log in to Trendward";
    const input=modal.querySelector('input[name="name"],input[name="username"]');
    if(input){input.name="username";input.placeholder="Username";}
    let chooser=modal.querySelector("#authPlanChoice");
    if(mode==="signup"){
      if(!chooser){
        chooser=document.createElement("div");
        chooser.id="authPlanChoice";chooser.className="auth-plan-choice";
        modal.querySelector("form")?.prepend(chooser);
      }
      chooser.innerHTML=["FREE","BASIC","PRO","PREMIUM","PREMIER"].map(t=>`<button type="button" data-auth-tier="${t}" class="${state.desiredTier===t?"active":""}">${label(t)}</button>`).join("");
      chooser.querySelectorAll("button").forEach(b=>b.onclick=()=>{state.desiredTier=b.dataset.authTier;chooser.querySelectorAll("button").forEach(x=>x.classList.toggle("active",x===b));});
    }else if(chooser) chooser.remove();

    let note=modal.querySelector("#securityRecoveryNote");
    if(!note){note=document.createElement("div");note.id="securityRecoveryNote";note.className="account-lock-note";modal.querySelector(".modal-card")?.appendChild(note);}
    note.textContent="Recovery uses verified email and one-time recovery codes. Security questions are not used as the primary recovery factor.";
  }

  async function me(){
    try{state.user=(await api("/auth/me",{method:"GET",headers:{}})).user}catch{state.user=null}
    update();
  }

  document.addEventListener("click",async e=>{
    const up=e.target.closest("[data-upgrade]");
    if(up){
      e.preventDefault();
      const target=String(up.dataset.upgrade||"").toUpperCase();
      if(!state.user){setMode("signup",target);document.getElementById("signupBtn")?.click();}
      else{try{alert((await api("/account/request-tier",{method:"POST",body:JSON.stringify({tier:target})})).message)}catch(err){alert(err.message)}}
    }
    if(e.target.closest("#loginBtn")&&!state.user) setMode("login");
    if(e.target.closest("#signupBtn")){
      if(state.user){
        e.preventDefault(); await api("/auth/logout",{method:"POST",body:"{}"}); state.user=null; update();
      }else setMode("signup","FREE");
    }
  });

  document.addEventListener("submit",async e=>{
    if(!e.target.closest("#authModal form"))return;
    e.preventDefault();
    const mode=document.getElementById("authModal")?.dataset.authMode||"login";
    const fd=new FormData(e.target);
    const p=Object.fromEntries(fd.entries());
    try{
      if(mode==="signup"){
        p.desired_tier=state.desiredTier;
        alert((await api("/auth/signup",{method:"POST",body:JSON.stringify(p)})).message);
      }else{
        const r=await api("/auth/login",{method:"POST",body:JSON.stringify(p)});
        state.user=r.user;update();document.getElementById("authModal").hidden=true;
      }
    }catch(err){alert(err.message)}
  });

  window.TRENDWARD_AUTH={api,state,me,setMode};
  me();
})();