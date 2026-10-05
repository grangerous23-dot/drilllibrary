const drills = [
  {
    id: 1,
    name: "Cone Weave Dribbling",
    category: "individual",
    skill: "dribbling",
    difficulty: "beginner",
    equipment: "cones",
    videoUrl: "https://www.youtube.com/embed/example1",
    description: "Dribble through a line of cones using both feet."
  },
  {
    id: 2,
    name: "Wall Passing",
    category: "individual",
    skill: "passing",
    difficulty: "beginner",
    equipment: "ball, wall",
    videoUrl: "https://www.youtube.com/embed/example2",
    description: "Improve passing accuracy, high repetitions."
  },
  {
    id: 3,
    name: "First Touch Game",
    category: "individual",
    skill: "ball control",
    difficulty: "beginner",
    equipment: "ball",
    videoUrl: "https://www.youtube.com/embed/example3",
    description: "Launch ball into air, control with foot."
  },
  {
    id: 4,
    name: "1v1 Attack and Defend",
    category: "group",
    playerCount: 2,
    skill: "dribbling, defending",
    difficulty: "intermediate",
    equipment: "ball, goal",
    videoUrl: "https://www.youtube.com/embed/example4",
    description: "Practice attacking and defending in a 1v1 scenario."
  }
];
function renderDrills(drillList) {
  const container = document.getElementById("drill-grid");

  const cardsHTML = drillList.map(function(drill) {
    return `
      <div class="drill-card">
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
sorting.forEach(function(button) {
  button.addEventListener("click", function() {
    const chosenCategory = button.dataset.filter;

    const filteredCategory =
      chosenCategory === "all"
        ? drills
        : drills.filter(function(drill) {
            return drill.category === chosenCategory;
          });

    sorting.forEach(function(btn) {
      btn.classList.remove("active");
    });

    button.classList.add("active");
    renderDrills(filteredCategory);
  });
});
