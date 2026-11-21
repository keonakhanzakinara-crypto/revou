/* ============================================
   GREETING, CLOCK & CUSTOM NAME
   ============================================ */
const NAME_KEY = "kiro_name";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning,";
  if (hour < 17) return "Good afternoon,";
  if (hour < 21) return "Good evening,";
  return "Good night,";
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(date) {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function updateClock() {
  const now = new Date();
  document.getElementById("clock").textContent = formatTime(now);
  document.getElementById("date").textContent = formatDate(now);
  document.getElementById("greeting-text").textContent = getGreeting();
}

updateClock();
setInterval(updateClock, 1000);

// --- Custom name ---
const greetingNameEl    = document.getElementById("greeting-name");
const greetingNameInput = document.getElementById("greeting-name-input");

function loadName() {
  return localStorage.getItem(NAME_KEY) || "Friend";
}

function saveName(name) {
  localStorage.setItem(NAME_KEY, name);
}

function applyName(name) {
  greetingNameEl.textContent = name || "Friend";
}

function enterEditName() {
  greetingNameInput.value = greetingNameEl.textContent === "Friend"
    ? ""
    : greetingNameEl.textContent;
  greetingNameEl.style.display = "none";
  greetingNameInput.classList.add("active");
  greetingNameInput.focus();
  greetingNameInput.select();
}

function commitName() {
  const val = greetingNameInput.value.trim();
  const name = val || "Friend";
  saveName(name);
  applyName(name);
  greetingNameInput.classList.remove("active");
  greetingNameEl.style.display = "";
}

greetingNameEl.addEventListener("click", enterEditName);

greetingNameInput.addEventListener("blur", commitName);

greetingNameInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") commitName();
  if (e.key === "Escape") {
    greetingNameInput.classList.remove("active");
    greetingNameEl.style.display = "";
  }
});

applyName(loadName());

/* ============================================
   FOCUS TIMER
   ============================================ */
const TIMER_DURATION_KEY = "kiro_timer_duration";

function loadTimerDuration() {
  const stored = parseInt(localStorage.getItem(TIMER_DURATION_KEY), 10);
  return (stored > 0 && stored <= 120) ? stored : 25;
}

function saveTimerDuration(minutes) {
  localStorage.setItem(TIMER_DURATION_KEY, minutes);
}

let timerMinutes   = loadTimerDuration();
let timerTotal     = timerMinutes * 60;
let timerRemaining = timerTotal;
let timerInterval  = null;
let timerRunning   = false;

const timerEl          = document.getElementById("timer-time");
const progressBar      = document.getElementById("timer-progress-bar");
const startBtn         = document.getElementById("timer-start");
const stopBtn          = document.getElementById("timer-stop");
const resetBtn         = document.getElementById("timer-reset");
const timerLabelEl     = document.getElementById("timer-label");
const durationInput    = document.getElementById("timer-duration-input");
const setDurationBtn   = document.getElementById("timer-set-btn");

// Sync the input field to the stored duration
durationInput.value = timerMinutes;

function formatTimerDisplay(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function updateTimerDisplay() {
  timerEl.textContent = formatTimerDisplay(timerRemaining);

  const pct = timerTotal > 0 ? (timerRemaining / timerTotal) * 100 : 0;
  progressBar.style.width = pct + "%";

  timerEl.classList.remove("warning", "danger");
  if (timerRemaining <= 60) {
    timerEl.classList.add("danger");
  } else if (timerRemaining <= 5 * 60) {
    timerEl.classList.add("warning");
  }
}

function setTimerLocked(locked) {
  durationInput.disabled = locked;
  setDurationBtn.disabled = locked;
}

function timerTick() {
  if (timerRemaining <= 0) {
    clearInterval(timerInterval);
    timerInterval  = null;
    timerRunning   = false;
    startBtn.textContent = "▶ Start";
    timerLabelEl.textContent = "Session complete! 🎉";
    timerEl.classList.add("danger");
    setTimerLocked(false);
    return;
  }
  timerRemaining--;
  updateTimerDisplay();
}

startBtn.addEventListener("click", function () {
  if (timerRunning) {
    // Pause
    clearInterval(timerInterval);
    timerInterval = null;
    timerRunning  = false;
    startBtn.textContent = "▶ Resume";
    timerLabelEl.textContent = "Paused";
    setTimerLocked(false);
  } else {
    // Start / Resume
    if (timerRemaining === 0) return;
    timerInterval = setInterval(timerTick, 1000);
    timerRunning  = true;
    startBtn.textContent = "⏸ Pause";
    timerLabelEl.textContent = "Focus session running…";
    setTimerLocked(true);
  }
});

stopBtn.addEventListener("click", function () {
  clearInterval(timerInterval);
  timerInterval = null;
  timerRunning  = false;
  startBtn.textContent = "▶ Start";
  timerLabelEl.textContent = "Stopped";
  setTimerLocked(false);
});

resetBtn.addEventListener("click", function () {
  clearInterval(timerInterval);
  timerInterval  = null;
  timerRunning   = false;
  timerRemaining = timerTotal;
  startBtn.textContent = "▶ Start";
  timerLabelEl.textContent = `${timerMinutes}-minute focus session`;
  updateTimerDisplay();
  setTimerLocked(false);
});

function applyNewDuration(minutes) {
  timerMinutes   = minutes;
  timerTotal     = minutes * 60;
  timerRemaining = timerTotal;
  saveTimerDuration(minutes);
  durationInput.value = minutes;
  timerLabelEl.textContent = `${minutes}-minute focus session`;
  startBtn.textContent = "▶ Start";
  updateTimerDisplay();
}

setDurationBtn.addEventListener("click", function () {
  let val = parseInt(durationInput.value, 10);
  if (isNaN(val) || val < 1)   val = 1;
  if (val > 120) val = 120;
  applyNewDuration(val);
});

durationInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") setDurationBtn.click();
});

