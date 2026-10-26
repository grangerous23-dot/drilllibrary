let session = [];
const drills = [
  {
    id: 1,
    name: "Cone Weave Dribbling",
    category: "individual",
    skill: "dribbling",
    difficulty: "beginner",
    equipment: "cones",
    description: "Dribble through a line of cones using both feet.",
    gif: "images/cone-weave.gif",
  },
  {
    id: 2,
    name: "Wall Passing",
    category: "individual",
    skill: "passing",
    difficulty: "beginner",
    equipment: "ball, wall",
    description: "Improve passing accuracy, high repetitions.",
    gif: "images/wall-passing.gif",
  },
  {
    id: 3,
    name: "First Touch Game",
    category: "individual",
    skill: "ball control",
    difficulty: "beginner",
    equipment: "ball",
    description: "Launch ball into air, control with foot.",
    gif: "images/first-touch-game.gif"
  },
  {
    id: 4,
    name: "1v1 Attack and Defend",
    category: "group",
    playerCount: 2,
    skill: "dribbling, defending",
    difficulty: "intermediate",
    equipment: "ball, goal",
    description: "Practice attacking and defending in a 1v1 scenario.",
    gif: "images/1v1-attack-defend.gif"
  },
  {
    id: 5,
    name: "Rondos",
    category: "group",
    playerCount: 7,
    skill: "passing, ball control",
    difficulty: "intermediate",
    equipment: "ball",
    description: "Keep possession in a small area while defenders try to intercept.",
    gif: "images/rondos.gif",
  },
  {
    id: 6,
    name: "2v2 Small-Sided",
    category: "group",
    playerCount: 4,
    skill: "dribbling, passing",
    difficulty: "intermediate",
    equipment: "ball, goal",
    description: "A 2v2 game focusing on dribbling and passing.",
    gif: "images/2v2.gif",
  }
];

// ---------- Drill library ----------

const filters = {
  category: "all",
  search: "",
  skill: "all",
  difficulty: "all"
};

function drillSkills(drill) {
  return drill.skill.split(",").map(function (s) {
    return s.trim();
  });
}

function findDrill(id) {
  return drills.find(function (d) {
    return d.id === id;
  });
}

function renderDrills(drillList) {
  const container = document.getElementById("drill-grid");
  if (!container) return;

  const cardsHTML = drillList.map(function (drill) {
    return `
      <div data-id="${drill.id}" class="drill-card" tabindex="0" role="button">
        <h3>${drill.name}</h3>
        <p>Skill: ${drill.skill}</p>
        <p>Difficulty: ${drill.difficulty}</p>
        ${drill.playerCount ? `<p>Players: ${drill.playerCount}</p>` : ""}
        <button class="card-add-btn" data-id="${drill.id}">+ Add to session</button>
      </div>
    `;
  });

  container.innerHTML = cardsHTML.join("");
  document.getElementById("no-results").hidden = drillList.length > 0;
}

function applyFilters() {
  const search = filters.search.toLowerCase();

  const filtered = drills.filter(function (drill) {
    if (filters.category !== "all" && drill.category !== filters.category) return false;
    if (filters.difficulty !== "all" && drill.difficulty !== filters.difficulty) return false;
    if (filters.skill !== "all" && !drillSkills(drill).includes(filters.skill)) return false;
    if (search) {
      const text = (drill.name + " " + drill.description + " " + drill.skill).toLowerCase();
      if (!text.includes(search)) return false;
    }
    return true;
  });

  renderDrills(filtered);
}

// Fill the skill dropdown from the skills used in the drills
const allSkills = [];
drills.forEach(function (drill) {
  drillSkills(drill).forEach(function (skill) {
    if (!allSkills.includes(skill)) allSkills.push(skill);
  });
});
allSkills.sort();
document.getElementById("skill-filter").innerHTML += allSkills.map(function (skill) {
  return `<option value="${skill}">${skill}</option>`;
}).join("");

document.getElementById("search").addEventListener("input", function (event) {
  filters.search = event.target.value;
  applyFilters();
});

document.getElementById("skill-filter").addEventListener("change", function (event) {
  filters.skill = event.target.value;
  applyFilters();
});

document.getElementById("difficulty-filter").addEventListener("change", function (event) {
  filters.difficulty = event.target.value;
  applyFilters();
});

