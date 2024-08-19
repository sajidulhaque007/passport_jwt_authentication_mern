const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, unique: true },
  otp: { type: Number },
  otpExpires: { type: Date },
  isVerified: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
