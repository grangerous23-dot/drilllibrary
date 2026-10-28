// Saved sessions and coach accounts.
//
// Not logged in: saved sessions are kept in this browser (localStorage).
// Logged in: they're kept in the coach's account in Supabase, so they show up on any device.
// The Supabase settings live in config.js - if they're empty, accounts are switched off.

// ---------- Setup ----------

let supabaseClient = null;
let currentUser = null;
let savedSessions = [];
let accountMessage = ""; // e.g. "Moved 2 sessions into your account"

if (typeof SUPABASE_URL !== "undefined" && SUPABASE_URL && SUPABASE_KEY && window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

function findSaved(id) {
  return savedSessions.find(function (saved) {
    return saved.id === id;
  });
}

function sessionDisplayName() {
  return sessionName.trim() || "Untitled session";
}

// Turn a list of session items into text we can compare, so we can spot unsaved changes.
// (We list the fields ourselves because the database can store them in a different order.)
function itemsKey(items) {
  return JSON.stringify(items.map(function (item) {
    return [item.id, item.part, item.type, item.minutes, item.reps, item.sets, item.work, item.rest];
  }));
}

function hasUnsavedChanges() {
  if (session.length === 0) return false;
  const saved = findSaved(currentSessionId);
  if (!saved) return true;
  return saved.name !== sessionDisplayName() || itemsKey(saved.items) !== itemsKey(session);
}

// ---------- Saving in the browser (when not logged in) ----------

const LOCAL_KEY = "saved-sessions";

function readLocalSessions() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function writeLocalSessions(list) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
    return true;
  } catch (error) {
    return false; // e.g. private browsing blocks storage
  }
}

