const addTaskBtn = document.getElementById("addTask");
const taskContainer = document.getElementById("taskContainer");
const searchInput = document.getElementById("searchInput");
const themeToggle = document.getElementById("themeToggle");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Tema salvo
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.body.classList.add("dark");
  themeToggle.textContent = "☀️ Light Mode";
}

// Toggle tema
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
    themeToggle.textContent = "☀️ Light Mode";
  } else {
    localStorage.setItem("theme", "light");
    themeToggle.textContent = "🌙 Dark Mode";
  }
});

// Proteção contra XSS
function sanitize(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function updateDashboard() {
  const today = new Date().toISOString().split("T")[0];

  document.getElementById("totalTasks").textContent = tasks.length;
  document.getElementById("highPriority").textContent =
    tasks.filter(t => t.priority === "Alta").length;
  document.getElementById("dueToday").textContent =
    tasks.filter(t => t.deadline === today).length;
}

function renderTasks(filter = "") {
  taskContainer.innerHTML = "";

  const filtered = tasks.filter(task =>
    task.title.toLowerCase().includes(filter.toLowerCase()) ||
    task.responsible.toLowerCase().includes(filter.toLowerCase())
  );

  if (filtered.length === 0) {
    taskContainer.innerHTML = `
      <div class="empty-state">
        <span>📭</span>
        Nenhuma tarefa encontrada.
      </div>
    `;
    updateDashboard();
    return;
  }

  filtered.forEach(task => {
    const card = document.createElement("div");
    card.classList.add("task-card");
    if (task.completed) card.classList.add("completed");

    const priorityMap = { "Baixa": "low", "Média": "medium", "Alta": "high" };
    const priorityClass = priorityMap[task.priority] || "low";

    card.innerHTML = `
      <h3>${sanitize(task.title)}</h3>
      <p><strong>Responsável:</strong> ${sanitize(task.responsible)}</p>
      <p><strong>Prazo:</strong> ${formatDate(task.deadline)}</p>
      <span class="priority ${priorityClass}">${sanitize(task.priority)}</span>
      <div class="task-buttons">
        <button class="complete-btn" data-id="${task.id}">
          ${task.completed ? "Reabrir" : "Concluir"}
        </button>
        <button class="delete-btn" data-id="${task.id}">Excluir</button>
      </div>
    `;

    taskContainer.appendChild(card);
  });

  // Event delegation — evita onclick inline
  taskContainer.querySelectorAll(".complete-btn").forEach(btn => {
    btn.addEventListener("click", () => toggleComplete(Number(btn.dataset.id)));
  });

  taskContainer.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => deleteTask(Number(btn.dataset.id)));
  });

  updateDashboard();
}

function formatDate(date) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

// Adicionar tarefa
addTaskBtn.addEventListener("click", () => {
  const title = document.getElementById("title").value.trim();
  const responsible = document.getElementById("responsible").value.trim();
  const deadline = document.getElementById("deadline").value;
  const priority = document.getElementById("priority").value;

  if (!title || !responsible || !deadline) {
    alert("Preencha todos os campos antes de adicionar.");
    return;
  }

  const newTask = {
    id: Date.now(),
    title,
    responsible,
    deadline,
    priority,
    completed: false
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks(searchInput.value);

  document.getElementById("title").value = "";
  document.getElementById("responsible").value = "";
  document.getElementById("deadline").value = "";
  document.getElementById("priority").value = "Baixa";
});

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks(searchInput.value);
}

function toggleComplete(id) {
  tasks = tasks.map(t =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );
  saveTasks();
  renderTasks(searchInput.value);
}

searchInput.addEventListener("input", () => {
  renderTasks(searchInput.value);
});

renderTasks();
