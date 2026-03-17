const { body, validationResult } = require("express-validator");

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 100 }),
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

const loginRules = [
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

const createRules = [
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 200 }),
  body("priority").optional().isIn(["Low", "Medium", "High"]),
  body("dueDate").optional({ nullable: true }).isISO8601().withMessage("Invalid date format"),
];

const updateRules = [
  body("title").optional().trim().notEmpty().isLength({ max: 200 }),
  body("priority").optional().isIn(["Low", "Medium", "High"]),
  body("status").optional().isIn(["Pending", "Completed"]),
  body("dueDate").optional({ nullable: true }).isISO8601(),
];

module.exports = { validate, registerRules, loginRules, createRules, updateRules };
