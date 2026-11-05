// Drills uploaded by coaches.
//
// Uploaded drills live in the "drills" table in Supabase, and anyone can see them.
// Only the coach who uploaded a drill can edit or delete it.
// Photos and videos go into Supabase Storage (the "drill-media" bucket).
// Uses supabaseClient and currentUser from sessions.js.

const MAX_MEDIA_MB = 20;
const STARTER_SKILLS = ["Ball Control", "Defending", "Dribbling", "Finishing", "Fitness", "Passing"];

// ---------- Loading uploaded drills ----------

function drillFromRow(row) {
  return {
    id: row.id,
    uploaded: true,
    userId: row.user_id,
    name: row.name,
    category: row.category,
    phase: row.phase || undefined,
    playerCount: row.player_count,
    skill: row.skill,
    difficulty: row.difficulty,
    equipment: row.equipment,
    description: row.description,
    setup: row.setup || undefined,
    steps: cleanList(row.steps),
    coachingPoints: cleanList(row.coaching_points),
    mediaUrl: row.media_url,
    mediaType: row.media_type,
    mediaPath: row.media_path,
    authorName: row.author_name || null, // null means the coach posted anonymously
    animation: isValidAnimation(row.animation) ? row.animation : null
  };
}

// A list from the database (steps or coaching points), or null if there isn't one
function cleanList(list) {
  if (!Array.isArray(list)) return null;
  const items = list.filter(function (item) {
    return typeof item === "string" && item.trim();
  });
  return items.length ? items : null;
}

async function loadUploadedDrills() {
  if (!supabaseClient) return;

  const { data, error } = await supabaseClient
    .from("drills")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Couldn't load uploaded drills:", error.message);
    return;
  }

  // Take out the old copies of uploaded drills, then put the fresh ones at the top (newest first)
  for (let i = drills.length - 1; i >= 0; i--) {
    if (drills[i].uploaded) drills.splice(i, 1);
  }
  drills.unshift(...data.map(drillFromRow));

  buildSkillOptions();
  applyFilters();
  renderSession(); // session drills that were waiting for these can show their names now
}

// ---------- The "Add a drill" form ----------

const uploadDialog = document.getElementById("upload-dialog");
let editingDrill = null;     // the drill being edited, or null when adding a new one
let mediaFile = null;        // a photo/video the coach just picked
let removeOldMedia = false;  // true if they removed the drill's existing photo/video
let previewUrl = null;
let animationEditor = null;

function formField(id) {
  return document.getElementById(id);
}

function showUploadMessage(text, isError) {
  const message = formField("upload-message");
  message.textContent = text;
  message.hidden = !text;
  message.classList.toggle("error", Boolean(isError));
}

function renderSkillCheckboxes(checked) {
  const skills = STARTER_SKILLS.slice();
  allSkills().forEach(function (skill) {
    if (!skills.includes(skill)) skills.push(skill);
  });
  skills.sort();

  formField("f-skills").innerHTML = skills.map(function (skill) {
    return `
      <label>
        <input type="checkbox" value="${escapeHTML(skill)}" ${checked.includes(skill) ? "checked" : ""}>
        ${escapeHTML(skill)}
      </label>
    `;
  }).join("");
}

function showMediaPreview(url, type) {
  const preview = formField("f-media-preview");
  if (!url) {
    preview.innerHTML = "";
  } else if (type === "video") {
    preview.innerHTML = `<video src="${escapeHTML(url)}" controls muted playsinline></video>`;
  } else {
    preview.innerHTML = `<img src="${escapeHTML(url)}" alt="Preview">`;
  }
  formField("f-media-remove").hidden = !url;
}

// ---------- Step and coaching point lists ----------

const MAX_LIST_ROWS = 15;
const LIST_PLACEHOLDERS = {
  "f-steps": "e.g. The winger passes inside to the striker",
  "f-points": "e.g. Time your run so you arrive as the pass is played"
};

function addListRow(listId, value, afterRow) {
  const list = formField(listId);
  if (list.children.length >= MAX_LIST_ROWS) return null;

  const row = document.createElement("li");
  row.innerHTML = `
    <div class="list-row">
      <input type="text" maxlength="250">
      <button type="button" class="secondary remove-row" aria-label="Remove">✕</button>
    </div>
  `;
  const input = row.querySelector("input");
  input.value = value || "";
  input.placeholder = LIST_PLACEHOLDERS[listId];

  if (afterRow) afterRow.after(row);
  else list.appendChild(row);
  return input;
}

