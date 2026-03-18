const express    = require("express");
const cors       = require("cors");
const fs         = require("fs");
const path       = require("path");

// Ensure db folder exists before anything else
fs.mkdirSync(path.join(__dirname, "db"), { recursive: true });

const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000","https://taskhiveco.netlify.app"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.use((req, _res, next) => {
  console.log(`${new Date().toISOString().slice(11,19)}  ${req.method.padEnd(7)} ${req.url}`);
  next();
});

app.use("/api/auth",  authRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use((_req, res) => res.status(404).json({ message: "Route not found" }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🚀  API →  http://localhost:${PORT}`);
    console.log(`🔑  Auth → http://localhost:${PORT}/api/auth/login\n`);
  });
}

module.exports = app; // exported for tests
