const taskInput = document.getElementById("taskEntry");
const addBtn = document.getElementById("submitNewTask");
const taskList = document.getElementById("taskDisplayList");
const prioritySelect = document.getElementById("taskPrioritySelect");
const charCounter = document.getElementById("charLimiter");
const emptyState = document.getElementById("emptyStateMsg");

const modal = document.getElementById("confirmModal");
const modalMessage = document.getElementById("modalMessage");
const confirmBtn = document.getElementById("modalConfirm");
const cancelBtn = document.getElementById("modalCancel");

let modalResolve = null;
function showModal(message) {
  modalMessage.textContent = message;
  modal.classList.add("active");
  return new Promise((resolve) => {
    modalResolve = resolve;
  });
}
confirmBtn.onclick = () => {
  modal.classList.remove("active");
  if (modalResolve) modalResolve(true);
};
cancelBtn.onclick = () => {
  modal.classList.remove("active");
  if (modalResolve) modalResolve(false);
};

function updateCharacterCounter() {
  const length = taskInput.value.length;
  charCounter.textContent = `${length}/100`;
  charCounter.classList.remove("warned", "over");

  if (length >= 90 && length <= 100) {
    charCounter.classList.add("warned");
  } else if (length > 100) {
    charCounter.classList.add("over");
  }
}

taskInput.addEventListener("input", updateCharacterCounter);
addBtn.addEventListener("click", () => {
  if (taskInput.value.trim() && taskInput.value.length <= 100) {
    createTask(taskInput.value.trim(), prioritySelect.value);
    taskInput.value = "";
    updateCharacterCounter();
    prioritySelect.value = "Medium";
    saveAllTasks();
  }
});

taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && taskInput.value.trim() && taskInput.value.length <= 100) {
    addBtn.click();
  }
});

function createTask(taskName, priority) {
  const card = document.createElement("li");
  card.className = "taskCard";
  const label = document.createElement("span");
  label.textContent = taskName;

  const priorityTag = document.createElement("span");
  priorityTag.className = `priorityIndicator ${priority}`;
  priorityTag.textContent = priority;

  const functions = document.createElement("div");
  functions.className = "taskFunctions";

  const editIcon = document.createElement("button");
  editIcon.innerHTML = `<i class="fas fa-pen"></i>`;
  editIcon.title = "Edit Task";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.title = "Complete Task";

  const trashIcon = document.createElement("button");
  trashIcon.innerHTML = `<i class="fas fa-trash"></i>`;
  trashIcon.title = "Delete Task";

  functions.append(priorityTag, editIcon, checkbox, trashIcon);
  card.append(label, functions);
  taskList.appendChild(card);
  checkEmptyState();

  editIcon.addEventListener("click", () => {
    const input = document.createElement("input");
    input.className = "editingField";
    input.value = label.textContent;

    card.replaceChild(input, label);
    input.focus();

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        label.textContent = input.value.trim() || "Untitled Task";
        card.replaceChild(label, input);
        saveAllTasks();
      }
    });
  });

  checkbox.addEventListener("change", async () => {
    if (checkbox.checked) {
      const confirmed = await showModal("Are you sure you want to check-off and delete this task?");
      if (confirmed) {
        taskList.removeChild(card);
        saveAllTasks();
        checkEmptyState();
      } else {
        checkbox.checked = false;
      }
    }
  });

  trashIcon.addEventListener("click", () => {
    taskList.removeChild(card);
    saveAllTasks();
    checkEmptyState();
  });
}

function checkEmptyState() {
  emptyState.style.display = taskList.children.length === 0 ? "block" : "none";
}

function saveAllTasks() {
  const tasks = [];
  taskList.querySelectorAll(".taskCard").forEach((card) => {
    const name = card.querySelector("span").textContent;
    const priority = card.querySelector(".priorityIndicator").textContent;
    tasks.push({ name, priority });
  });
  localStorage.setItem("todoTasks", JSON.stringify(tasks));
}

function loadAllTasks() {
  const tasks = JSON.parse(localStorage.getItem("todoTasks")) || [];
  tasks.forEach((task) => createTask(task.name, task.priority));
}

loadAllTasks();
updateCharacterCounter();
