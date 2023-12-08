/*-----------------------*/
/* Global Variables      */
/*----------------------*/

const STORAGE_KEY = "task_list";
let task_data;

/**
 * Saves tasks to local storage
 */
function updateLocalStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(task_data));
}

/*------------------------*/
/* Add Tasks              */
/*------------------------*/

const $FORM = document.getElementById("form");
const $TASKS_LIST = document.getElementById("task-list");

// Form handler
$FORM.addEventListener("submit", (e) => {
  e.preventDefault();

  addTask($FORM["add-task"].value);
  $FORM["add-task"].value = "";
  $FORM["add-task"].focus();
});

/**
 * Creates and adds a task to the local storage and UI
 * @param {String} content
 * @returns
 */
function addTask(content) {
  let taskId = randomId();

  if (taskId.error) {
    return { error: taskId.error };
  }

  let task = {
    id: taskId,
    task: content,
    taskChecked: false,
  };

  const LI_ELEMENT = createListItem(task);
  $TASKS_LIST.appendChild(LI_ELEMENT);

  task_data.push(task);

  activeTasks();
  updateLocalStorage();
}

/**
 * Creates a list item (li) element of the task list
 * @param {Object} task_obj
 * @returns {Node} Task list List Item
 */
function createListItem(task_obj) {
  const LI_TEMPLATE = document
    .getElementById("listItem")
    .content.cloneNode(true);
  const LI = LI_TEMPLATE.querySelector("li");
  LI.id = task_obj.id;

  const INPUT = LI.querySelector("input");
  INPUT.id = INPUT.name = "Task" + task_obj.id;
  INPUT.checked = task_obj.taskChecked;

  const LABEL = LI.querySelector("label");
  LABEL.textContent = task_obj.task;
  LABEL.setAttribute("for", "Task" + task_obj.id);

  return LI;
}

/**
 * Retuns a number that isn't used currently as an ID. The maximum is 100.
 * @returns {Number} A number between 0 and 100
 */
function randomId() {
  let usedIds = task_data.map((task) => task.id);
  if (usedIds.length >= 100) {
    return { error: "Maximum task limit reached." };
  }
  let numberId = Math.floor(Math.random() * 100);
  if (usedIds.indexOf(numberId) === -1) {
    return numberId;
  }
  return randomId();
}

/*-------------------------------*/
/* Tasks Manipulation            */
/* check, remove,                */
/*-------------------------------*/

// The click event handler in the task list
$TASKS_LIST.addEventListener("click", (e) => {
  let target = e.target;
  let li = target.closest("li");
  if (e.target.matches("input[type=checkbox]")) {
    updateStatus(li.id, target.checked);
  }

  if (e.target.matches("button.button--remove")) {
    removeTask(li);
  }
  activeTasks();
  updateLocalStorage();
});

/**
 * Updates task check status on the task data array
 * @param {String} task_id
 * @param {Boolean} checkedValue
 */
function updateStatus(task_id, checkedValue) {
  task_data.find((task) => task.id === +task_id).taskChecked = checkedValue;
}

/**
 * Removes the task from the task list array and UI
 * @param {Node} element
 */
function removeTask(element) {
  task_data.splice(
    task_data.findIndex((task) => task.id === element.id),
    1
  );
  element.remove();
}

/*-------------------------------*/
/* Drag and Drop                 */
/*-------------------------------*/

// Dragstar event handler
let draggedTask = null;
$TASKS_LIST.addEventListener("dragstart", (e) => {
  if (e.target.tagName === "LI") {
    draggedTask = e.target;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", draggedTask);
    draggedTask.style.opacity = 0.5;
  }
});

// Dragover event handler
$TASKS_LIST.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  let target = e.target;

  // checks if the dragged element and dragover element are LI and if they are different.
  if (
    target !== draggedTask &&
    target.tagName === "LI" &&
    draggedTask.tagName === "LI"
  ) {
    // If the dragover element is in the top half or above the dragged task, insert it after the dragged task.
    if (
      e.clientY >
      target.getBoundingClientRect().top + target.offsetHeight / 2
    ) {
      $TASKS_LIST.insertBefore(target, draggedTask);
    } else {
      $TASKS_LIST.insertBefore(draggedTask, target);
    }
  }
});

// the drop event handler and reorders based on the new ID order
$TASKS_LIST.addEventListener("drop", (e) => {
  e.preventDefault();
  draggedTask.style.opacity = 1;
  let newOrder = [...$TASKS_LIST.childNodes].map((li) => +li.id);
  reorderArray(newOrder);
});

/**
 * Reorders the tasks list based on another array of IDs
 * @param {Array} newOrder
 */
function reorderArray(newOrder) {
  let currentOrder = task_data.map((task) => task.id);

  // Checks if the order of the tasks has changed and arrays have the same length
  if (
    !currentOrder.every((val, index) => val === newOrder[index]) &&
    currentOrder.length === newOrder.length
  ) {
    // reorder tasks
    task_data.sort((a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id));
    updateLocalStorage();
  }
}

/*-------------------------------*/
/* Filter Buttons                */
/*-------------------------------*/

const $CLEAR_BTN = document.getElementById("clearCompleted");
const $FILTERS = document.querySelector(".filter-btns-js");

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

// Removes all completed tasks
$CLEAR_BTN.addEventListener("click", () => {
  $TASKS_LIST.querySelectorAll("li:has(input:checked)").forEach((task) => {
    removeTask(task);
  });
});

/**
 * Shows all tasks, active tasks, or only the completed tasks.
 * @param {String} filter
 */
function filterTasks(filter = "all") {
  $TASKS_LIST
    .querySelectorAll("li")
    .forEach((task) => task.classList.add("d-none"));
  switch (filter) {
    case "active":
      let activeTasks = $TASKS_LIST.querySelectorAll(
        "li:has(input:not(:checked))"
      );
      activeTasks.forEach((task) => task.classList.remove("d-none"));
      break;
    case "completed":
      let completedTasks = $TASKS_LIST.querySelectorAll(
        "li:has(input:checked)"
      );
      completedTasks.forEach((task) => task.classList.remove("d-none"));
      break;
    default:
      $TASKS_LIST
        .querySelectorAll("li")
        .forEach((task) => task.classList.remove("d-none"));
      break;
  }
}

/**
 * Updates the count of active tasks
 */
function activeTasks() {
  const $TASK_COUNT = document.querySelector(".task-count-js");
  $TASK_COUNT.textContent = $TASKS_LIST.querySelectorAll(
    "li:has(input:not(:checked))"
  ).length;
}

/*----------------------*/
/* INIT                 */
/*----------------------*/

function init() {
  task_data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  task_data.forEach((task) => $TASKS_LIST.appendChild(createListItem(task)));
  activeTasks();
}

window.onload = () => {
  init();
};
