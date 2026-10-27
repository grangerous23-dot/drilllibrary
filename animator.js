// Drill animator.
//
// An animation is a list of pieces (players, ball, cones, goals) and a list of "frames".
// Each frame says where every piece is. Playing the animation slides the pieces
// smoothly from one frame to the next.
//
// It's saved as plain data, like this:
// {
//   pieces: [{ id: "p1", type: "attacker", label: "1" }, { id: "p2", type: "ball", label: "" }],
//   frames: [{ p1: [20, 32], p2: [22, 32] }, { p1: [50, 20], p2: [52, 20] }],
//   secondsPerFrame: 1
// }
// Positions are [x, y] on a 100 x 64 pitch.

const PITCH_WIDTH = 100;
const PITCH_HEIGHT = 64;
const MAX_FRAMES = 30;
const MAX_PIECES = 30;
const SVG_NS = "http://www.w3.org/2000/svg";

const PIECE_TYPES = {
  attacker: { name: "Attacker", color: "#1565c0", size: 2.4 },
  defender: { name: "Defender", color: "#c62828", size: 2.4 },
  ball: { name: "Ball", color: "#ffffff", size: 1.2 },
  cone: { name: "Cone", color: "#ff9800", size: 1.3 },
  goal: { name: "Mini goal", color: "#ffffff", size: 4 }
};

// ---------- Drawing ----------

function svgElement(tag, attributes) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const name in attributes) {
    el.setAttribute(name, attributes[name]);
  }
  return el;
}

function createPitch() {
  const svg = svgElement("svg", {
    viewBox: "0 0 " + PITCH_WIDTH + " " + PITCH_HEIGHT,
    class: "pitch",
    role: "img",
    "aria-label": "Drill animation on a soccer pitch"
  });

  // Grass stripes
  for (let i = 0; i < 10; i++) {
    svg.appendChild(svgElement("rect", {
      x: i * 10, y: 0, width: 10, height: PITCH_HEIGHT,
      fill: i % 2 === 0 ? "#2e7d32" : "#388e3c"
    }));
  }

  // Field markings
  const lines = svgElement("g", { fill: "none", stroke: "rgba(255,255,255,0.85)", "stroke-width": 0.35 });
  lines.appendChild(svgElement("rect", { x: 1, y: 1, width: 98, height: 62 }));
  lines.appendChild(svgElement("line", { x1: 50, y1: 1, x2: 50, y2: 63 }));
  lines.appendChild(svgElement("circle", { cx: 50, cy: 32, r: 8 }));
  lines.appendChild(svgElement("rect", { x: 1, y: 17, width: 14, height: 30 }));
  lines.appendChild(svgElement("rect", { x: 85, y: 17, width: 14, height: 30 }));
  lines.appendChild(svgElement("rect", { x: 1, y: 25, width: 5, height: 14 }));
  lines.appendChild(svgElement("rect", { x: 94, y: 25, width: 5, height: 14 }));
  svg.appendChild(lines);

  // Pieces get drawn into this group
  svg.appendChild(svgElement("g", { class: "pieces" }));
  return svg;
}

function drawPiece(group, piece, position, options) {
  const type = PIECE_TYPES[piece.type];
  const x = position[0];
  const y = position[1];
  const g = svgElement("g", { class: "piece", "data-id": piece.id });
  if (options.selectedId === piece.id) g.classList.add("selected");

  if (piece.type === "goal") {
    g.appendChild(svgElement("rect", {
      x: x - 0.8, y: y - type.size, width: 1.6, height: type.size * 2,
      fill: "rgba(255,255,255,0.25)", stroke: type.color, "stroke-width": 0.5
    }));
  } else if (piece.type === "cone") {
    const s = type.size;
    g.appendChild(svgElement("polygon", {
      points: [x, y - s, x - s, y + s * 0.8, x + s, y + s * 0.8].join(" "),
      fill: type.color, stroke: "#333", "stroke-width": 0.2
    }));
  } else {
    g.appendChild(svgElement("circle", {
      cx: x, cy: y, r: type.size,
      fill: type.color, stroke: piece.type === "ball" ? "#222" : "#fff", "stroke-width": 0.35
    }));
  }

  if (piece.label) {
    const text = svgElement("text", {
      x: x, y: y + 0.9, "text-anchor": "middle", "font-size": 2.6,
      "font-family": "sans-serif", "font-weight": "bold", fill: "#fff"
    });
    text.textContent = piece.label;
    g.appendChild(text);
  }

  // A bigger invisible circle makes pieces easier to grab with a finger
  if (options.editable) {
    g.appendChild(svgElement("circle", { cx: x, cy: y, r: Math.max(type.size, 3), fill: "transparent" }));
  }

  group.appendChild(g);
}

