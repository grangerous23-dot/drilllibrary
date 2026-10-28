let session = [];
const drills = [
  {
    id: 1,
    name: "Cone Weave Dribbling",
    category: "individual",
    skill: "Dribbling",
    difficulty: "Beginner",
    equipment: "cones",
    description: "Dribble through a line of cones using both feet.",
    setup: "6–8 cones in a straight line, about 1 meter apart. One ball per player.",
    steps: [
      "Dribble in and out of the cones using only the inside of your feet.",
      "Turn at the last cone and come back using only the outside of your feet.",
      "Next round, use your weaker foot only.",
      "Finish with a sprint back to the start."
    ],
    coachingPoints: [
      "Keep the ball close, a small touch every step",
      "Head up between touches to see the next cone",
      "Stay on the balls of your feet, knees bent",
      "Speed up only once you're clean through the cones"
    ],
    gif: "images/cone-weave.gif",
  },
  {
    id: 2,
    name: "Wall Passing",
    category: "individual",
    skill: "Passing",
    difficulty: "Beginner",
    equipment: "ball, wall",
    description: "Improve passing accuracy, high repetitions.",
    setup: "A solid wall and a ball. Mark a line 3–5 meters from the wall.",
    steps: [
      "Pass the ball against the wall with the inside of your foot.",
      "Control the rebound with one touch, then pass again.",
      "After 20 passes, switch to your other foot.",
      "Progress to one-touch passing, then move the line further back."
    ],
    coachingPoints: [
      "Plant foot next to the ball, pointing at the target",
      "Strike through the middle of the ball to keep it on the ground",
      "Lock your ankle, toe up",
      "Cushion the return so it stops in front of you"
    ],
    gif: "images/wall-passing.gif",
  },
  {
    id: 3,
    name: "First Touch Game",
    category: "individual",
    skill: "Ball Control",
    difficulty: "Beginner",
    equipment: "ball",
    description: "Launch ball into air, control with foot.",
    setup: "One ball per player and some open space.",
    steps: [
      "Toss the ball into the air, about head height.",
      "Control it with your foot so it drops dead in front of you.",
      "Repeat with thigh, then chest, then your weaker foot.",
      "Count clean controls in a row and try to beat your record."
    ],
    coachingPoints: [
      "Get in line with the ball early",
      "Relax the controlling surface and pull it back slightly on contact",
      "Watch the ball all the way onto your foot",
      "Your first touch should set up your next action"
    ],
    gif: "images/first-touch-game.gif"
  },
  {
    id: 4,
    name: "1v1 Attack and Defend",
    category: "group",
    playerCount: 2,
    skill: "Dribbling, Defending, Finishing",
    difficulty: "Intermediate",
    equipment: "ball, goal",
    description: "Practice attacking and defending in a 1v1 scenario.",
    setup: "A 10 × 15 meter area with a goal at one end. One attacker, one defender.",
    steps: [
      "The defender passes to the attacker and closes them down.",
      "The attacker tries to beat the defender and score.",
      "If the defender wins the ball, they counter to a line at the other end.",
      "Swap roles after each round."
    ],
    coachingPoints: [
      "Attacker: attack the defender's front foot at speed",
      "Attacker: use a change of direction or pace to get past",
      "Defender: close down quickly, then slow down as you arrive",
      "Defender: stay side-on and show the attacker one way"
    ],
    gif: "images/1v1-attack-defend.gif"
  },
  {
    id: 5,
    name: "Rondos",
    category: "group",
    playerCount: 7,
    skill: "Passing, Ball Control",
    difficulty: "Intermediate",
    equipment: "ball",
    description: "Keep possession in a small area while defenders try to intercept.",
    setup: "A 10 × 10 meter square. 5 players on the outside, 2 defenders in the middle.",
    steps: [
      "The outside players keep the ball away from the defenders.",
      "Count passes: 10 in a row scores a point.",
      "A defender who wins the ball swaps with the player who lost it.",
      "Make it harder with a two-touch limit, then one-touch."
    ],
    coachingPoints: [
      "Open your body so you can see the next pass",
      "Move to make a passing angle, don't hide behind defenders",
      "Pass to the foot away from the defender",
      "Defenders: work as a pair and cut off the middle pass"
    ],
    gif: "images/rondos.gif",
  },
  {
    id: 6,
    name: "2v2 Small-Sided",
    category: "group",
    playerCount: 4,
    skill: "Dribbling, Passing, Finishing",
    difficulty: "Intermediate",
    equipment: "ball, goal",
    description: "A 2v2 game focusing on dribbling and passing.",
    setup: "A 20 × 15 meter pitch with a small goal at each end. Two teams of two.",
    steps: [
      "Play 2v2 games of 2–3 minutes.",
      "Teams try to combine with passes or dribbles to score.",
      "Rest one round, then play again with new pairs.",
      "Add a rule: a goal after a give-and-go counts double."
    ],
    coachingPoints: [
      "The player without the ball moves to give a passing option",
      "Dribble when there's space, pass when you draw a defender",
      "Defend as a pair: one presses, the other covers",
      "Switch quickly from attack to defense when you lose it"
    ],
    gif: "images/2v2.gif",
  },
  {
    id: 7,
    name: "Dynamic Stretching",
    category: "group",
    phase: "warmup",
    skill: "Fitness",
    difficulty: "Beginner",
    equipment: "cones",
    description: "Jog between two lines of cones doing high knees, butt kicks, side shuffles and leg swings.",
    setup: "Two lines of cones about 15 meters apart.",
    steps: [
      "Jog between the cones and back.",
      "High knees, then butt kicks.",
      "Side shuffles facing each way.",
      "Open and close the gate (hip rotations), then leg swings.",
      "Finish with two short sprints at 75% speed."
    ],
    coachingPoints: [
      "Start easy and build intensity each round",
      "Keep moving, no static stretching before training",
      "Good posture: chest up, arms working"
    ]
  },
  {
    id: 8,
    name: "Passing Pairs Warm-up",
    category: "group",
    phase: "warmup",
    playerCount: 2,
    skill: "Passing",
    difficulty: "Beginner",
    equipment: "ball",
    description: "Partners pass back and forth at walking pace, then jogging, using both feet.",
    setup: "Players in pairs, 8–10 meters apart, one ball per pair.",
    steps: [
      "Pass back and forth with the inside of the foot while walking on the spot.",
      "After a minute, move on your toes and receive across your body.",
      "Pass with your weaker foot only.",
      "Finish with one-touch passing at match pace."
    ],
    coachingPoints: [
      "Be on your toes before the ball arrives",
      "Receive with the foot furthest from your partner",
      "Firm, accurate passes along the ground"
    ]
  },
  {
    id: 9,
    name: "Light Jog and Static Stretch",
    category: "group",
    phase: "cooldown",
    skill: "Fitness",
    difficulty: "Beginner",
    equipment: "none",
    description: "Two slow laps of the field, then hold each stretch (quads, hamstrings, calves, hips) for 20-30 seconds.",
    setup: "The whole field, after training.",
    steps: [
      "Two slow laps of the field.",
      "Walk for a minute to bring your breathing down.",
      "Hold each stretch for 20–30 seconds: quads, hamstrings, calves, hip flexors, groin.",
      "Drink water and talk through the session."
    ],
    coachingPoints: [
      "Never bounce in a stretch, hold it steady",
      "Breathe slowly and relax into it",
      "Stretch both sides equally"
    ]
  },
  {
    id: 10,
    name: "Juggling Cool-down",
    category: "individual",
    phase: "cooldown",
    skill: "Ball Control",
    difficulty: "Beginner",
    equipment: "ball",
    description: "Relaxed juggling at your own pace to bring the heart rate down while keeping a touch on the ball.",
    setup: "One ball per player.",
    steps: [
      "Juggle at your own pace using both feet.",
      "Mix in thighs and finish with a few headers.",
      "Try to beat your personal best for the session.",
      "Slow your breathing down as you go."
    ],
    coachingPoints: [
      "Small, soft touches, ball no higher than your waist",
      "Lock the ankle and use your laces",
      "Stay relaxed, this is a cool-down, not a test"
    ]
  },
  {
    id: 11,
    name: "Finishing Circuit",
    category: "individual",
    skill: "Finishing",
    difficulty: "Intermediate",
    equipment: "balls, cones, goal",
    description: "Dribble around a cone and shoot from the edge of the box. Alternate feet and aim for the corners.",
    setup: "A goal with a goalkeeper (or targets in the corners). Cones 25 meters out, balls at the start.",
    steps: [
      "Dribble at the cone and go round it.",
      "Take a touch out of your feet toward goal.",
      "Shoot from the edge of the box, aiming for a corner.",
      "Next round, go round the cone the other way and shoot with the other foot."
    ],
    coachingPoints: [
      "Pick your corner before you shoot",
      "Head over the ball to keep the shot low",
      "Strike with your laces, follow through toward the target",
      "Hit the target first, power second"
    ]
  }
];

