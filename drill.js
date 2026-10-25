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

function renderDrills(drillList) {
  const container = document.getElementById("drill-grid");
  if (!container) return;

  const cardsHTML = drillList.map(function (drill) {
    return `
      <div data-id="${drill.id}" class="drill-card">
        <h3>${drill.name}</h3>
        <p>Skill: ${drill.skill}</p>
        <p>Difficulty: ${drill.difficulty}</p>
      </div>
    `;
  });

  container.innerHTML = cardsHTML.join("");
}

renderDrills(drills);

const sorting = document.querySelectorAll(".filter-btn");
sorting.forEach(function (button) {
  button.addEventListener("click", function () {
    const chosenCategory = button.dataset.filter;

    const filteredCategory =
      chosenCategory === "all"
        ? drills
        : drills.filter(function (drill) {
            return drill.category === chosenCategory;
          });

    sorting.forEach(function (btn) {
      btn.classList.remove("active");
    });

    button.classList.add("active");
    renderDrills(filteredCategory);
  });
});

const grid = document.getElementById("drill-grid");
if (grid) {
  grid.addEventListener("click", function (event) {
    const card = event.target.closest(".drill-card");
    if (!card) return;

    const drill = drills.find(function (d) {
      return d.id === Number(card.dataset.id);
    });

    if (!drill) return;

    const detail = document.getElementById("drill-detail");
    if (!detail) return;

    detail.innerHTML = `
      <h2>${drill.name}</h2>
      <div class="detail-layout">
        <div class="detail-text">
          <p>Skill: ${drill.skill}</p>
          <p>Difficulty: ${drill.difficulty}</p>
          <p>Equipment: ${drill.equipment || "N/A"}</p>
          <p>${drill.description}</p>
        </div>
        ${drill.gif ? `<div class="detail-diagram"><img src="${drill.gif}" alt="${drill.name} diagram"></div>` : ""}
      </div>
      <button id="add-to-session">Add to session</button>
    `;

    const dialog = document.getElementById("drill-dialog");
    if (dialog && typeof dialog.showModal === "function") {
      dialog.showModal();
    }
      document.getElementById("add-to-session").addEventListener("click", function() {
            console.log("button clicked");
    session.push({ id: drill.id, minutes: 10 });
    console.log(session);
        renderSession();
  });
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
function renderSession() {
    console.log("renderSession running", session);
  const list = document.getElementById("session-list");

  const itemsHTML = session.map(function(item) {
    const drill = drills.find(function(d) {
      return d.id === item.id;
    });
    return `<li>${drill.name} – ${item.minutes} min</li>`;
  });

  list.innerHTML = itemsHTML.join("");
}
const tabs = document.querySelectorAll(".tab-btn");

tabs.forEach(function(tab) {
  tab.addEventListener("click", function() {
    tabs.forEach(function(t) {
      t.classList.remove("active");
    });
    tab.classList.add("active");

    document.getElementById("drills-view").hidden = tab.dataset.tab !== "drills-view";
    document.getElementById("session-view").hidden = tab.dataset.tab !== "session-view";
  });
});