// Dashed line from where each piece was in the previous frame, so coaches can see the movement
function drawTrails(group, animation, frameIndex) {
  if (frameIndex === 0) return;
  const before = animation.frames[frameIndex - 1];
  const now = animation.frames[frameIndex];

  animation.pieces.forEach(function (piece) {
    const a = before[piece.id];
    const b = now[piece.id];
    if (!a || !b || (a[0] === b[0] && a[1] === b[1])) return;
    group.appendChild(svgElement("line", {
      x1: a[0], y1: a[1], x2: b[0], y2: b[1],
      stroke: "rgba(255,255,255,0.7)", "stroke-width": 0.4, "stroke-dasharray": "1 1"
    }));
    group.appendChild(svgElement("circle", { cx: a[0], cy: a[1], r: 1, fill: "rgba(255,255,255,0.4)" }));
  });
}

function drawPieces(svg, animation, positions, options) {
  const group = svg.querySelector(".pieces");
  group.innerHTML = "";
  if (options.trailsForFrame !== undefined) drawTrails(group, animation, options.trailsForFrame);

  // Goals and cones first, so players and the ball sit on top of them
  const order = ["goal", "cone", "defender", "attacker", "ball"];
  order.forEach(function (type) {
    animation.pieces.forEach(function (piece) {
      if (piece.type === type && positions[piece.id]) drawPiece(group, piece, positions[piece.id], options);
    });
  });
}

// Positions part of the way between two frames (amount goes from 0 to 1)
function positionsBetween(animation, fromFrame, toFrame, amount) {
  const eased = amount < 0.5 ? 2 * amount * amount : 1 - Math.pow(-2 * amount + 2, 2) / 2; // ease in and out
  const result = {};
  animation.pieces.forEach(function (piece) {
    const a = fromFrame[piece.id];
    const b = toFrame[piece.id] || a;
    if (!a) return;
    result[piece.id] = [a[0] + (b[0] - a[0]) * eased, a[1] + (b[1] - a[1]) * eased];
  });
  return result;
}

// Checks that saved animation data looks right before we draw it
function isValidAnimation(animation) {
  return Boolean(
    animation &&
    Array.isArray(animation.pieces) && animation.pieces.length > 0 &&
    Array.isArray(animation.frames) && animation.frames.length > 0 &&
    animation.pieces.every(function (piece) {
      return PIECE_TYPES[piece.type] && typeof piece.id === "string";
    })
  );
}

// ---------- Player (used in the drill popup) ----------

function createAnimationPlayer(container, animation) {
  const svg = createPitch();
  const controls = document.createElement("div");
  controls.className = "animation-controls";
  controls.innerHTML = `
    <button type="button" class="play-button">❚❚ Pause</button>
    <button type="button" class="restart-button secondary">↺ Restart</button>
    <span class="frame-counter"></span>
  `;
  container.appendChild(svg);
  if (animation.frames.length > 1) container.appendChild(controls);

  const playButton = controls.querySelector(".play-button");
  const counter = controls.querySelector(".frame-counter");
  const msPerFrame = (animation.secondsPerFrame || 1) * 1000;
  const pauseAtEnd = 800;
  const totalTime = (animation.frames.length - 1) * msPerFrame + pauseAtEnd;

  let elapsed = 0;
  let playing = animation.frames.length > 1;
  let lastTime = null;
  let rafId = null;

  function drawAt(time) {
    const step = Math.min(time / msPerFrame, animation.frames.length - 1);
    const index = Math.floor(step);
    const next = Math.min(index + 1, animation.frames.length - 1);
    drawPieces(svg, animation, positionsBetween(animation, animation.frames[index], animation.frames[next], step - index), {});
    counter.textContent = "Step " + (Math.min(index + 1, animation.frames.length)) + " of " + animation.frames.length;
  }

  function tick(now) {
    if (lastTime !== null) elapsed = (elapsed + (now - lastTime)) % totalTime; // loops back to the start
    lastTime = now;
    drawAt(elapsed);
    rafId = requestAnimationFrame(tick);
  }

  function play() {
    playing = true;
    lastTime = null;
    playButton.textContent = "❚❚ Pause";
    rafId = requestAnimationFrame(tick);
  }

  function pause() {
    playing = false;
    playButton.textContent = "▶ Play";
    cancelAnimationFrame(rafId);
  }

  playButton.addEventListener("click", function () {
    if (playing) pause();
    else play();
  });

  controls.querySelector(".restart-button").addEventListener("click", function () {
    elapsed = 0;
    drawAt(0);
    if (!playing) play();
  });

  drawAt(0);
  if (playing) play();

  return {
    stop: function () {
      cancelAnimationFrame(rafId);
    }
  };
}

