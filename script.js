const taskInput = document.getElementById('taskEntry');
const addTaskBtn = document.getElementById('submitNewTask');
const prioritySelect = document.getElementById('taskPrioritySelect');
const taskList = document.getElementById('taskDisplayList');
const emptyStateMsg = document.getElementById('emptyStateMsg');
const charLimiter = document.getElementById('charLimiter');
const taskTemplate = document.getElementById('taskTemplate');

const confirmModal = document.getElementById('confirmModal');
const modalMessage = document.getElementById('modalMessage');
const modalConfirmBtn = document.getElementById('modalConfirm');
const modalCancelBtn = document.getElementById('modalCancel');

let taskToDelete = null;
let deleteAction = '';

updateCharCount();
loadTasks();

taskInput.addEventListener('input', updateCharCount);
addTaskBtn.addEventListener('click', handleAddTask);
modalCancelBtn.addEventListener('click', () => {
  confirmModal.classList.remove('active');
  taskToDelete = null;
  deleteAction = '';
});
modalConfirmBtn.addEventListener('click', () => {
  if (taskToDelete) {
    const text = taskToDelete.querySelector('.taskText').textContent;
    const priority = taskToDelete.classList.contains('high') ? 'High' :
                     taskToDelete.classList.contains('medium') ? 'Medium' : 'Low';
    deleteTaskFromStorage(text, priority);
    taskToDelete.remove();
    checkEmptyState();
    taskToDelete = null;
    deleteAction = '';
  }
  confirmModal.classList.remove('active');
});

function updateCharCount() {
  charLimiter.textContent = `${taskInput.value.length}/100`;
}

const priorityOrder = { High: 3, Medium: 2, Low: 1 };

function handleAddTask() {
  const text = taskInput.value.trim();
  const priority = prioritySelect.value;
  if (!text) return;

  const taskData = { text, priority };
  createTaskElement(taskData);
  saveTaskToStorage(taskData);

  taskInput.value = '';
  updateCharCount();
  checkEmptyState();
}

function createTaskElement({ text, priority }) {
  const clone = taskTemplate.content.cloneNode(true);
  const taskItem = clone.querySelector('.taskItem');
  const taskText = clone.querySelector('.taskText');
  const editBtn = clone.querySelector('.editBtn');
  const deleteBtn = clone.querySelector('.deleteBtn');

  taskItem.classList.add(priority.toLowerCase());
  taskText.textContent = text;

  const completeBtn = document.createElement('button');
  completeBtn.className = 'iconBtn completeBtn';
  completeBtn.title = 'Complete task';
  completeBtn.textContent = '✔️';

  completeBtn.addEventListener('click', () => {
    taskToDelete = taskItem;
    deleteAction = 'complete';
    modalMessage.textContent = 'Are you sure you want to complete this task?';
    confirmModal.classList.add('active');
  });

  deleteBtn.textContent = '🗑️';
  deleteBtn.title = 'Delete task';
  deleteBtn.addEventListener('click', () => {
    taskToDelete = taskItem;
    deleteAction = 'delete';
    modalMessage.textContent = 'Are you sure you want to delete this task?';
    confirmModal.classList.add('active');
  });

  editBtn.textContent = '✏️';
  editBtn.title = 'Edit task';
  editBtn.addEventListener('click', () => enableTaskEditing(taskText, taskItem, priority));

  const taskActions = clone.querySelector('.taskActions');
  taskActions.prepend(completeBtn);

  const children = Array.from(taskList.children);
  let inserted = false;
  for (const child of children) {
    const childPriority = child.classList.contains('high') ? 3 :
                          child.classList.contains('medium') ? 2 : 1;
    if (priorityOrder[priority] > childPriority) {
      taskList.insertBefore(taskItem, child);
      inserted = true;
      break;
    }
  }
  if (!inserted) {
    taskList.appendChild(taskItem);
  }

  taskItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function checkEmptyState() {
  emptyStateMsg.style.display = taskList.children.length === 0 ? 'block' : 'none';
}

function enableTaskEditing(taskTextElem, taskItem, priority) {
  const originalText = taskTextElem.textContent;
  const input = document.createElement('input');
  input.type = 'text';
  input.value = originalText;
  input.maxLength = 100;
  input.className = 'editInput';

  taskTextElem.replaceWith(input);
  input.focus();

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      finishEdit(input, taskItem, originalText, priority);
    }
  });

  input.addEventListener('blur', () => {
    finishEdit(input, taskItem, originalText, priority);
  });
}

function finishEdit(inputElem, taskItem, oldText, priority) {
  const newText = inputElem.value.trim() || 'Untitled Task';
  const span = document.createElement('span');
  span.className = 'taskText';
  span.textContent = newText;
  inputElem.replaceWith(span);

  const editBtn = taskItem.querySelector('.editBtn');
  editBtn.onclick = () => enableTaskEditing(span, taskItem, priority);

  updateTaskInStorage(oldText, newText, priority);
}

function saveTaskToStorage(task) {
  const tasks = JSON.parse(localStorage.getItem('todoTasks')) || [];
  tasks.push(task);
  localStorage.setItem('todoTasks', JSON.stringify(tasks));
}

function deleteTaskFromStorage(text, priority) {
  let tasks = JSON.parse(localStorage.getItem('todoTasks')) || [];
  tasks = tasks.filter(task => !(task.text === text && task.priority === priority));
  localStorage.setItem('todoTasks', JSON.stringify(tasks));
}

function updateTaskInStorage(oldText, newText, priority) {
  const tasks = JSON.parse(localStorage.getItem('todoTasks')) || [];
  const index = tasks.findIndex(task => task.text === oldText && task.priority === priority);
  if (index !== -1) {
    tasks[index].text = newText;
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
  }
}

function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem('todoTasks')) || [];
  tasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
  tasks.forEach(task => createTaskElement(task));
  checkEmptyState();
}