// Which part of a session a drill goes in by default
const sessionParts = [
  { value: "warmup", label: "Warm-up" },
  { value: "main", label: "Main session" },
  { value: "cooldown", label: "Cool-down" }
];

// ---------- Drill library ----------
// A color, quote and (optional) image for each skill.
// The banner changes to match whichever skill is picked in the dropdown.
const skillThemes = {
  all: { color: "#0172ad", quote: "Playing football is very simple, but playing simple football is the hardest thing there is. - Johan Cruyff", tint: "rgba(14, 37, 237, 0.25)", image: "https://i.pinimg.com/1200x/03/e3/8e/03e38ec1c60e677cc2a871a1a35dfa7d.jpg" },
  "Finishing": { color: "#c62828", quote: "Even if I miss one time, I will shoot the second time. If I lose the second time, I will shoot the third time. I'm not afraid. - Cristiano Ronaldo", tint: "rgba(194, 6, 6, 0.25)", image: "https://i.pinimg.com/736x/4d/66/72/4d66726ab5167c4ee7f4ba8d7f03396e.jpg" },
  "Passing": { color: "#2e7d32", quote: "The game is played with your head. Your legs are just the tools. - Andrea Pirlo", tint: "rgba(6, 194, 188, 0.25)", image: "https://i.pinimg.com/736x/04/50/49/04504931139240fb707f41f909e6c0c7.jpg" },
  "Dribbling": { color: "#6a1b9a", quote: "All those dribblers, I couldn't do as they did, so I created something for myself. - Jeremy Doku", tint:"rgba(75, 10, 140,0.25)", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkTpnZFTtL-PgIhdeNKGKx_abXhnZzKeIQNXMkHLz5JDyEFRLtnHF80hoc&s=10" },
  "Defending": { color: "#37474f", quote: "Put another way, defending is our first offensive action. - Jurgen Klopp", tint: "rgba(84, 81, 87,0.25)", image: "https://i.pinimg.com/736x/24/7d/94/247d9491b95ef09c7bb2160a7b0dba16.jpg"  },
  "Ball Control": { color: "#ef6c00", quote: "The basics for me is the first touch... First touch in football is so important... With that you create your own time. - Dimitar Berbatov", tint: "rgba(209, 129, 17,0.25)", image: "https://i.pinimg.com/736x/8c/09/f3/8c09f3f4025d91def2a858f2d85160f9.jpg" },
  "Fitness": { color: "#00838f", quote: "If you are not prepared to run, you should not play the game. - Roy Keane", tint: "rgba(30, 209, 17,0.25)", image:"https://i.pinimg.com/1200x/92/fe/17/92fe177011e270bd9c0595ce72f82021.jpg" },
  warmup: { color: "#f9a825", quote: "I start early and I stay late, day after day, year after year. - Lionel Messi", tint: "rgba(9, 11, 173,0.25)", image:"https://i.pinimg.com/1200x/b2/66/31/b266314115b51326eb3a0e4a90cee7e6.jpg" },
  cooldown: { color: "#5c6bc0", quote: "For me, recovery is as important as training. - Cristiano Ronaldo", tint: "rgba(8, 116, 204, 0.25)", image: "https://i.pinimg.com/1200x/b8/00/41/b8004132d0cd253c11f68a145617a4de.jpg" }
};

let activeLayer = 0; // which of the two image layers is showing

function applySkillTheme(skill) {
  // Skills without a theme (like ones coaches add) use the "all" theme
  const theme = skillThemes[skill] || skillThemes.all;
  const layers = document.querySelectorAll("#skill-banner .banner-layer");

  document.documentElement.style.setProperty("--theme-color", theme.color);
  document.getElementById("skill-quote").textContent = theme.quote;

  // Put the new image on the hidden layer, then fade it in while the old one fades out
  activeLayer = 1 - activeLayer; // switches between 0 and 1
  const tint = theme.tint || "rgba(0,0,0,0.45)";
  layers[activeLayer].style.backgroundImage = theme.image
    ? `linear-gradient(${tint}, ${tint}), url("${theme.image}")`
    : "";
  layers[activeLayer].classList.add("visible");
  layers[1 - activeLayer].classList.remove("visible");
}
applySkillTheme("all");
// Anything coaches type (drill names, descriptions, session names) must be escaped
// before it goes into innerHTML, or someone could sneak code into the page
function escapeHTML(text) {
  return String(text === undefined || text === null ? "" : text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// True if the logged-in coach uploaded this drill (currentUser lives in sessions.js)
function isMyDrill(drill) {
  return typeof currentUser !== "undefined" && currentUser !== null && drill.userId === currentUser.id;
}

const filters = {
  category: "all",
  search: "",
  skill: "all",
  difficulty: "all"
};

function drillSkills(drill) {
  return (drill.skill || "").split(",").map(function (s) {
    return s.trim();
  });
}

function partLabel(value) {
  return sessionParts.find(function (part) {
    return part.value === value;
  }).label;
}

// Built-in drills have number ids, uploaded drills have text ids, so compare them as text
function findDrill(id) {
  return drills.find(function (d) {
    return String(d.id) === String(id);
  });
}

function renderDrills(drillList) {
  const container = document.getElementById("drill-grid");
  if (!container) return;

  const cardsHTML = drillList.map(function (drill) {
    return `
      <div data-id="${escapeHTML(drill.id)}" class="drill-card" tabindex="0">
        <div class="card-tags">
          ${drill.phase ? `<span class="phase-tag">${partLabel(drill.phase)}</span>` : ""}
          ${drill.animation ? `<span class="phase-tag tag-light">▶ Animated</span>` : ""}
          ${drill.mediaType === "video" ? `<span class="phase-tag tag-light">Video</span>` : ""}
          ${isMyDrill(drill) ? `<span class="phase-tag tag-mine">Your drill</span>` : ""}
        </div>
        <h3>${escapeHTML(drill.name)}</h3>
        <p class="card-summary">${escapeHTML(drill.description)}</p>
        <p>Skill: ${escapeHTML(drill.skill)}</p>
        <p>Difficulty: ${escapeHTML(drill.difficulty)}</p>
        ${drill.playerCount ? `<p>Players: ${escapeHTML(drill.playerCount)}</p>` : ""}
        <button class="card-add-btn" data-id="${escapeHTML(drill.id)}">+ Add to session</button>
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
    if (filters.skill === "warmup" || filters.skill === "cooldown") {
      if (drill.phase !== filters.skill) return false;
    } else if (filters.skill !== "all" && !drillSkills(drill).includes(filters.skill)) {
      return false;
    }
    if (search) {
      const text = (drill.name + " " + drill.description + " " + drill.skill).toLowerCase();
      if (!text.includes(search)) return false;
    }
    return true;
  });

  renderDrills(filtered);
}

// Every skill used by any drill, A-Z
function allSkills() {
  const skills = [];
  drills.forEach(function (drill) {
    drillSkills(drill).forEach(function (skill) {
      if (skill && !skills.includes(skill)) skills.push(skill);
    });
  });
  return skills.sort();
}

// Fill the skill dropdown from the skills used in the drills.
// Runs again when uploaded drills load, since they can add new skills.
function buildSkillOptions() {
  const select = document.getElementById("skill-filter");
  select.innerHTML =
    `<option value="all">All skills</option>` +
    allSkills().map(function (skill) {
      return `<option value="${escapeHTML(skill)}">${escapeHTML(skill)}</option>`;
    }).join("") +
    `<optgroup label="Session part">
      <option value="warmup">Warm-up</option>
      <option value="cooldown">Cool-down</option>
    </optgroup>`;
  select.value = filters.skill;
  if (select.value !== filters.skill) {
    // The chosen skill no longer exists
    filters.skill = "all";
    select.value = "all";
  }
}
buildSkillOptions();

document.getElementById("search").addEventListener("input", function (event) {
  filters.search = event.target.value;
  applyFilters();
});

document.getElementById("skill-filter").addEventListener("change", function (event) {
  filters.skill = event.target.value;
  applyFilters();
  applySkillTheme(filters.skill);
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

let currentPlayer = null; // the animation playing in the popup, so it can be stopped

// Only show media from https links (blocks tricks like "javascript:" links)
function safeMediaUrl(url) {
  return typeof url === "string" && url.startsWith("https://") ? url : null;
}

function mediaHTML(drill) {
  const url = safeMediaUrl(drill.mediaUrl) || drill.gif;
  if (!url) return "";
  if (drill.mediaType === "video") {
    return `<video src="${escapeHTML(url)}" controls muted loop playsinline></video>`;
  }
  return `<img src="${escapeHTML(url)}" alt="${escapeHTML(drill.name)} diagram">`;
}

// The banner theme (color, image, tint) that matches a drill's main skill
function themeForDrill(drill) {
  const skill = drillSkills(drill).find(function (name) {
    return skillThemes[name];
  });
  return skillThemes[skill] || skillThemes[drill.phase] || skillThemes.all;
}

// Turns a coach's description into paragraphs and lists:
// lines starting with "-" or "•" become bullet points, lines starting with "1." become numbered steps
function formatDescription(text) {
  const blocks = [];
  let list = null;

  String(text || "").split("\n").forEach(function (rawLine) {
    const line = rawLine.trim();
    const bullet = line.match(/^[-•*]\s+(.*)/);
    const numbered = line.match(/^\d+[.)]\s+(.*)/);

    if (bullet || numbered) {
      const type = bullet ? "ul" : "ol";
      if (!list || list.type !== type) {
        list = { type: type, items: [] };
        blocks.push(list);
      }
      list.items.push((bullet || numbered)[1]);
    } else {
      list = null;
      if (line) blocks.push({ type: "p", text: line });
    }
  });

  return blocks.map(function (block) {
    if (block.type === "p") return `<p>${escapeHTML(block.text)}</p>`;
    const items = block.items.map(function (item) {
      return `<li>${escapeHTML(item)}</li>`;
    }).join("");
    return `<${block.type}>${items}</${block.type}>`;
  }).join("");
}

function listHTML(tag, items) {
  return `<${tag}>${items.map(function (item) {
    return `<li>${escapeHTML(item)}</li>`;
  }).join("")}</${tag}>`;
}

// The written part of the drill page: setup, steps and coaching points if the drill has them,
// otherwise the coach's description
function drillSectionsHTML(drill) {
  if (!drill.steps) {
    return `
      <section class="drill-section">
        <h3>About this drill</h3>
        <div class="drill-description">${formatDescription(drill.description)}</div>
      </section>
    `;
  }

  return `
    ${drill.setup ? `
      <section class="drill-section">
        <h3>Setup</h3>
        <p>${escapeHTML(drill.setup)}</p>
      </section>` : ""}
    <section class="drill-section">
      <h3>How it works</h3>
      ${listHTML("ol", drill.steps)}
    </section>
    ${drill.coachingPoints ? `
      <section class="drill-section coaching-points">
        <h3>Coaching points</h3>
        ${listHTML("ul", drill.coachingPoints)}
      </section>` : ""}
  `;
}

function factHTML(label, value) {
  if (!value) return "";
  return `
    <div class="fact">
      <dt>${label}</dt>
      <dd>${escapeHTML(value)}</dd>
    </div>
  `;
}

function openDrill(drill) {
  const detail = document.getElementById("drill-detail");
  if (!detail) return;
  stopPlayer();

  const hasVisuals = Boolean(drill.animation || safeMediaUrl(drill.mediaUrl) || drill.gif);
  const theme = themeForDrill(drill);

  detail.innerHTML = `
    <header class="drill-hero">
      <div class="drill-hero-inner">
        <div class="hero-tags">
          <span class="chip">${drill.category === "group" ? "Group" : "Individual"}</span>
          <span class="chip">${escapeHTML(drill.difficulty)}</span>
          ${drill.phase ? `<span class="chip">${partLabel(drill.phase)}</span>` : ""}
          ${drill.animation ? `<span class="chip">▶ Animated</span>` : ""}
          ${isMyDrill(drill) ? `<span class="chip chip-mine">Your drill</span>` : ""}
        </div>
        <h2>${escapeHTML(drill.name)}</h2>
        ${drill.steps ? `<p class="hero-summary">${escapeHTML(drill.description)}</p>` : ""}
        <div class="hero-skills">
          ${drillSkills(drill).map(function (skill) {
            return `<span class="chip chip-outline">${escapeHTML(skill)}</span>`;
          }).join("")}
        </div>
      </div>
    </header>

    <div class="drill-body ${hasVisuals ? "" : "no-visuals"}">
      <div class="drill-main">
        ${hasVisuals ? `
          <div class="drill-visuals">
            ${drill.animation ? `<div class="visual-card" id="drill-animation"></div>` : ""}
            ${mediaHTML(drill) ? `<div class="visual-card">${mediaHTML(drill)}</div>` : ""}
          </div>` : ""}
        ${drillSectionsHTML(drill)}
      </div>

      <aside class="drill-side">
        <div class="side-card">
          <h3>At a glance</h3>
          <dl class="facts">
            ${factHTML("Players", drill.playerCount ? String(drill.playerCount) : (drill.category === "individual" ? "1" : ""))}
            ${factHTML("Level", drill.difficulty)}
            ${factHTML("Type", drill.category === "group" ? "Group" : "Individual")}
            ${factHTML("Session part", drill.phase ? partLabel(drill.phase) : "Main session")}
          </dl>
          ${drill.equipment ? `
            <div class="equipment">
              <span class="equipment-label">Equipment</span>
              <p>${escapeHTML(drill.equipment)}</p>
            </div>` : ""}
          <button id="add-to-session" class="add-big">+ Add to session</button>
          ${isMyDrill(drill) ? `
            <div class="owner-buttons">
              <button id="edit-drill" class="secondary">Edit drill</button>
              <button id="delete-drill" class="secondary">Delete drill</button>
            </div>` : ""}
        </div>
      </aside>
    </div>
  `;

  // Header uses the skill's banner image and color, darkened so the white text is readable
  const hero = detail.querySelector(".drill-hero");
  detail.style.setProperty("--theme-color", theme.color); // step numbers, buttons etc. match this drill
  hero.style.backgroundColor = theme.color;
  if (theme.image) {
    hero.style.backgroundImage =
      `linear-gradient(90deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.25) 100%), url("${theme.image}")`;
  }

  if (drill.animation && typeof createAnimationPlayer === "function" && isValidAnimation(drill.animation)) {
    currentPlayer = createAnimationPlayer(document.getElementById("drill-animation"), drill.animation);
  }

  document.getElementById("add-to-session").addEventListener("click", function (event) {
    addToSession(drill.id);
    showAdded(event.target);
  });

  // editDrill and deleteDrill are in upload.js
  if (isMyDrill(drill)) {
    document.getElementById("edit-drill").addEventListener("click", function () {
      closeDrillDialog();
      editDrill(drill);
    });
    document.getElementById("delete-drill").addEventListener("click", function () {
      deleteDrill(drill);
    });
  }

  const dialog = document.getElementById("drill-dialog");
  if (dialog && typeof dialog.showModal === "function") {
    dialog.showModal();
    dialog.querySelector("article").scrollTop = 0;
  }
}

function stopPlayer() {
  if (currentPlayer) currentPlayer.stop();
  currentPlayer = null;
}

function closeDrillDialog() {
  const dialog = document.getElementById("drill-dialog");
  if (dialog.open) dialog.close();
}

// Stop the animation and any video when the popup closes (Close button or Esc)
document.getElementById("drill-dialog").addEventListener("close", function () {
  stopPlayer();
  const video = document.querySelector("#drill-detail video");
  if (video) video.pause();
});

const grid = document.getElementById("drill-grid");
if (grid) {
  grid.addEventListener("click", function (event) {
    // "+ Add to session" button on a card: add without opening the popup
    const addButton = event.target.closest(".card-add-btn");
    if (addButton) {
      addToSession(addButton.dataset.id);
      showAdded(addButton);
      return;
    }

    const card = event.target.closest(".drill-card");
    if (!card) return;

    const drill = findDrill(card.dataset.id);
    if (drill) openDrill(drill);
  });

  // Let keyboard users open a card with Enter or Space
  grid.addEventListener("keydown", function (event) {
    if (event.key !== "Enter" && event.key !== " ") return;
    if (!event.target.classList.contains("drill-card")) return;
    event.preventDefault();

    const drill = findDrill(event.target.dataset.id);
    if (drill) openDrill(drill);
  });
}

const closeDialogButton = document.getElementById("close-dialog");
if (closeDialogButton) {
  closeDialogButton.addEventListener("click", closeDrillDialog);
}

// ---------- Session planner ----------

let sessionName = "";
// The id of the saved session that's open in My Session, or null if it hasn't been saved yet
let currentSessionId = null;

function addToSession(drillId) {
  const drill = findDrill(drillId);
  if (!drill) return;
  const part = drill.phase || "main";
  session.push({ id: drill.id, part: part, type: "time", minutes: 10, reps: 10, sets: 3, work: 60, rest: 30 });
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

function renderItem(item, index) {
  // Uploaded drills load a moment after the page, and a coach may delete one
  const drill = findDrill(item.id) || { name: "Drill not available" };
  const isFirst = previousInPart(index) === -1;
  const isLast = nextInPart(index) === -1;

  return `
    <li class="session-item">
      <div class="session-item-head">
        <strong>${escapeHTML(drill.name)}</strong>
        <span class="item-minutes">${formatMinutes(itemMinutes(item))} min</span>
        <span class="item-buttons">
          <button data-action="up" data-index="${index}" aria-label="Move up" ${isFirst ? "disabled" : ""}>↑</button>
          <button data-action="down" data-index="${index}" aria-label="Move down" ${isLast ? "disabled" : ""}>↓</button>
          <button data-action="remove" data-index="${index}" aria-label="Remove">✕</button>
        </span>
      </div>
      <div class="session-fields">
        <label>Part
          <select class="session-input" data-index="${index}" data-field="part">
            ${sessionParts.map(function (part) {
              return `<option value="${part.value}" ${item.part === part.value ? "selected" : ""}>${part.label}</option>`;
            }).join("")}
          </select>
        </label>
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
}

function renderSession() {
  const partsHTML = sessionParts.map(function (part) {
    let itemsHTML = "";
    session.forEach(function (item, index) {
      if (item.part === part.value) itemsHTML += renderItem(item, index);
    });

    return `
      <div class="session-part" data-part="${part.value}">
        <h3>${part.label} <span class="part-minutes"></span></h3>
        ${itemsHTML
          ? `<ol>${itemsHTML}</ol>`
          : `<p class="part-empty">No ${part.label.toLowerCase()} drills yet.</p>`}
      </div>
    `;
  });

  document.getElementById("session-list").innerHTML = partsHTML.join("");
  document.getElementById("session-list").hidden = session.length === 0;
  document.getElementById("session-empty").hidden = session.length > 0;
  document.querySelector(".session-actions").hidden = session.length === 0;
  document.getElementById("session-count").textContent = session.length ? "(" + session.length + ")" : "";
  renderTotal();
  saveSession();
}

// The index of the drill above/below this one in the same part, or -1 if there isn't one
function previousInPart(index) {
  for (let i = index - 1; i >= 0; i--) {
    if (session[i].part === session[index].part) return i;
  }
  return -1;
}

function nextInPart(index) {
  for (let i = index + 1; i < session.length; i++) {
    if (session[i].part === session[index].part) return i;
  }
  return -1;
}

function renderTotal() {
  let total = 0;

  session.forEach(function (item) {
    total = total + itemMinutes(item);
  });

  sessionParts.forEach(function (part) {
    let partTotal = 0;
    session.forEach(function (item) {
      if (item.part === part.value) partTotal = partTotal + itemMinutes(item);
    });
    const label = document.querySelector(`.session-part[data-part="${part.value}"] .part-minutes`);
    if (label) label.textContent = partTotal ? formatMinutes(partTotal) + " min" : "";
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

  if (field === "part") {
    item.part = event.target.value;
    // Move it to the end of the list so it shows up last in its new part
    session.splice(index, 1);
    session.push(item);
    renderSession();
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
  } else if (action === "up" || action === "down") {
    const other = action === "up" ? previousInPart(index) : nextInPart(index);
    if (other !== -1) {
      const item = session[index];
      session[index] = session[other];
      session[other] = item;
    }
  }

  renderSession();
});

document.getElementById("session-name").addEventListener("input", function (event) {
  sessionName = event.target.value;
  saveSession();
});

// ---------- "Are you sure?" popup ----------
// Use it like: askConfirm("Delete?", "This can't be undone.", "Delete", function () { ...do it... });

const confirmDialog = document.getElementById("confirm-dialog");
let onConfirm = null;

function askConfirm(title, message, buttonText, callback) {
  document.getElementById("confirm-title").textContent = title;
  document.getElementById("confirm-message").textContent = message;
  document.getElementById("confirm-ok").textContent = buttonText;
  onConfirm = callback;
  confirmDialog.showModal();
}

document.getElementById("confirm-cancel").addEventListener("click", function () {
  confirmDialog.close();
});

document.getElementById("confirm-ok").addEventListener("click", function () {
  confirmDialog.close();
  if (onConfirm) onConfirm();
});

document.getElementById("print-session").addEventListener("click", function () {
  window.print();
});

// Keep the session you're working on in the browser so it's still there after a refresh.
// (Clicking "Save session" is different: that adds it to Saved Sessions - see sessions.js.)
function saveSession() {
  try {
    localStorage.setItem("drill-session", JSON.stringify({ name: sessionName, items: session, savedId: currentSessionId }));
  } catch (error) {
    // Storage can be blocked (e.g. private browsing) - the planner still works, it just won't be saved
  }
  // updateSaveStatus is in sessions.js, which loads after this file
  if (typeof updateSaveStatus === "function") updateSaveStatus();
}

function loadSession() {
  try {
    const saved = JSON.parse(localStorage.getItem("drill-session"));
    if (!saved) return;
    sessionName = saved.name || "";
    currentSessionId = saved.savedId || null;
    // Keep every drill, even ones not found yet: uploaded drills load a moment later
    session = saved.items || [];
    session.forEach(function (item) {
      if (!item.part) item.part = "main";
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
    showTab(tab.dataset.tab);
  });
});

function showTab(viewId) {
  tabs.forEach(function (t) {
    t.classList.toggle("active", t.dataset.tab === viewId);
    document.getElementById(t.dataset.tab).hidden = t.dataset.tab !== viewId;
  });
}

// ---------- Start ----------

applyFilters();
loadSession();
renderSession();
