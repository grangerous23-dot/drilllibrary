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
    mediaUrl: row.media_url,
    mediaType: row.media_type,
    mediaPath: row.media_path,
    animation: isValidAnimation(row.animation) ? row.animation : null
  };
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
    formField("f-description").value = drill.description;
    formField("f-category").value = drill.category;
    formField("f-difficulty").value = drill.difficulty;
    formField("f-players").value = drill.playerCount || "";
    formField("f-phase").value = drill.phase || "";
    formField("f-equipment").value = drill.equipment || "";
    showMediaPreview(safeMediaUrl(drill.mediaUrl), drill.mediaType);
    if (drill.animation) startAnimationEditor(drill.animation);
  } else {
    showMediaPreview(null);
  }

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
  if (!description) return showUploadMessage("Add a description so coaches know how to run it.", true);
  if (skills.length === 0) return showUploadMessage("Pick at least one skill.", true);
  if (players && (players < 1 || players > 50)) return showUploadMessage("Players should be between 1 and 50.", true);

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
      category: formField("f-category").value,
      difficulty: formField("f-difficulty").value,
      player_count: players ? Number(players) : null,
      phase: formField("f-phase").value || null,
      skill: skills.join(", "),
      equipment: formField("f-equipment").value.trim() || null,
      media_url: media.url,
      media_type: media.type,
      media_path: media.path,
      animation: animationEditor ? animationEditor.getAnimation() : null
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
    showUploadMessage("Couldn't save the drill: " + error.message, true);
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