function makeLocalId() {
  return "local-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ---------- Loading, saving, opening and deleting sessions ----------

async function loadSavedSessions() {
  if (currentUser) {
    const { data, error } = await supabaseClient
      .from("sessions")
      .select("id, name, items, updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      accountMessage = "Couldn't load your sessions: " + error.message;
      savedSessions = [];
    } else {
      savedSessions = data.map(function (row) {
        return { id: row.id, name: row.name, items: row.items, updatedAt: row.updated_at };
      });
    }
  } else {
    savedSessions = readLocalSessions().sort(function (a, b) {
      return b.updatedAt.localeCompare(a.updatedAt); // newest first
    });
  }

  renderSavedSessions();
  updateSaveStatus();
}

async function saveCurrentSession() {
  if (session.length === 0) return;

  const button = document.getElementById("save-session");
  const name = sessionDisplayName();
  const items = JSON.parse(JSON.stringify(session)); // a copy, so later edits don't change it
  const existing = findSaved(currentSessionId);

  button.disabled = true;
  button.setAttribute("aria-busy", "true");

  try {
    if (currentUser) {
      if (existing) {
        const { error } = await supabaseClient
          .from("sessions")
          .update({ name: name, items: items, updated_at: new Date().toISOString() })
          .eq("id", currentSessionId);
        if (error) throw error;
      } else {
        const { data, error } = await supabaseClient
          .from("sessions")
          .insert({ name: name, items: items })
          .select("id")
          .single();
        if (error) throw error;
        currentSessionId = data.id;
      }
    } else {
      const list = readLocalSessions();
      const now = new Date().toISOString();
      const index = list.findIndex(function (saved) {
        return saved.id === currentSessionId;
      });

      if (index !== -1) {
        list[index] = { id: currentSessionId, name: name, items: items, updatedAt: now };
      } else {
        currentSessionId = makeLocalId();
        list.push({ id: currentSessionId, name: name, items: items, updatedAt: now });
      }

      if (!writeLocalSessions(list)) {
        throw new Error("this browser isn't letting the site store data (private browsing?)");
      }
    }
  } catch (error) {
    document.getElementById("save-status").textContent = "Couldn't save: " + error.message;
    button.disabled = false;
    button.removeAttribute("aria-busy");
    return;
  }

  saveSession(); // remember which saved session is open
  await loadSavedSessions();
  button.disabled = false;
  button.removeAttribute("aria-busy");
}

function openSavedSession(id) {
  const saved = findSaved(id);
  if (!saved) return;

  // Already open: just go to it
  if (id === currentSessionId) {
    showTab("session-view");
    return;
  }

  function open() {
    sessionName = saved.name;
    currentSessionId = saved.id;
    // Skip drills that are no longer in the library
    session = saved.items
      .filter(function (item) {
        return findDrill(item.id);
      })
      .map(function (item) {
        return Object.assign({ part: "main" }, item);
      });
    document.getElementById("session-name").value = sessionName;
    renderSession();
    renderSavedSessions();
    showTab("session-view");
  }

  if (hasUnsavedChanges()) {
    askConfirm(
      "Open this session?",
      "The session you're working on has unsaved changes. They'll be lost if you open another one.",
      "Open anyway",
      open
    );
  } else {
    open();
  }
}

function deleteSavedSession(id) {
  const saved = findSaved(id);
  if (!saved) return;

  askConfirm("Delete this session?", '"' + saved.name + '" will be deleted. You can\'t undo this.', "Delete", async function () {
    if (currentUser) {
      const { error } = await supabaseClient.from("sessions").delete().eq("id", id);
      if (error) {
        accountMessage = "Couldn't delete: " + error.message;
        renderSavedSessions();
        return;
      }
    } else {
      writeLocalSessions(readLocalSessions().filter(function (s) {
        return s.id !== id;
      }));
    }

    // If it was open in My Session, keep the drills there but treat it as not saved
    if (currentSessionId === id) {
      currentSessionId = null;
      saveSession();
    }
    await loadSavedSessions();
  });
}

function startNewSession() {
  function startNew() {
    session = [];
    sessionName = "";
    currentSessionId = null;
    document.getElementById("session-name").value = "";
    renderSession();
    renderSavedSessions();
  }

  if (hasUnsavedChanges()) {
    askConfirm("Start a new session?", "Your current session has unsaved changes. They'll be lost.", "Start new", startNew);
  } else {
    startNew();
  }
}

// ---------- Showing saved sessions ----------

function renderSavedSessions() {
  const cardsHTML = savedSessions.map(function (saved) {
    let minutes = 0;
    saved.items.forEach(function (item) {
      minutes = minutes + itemMinutes(item);
    });
    const count = saved.items.length;
    const date = new Date(saved.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

    return `
      <article class="saved-card">
        <div>
          <h3>
            ${escapeHTML(saved.name)}
            ${saved.id === currentSessionId ? `<span class="open-tag">Open</span>` : ""}
          </h3>
          <p>${count} ${count === 1 ? "drill" : "drills"} · ${formatMinutes(minutes)} min · Saved ${date}</p>
        </div>
        <div class="saved-buttons">
          <button data-action="open" data-id="${saved.id}">Open</button>
          <button data-action="delete" data-id="${saved.id}" class="secondary">Delete</button>
        </div>
      </article>
    `;
  });

  document.getElementById("saved-list").innerHTML = cardsHTML.join("");
  document.getElementById("saved-empty").hidden = savedSessions.length > 0;
  document.querySelector('.tab-btn[data-tab="saved-view"]').textContent =
    "Saved Sessions" + (savedSessions.length ? " (" + savedSessions.length + ")" : "");

  let note;
  if (!supabaseClient) {
    note = "Sessions are saved in this browser.";
  } else if (!currentUser) {
    note = "You're not logged in, so sessions are saved in this browser only. Log in to keep them in your account and see them on any device.";
  } else {
    note = "Sessions are saved to your account (" + currentUser.email + ").";
  }
  if (accountMessage) note = accountMessage + " " + note;
  document.getElementById("saved-note").textContent = note;
}

// Shows "Saved ✓" / "Unsaved changes" next to the Save button. drill.js calls this whenever the session changes.
function updateSaveStatus() {
  const status = document.getElementById("save-status");
  const button = document.getElementById("save-session");

  if (!findSaved(currentSessionId)) {
    status.textContent = "Not saved yet";
    button.textContent = "Save session";
    button.disabled = false;
  } else if (hasUnsavedChanges()) {
    status.textContent = "Unsaved changes";
    button.textContent = "Save changes";
    button.disabled = false;
  } else {
    status.textContent = "Saved ✓";
    button.textContent = "Saved";
    button.disabled = true;
  }
}

document.getElementById("save-session").addEventListener("click", saveCurrentSession);
document.getElementById("new-session").addEventListener("click", startNewSession);

document.getElementById("saved-list").addEventListener("click", function (event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  if (button.dataset.action === "open") openSavedSession(button.dataset.id);
  if (button.dataset.action === "delete") deleteSavedSession(button.dataset.id);
});

// ---------- Coach accounts (log in / sign up) ----------

const accountDialog = document.getElementById("account-dialog");
let accountMode = "login"; // or "signup"

function renderAccountArea() {
  const area = document.getElementById("account-area");

  if (!supabaseClient) {
    area.innerHTML = ""; // accounts aren't set up yet
  } else if (currentUser) {
    area.innerHTML = `
      <span class="account-email">${escapeHTML(currentUser.email)}</span>
      <button id="logout-button" class="secondary">Log out</button>
    `;
  } else {
    area.innerHTML = `<button id="login-button">Log in / Sign up</button>`;
  }
}

document.getElementById("account-area").addEventListener("click", async function (event) {
  if (event.target.id === "login-button") {
    setAccountMode("login");
    showAccountMessage("");
    document.getElementById("account-form").reset();
    accountDialog.showModal();
  }

  if (event.target.id === "logout-button") {
    await supabaseClient.auth.signOut();
  }
});

// The account popup has three modes: "login", "signup" and "reset" (forgot password)
function setAccountMode(mode) {
  accountMode = mode;
  const isLogin = mode === "login";
  const isReset = mode === "reset";
  const titles = { login: "Log in", signup: "Create an account", reset: "Reset your password" };
  const buttons = { login: "Log in", signup: "Sign up", reset: "Send reset link" };

  document.getElementById("account-title").textContent = titles[mode];
  document.getElementById("account-submit").textContent = buttons[mode];
  document.getElementById("account-switch-text").textContent =
    isLogin ? "Don't have an account?" : isReset ? "Remembered it?" : "Already have an account?";
  document.getElementById("account-switch").textContent = isLogin ? "Sign up" : "Log in";

  // Resetting only needs the email, so hide the password box
  const password = document.getElementById("account-password");
  document.getElementById("password-row").hidden = isReset;
  password.required = !isReset;
  password.autocomplete = isLogin ? "current-password" : "new-password";
  document.getElementById("forgot-password").hidden = !isLogin;
}

function showAccountMessage(text, isError) {
  const message = document.getElementById("account-message");
  message.textContent = text;
  message.hidden = !text;
  message.classList.toggle("error", Boolean(isError));
}

document.getElementById("account-switch").addEventListener("click", function (event) {
  event.preventDefault();
  setAccountMode(accountMode === "login" ? "signup" : "login");
  showAccountMessage("");
});

document.getElementById("forgot-password").addEventListener("click", function (event) {
  event.preventDefault();
  setAccountMode("reset");
  showAccountMessage("Enter your email and we'll send you a link to choose a new password.");
});

document.getElementById("account-cancel").addEventListener("click", function () {
  accountDialog.close();
});

document.getElementById("account-form").addEventListener("submit", async function (event) {
  event.preventDefault();

  const email = document.getElementById("account-email").value.trim();
  const password = document.getElementById("account-password").value;
  const submit = document.getElementById("account-submit");

  submit.disabled = true;
  submit.setAttribute("aria-busy", "true");
  showAccountMessage("");

  if (accountMode === "reset") {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      // Where the link in the email sends them back to
      redirectTo: window.location.origin + window.location.pathname
    });

    if (error) {
      showAccountMessage(error.message, true);
    } else {
      // Same message either way, so nobody can use this to check which emails have accounts
      showAccountMessage("If there's an account for " + email + ", we've sent it a reset link. Check your email (and your spam folder).");
    }
  } else if (accountMode === "signup") {
    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: password,
      // Where the "confirm your email" link sends them back to
      options: { emailRedirectTo: window.location.origin + window.location.pathname }
    });

    if (error) {
      showAccountMessage(error.message, true);
    } else if (!data.session) {
      // Supabase wants them to confirm their email first
      setAccountMode("login");
      showAccountMessage("Almost done! Check your email for a confirmation link, then log in here.");
    } else {
      accountDialog.close();
    }
  } else {
    const { error } = await supabaseClient.auth.signInWithPassword({ email: email, password: password });

    if (error) {
      showAccountMessage(error.message, true);
    } else {
      accountDialog.close();
    }
  }

  submit.disabled = false;
  submit.removeAttribute("aria-busy");
});