// Clamp value on blur so it always shows a valid number
durationInput.addEventListener("blur", function () {
  let val = parseInt(durationInput.value, 10);
  if (isNaN(val) || val < 1) durationInput.value = 1;
  if (val > 120)             durationInput.value = 120;
});

updateTimerDisplay();

/* ============================================
   TO-DO LIST
   ============================================ */
const TODO_KEY = "kiro_todos";

function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(TODO_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTodos(todos) {
  localStorage.setItem(TODO_KEY, JSON.stringify(todos));
}

function isDuplicate(text, todos) {
  const lower = text.toLowerCase();
  return todos.some(function (t) { return t.text.toLowerCase() === lower; });
}

function showDuplicateError(input) {
  const msg = document.getElementById("todo-duplicate-msg");
  msg.textContent = "⚠ That task already exists!";

  input.classList.remove("shake"); // reset if already animating
  // Force reflow so the animation restarts
  void input.offsetWidth;
  input.classList.add("shake");

  input.addEventListener("animationend", function handler() {
    input.classList.remove("shake");
    input.removeEventListener("animationend", handler);
  });

  // Clear the message after 2.5 s
  clearTimeout(input._dupTimeout);
  input._dupTimeout = setTimeout(function () {
    msg.textContent = "";
  }, 2500);
}

function renderTodos() {
  const todos = loadTodos();
  const list    = document.getElementById("todo-list");
  const counter = document.getElementById("todo-counter");
  list.innerHTML = "";

  const done = todos.filter(function (t) { return t.done; }).length;
  counter.textContent = `${done}/${todos.length} done`;

  if (todos.length === 0) {
    list.innerHTML = '<li class="todo-empty">No tasks yet. Add one above!</li>';
    return;
  }

  todos.forEach(function (todo, index) {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.done ? " done" : "");

    const checkbox = document.createElement("input");
    checkbox.type      = "checkbox";
    checkbox.className = "todo-checkbox";
    checkbox.checked   = todo.done;
    checkbox.addEventListener("change", function () { toggleTodo(index); });

    const textSpan = document.createElement("span");
    textSpan.className   = "todo-text";
    textSpan.textContent = todo.text;

    const actions = document.createElement("div");
    actions.className = "todo-actions";

    const editBtn = document.createElement("button");
    editBtn.className   = "btn-icon";
    editBtn.title       = "Edit";
    editBtn.textContent = "✏️";
    editBtn.addEventListener("click", function () {
      startEditTodo(index, li, textSpan);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.className   = "btn-icon danger";
    deleteBtn.title       = "Delete";
    deleteBtn.textContent = "🗑️";
    deleteBtn.addEventListener("click", function () { deleteTodo(index); });

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    li.appendChild(checkbox);
    li.appendChild(textSpan);
    li.appendChild(actions);
    list.appendChild(li);
  });
}

function addTodo() {
  const input = document.getElementById("todo-input");
  const text  = input.value.trim();
  if (!text) return;

  const todos = loadTodos();

  if (isDuplicate(text, todos)) {
    showDuplicateError(input);
    return;
  }

  // Clear any lingering error message
  document.getElementById("todo-duplicate-msg").textContent = "";

  todos.push({ text: text, done: false });
  saveTodos(todos);
  input.value = "";
  renderTodos();
}

function toggleTodo(index) {
  const todos = loadTodos();
  todos[index].done = !todos[index].done;
  saveTodos(todos);
  renderTodos();
}

function deleteTodo(index) {
  const todos = loadTodos();
  todos.splice(index, 1);
  saveTodos(todos);
  renderTodos();
}

function startEditTodo(index, li, textSpan) {
  const todos       = loadTodos();
  const currentText = todos[index].text;

  const editInput = document.createElement("input");
  editInput.className = "todo-edit-input";
  editInput.value     = currentText;

  li.replaceChild(editInput, textSpan);
  editInput.focus();
  editInput.select();

  function saveEdit() {
    const newText = editInput.value.trim();
    if (newText && newText.toLowerCase() !== currentText.toLowerCase()) {
      // Check duplicate against all OTHER tasks
      const others = todos.filter(function (_, i) { return i !== index; });
      if (isDuplicate(newText, others)) {
        editInput.style.borderBottomColor = "var(--danger)";
        editInput.addEventListener("animationend", function () {});
        // restore original on duplicate
        renderTodos();
        return;
      }
      todos[index].text = newText;
      saveTodos(todos);
    }
    renderTodos();
  }

  editInput.addEventListener("blur",    saveEdit);
  editInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter")  { e.preventDefault(); saveEdit(); }
    if (e.key === "Escape") renderTodos();
  });
}