// Fill a list with items, plus empty boxes so there are at least `minRows`
function fillList(listId, items, minRows) {
  formField(listId).innerHTML = "";
  (items || []).forEach(function (item) {
    addListRow(listId, item);
  });
  while (formField(listId).children.length < minRows) addListRow(listId, "");
}

// The text in each box, skipping empty ones
function listValues(listId) {
  const values = [];
  formField(listId).querySelectorAll("input").forEach(function (input) {
    if (input.value.trim()) values.push(input.value.trim());
  });
  return values;
}

// Older uploaded drills have everything in one description. Pull out its numbered lines
// as steps and its "-" lines as coaching points, so editing them fills the new boxes.
function splitOldDescription(text) {
  const result = { summary: [], steps: [], points: [] };
  String(text || "").split("\n").forEach(function (rawLine) {
    const line = rawLine.trim();
    const numbered = line.match(/^\d+[.)]\s+(.*)/);
    const bullet = line.match(/^[-•*]\s+(.*)/);
    if (numbered) result.steps.push(numbered[1]);
    else if (bullet) result.points.push(bullet[1]);
    else if (line) result.summary.push(line);
  });
  return { summary: result.summary.join("\n"), steps: result.steps, points: result.points };
}

document.querySelectorAll("[data-add-row]").forEach(function (button) {
  button.addEventListener("click", function () {
    const input = addListRow(button.dataset.addRow, "");
    if (input) input.focus();
  });
});

["f-steps", "f-points"].forEach(function (listId) {
  const list = formField(listId);

  // ✕ removes a box (the last one just gets cleared)
  list.addEventListener("click", function (event) {
    if (!event.target.classList.contains("remove-row")) return;
    const row = event.target.closest("li");
    if (list.children.length > 1) row.remove();
    else row.querySelector("input").value = "";
  });

  // Enter adds a new box below instead of submitting the form
  list.addEventListener("keydown", function (event) {
    if (event.key !== "Enter" || event.target.tagName !== "INPUT") return;
    event.preventDefault();
    const input = addListRow(listId, "", event.target.closest("li"));
    if (input) input.focus();
  });
});

function startAnimationEditor(animation) {
  formField("f-animation-start").hidden = true;
  formField("f-animation-remove").hidden = false;
  animationEditor = createAnimationEditor(formField("f-animator"), animation);
}

function removeAnimationEditor() {
  if (animationEditor) animationEditor.destroy();
  animationEditor = null;
  formField("f-animation-start").hidden = false;
  formField("f-animation-remove").hidden = true;
}

function resetMediaChoice() {
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = null;
  mediaFile = null;
  removeOldMedia = false;
  formField("f-media").value = "";
}

function openDrillForm(drill) {
  // Only logged-in coaches can add drills
  if (!currentUser) {
    setAccountMode("login");
    showAccountMessage("Log in or sign up to add your own drills.");
    accountDialog.showModal();
    return;
  }

  editingDrill = drill || null;
  formField("drill-form").reset();
  resetMediaChoice();
  removeAnimationEditor();
  showUploadMessage("");

  formField("upload-title").textContent = drill ? "Edit drill" : "Add a drill";
  formField("upload-submit").textContent = drill ? "Save changes" : "Publish drill";

  const skills = drill ? drillSkills(drill) : [];
  renderSkillCheckboxes(skills);

  if (drill) {
    formField("f-name").value = drill.name;
    if (drill.steps) {
      formField("f-description").value = drill.description;
      formField("f-setup").value = drill.setup || "";
      fillList("f-steps", drill.steps, 1);
      fillList("f-points", drill.coachingPoints, 1);
    } else {
      const old = splitOldDescription(drill.description);
      formField("f-description").value = old.summary;
      fillList("f-steps", old.steps, 3);
      fillList("f-points", old.points, 2);
    }
    formField("f-category").value = drill.category;
    formField("f-difficulty").value = drill.difficulty;
    formField("f-players").value = drill.playerCount || "";
    formField("f-phase").value = drill.phase || "";
    formField("f-equipment").value = drill.equipment || "";
    formField("f-author").value = drill.authorName || savedDisplayName();
    formField("f-anonymous").checked = !drill.authorName;
    showMediaPreview(safeMediaUrl(drill.mediaUrl), drill.mediaType);
    if (drill.animation) startAnimationEditor(drill.animation);
  } else {
    fillList("f-steps", [], 3);
    fillList("f-points", [], 2);
    formField("f-author").value = savedDisplayName();
    formField("f-anonymous").checked = false;
    showMediaPreview(null);
  }
  updateAuthorField();

  uploadDialog.showModal();
  uploadDialog.querySelector("article").scrollTop = 0;
}

