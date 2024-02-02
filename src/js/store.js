const initialTasks = [
  {
    id: 0,
    taskContent: "Finish JavaScript course.",
    isComplete: true,
  },
  {
    id: 1,
    taskContent: "Complete this project.",
    isComplete: true,
  },
  {
    id: 2,
    taskContent: "Deploy this project.",
    isComplete: false,
  },
];

/**
 * MODEL - Responsible for managing data in localStorage
 */

export default class Store extends EventTarget {
  constructor(storageKey) {
    super();
    this.storageKey = storageKey;
  }

  get allTasks() {
    return JSON.parse(JSON.stringify(this.#getState()));
  }

  setTaskState(taskId, newState) {
    const prevState = JSON.parse(JSON.stringify(this.#getState()));
    prevState.find((task) => task.id === taskId).isComplete = newState;

    this.#setState(prevState);
  }

  newTask(taskContent) {
    const prevState = JSON.parse(JSON.stringify(this.#getState()));
    let taskId = this.#taskId();

    const newTask = {
      id: taskId,
      taskContent,
      state: false,
    };

    prevState.push(newTask);
    this.#setState(prevState);
  }

  removeTask(taskId) {
    const prevState = JSON.parse(JSON.stringify(this.#getState()));

    prevState.splice(
      prevState.findIndex((task) => task.id === taskId),
      1
    );

    this.#setState(prevState);
  }

  removeAllCompletedTasks() {
    const prevState = JSON.parse(JSON.stringify(this.#getState()));

    this.#setState(prevState.filter((task) => !task.isComplete));
  }

  reorderList(newOrder) {
    const prevState = JSON.parse(JSON.stringify(this.#getState()));
    prevState.sort((a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id));

    this.#setState(prevState);
  }
  /**
   * Returns a number that isn't used currently as an ID. The maximum is 100.
   * @returns {Number} A number between 0 and 100
   */
  #taskId() {
    let usedIds = JSON.parse(JSON.stringify(this.#getState())).map(
      (task) => +task.id
    );

    if (usedIds.length >= 100) {
      throw new Error("Maximum task limit reached.");
    }

    let numberId = Math.floor(Math.random() * 100);
    if (usedIds.indexOf(numberId) === -1) {
      return numberId;
    }
    return this.#taskId;
  }

  #getState() {
    const storage = localStorage.getItem(this.storageKey);
    return storage ? JSON.parse(storage) : initialTasks;
  }

  #setState(state) {
    let newState;

    switch (typeof state) {
      case "function":
        newState = state(this.#getState());
        break;
      case "object":
        newState = state;
        break;
      default:
        throw new Error("Invalid argument.");
    }
    localStorage.setItem(this.storageKey, JSON.stringify(newState));
    this.dispatchEvent(new Event("statechange"));
  }
}