const sorting = document.querySelectorAll(".filter-btn");
sorting.forEach(function (button) {
  button.addEventListener("click", function () {
    sorting.forEach(function (btn) {
      btn.classList.remove("active");
    });
    button.classList.add("active");

    filters.category = button.dataset.filter;
    applyFilters();
  });
});

// Briefly change a button's text so the coach knows the drill was added
function showAdded(button) {
  const original = button.textContent;
  button.textContent = "Added ✓";
  button.disabled = true;
  setTimeout(function () {
    button.textContent = original;
    button.disabled = false;
  }, 1200);
}

function openDrill(drill) {
  const detail = document.getElementById("drill-detail");
  if (!detail) return;

  detail.innerHTML = `
    <h2>${drill.name}</h2>
    <div class="detail-layout">
      <div class="detail-text">
        <p>Skill: ${drill.skill}</p>
        <p>Difficulty: ${drill.difficulty}</p>
        ${drill.playerCount ? `<p>Players: ${drill.playerCount}</p>` : ""}
        <p>Equipment: ${drill.equipment || "N/A"}</p>
        <p>${drill.description}</p>
        <button id="add-to-session">Add to session</button>
      </div>
      ${drill.gif ? `<div class="detail-diagram"><img src="${drill.gif}" alt="${drill.name} diagram"></div>` : ""}
    </div>
  `;

  document.getElementById("add-to-session").addEventListener("click", function (event) {
    addToSession(drill.id);
    showAdded(event.target);
  });

  const dialog = document.getElementById("drill-dialog");
  if (dialog && typeof dialog.showModal === "function") {
    dialog.showModal();
  }
}

const grid = document.getElementById("drill-grid");
if (grid) {
  grid.addEventListener("click", function (event) {
    // "+ Add to session" button on a card: add without opening the popup
    const addButton = event.target.closest(".card-add-btn");
    if (addButton) {
      addToSession(Number(addButton.dataset.id));
      showAdded(addButton);
      return;
    }

    const card = event.target.closest(".drill-card");
    if (!card) return;

    const drill = findDrill(Number(card.dataset.id));
    if (drill) openDrill(drill);
  });

  // Let keyboard users open a card with Enter or Space
  grid.addEventListener("keydown", function (event) {
    if (event.key !== "Enter" && event.key !== " ") return;
    if (!event.target.classList.contains("drill-card")) return;
    event.preventDefault();

    const drill = findDrill(Number(event.target.dataset.id));
    if (drill) openDrill(drill);
  });
}

const closeDialogButton = document.getElementById("close-dialog");
if (closeDialogButton) {
  closeDialogButton.addEventListener("click", function () {
    const dialog = document.getElementById("drill-dialog");
    if (dialog && typeof dialog.close === "function") {
      dialog.close();
    }
  });
}

// ---------- Session planner ----------

let sessionName = "";

function addToSession(drillId) {
  session.push({ id: drillId, type: "time", minutes: 10, reps: 10, sets: 3, work: 60, rest: 30 });
  renderSession();
}

// How many minutes one session item takes
function itemMinutes(item) {
  if (item.type === "sets") {
    return (item.sets * (item.work + item.rest)) / 60;
  }
  return item.minutes;
}

// Round to at most 1 decimal place, e.g. 4.5
function formatMinutes(minutes) {
  return Math.round(minutes * 10) / 10;
}

function sessionFields(item, index) {
  if (item.type === "timeReps") {
    return `
      <label>Minutes <input type="number" class="session-input" data-index="${index}" data-field="minutes" value="${item.minutes}" min="1"></label>
      <label>Reps <input type="number" class="session-input" data-index="${index}" data-field="reps" value="${item.reps}" min="1"></label>
    `;
  }

  if (item.type === "sets") {
    return `
      <label>Sets <input type="number" class="session-input" data-index="${index}" data-field="sets" value="${item.sets}" min="1"></label>
      <label>Work (sec) <input type="number" class="session-input" data-index="${index}" data-field="work" value="${item.work}" min="1"></label>
      <label>Rest (sec) <input type="number" class="session-input" data-index="${index}" data-field="rest" value="${item.rest}" min="0"></label>
    `;
  }

  return `
    <label>Minutes <input type="number" class="session-input" data-index="${index}" data-field="minutes" value="${item.minutes}" min="1"></label>
  `;
}

