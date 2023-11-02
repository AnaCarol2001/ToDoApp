const $FORM = document.getElementById("form");
const $TASKS_LIST = document.getElementById("task-list");
const $TASK_COUNT = document.querySelector(".task-count-js");

const TASKS_DATA = JSON.parse(localStorage.getItem("task_list")) || {};

Object.values(TASKS_DATA).forEach((task) =>
  $TASKS_LIST.appendChild(createListItem(task))
);
activeTasks();

$FORM.addEventListener("submit", (e) => {
  e.preventDefault();

  addTask($FORM["add-task"].value);
  $FORM["add-task"].value = "";
});

function createListItem(task_obj) {
  const LI = document.createElement("li");
  LI.id = task_obj.id;
  LI.draggable = true;

  const INPUT = document.createElement("input");
  INPUT.type = "checkbox";
  INPUT.id = INPUT.name = "Task" + task_obj.id;
  INPUT.checked = task_obj.taskChecked;
  INPUT.addEventListener("click", updateStatus);

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
  BUTTON.addEventListener("click", removeTask);

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

function updateStatus() {
  TASKS_DATA[this.parentNode.id].taskChecked = this.checked;
  updateLocalStorage();
}

function removeTask() {
  delete TASKS_DATA[this.parentNode.id];
  this.parentNode.remove();
  updateLocalStorage();
}

document.getElementById("activeTasks").addEventListener("click", () => {
  let elements = activeTasks().map((task) => createListItem(task));
  $TASKS_LIST.replaceChildren(...elements);
});

document.getElementById("completedTasks").addEventListener("click", () => {
  let elements = completedTasks().map((task) => createListItem(task));
  $TASKS_LIST.replaceChildren(...elements);
});

document.getElementById("clearCompleted").addEventListener("click", () => {
  completedTasks().forEach((task) => {
    delete TASKS_DATA[task.id];
    document.getElementById(task.id).remove();
  });
  updateLocalStorage();
});

function activeTasks() {
  let active = Object.values(TASKS_DATA).filter((task) => !task.taskChecked);
  $TASK_COUNT.textContent = active.length;
  return active;
}

function completedTasks() {
  let completed = Object.values(TASKS_DATA).filter((task) => task.taskChecked);
  return completed;
}

const $ALL_BTN = document.querySelector("#allTasks");
$ALL_BTN.addEventListener("click", () => {
  let elements = Object.values(TASKS_DATA).map((task) => createListItem(task));
  $TASKS_LIST.replaceChildren(...elements);
});
