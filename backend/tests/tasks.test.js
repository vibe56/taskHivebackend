const request = require("supertest");
const fs      = require("fs");
const path    = require("path");
const app     = require("../server");

const USERS_FILE = path.join(__dirname, "../db/users.json");
const TASKS_FILE = path.join(__dirname, "../db/tasks.json");

let token;

beforeEach(async () => {
  if (fs.existsSync(USERS_FILE)) fs.unlinkSync(USERS_FILE);
  if (fs.existsSync(TASKS_FILE)) fs.unlinkSync(TASKS_FILE);
  const res = await request(app).post("/api/auth/register").send({ name: "Test", email: "test@test.com", password: "password123" });
  token = res.body.token;
});

afterAll(() => {
  if (fs.existsSync(USERS_FILE)) fs.unlinkSync(USERS_FILE);
  if (fs.existsSync(TASKS_FILE)) fs.unlinkSync(TASKS_FILE);
});

const auth = () => ({ Authorization: `Bearer ${token}` });

describe("GET /api/tasks", () => {
  it("returns task list for authenticated user", async () => {
    const res = await request(app).get("/api/tasks").set(auth());
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("returns 401 without token", async () => {
    const res = await request(app).get("/api/tasks");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/tasks", () => {
  it("creates a task successfully", async () => {
    const res = await request(app).post("/api/tasks").set(auth()).send({
      title: "Test task", priority: "High",
    });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Test task");
    expect(res.body.status).toBe("Pending");
  });

  it("rejects task with empty title", async () => {
    const res = await request(app).post("/api/tasks").set(auth()).send({ title: "" });
    expect(res.status).toBe(400);
  });
});

describe("PUT /api/tasks/:id", () => {
  it("updates a task", async () => {
    const create = await request(app).post("/api/tasks").set(auth()).send({ title: "Original" });
    const id     = create.body.id;
    const res    = await request(app).put(`/api/tasks/${id}`).set(auth()).send({ title: "Updated" });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Updated");
  });

  it("returns 404 for non-existent task", async () => {
    const res = await request(app).put("/api/tasks/9999").set(auth()).send({ title: "X" });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/tasks/:id", () => {
  it("deletes a task and returns 204", async () => {
    const create = await request(app).post("/api/tasks").set(auth()).send({ title: "Delete me" });
    const res    = await request(app).delete(`/api/tasks/${create.body.id}`).set(auth());
    expect(res.status).toBe(204);
  });
});

describe("PATCH /api/tasks/:id/toggle", () => {
  it("toggles task status from Pending to Completed", async () => {
    const create = await request(app).post("/api/tasks").set(auth()).send({ title: "Toggle me" });
    const res    = await request(app).patch(`/api/tasks/${create.body.id}/toggle`).set(auth());
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("Completed");
  });
});

describe("GET /api/tasks/stats", () => {
  it("returns stats object", async () => {
    const res = await request(app).get("/api/tasks/stats").set(auth());
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("total");
    expect(res.body).toHaveProperty("pending");
    expect(res.body).toHaveProperty("completed");
  });
});