// Sessions saved in this browser before logging in get moved into the account.
// Returns which new account id each browser id became, e.g. { "local-abc": "5f1c..." }
async function moveLocalSessionsToAccount() {
  const local = readLocalSessions();
  const newIds = {};
  if (local.length === 0) return newIds;

  const notMoved = [];
  for (const saved of local) {
    const { data, error } = await supabaseClient
      .from("sessions")
      .insert({ name: saved.name, items: saved.items, updated_at: saved.updatedAt })
      .select("id")
      .single();

    if (error) {
      notMoved.push(saved);
    } else {
      newIds[saved.id] = data.id;
    }
  }

  // Keep any that failed in the browser so nothing is lost
  writeLocalSessions(notMoved);

  const moved = local.length - notMoved.length;
  if (moved > 0) {
    accountMessage = "Moved " + moved + (moved === 1 ? " session" : " sessions") + " from this browser into your account.";
  }
  if (notMoved.length > 0) {
    accountMessage += " Couldn't move " + notMoved.length + " - they're still saved in this browser.";
  }
  return newIds;
}

// Runs when the page loads, when a coach logs in and when they log out
async function handleUserChanged(isFirstCheck) {
  accountMessage = "";
  renderAccountArea();

  let newIds = {};
  if (currentUser) newIds = await moveLocalSessionsToAccount();

  if (newIds[currentSessionId]) {
    // The open session was just moved into the account, so follow it there
    currentSessionId = newIds[currentSessionId];
    saveSession();
  } else if (!isFirstCheck) {
    // Sessions in the browser and in an account are kept separately,
    // so after logging in or out, the open session counts as not saved yet
    currentSessionId = null;
    saveSession();
  }

  await loadSavedSessions();
}

