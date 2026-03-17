const express    = require("express");
const router     = express.Router();
const TaskModel  = require("../models/TaskModel");
const { requireAuth }   = require("../middleware/auth");
const { validate, createRules, updateRules } = require("../middleware/validate");

// All task routes require a valid JWT
router.use(requireAuth);

// GET /api/tasks
router.get("/", (req, res) => {
  try {
    const { status, priority, search, sortBy } = req.query;
    res.json(TaskModel.findAll({ status, priority, search, sortBy }));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

// GET /api/tasks/stats  — must be before /:id
router.get("/stats", (req, res) => {
  try {
    res.json(TaskModel.getStats());
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

// GET /api/tasks/:id
router.get("/:id", (req, res) => {
  const task = TaskModel.findById(Number(req.params.id));
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json(task);
});

// POST /api/tasks
router.post("/", createRules, validate, (req, res) => {
  try {
    const task = TaskModel.create(req.body);
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: "Failed to create task" });
  }
});

// PUT /api/tasks/:id
router.put("/:id", updateRules, validate, (req, res) => {
  const task = TaskModel.update(Number(req.params.id), req.body);
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json(task);
});

// DELETE /api/tasks/:id
router.delete("/:id", (req, res) => {
  const deleted = TaskModel.delete(Number(req.params.id));
  if (!deleted) return res.status(404).json({ message: "Task not found" });
  res.status(204).send();
});

// PATCH /api/tasks/:id/toggle
router.patch("/:id/toggle", (req, res) => {
  const task = TaskModel.toggleStatus(Number(req.params.id));
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json(task);
});

// PATCH /api/tasks/reorder  — drag & drop saves new order
router.patch("/reorder", (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ message: "orderedIds must be an array" });
    }
    const tasks = TaskModel.reorder(orderedIds.map(Number));
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Failed to reorder tasks" });
  }
});

module.exports = router;
