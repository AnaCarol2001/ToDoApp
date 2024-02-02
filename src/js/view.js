/**
 * VIEW - Responsible for UI
 */
export default class View extends EventTarget {
  $ = {};
  saved_theme = localStorage.getItem("theme") || "";
  constructor() {
    super();
    this.$.form = this.#getElement("#form");
    this.$.taskList = this.#getElement("#task-list");
    this.$.taskCount = this.#getElement("#task-count");
    this.$.clearBtn = this.#getElement("#clear-completed");
    this.$.filtersBtn = this.#getElement("#filters-btn");
    this.$.themeBtn = this.#getElement("#theme-btn");
    this.$.draggedTask = null;
  }

  init(tasks) {
    this.#setTheme(this.saved_theme);
    this.$.themeBtn.addEventListener("click", () => this.#themeHandler());
    this.$.filtersBtn.addEventListener("click", (e) => this.#filterTasks(e));
    this.$.taskList.addEventListener("dragstart", (e) =>
      this.#dragStartHandler(e)
    );
    this.$.taskList.addEventListener("dragover", (e) =>
      this.#dragOvertHandler(e)
    );
    this.$.taskList.addEventListener("drop", (e) => this.#dropHandler(e));
    this.render(tasks);
  }

  render(tasks) {
    this.#renderTasksList(tasks);
    this.$.taskCount.textContent = tasks.filter(
      (task) => !task.isComplete
    ).length;
    this.$.filtersBtn.querySelector("button[data-filter].active").click();
  }

  /**
   * Event Listeners
   */
  bindFormEvent(handler) {
    this.$.form.addEventListener("submit", handler);
  }
  bindTaskListEvent(handler) {
    this.$.taskList.addEventListener("click", handler);
  }

  bindClearBtnEvent(handler) {
    this.$.clearBtn.addEventListener("click", handler);
  }

  /**
   * Utility Methods
   */

  get listOrder() {
    return [...this.$.taskList.children].map((taskLi) => +taskLi.id);
  }

  #filterTasks(e) {
    const filter = e.target.dataset.filter;
    const taskState = filter == "completed";
    let count = 0;

    this.#getElement("li#info")?.remove();

    [...this.$.taskList.children].forEach((taskLi) => {
      const check = taskLi.querySelector('input[type="checkbox"]').checked;
      if (check === taskState || filter === "all") {
        taskLi.removeAttribute("hidden");
        count++;
      } else taskLi.setAttribute("hidden", "");
    });

    [...this.$.filtersBtn.children].forEach((button) =>
      button.dataset.filter === filter
        ? button.classList.add("active")
        : button.classList.remove("active")
    );

    let message = filter == "all" ? "" : filter;

    if (count === 0) {
      const info = this.#createTaskLI({
        id: "info",
        taskContent: `no ${message} tasks.`,
        isComplete: false,
      });

      this.$.taskList.append(info);
    }
  }

  #renderTasksList(tasks) {
    const LI_ELEMENTS = tasks.map((task) => this.#createTaskLI(task));

    this.$.taskList.replaceChildren(...LI_ELEMENTS);
  }

  #createTaskLI(task) {
    const LI_TEMPLATE = document
      .getElementById("listItem")
      .content.cloneNode(true);
    const LI = LI_TEMPLATE.querySelector("li");
    LI.id = task.id;

    const INPUT = LI.querySelector("input");
    INPUT.id = INPUT.name = "Task" + task.id;
    INPUT.checked = task.isComplete;

    const LABEL = LI.querySelector("label");
    LABEL.textContent = task.taskContent;
    LABEL.setAttribute("for", "Task" + task.id);

    return LI;
  }

  #getElement(query) {
    return document.querySelector(query);
  }

  #dragStartHandler(e) {
    const target = e.target;
    if (!target.matches("li")) return;

    this.$.draggedTask = target;
    this.$.draggedTask.style.opacity = 0.5;
  }

  #dragOvertHandler(e) {
    e.preventDefault();
    const target = e.target;

    const middleTarget =
      target.getBoundingClientRect().top + target.offsetHeight / 2;

    if (
      target == this.$.draggedTask ||
      !target.matches("li") ||
      this.$.draggedTask == null
    )
      return;

    if (e.clientY > middleTarget) {
      this.$.taskList.insertBefore(target, this.$.draggedTask);
    } else {
      this.$.taskList.insertBefore(this.$.draggedTask, target);
    }
  }

  #dropHandler(e) {
    e.preventDefault();
    this.$.draggedTask.style.opacity = 1;
    this.dispatchEvent(new Event("listorderchange"));
  }

  #themeHandler() {
    this.#setTheme(this.saved_theme === "light" ? "dark" : "light");
  }

  #setTheme(theme) {
    let newTheme = null;

    if (!theme) {
      window.matchMedia("(prefers-color-scheme : dark)").matches
        ? (newTheme = "dark")
        : (newTheme = "light");
    } else newTheme = theme;

    document.body.dataset.theme = newTheme;
    this.$.themeBtn.title =
      newTheme == "dark" ? "Disable Dark Mode" : "Enable Dark Mode";
    this.saved_theme = newTheme;
    localStorage.setItem("theme", newTheme);
  }
}
