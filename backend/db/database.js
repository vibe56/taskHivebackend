const fs   = require("fs");
const path = require("path");

const DB_DIR        = path.join(__dirname);
const TASKS_FILE    = path.join(DB_DIR, "tasks.json");
const USERS_FILE    = path.join(DB_DIR, "users.json");

// ── Generic helpers ────────────────────────────────────────────────────────

function readFile(filePath, fallback) {
  if (!fs.existsSync(filePath)) {
    writeFile(filePath, fallback);
    return fallback;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    writeFile(filePath, fallback);
    return fallback;
  }
}

function writeFile(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function nextId(arr) {
  return arr.length === 0 ? 1 : Math.max(...arr.map((i) => i.id)) + 1;
}

// ── Tasks ──────────────────────────────────────────────────────────────────

function readTasks() {
  const data = readFile(TASKS_FILE, null);
  if (data) return data;
  return seedTasks();
}

function writeTasks(tasks) {
  writeFile(TASKS_FILE, tasks);
}

function seedTasks() {
  const now  = new Date();
  const day  = (n) => new Date(now.getTime() + n * 86400000).toISOString().slice(0, 10);
  const past = (n) => new Date(now.getTime() - n * 86400000).toISOString();

  const tasks = [
    { id:1, title:"Set up development environment",  description:"Install dependencies, configure linting, set up Git hooks.", dueDate:day(1),  priority:"High",   status:"Completed", sortOrder:1, createdAt:past(3) },
    { id:2, title:"Design database schema",           description:"Define all entities, relationships, and indexes.",           dueDate:day(3),  priority:"High",   status:"Pending",   sortOrder:2, createdAt:past(2) },
    { id:3, title:"Implement REST API endpoints",     description:"Build CRUD operations, add input validation.",               dueDate:day(6),  priority:"Medium", status:"Pending",   sortOrder:3, createdAt:past(1) },
    { id:4, title:"Write unit and integration tests", description:"Aim for at least 80% code coverage.",                       dueDate:day(10), priority:"Medium", status:"Pending",   sortOrder:4, createdAt:now.toISOString() },
    { id:5, title:"Update project README",            description:"Add setup instructions and contribution guidelines.",        dueDate:day(12), priority:"Low",    status:"Pending",   sortOrder:5, createdAt:now.toISOString() },
  ];
  writeTasks(tasks);
  return tasks;
}

// ── Users ──────────────────────────────────────────────────────────────────

function readUsers() {
  return readFile(USERS_FILE, []);
}

function writeUsers(users) {
  writeFile(USERS_FILE, users);
}

module.exports = { readTasks, writeTasks, readUsers, writeUsers, nextId };
