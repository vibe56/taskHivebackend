const jwt       = require("jsonwebtoken");
const UserModel = require("../models/UserModel");

const JWT_SECRET  = process.env.JWT_SECRET || "taskhive_super_secret_key_change_in_prod";
const JWT_EXPIRES = "7d";

function generateToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided. Please log in." });
  }

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user    = UserModel.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "User no longer exists." });
    req.user = UserModel.sanitize(user);
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }
    return res.status(401).json({ message: "Invalid token." });
  }
}

module.exports = { generateToken, requireAuth, JWT_SECRET };