// ---------- Editor (used in the "Add a drill" form) ----------

function createAnimationEditor(container, startingAnimation) {
  // Work on a copy so Cancel doesn't change the original
  const animation = startingAnimation
    ? JSON.parse(JSON.stringify(startingAnimation))
    : { pieces: [], frames: [{}], secondsPerFrame: 1 };

  let frameIndex = 0;
  let selectedId = null;
  let draggingId = null;
  let preview = null;
  let nextId = 1;
  animation.pieces.forEach(function (piece) {
    const n = Number(piece.id.slice(1));
    if (n >= nextId) nextId = n + 1;
  });

  container.innerHTML = `
    <div class="animator">
      <div class="animator-toolbar">
        <span>Add:</span>
        ${Object.keys(PIECE_TYPES).map(function (type) {
          return `<button type="button" class="secondary" data-add="${type}">${PIECE_TYPES[type].name}</button>`;
        }).join("")}
        <button type="button" class="secondary" data-action="delete-piece" disabled>Remove selected</button>
      </div>
      <div class="animator-pitch"></div>
      <div class="animator-frames">
        <span>Steps:</span>
        <span class="frame-buttons"></span>
        <button type="button" data-action="add-frame">+ Add step</button>
        <button type="button" class="secondary" data-action="delete-frame">Delete step</button>
      </div>
      <div class="animator-frames">
        <button type="button" data-action="preview">▶ Preview</button>
        <label>Speed
          <select data-action="speed">
            <option value="1.5">Slow</option>
            <option value="1">Normal</option>
            <option value="0.6">Fast</option>
          </select>
        </label>
      </div>
      <p class="animator-help">
        Click a button above to add a piece, then drag it into place. Then click <strong>+ Add step</strong>
        and drag the pieces to where they move next. Dashed lines show the movement.
      </p>
      <p class="animator-error" hidden></p>
    </div>
  `;

  const svg = createPitch();
  container.querySelector(".animator-pitch").appendChild(svg);
  const speedSelect = container.querySelector('[data-action="speed"]');
  speedSelect.value = String(animation.secondsPerFrame || 1);

  function showError(text) {
    const error = container.querySelector(".animator-error");
    error.textContent = text;
    error.hidden = !text;
  }

  function render() {
    drawPieces(svg, animation, animation.frames[frameIndex], {
      editable: true,
      selectedId: selectedId,
      trailsForFrame: frameIndex
    });

    container.querySelector(".frame-buttons").innerHTML = animation.frames.map(function (frame, i) {
      return `<button type="button" class="frame-button ${i === frameIndex ? "" : "secondary"}" data-frame="${i}">${i + 1}</button>`;
    }).join("");

    container.querySelector('[data-action="delete-piece"]').disabled = !selectedId;
    container.querySelector('[data-action="delete-frame"]').disabled = animation.frames.length === 1;
    container.querySelector('[data-action="add-frame"]').disabled = animation.frames.length >= MAX_FRAMES;
  }

  function stopPreview() {
    if (!preview) return;
    preview.stop();
    preview = null;
    container.querySelector(".animator-preview").remove();
    container.querySelector(".animator-pitch").hidden = false;
    container.querySelector('[data-action="preview"]').textContent = "▶ Preview";
  }

  function addPiece(type) {
    if (animation.pieces.length >= MAX_PIECES) {
      showError("That's the most pieces one animation can have (" + MAX_PIECES + ").");
      return;
    }
    const sameType = animation.pieces.filter(function (p) {
      return p.type === type;
    }).length;
    const label = type === "attacker" || type === "defender" ? String(sameType + 1) : "";
    const piece = { id: "p" + nextId++, type: type, label: label };

    // Start new pieces near the middle, spread out a little so they don't stack
    const x = 30 + ((animation.pieces.length * 7) % 40);
    const y = 20 + ((animation.pieces.length * 5) % 24);
    animation.pieces.push(piece);
    animation.frames.forEach(function (frame) {
      frame[piece.id] = [x, y];
    });
    selectedId = piece.id;
    render();
  }

  // Turn a mouse/finger position on screen into pitch coordinates
  function pitchPoint(event) {
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const p = point.matrixTransform(svg.getScreenCTM().inverse());
    // Keep pieces a little inside the edge so they don't get cut off
    return [
      Math.round(Math.min(Math.max(p.x, 2.5), PITCH_WIDTH - 2.5) * 10) / 10,
      Math.round(Math.min(Math.max(p.y, 2.5), PITCH_HEIGHT - 2.5) * 10) / 10
    ];
  }

  svg.addEventListener("pointerdown", function (event) {
    const pieceEl = event.target.closest(".piece");
    selectedId = pieceEl ? pieceEl.dataset.id : null;
    if (pieceEl) {
      draggingId = selectedId;
      svg.setPointerCapture(event.pointerId);
      event.preventDefault();
    }
    render();
  });

  svg.addEventListener("pointermove", function (event) {
    if (!draggingId) return;
    animation.frames[frameIndex][draggingId] = pitchPoint(event);
    render();
  });

  function endDrag() {
    draggingId = null;
  }
  svg.addEventListener("pointerup", endDrag);
  svg.addEventListener("pointercancel", endDrag);

  container.querySelector(".animator").addEventListener("click", function (event) {
    const button = event.target.closest("button");
    if (!button) return;
    showError("");

    if (button.dataset.add) {
      stopPreview();
      addPiece(button.dataset.add);
    } else if (button.dataset.frame !== undefined) {
      stopPreview();
      frameIndex = Number(button.dataset.frame);
      render();
    } else if (button.dataset.action === "add-frame") {
      stopPreview();
      // The new step starts as a copy of the current one, then the coach moves pieces
      animation.frames.splice(frameIndex + 1, 0, JSON.parse(JSON.stringify(animation.frames[frameIndex])));
      frameIndex++;
      render();
    } else if (button.dataset.action === "delete-frame") {
      stopPreview();
      animation.frames.splice(frameIndex, 1);
      frameIndex = Math.max(0, frameIndex - 1);
      render();
    } else if (button.dataset.action === "delete-piece") {
      stopPreview();
      animation.pieces = animation.pieces.filter(function (p) {
        return p.id !== selectedId;
      });
      animation.frames.forEach(function (frame) {
        delete frame[selectedId];
      });
      selectedId = null;
      render();
    } else if (button.dataset.action === "preview") {
      if (preview) {
        stopPreview();
        return;
      }
      if (animation.pieces.length === 0) {
        showError("Add some pieces first.");
        return;
      }
      const box = document.createElement("div");
      box.className = "animator-preview";
      container.querySelector(".animator-pitch").after(box);
      container.querySelector(".animator-pitch").hidden = true;
      preview = createAnimationPlayer(box, JSON.parse(JSON.stringify(animation)));
      button.textContent = "✎ Back to editing";
    }
  });

  speedSelect.addEventListener("change", function () {
    animation.secondsPerFrame = Number(speedSelect.value);
  });

  // Delete / Backspace removes the selected piece (but not while typing in a box)
  container.addEventListener("keydown", function (event) {
    if ((event.key === "Delete" || event.key === "Backspace") && selectedId && event.target.tagName !== "INPUT") {
      container.querySelector('[data-action="delete-piece"]').click();
      event.preventDefault();
    }
  });

  render();

  return {
    // The finished animation, or null if nothing was added
    getAnimation: function () {
      if (animation.pieces.length === 0) return null;
      return JSON.parse(JSON.stringify(animation));
    },
    destroy: function () {
      stopPreview();
      container.innerHTML = "";
    }
  };
}
