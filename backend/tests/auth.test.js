const request = require("supertest");
const fs      = require("fs");
const path    = require("path");
const app     = require("../server");

const USERS_FILE = path.join(__dirname, "../db/users.json");
const TASKS_FILE = path.join(__dirname, "../db/tasks.json");

beforeEach(() => {
  if (fs.existsSync(USERS_FILE)) fs.unlinkSync(USERS_FILE);
  if (fs.existsSync(TASKS_FILE)) fs.unlinkSync(TASKS_FILE);
});

afterAll(() => {
  if (fs.existsSync(USERS_FILE)) fs.unlinkSync(USERS_FILE);
});

describe("POST /api/auth/register", () => {
  it("registers a new user and returns a token", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Alice", email: "alice@test.com", password: "password123",
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe("alice@test.com");
    expect(res.body.user).not.toHaveProperty("password");
  });

  it("rejects duplicate email with 409", async () => {
    await request(app).post("/api/auth/register").send({ name: "Alice", email: "alice@test.com", password: "password123" });
    const res = await request(app).post("/api/auth/register").send({ name: "Alice2", email: "alice@test.com", password: "pass456" });
    expect(res.status).toBe(409);
  });

  it("rejects password shorter than 6 chars", async () => {
    const res = await request(app).post("/api/auth/register").send({ name: "Bob", email: "bob@test.com", password: "123" });
    expect(res.status).toBe(400);
  });

  it("rejects missing name", async () => {
    const res = await request(app).post("/api/auth/register").send({ email: "bob@test.com", password: "password123" });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send({ name: "Alice", email: "alice@test.com", password: "password123" });
  });

  it("logs in with correct credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "alice@test.com", password: "password123" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("rejects wrong password with 401", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "alice@test.com", password: "wrongpass" });
    expect(res.status).toBe(401);
  });

  it("rejects unknown email with 401", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "nobody@test.com", password: "password123" });
    expect(res.status).toBe(401);
  });
});
