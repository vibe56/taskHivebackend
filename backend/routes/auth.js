const express    = require("express");
const router     = express.Router();
const UserModel  = require("../models/UserModel");
const { generateToken } = require("../middleware/auth");
const { validate, registerRules, loginRules } = require("../middleware/validate");

// POST /api/auth/register
router.post("/register", registerRules, validate, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (UserModel.findByEmail(email)) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const user  = await UserModel.create({ name, email, password });
    const token = generateToken(user.id);

    res.status(201).json({ user, token });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
});

// POST /api/auth/login
router.post("/login", loginRules, validate, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const valid = await UserModel.verifyPassword(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken(user.id);
    res.json({ user: UserModel.sanitize(user), token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
});

// GET /api/auth/me  — verify token & return current user
router.get("/me", require("../middleware/auth").requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