function renderSession() {
  const itemsHTML = session.map(function (item, index) {
    const drill = findDrill(item.id);
    return `
      <li class="session-item">
        <div class="session-item-head">
          <strong>${drill.name}</strong>
          <span class="item-minutes">${formatMinutes(itemMinutes(item))} min</span>
          <span class="item-buttons">
            <button data-action="up" data-index="${index}" aria-label="Move up" ${index === 0 ? "disabled" : ""}>↑</button>
            <button data-action="down" data-index="${index}" aria-label="Move down" ${index === session.length - 1 ? "disabled" : ""}>↓</button>
            <button data-action="remove" data-index="${index}" aria-label="Remove">✕</button>
          </span>
        </div>
        <div class="session-fields">
          <label>Type
            <select class="session-input" data-index="${index}" data-field="type">
              <option value="time" ${item.type === "time" ? "selected" : ""}>Time</option>
              <option value="timeReps" ${item.type === "timeReps" ? "selected" : ""}>Time + reps</option>
              <option value="sets" ${item.type === "sets" ? "selected" : ""}>Sets (work / rest)</option>
            </select>
          </label>
          ${sessionFields(item, index)}
        </div>
      </li>
    `;
  });

  document.getElementById("session-list").innerHTML = itemsHTML.join("");
  document.getElementById("session-empty").hidden = session.length > 0;
  document.querySelector(".session-actions").hidden = session.length === 0;
  document.getElementById("session-count").textContent = session.length ? "(" + session.length + ")" : "";
  renderTotal();
  saveSession();
}

function renderTotal() {
  let total = 0;

  session.forEach(function (item) {
    total = total + itemMinutes(item);
  });

  document.getElementById("session-total").textContent =
    session.length ? "Total: " + formatMinutes(total) + " min" : "";
}

// Typing in a number box or changing the type dropdown
document.getElementById("session-list").addEventListener("input", function (event) {
  if (!event.target.classList.contains("session-input")) return;

  const index = Number(event.target.dataset.index);
  const field = event.target.dataset.field;
  const item = session[index];

  if (field === "type") {
    item.type = event.target.value;
    renderSession(); // different type = different boxes, so redraw
    return;
  }

  item[field] = Number(event.target.value);

  // Update just this drill's minutes and the total, so the box you're typing in keeps focus
  const li = event.target.closest(".session-item");
  li.querySelector(".item-minutes").textContent = formatMinutes(itemMinutes(item)) + " min";
  renderTotal();
  saveSession();
});

// Move up / move down / remove buttons
document.getElementById("session-list").addEventListener("click", function (event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const index = Number(button.dataset.index);
  const action = button.dataset.action;

  if (action === "remove") {
    session.splice(index, 1);
  } else if (action === "up" && index > 0) {
    const item = session.splice(index, 1)[0];
    session.splice(index - 1, 0, item);
  } else if (action === "down" && index < session.length - 1) {
    const item = session.splice(index, 1)[0];
    session.splice(index + 1, 0, item);
  }

  renderSession();
});

document.getElementById("session-name").addEventListener("input", function (event) {
  sessionName = event.target.value;
  saveSession();
});

document.getElementById("clear-session").addEventListener("click", function () {
  if (!confirm("Remove all drills from this session?")) return;
  session = [];
  sessionName = "";
  document.getElementById("session-name").value = "";
  renderSession();
});

document.getElementById("print-session").addEventListener("click", function () {
  window.print();
});

// Save the session in the browser so it's still there after a refresh.
// (Later this will be saved to the coach's account instead.)
function saveSession() {
  try {
    localStorage.setItem("drill-session", JSON.stringify({ name: sessionName, items: session }));
  } catch (error) {
    // Storage can be blocked (e.g. private browsing) - the planner still works, it just won't be saved
  }
}

function loadSession() {
  try {
    const saved = JSON.parse(localStorage.getItem("drill-session"));
    if (!saved) return;
    sessionName = saved.name || "";
    // Skip any drills that no longer exist in the library
    session = (saved.items || []).filter(function (item) {
      return findDrill(item.id);
    });
  } catch (error) {
    session = [];
  }
  document.getElementById("session-name").value = sessionName;
}

// ---------- Tabs ----------

const tabs = document.querySelectorAll(".tab-btn");

tabs.forEach(function (tab) {
  tab.addEventListener("click", function () {
    tabs.forEach(function (t) {
      t.classList.remove("active");
    });
    tab.classList.add("active");

    document.getElementById("drills-view").hidden = tab.dataset.tab !== "drills-view";
    document.getElementById("session-view").hidden = tab.dataset.tab !== "session-view";
  });
});

// ---------- Start ----------

applyFilters();
loadSession();
renderSession();
