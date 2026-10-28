(() => {
  const API = "https://dashboard.reubendecker.com/api/trendward";

  const state = {
    user: null,
    mode: "login",
    desiredTier: "FREE"
  };

  async function api(path, options = {}) {
    const response = await fetch(API + path, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options
    });

    let body = null;

    try {
      body = await response.json();
    } catch (_) {}

    if (!response.ok) {
      throw new Error(
        (body && (body.detail || body.message)) ||
        ("HTTP " + response.status)
      );
    }

    return body;
  }

  function planLabel(tier) {
    tier = String(tier || "").toLowerCase();
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  }

  function modal() {
    return document.getElementById("authModal");
  }

  function showModal() {
    const backdrop = document.getElementById("modalBackdrop");
    const auth = modal();

    if (backdrop) backdrop.hidden = false;
    if (auth) auth.hidden = false;
  }

  function hideModal() {
    const backdrop = document.getElementById("modalBackdrop");
    if (backdrop) backdrop.hidden = true;
  }

  function setMode(mode, tier) {
    state.mode = mode;

    if (tier) {
      state.desiredTier = tier;
    }

    const auth = modal();
    if (!auth) return;

    const title = document.getElementById("authTitle");
    const submit = document.getElementById("authSubmit");
    const nameLabel = document.getElementById("nameLabel");
    const nameInput = document.getElementById("authName");

    if (mode === "signup") {
      if (title) title.textContent = "Create your Trendward account";
      if (submit) submit.textContent = "Create account";
      if (nameLabel) nameLabel.hidden = false;

      if (nameInput) {
        nameInput.placeholder = "Username";
        nameInput.setAttribute("autocomplete", "username");
      }
    } else {
      if (title) title.textContent = "Log in to Trendward";
      if (submit) submit.textContent = "Log in";
      if (nameLabel) nameLabel.hidden = true;
    }

    showModal();
  }

  function updateUI() {
    const login = document.getElementById("loginBtn");
    const signup = document.getElementById("signupBtn");
    const badge = document.getElementById("topPlanBadge");
    const accountState = document.getElementById("accountState");

    document.body.classList.toggle("authenticated", !!state.user);

    if (state.user) {
      if (login) login.textContent = state.user.username || "Account";
      if (signup) signup.textContent = "Log out";
      if (badge) {
        badge.textContent =
          String(state.user.effective_tier || "FREE").toUpperCase();
      }

      if (accountState) {
        accountState.textContent =
          "Signed in as " +
          state.user.username +
          " (" +
          state.user.email +
          ")";
      }
    } else {
      if (login) login.textContent = "Log in";
      if (signup) signup.textContent = "Sign up";
      if (accountState) accountState.textContent = "Not signed in";
    }

    document
      .querySelectorAll("[data-upgrade]")
      .forEach((button) => {
        const tier = String(button.dataset.upgrade || "").toUpperCase();
        const label = button.querySelector("span");

        if (!label) return;

        label.textContent = state.user
          ? "Upgrade to " + planLabel(tier)
          : "Sign up for " + planLabel(tier);
      });
  }

  async function loadMe() {
    try {
      const result = await api("/auth/me", {
        method: "GET",
        headers: {}
      });

      state.user = result.user;
    } catch (_) {
      state.user = null;
    }

    updateUI();
  }

  async function handleLogin() {
    const email =
      document.getElementById("authEmail").value.trim();

    const password =
      document.getElementById("authPassword").value;

    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }

    const result = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    state.user = result.user;

    hideModal();
    updateUI();
  }

  async function handleSignup() {
    const username =
      document.getElementById("authName").value.trim();

    const email =
      document.getElementById("authEmail").value.trim();

    const password =
      document.getElementById("authPassword").value;

    if (!username) {
      alert("Please choose a username.");
      return;
    }

    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }

    if (password.length < 12) {
      alert("Password must be at least 12 characters.");
      return;
    }

    const result = await api("/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        username: username,
        email: email,
        password: password,
        desired_tier: state.desiredTier
      })
    });

    alert(result.message);

    state.mode = "login";

    const nameLabel = document.getElementById("nameLabel");
    const title = document.getElementById("authTitle");
    const submit = document.getElementById("authSubmit");

    if (nameLabel) nameLabel.hidden = true;
    if (title) title.textContent = "Log in to Trendward";
    if (submit) submit.textContent = "Log in";
  }

  async function logout() {
    await api("/auth/logout", {
      method: "POST",
      body: "{}"
    });

    state.user = null;
    updateUI();
  }

  // This comment is intentionally plain ASCII.
  document.addEventListener(
    "submit",
    async function (event) {
      const form = event.target;

      if (!form || form.id !== "authForm") {
        return;
      }

      // Stop the old browser-only preview auth handler.
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      try {
        if (state.mode === "signup") {
          await handleSignup();
        } else {
          await handleLogin();
        }
      } catch (error) {
        alert(error.message || "Trendward authentication failed.");
      }
    },
    true
  );

  document.addEventListener(
    "click",
    async function (event) {
      const login = event.target.closest("#loginBtn");

      if (login) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        if (state.user) {
          return;
        }

        setMode("login");
        return;
      }

      const signup = event.target.closest("#signupBtn");

      if (signup) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        try {
          if (state.user) {
            await logout();
          } else {
            setMode("signup", "FREE");
          }
        } catch (error) {
          alert(error.message);
        }

        return;
      }

      const settingsLogin =
        event.target.closest("#settingsLoginBtn");

      if (settingsLogin) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        if (!state.user) {
          setMode("login");
        }

        return;
      }

      const upgrade =
        event.target.closest("[data-upgrade]");

      if (upgrade) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        const tier =
          String(upgrade.dataset.upgrade || "").toUpperCase();

        if (!state.user) {
          setMode("signup", tier);
          return;
        }

        try {
          const result = await api("/account/request-tier", {
            method: "POST",
            body: JSON.stringify({
              tier: tier
            })
          });

          alert(result.message);
        } catch (error) {
          alert(error.message);
        }
      }
    },
    true
  );

  window.TRENDWARD_AUTH = {
    api: api,
    state: state,
    setMode: setMode,
    loadMe: loadMe
  };

  loadMe();
})();