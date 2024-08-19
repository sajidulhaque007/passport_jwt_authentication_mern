const mongoose = require("mongoose");
const validator = require('validator');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    validate: [validator.isEmail, 'Invalid email format'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
  },
    isVerified: { type: Boolean, default: false },
    verificationCode: {type: String}
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
