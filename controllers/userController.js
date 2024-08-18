// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const User = require("../models/User");
// require("dotenv").config();

// exports.register = async (req, res) => {
//   const { username, email, password } = req.body;

//   try {
//     let user = await User.findOne({ email });
//     if (user) {
//       return res.status(400).json({ msg: "User already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     user = new User({
//       username,
//       email,
//       password: hashedPassword,
//     });

//     await user.save();

//     res.status(201).json({ msg: "User registered successfully" });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server error");
//   }
// };

// exports.login = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     let user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ msg: "Email doesn't exist" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ msg: "Password doesn't match" });
//     }

//     const payload = { id: user.id };
//     const token = jwt.sign(payload, process.env.JWT_SECRET, {
//       expiresIn: "1h",
//     });

//     res.json({ token: `Bearer ${token}` });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ msg: "Server error" });
//   }
// };


/************ new code *****************/

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');


exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;
  
    try {
      console.log('Received registration request:', { username, email, password });
  
      const userExists = await User.findOne({ email });
  
      if (userExists) {
        console.log('User already exists');
        return res.status(400).json({ message: 'User already exists' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('Password hashed successfully');
  
      // const verificationToken = crypto.randomBytes(64).toString('hex');
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      console.log('Verification token generated:', verificationCode);
  
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
        verificationCode,
      });
  
      console.log('User created:', user);
  
      // const verificationUrl = `http://localhost:5000/api/users/verify/${verificationToken}`;
      // console.log('Verification URL:', verificationUrl);
  
      await sendEmail({
        to: user.email,
        subject: 'Verify your email',
        text: `Click this link to verify your email: ${verificationCode}`,
      });
  
      res.status(201).json({ message: 'Registration successful, please check your email to verify your account.' });
    } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  

// exports.verifyUser = async (req, res) => {
//   const { token } = req.params;

//   try {
//     const user = await User.findOne({ verificationToken: token });

//     if (!user) {
//       return res.status(400).json({ message: 'Invalid token' });
//     }

//     user.isVerified = true;
//     user.verificationToken = undefined;

//     await user.save();
//     res.status(200).json({ message: 'Email verified successfully' });
//     // res.redirect('http://localhost:3000/email-verified')
//   } catch (error) {
//     console.error('Email verification failed:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


exports.verifyUser = async (req, res) => {
  const { email, verificationCode } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }

    if (user.verificationCode === verificationCode) {
      user.isVerified = true;
      user.verificationCode = undefined;
      await user.save();
      return res.status(200).json({ message: 'Email verified successfully.', redirectUrl: '/' });
    } else {
      return res.status(400).json({ message: 'Invalid verification code.' });
    }
  } catch (error) {
    console.error('Error verifying email:', error);
    return res.status(500).json({ message: 'Error verifying email.' });
  }
};

exports.resendCode = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send('User not found.');
    }

    // Generate new verification code
    const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = newVerificationCode;
    await user.save();

    // Send the new code via email
    await sendEmail({
      to: user.email,
      subject: 'Resend Verification Code',
      text: `Your new verification code is: ${newVerificationCode}`,
    });

    res.status(200).send('Verification code has been resent. Please check your email.');
  } catch (error) {
    console.error('Error resending verification code:', error); // Log detailed error
    res.status(500).send('Server error.');
  }
};


exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: 'Please verify your email first' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({ token });
  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
