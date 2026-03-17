const { readTasks, writeTasks, nextId } = require("../db/database");

const TaskModel = {

  findAll({ status, priority, search, sortBy } = {}) {
    let tasks = readTasks();

    if (status)   tasks = tasks.filter((t) => t.status === status);
    if (priority) tasks = tasks.filter((t) => t.priority === priority);
    if (search) {
      const q = search.toLowerCase();
      tasks = tasks.filter(
        (t) => t.title.toLowerCase().includes(q) ||
               (t.description ?? "").toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case "dueDate":
        tasks = tasks.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        });
        break;
      case "priority": {
        const rank = { High: 0, Medium: 1, Low: 2 };
        tasks = tasks.sort((a, b) => rank[a.priority] - rank[b.priority]);
        break;
      }
      case "title":
        tasks = tasks.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        tasks = tasks.sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return tasks;
  },

  findById(id) {
    return readTasks().find((t) => t.id === id) ?? null;
  },

  create({ title, description, dueDate, priority = "Medium" }) {
    const tasks    = readTasks();
    const maxOrder = tasks.length ? Math.max(...tasks.map((t) => t.sortOrder)) : 0;
    const task = {
      id:          nextId(tasks),
      title:       title.trim(),
      description: description?.trim() ?? null,
      dueDate:     dueDate ?? null,
      priority,
      status:      "Pending",
      sortOrder:   maxOrder + 1,
      createdAt:   new Date().toISOString(),
    };
    tasks.push(task);
    writeTasks(tasks);
    return task;
  },

  update(id, { title, description, dueDate, priority, status }) {
    const tasks = readTasks();
    const idx   = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    if (title       !== undefined) tasks[idx].title       = title.trim();
    if (description !== undefined) tasks[idx].description = description?.trim() ?? null;
    if (dueDate     !== undefined) tasks[idx].dueDate     = dueDate ?? null;
    if (priority    !== undefined) tasks[idx].priority    = priority;
    if (status      !== undefined) tasks[idx].status      = status;
    writeTasks(tasks);
    return tasks[idx];
  },

  delete(id) {
    const tasks = readTasks();
    const idx   = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    tasks.splice(idx, 1);
    writeTasks(tasks);
    return true;
  },

  toggleStatus(id) {
    const tasks = readTasks();
    const idx   = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    tasks[idx].status = tasks[idx].status === "Pending" ? "Completed" : "Pending";
    writeTasks(tasks);
    return tasks[idx];
  },

  reorder(orderedIds) {
    const tasks = readTasks();
    orderedIds.forEach((id, index) => {
      const idx = tasks.findIndex((t) => t.id === id);
      if (idx !== -1) tasks[idx].sortOrder = index + 1;
    });
    writeTasks(tasks);
    return this.findAll();
  },

  getStats() {
    const tasks = readTasks();
    const today = new Date().toISOString().slice(0, 10);
    return {
      total:        tasks.length,
      pending:      tasks.filter((t) => t.status === "Pending").length,
      completed:    tasks.filter((t) => t.status === "Completed").length,
      highPriority: tasks.filter((t) => t.priority === "High" && t.status === "Pending").length,
      overdue:      tasks.filter((t) => t.dueDate && t.dueDate < today && t.status === "Pending").length,
    };
  },
};

module.exports = TaskModel;
