// HTML Elements and Global Varibles
const $FORM = document.getElementById("form");
const $TASKS_LIST = document.getElementById("task-list");
const $TASK_COUNT = document.querySelector(".task-count-js");
const $CLEAR_BTN = document.getElementById("clearCompleted");
const $FILTERS = document.querySelector(".filter-btns-js");

const TASKS_DATA = JSON.parse(localStorage.getItem("task_list")) || {};

// Functions
function createListItem(task_obj) {
  const LI = document.createElement("li");
  LI.id = task_obj.id;
  LI.draggable = true;

  const INPUT = document.createElement("input");
  INPUT.type = "checkbox";
  INPUT.id = INPUT.name = "Task" + task_obj.id;
  INPUT.checked = task_obj.taskChecked;

  const LABEL = document.createElement("label");
  LABEL.textContent = task_obj.task;
  LABEL.setAttribute("for", "Task" + task_obj.id);

  const BUTTON = document.createElement("button");
  BUTTON.type = "button";
  BUTTON.classList.add("button", "button--remove");
  BUTTON.innerHTML = `<span class="sr-only">Remove task</span>
    <span aria-hidden="true" class="material-symbols-outlined">
      close
    </span>`;

  LI.append(INPUT, LABEL, BUTTON);
  return LI;
}

function randomId() {
  let numberId = Math.floor(Math.random() * 100);
  return numberId;
}

function addTask(content) {
  let taskId = randomId();
  let task = {
    id: taskId,
    task: content,
    taskChecked: false,
  };

  const LI_ELEMENT = createListItem(task);
  $TASKS_LIST.appendChild(LI_ELEMENT);

  TASKS_DATA[taskId] = task;

  updateLocalStorage();
}

function updateLocalStorage() {
  activeTasks();
  localStorage.setItem("task_list", JSON.stringify(TASKS_DATA));
}

function updateStatus(task_id, checkedValue) {
  TASKS_DATA[task_id].taskChecked = checkedValue;
  updateLocalStorage();
}

function removeTask(taskId, element) {
  delete TASKS_DATA[taskId];
  element.remove();
  updateLocalStorage();
}

function filterTasks(filter = "all") {
  let completedTasks = $TASKS_LIST.querySelectorAll("li:has(input:checked)");
  let activeTasks = $TASKS_LIST.querySelectorAll("li:has(input:not(:checked))");

  switch (filter) {
    case "active":
      completedTasks.forEach((task) => task.classList.add("d-none"));
      activeTasks.forEach((task) => task.classList.remove("d-none"));
      break;
    case "completed":
      completedTasks.forEach((task) => task.classList.remove("d-none"));
      activeTasks.forEach((task) => task.classList.add("d-none"));
      break;
    default:
      completedTasks.forEach((task) => task.classList.remove("d-none"));
      activeTasks.forEach((task) => task.classList.remove("d-none"));
      break;
  }
}

function activeTasks() {
  $TASK_COUNT.textContent = $TASKS_LIST.querySelectorAll(
    "li:has(input:not(:checked))"
  ).length;
}

// Events
$TASKS_LIST.addEventListener("click", (e) => {
  let target = e.target;
  let li = target.closest("li");
  if (e.target.matches("input[type=checkbox]")) {
    updateStatus(li.id, target.checked);
  }

  if (e.target.matches("button.button--remove")) {
    removeTask(li.id, li);
  }
});

$FILTERS.addEventListener("click", (e) => {
  const $BTNS = $FILTERS.querySelectorAll("button");
  let target = e.target;
  let tasks;

  $BTNS.forEach((btn) => (btn.ariaSelected = false));
  if (target.dataset.filter == "active") {
    tasks = filterTasks("active");
    target.ariaSelected = true;
  } else if (target.dataset.filter == "completed") {
    tasks = filterTasks("completed");
    target.ariaSelected = true;
  } else {
    tasks = filterTasks();
    target.ariaSelected = true;
  }
});

$CLEAR_BTN.addEventListener("click", () => {
  $TASKS_LIST.querySelectorAll("li:has(input:checked)").forEach((task) => {
    removeTask(task.id, task);
  });
});

$FORM.addEventListener("submit", (e) => {
  e.preventDefault();

  addTask($FORM["add-task"].value);
  $FORM["add-task"].value = "";
  $FORM["add-task"].focus();
});

window.onload = () => {
  Object.values(TASKS_DATA).forEach((task) =>
    $TASKS_LIST.appendChild(createListItem(task))
  );
  activeTasks();
};
