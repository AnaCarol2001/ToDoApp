import Store from "./store.js";
import View from "./view.js";

/**
 * CONTROLLER - Responsible for connecting the Model to the View
 */

const STORAGE_KEY = "task_list";

function appInit() {
  const store = new Store(STORAGE_KEY);
  const view = new View();

  view.init(store.allTasks);

  store.addEventListener("statechange", () => {
    view.render(store.allTasks);
  });

  view.addEventListener("listorderchange", () => {
    store.reorderList(view.listOrder);
  });

  view.bindFormEvent((e) => {
    e.preventDefault();
    const form = e.target;
    store.newTask(form["add-task"].value);
    form.reset();
  });

  view.bindClearBtnEvent(() => {
    store.removeAllCompletedTasks();
  });

  view.bindTaskListEvent((e) => {
    const target = e.target;
    if (target.matches('input[type="checkbox"]')) {
      store.setTaskState(+target.parentNode.id, target.checked);
    }

    if (target.matches('button[data-id="remove-task"]')) {
      store.removeTask(target.parentNode.id);
    }
  });
}

onload = appInit;
