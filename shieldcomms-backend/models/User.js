const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Create a User Schema with a username field
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: false, unique: true },  // Add username field
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Create the User model with the username field
module.exports = mongoose.model('User', userSchema);