function editDrill(drill) {
  openDrillForm(drill);
}

function closeDrillForm() {
  removeAnimationEditor();
  resetMediaChoice();
  showMediaPreview(null);
  uploadDialog.close();
}

// Has the coach filled anything in? (So we can ask before throwing it away)
function formHasContent() {
  return Boolean(
    editingDrill ||
    formField("f-name").value.trim() ||
    formField("f-description").value.trim() ||
    formField("f-setup").value.trim() ||
    listValues("f-steps").length ||
    listValues("f-points").length ||
    mediaFile ||
    (animationEditor && animationEditor.getAnimation())
  );
}

function askToCloseForm() {
  if (!formHasContent()) {
    closeDrillForm();
    return;
  }
  askConfirm(
    editingDrill ? "Discard your changes?" : "Discard this drill?",
    "Anything you've filled in will be lost.",
    "Discard",
    closeDrillForm
  );
}

formField("add-drill-button").addEventListener("click", function () {
  openDrillForm(null);
});

formField("upload-cancel").addEventListener("click", askToCloseForm);

// Pressing Esc shouldn't wipe out a half-finished drill without asking
uploadDialog.addEventListener("cancel", function (event) {
  event.preventDefault();
  askToCloseForm();
});

formField("f-media").addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > MAX_MEDIA_MB * 1024 * 1024) {
    showUploadMessage("That file is too big. Please pick one under " + MAX_MEDIA_MB + " MB.", true);
    event.target.value = "";
    return;
  }
  showUploadMessage("");

  if (previewUrl) URL.revokeObjectURL(previewUrl);
  mediaFile = file;
  previewUrl = URL.createObjectURL(file);
  showMediaPreview(previewUrl, file.type.startsWith("video/") ? "video" : "image");
});

formField("f-media-remove").addEventListener("click", function () {
  resetMediaChoice();
  removeOldMedia = Boolean(editingDrill && editingDrill.mediaUrl);
  showMediaPreview(null);
});

formField("f-animation-start").addEventListener("click", function () {
  startAnimationEditor(null);
});

formField("f-animation-remove").addEventListener("click", function () {
  askConfirm("Remove the animation?", "The pieces and steps you've made will be deleted.", "Remove", removeAnimationEditor);
});

// The name this coach used last time, so they don't have to type it again
function savedDisplayName() {
  return (currentUser && currentUser.user_metadata && currentUser.user_metadata.display_name) || "";
}

// "Post anonymously" greys out the name box
function updateAuthorField() {
  formField("f-author").disabled = formField("f-anonymous").checked;
}

formField("f-anonymous").addEventListener("change", updateAuthorField);

// ---------- Saving ----------

function chosenSkills() {
  const skills = [];
  formField("f-skills").querySelectorAll("input:checked").forEach(function (box) {
    skills.push(box.value);
  });
  formField("f-other-skills").value.split(",").forEach(function (skill) {
    // Capitalize each word, so "ball control" matches "Ball Control"
    const tidy = skill.trim().toLowerCase().replace(/\b\w/g, function (letter) {
      return letter.toUpperCase();
    });
    if (tidy && !skills.includes(tidy)) skills.push(tidy);
  });
  return skills;
}

async function uploadMedia(file) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-60);
  // Each coach's files go in a folder named after their user id (the storage rules check this)
  const path = currentUser.id + "/" + Date.now() + "-" + safeName;

  const { error } = await supabaseClient.storage
    .from("drill-media")
    .upload(path, file, { contentType: file.type });
  if (error) throw error;

  const { data } = supabaseClient.storage.from("drill-media").getPublicUrl(path);
  return {
    path: path,
    url: data.publicUrl,
    type: file.type.startsWith("video/") ? "video" : "image"
  };
}

function deleteMediaFile(path) {
  if (!path) return;
  // If this fails the file is just left unused in storage, so we don't stop for it
  supabaseClient.storage.from("drill-media").remove([path]);
}

