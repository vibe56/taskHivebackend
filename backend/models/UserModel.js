const bcrypt               = require("bcryptjs");
const { readUsers, writeUsers, nextId } = require("../db/database");

const UserModel = {
  findByEmail(email) {
    return readUsers().find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
  },

  findById(id) {
    return readUsers().find((u) => u.id === id) ?? null;
  },

  async create({ name, email, password }) {
    const users = readUsers();
    const hashed = await bcrypt.hash(password, 10);
    const user = {
      id:        nextId(users),
      name:      name.trim(),
      email:     email.toLowerCase().trim(),
      password:  hashed,
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    writeUsers(users);
    // Never return the password hash
    const { password: _, ...safe } = user;
    return safe;
  },

  async verifyPassword(plainText, hash) {
    return bcrypt.compare(plainText, hash);
  },

  // Strip password before sending to client
  sanitize(user) {
    if (!user) return null;
    const { password, ...safe } = user;
    return safe;
  },
};

module.exports = UserModel;