if (supabaseClient) {
  let firstCheck = true;

  supabaseClient.auth.onAuthStateChange(function (event, authSession) {
    // They clicked the link in a "reset your password" email
    if (event === "PASSWORD_RECOVERY") setTimeout(openNewPasswordDialog, 0);

    const user = authSession ? authSession.user : null;
    const userChanged = (user ? user.id : null) !== (currentUser ? currentUser.id : null);
    currentUser = user;

    if (!firstCheck && !userChanged) return; // e.g. the login was just refreshed

    const isFirstCheck = firstCheck;
    firstCheck = false;
    // Supabase says not to call it from inside this function, so run it right after
    setTimeout(function () {
      handleUserChanged(isFirstCheck);
    }, 0);
  });
}

// ---------- Choosing a new password (after clicking the reset link) ----------

const passwordDialog = document.getElementById("password-dialog");

function showPasswordMessage(text, isError) {
  const message = document.getElementById("password-message");
  message.textContent = text;
  message.hidden = !text;
  message.classList.toggle("error", Boolean(isError));
}

function openNewPasswordDialog() {
  document.getElementById("password-form").reset();
  showPasswordMessage("");
  if (accountDialog.open) accountDialog.close();
  passwordDialog.showModal();
}

document.getElementById("password-cancel").addEventListener("click", function () {
  passwordDialog.close();
});

document.getElementById("password-form").addEventListener("submit", async function (event) {
  event.preventDefault();

  const password = document.getElementById("new-password").value;
  const again = document.getElementById("new-password-again").value;
  if (password !== again) {
    showPasswordMessage("The two passwords don't match.", true);
    return;
  }

  const submit = document.getElementById("password-submit");
  submit.disabled = true;
  submit.setAttribute("aria-busy", "true");

  const { error } = await supabaseClient.auth.updateUser({ password: password });

  submit.disabled = false;
  submit.removeAttribute("aria-busy");

  if (error) {
    showPasswordMessage(error.message, true);
  } else {
    showPasswordMessage("Password changed! You're logged in.");
    setTimeout(function () {
      passwordDialog.close();
    }, 1500);
  }
});

// ---------- Start ----------

renderAccountArea();
updateSaveStatus();
if (!supabaseClient) loadSavedSessions(); // with accounts, onAuthStateChange loads them