formField("drill-form").addEventListener("submit", async function (event) {
  event.preventDefault();

  const name = formField("f-name").value.trim();
  const description = formField("f-description").value.trim();
  const skills = chosenSkills();
  const players = formField("f-players").value;

  if (!name) return showUploadMessage("Give your drill a name.", true);
  const steps = listValues("f-steps");
  const points = listValues("f-points");
  if (!description) return showUploadMessage("Add a short summary of the drill.", true);
  if (steps.length === 0) return showUploadMessage("Add at least one step under \"How it works\".", true);
  if (skills.length === 0) return showUploadMessage("Pick at least one skill.", true);
  if (players && (players < 1 || players > 50)) return showUploadMessage("Players should be between 1 and 50.", true);

  const anonymous = formField("f-anonymous").checked;
  const authorName = formField("f-author").value.trim();
  if (!anonymous && !authorName) {
    return showUploadMessage("Add your name, or tick \"Post anonymously\".", true);
  }

  const submit = formField("upload-submit");
  submit.disabled = true;
  submit.setAttribute("aria-busy", "true");
  showUploadMessage(mediaFile ? "Uploading..." : "");

  // Start from the drill's current photo/video (if editing), then apply changes
  let media = editingDrill
    ? { url: editingDrill.mediaUrl, type: editingDrill.mediaType, path: editingDrill.mediaPath }
    : { url: null, type: null, path: null };
  const oldPath = media.path;
  let newUpload = null;

  try {
    if (removeOldMedia || mediaFile) media = { url: null, type: null, path: null };
    if (mediaFile) {
      newUpload = await uploadMedia(mediaFile);
      media = newUpload;
    }

    const row = {
      name: name,
      description: description,
      setup: formField("f-setup").value.trim() || null,
      steps: steps,
      coaching_points: points.length ? points : null,
      category: formField("f-category").value,
      difficulty: formField("f-difficulty").value,
      player_count: players ? Number(players) : null,
      phase: formField("f-phase").value || null,
      skill: skills.join(", "),
      equipment: formField("f-equipment").value.trim() || null,
      media_url: media.url,
      media_type: media.type,
      media_path: media.path,
      animation: animationEditor ? animationEditor.getAnimation() : null,
      author_name: anonymous ? null : authorName
    };

    let saved;
    if (editingDrill) {
      const { data, error } = await supabaseClient.from("drills").update(row).eq("id", editingDrill.id).select();
      if (error) throw error;
      if (!data || data.length === 0) throw new Error("you can only edit your own drills");
      saved = data[0];
    } else {
      const { data, error } = await supabaseClient.from("drills").insert(row).select().single();
      if (error) throw error;
      saved = data;
    }

    // Remember their name for next time (stored on their account, not shown anywhere else)
    if (!anonymous && authorName !== savedDisplayName() && supabaseClient.auth.updateUser) {
      supabaseClient.auth.updateUser({ data: { display_name: authorName } });
    }

    // The old photo/video was replaced or removed, so delete the file
    if (oldPath && oldPath !== media.path) deleteMediaFile(oldPath);

    submit.disabled = false;
    submit.removeAttribute("aria-busy");
    closeDrillForm();
    await loadUploadedDrills();

    const drill = findDrill(saved.id);
    if (drill) openDrill(drill); // show the coach their finished drill
  } catch (error) {
    // Don't leave an uploaded file behind if saving the drill failed
    if (newUpload) deleteMediaFile(newUpload.path);
    const message = String(error.message);
    if (["author_name", "setup", "steps", "coaching_points"].some(function (column) {
      return message.includes("'" + column + "'");
    })) {
      // The database is missing one of the newer columns
      showUploadMessage("The database needs an update before drills can be saved: run supabase-drill-details.sql in Supabase (see SUPABASE_SETUP.md).", true);
    } else {
      showUploadMessage("Couldn't save the drill: " + error.message, true);
    }
    submit.disabled = false;
    submit.removeAttribute("aria-busy");
  }
});

// ---------- Deleting ----------

function deleteDrill(drill) {
  askConfirm(
    "Delete this drill?",
    '"' + drill.name + '" will be removed from the library for everyone. You can\'t undo this.',
    "Delete",
    async function () {
      const { error } = await supabaseClient.from("drills").delete().eq("id", drill.id);
      if (error) {
        askConfirm("Couldn't delete the drill", error.message, "OK", null);
        return;
      }
      deleteMediaFile(drill.mediaPath);
      closeDrillDialog();
      await loadUploadedDrills();
    }
  );
}

// ---------- Start ----------

if (supabaseClient) {
  formField("add-drill-row").hidden = false;
  loadUploadedDrills();

  // "Your drill" tags and Edit buttons depend on who's logged in
  supabaseClient.auth.onAuthStateChange(function () {
    setTimeout(applyFilters, 0);
  });
}