function clearDoneTodos() {
  const todos = loadTodos().filter(function (t) { return !t.done; });
  saveTodos(todos);
  renderTodos();
}

document.getElementById("todo-add-btn").addEventListener("click", addTodo);
document.getElementById("todo-input").addEventListener("keydown", function (e) {
  if (e.key === "Enter") addTodo();
});
document.getElementById("todo-clear-btn").addEventListener("click", clearDoneTodos);

renderTodos();

/* ============================================
   QUICK LINKS
   ============================================ */
const LINKS_KEY = "kiro_links";

const DEFAULT_LINKS = [
  { name: "Google",  url: "https://google.com" },
  { name: "GitHub",  url: "https://github.com" },
  { name: "YouTube", url: "https://youtube.com" },
];

function loadLinks() {
  try {
    const stored = localStorage.getItem(LINKS_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_LINKS;
  } catch {
    return DEFAULT_LINKS;
  }
}

function saveLinks(links) {
  localStorage.setItem(LINKS_KEY, JSON.stringify(links));
}

function getFavicon(url) {
  try {
    const origin = new URL(url).origin;
    return `https://www.google.com/s2/favicons?sz=32&domain=${origin}`;
  } catch {
    return null;
  }
}

function renderLinks() {
  const links = loadLinks();
  const grid  = document.getElementById("links-grid");
  grid.innerHTML = "";

  if (links.length === 0) {
    grid.innerHTML = '<span class="links-empty">No links saved yet.</span>';
    return;
  }

  links.forEach(function (link, index) {
    const chip = document.createElement("a");
    chip.className = "link-chip";
    chip.href      = link.url;
    chip.target    = "_blank";
    chip.rel       = "noopener noreferrer";

    const favicon = getFavicon(link.url);
    if (favicon) {
      const img  = document.createElement("img");
      img.src    = favicon;
      img.alt    = "";
      img.onerror = function () { this.style.display = "none"; };
      chip.appendChild(img);
    }

    const nameSpan = document.createElement("span");
    nameSpan.textContent = link.name;
    chip.appendChild(nameSpan);

    const removeBtn = document.createElement("button");
    removeBtn.className   = "link-chip-remove";
    removeBtn.title       = "Remove link";
    removeBtn.textContent = "×";
    removeBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      removeLink(index);
    });
    chip.appendChild(removeBtn);

    grid.appendChild(chip);
  });
}

function removeLink(index) {
  const links = loadLinks();
  links.splice(index, 1);
  saveLinks(links);
  renderLinks();
}

function addLink() {
  const nameInput = document.getElementById("link-name-input");
  const urlInput  = document.getElementById("link-url-input");

  const name = nameInput.value.trim();
  let   url  = urlInput.value.trim();

  if (!name || !url) return;

  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }

  const links = loadLinks();
  links.push({ name, url });
  saveLinks(links);

  nameInput.value = "";
  urlInput.value  = "";
  toggleAddLinkForm(false);
  renderLinks();
}

function toggleAddLinkForm(forceState) {
  const form = document.getElementById("add-link-form");
  const btn  = document.getElementById("toggle-add-link-btn");
  const show = forceState !== undefined
    ? forceState
    : !form.classList.contains("visible");

  if (show) {
    form.classList.add("visible");
    btn.textContent = "✕ Cancel";
    document.getElementById("link-name-input").focus();
  } else {
    form.classList.remove("visible");
    btn.textContent = "+ Add Link";
  }
}

document.getElementById("toggle-add-link-btn").addEventListener("click", function () {
  toggleAddLinkForm();
});

document.getElementById("link-save-btn").addEventListener("click", addLink);

document.getElementById("link-url-input").addEventListener("keydown", function (e) {
  if (e.key === "Enter") addLink();
});

document.getElementById("link-name-input").addEventListener("keydown", function (e) {
  if (e.key === "Enter") document.getElementById("link-url-input").focus();
});

renderLinks();
