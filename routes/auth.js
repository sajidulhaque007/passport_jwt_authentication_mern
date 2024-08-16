const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
require("dotenv").config();

// User model
const User = require("../models/User");
// Register Route
// router.post("/register", async (req, res) => {
//   const { username, email, password } = req.body;

//   try {
//     // Check if the user already exists
//     let user = await User.findOne({ email });
//     if (user) {
//       return res.status(400).json({ msg: "User already exists" });
//     }
//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password);

//     // Create a new user
//     user = new User({
//       username,
//       email,
//       password: hashedPassword,
//     });

//     // Save the user to the database
//     await user.save();

//     res.status(201).json({ msg: "User registered successfully" });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server error");
//   }
// });

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // Adding 10 salt rounds

    // Create a new user
    user = new User({
      username,
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    // await user.save();

    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Login
// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     let user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ msg: "Email doesnt exist" });
//     const storedHashedPassword = user.password;
//     const isMatch = await bcrypt.compare(password, storedHashedPassword);

//     if (!isMatch) return res.status(400).json({ msg: "Password doesnt match" });

//     const payload = { id: user.id };
//     const token = jwt.sign(payload, process.env.JWT_SECRET, {
//       expiresIn: "1h",
//     });

//     res.json({ token: `Bearer ${token}` });
//   } catch (err) {
//     res.status(500).json({ msg: "Server error" });
//   }
// });

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Email doesn't exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Password doesn't match" });
    }

    const payload = { id: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token: `Bearer ${token}` });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
