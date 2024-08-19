const User = require('../models/userModel');
const otpService = require('../services/otpService');
const sendSMS = require('../utils/sendSMS');

exports.signup = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    // Generate OTP and save it to the user
    const otp = otpService.generateOTP();
    const otpExpires = Date.now() + 60 * 1000; 

    console.log(`Generated OTP: ${otp}, Expires at: ${new Date(otpExpires)}`);


    const user = await User.findOneAndUpdate(
      { phoneNumber },
      { otp, otpExpires },
      { new: true, upsert: true }
    );

    // Send OTP via SMS
    // await sendSMS(phoneNumber, `Your OTP code is ${otp}`);
    try {
        const smsResponse = await sendSMS(phoneNumber, `Your OTP code is ${otp}`);
        console.log('SMS Response:', smsResponse);
    } catch (error) {
        console.error('Error sending SMS:', error);
    }
    

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error during signup', error });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    const user = await User.findOne({ phoneNumber });

    if (!user) return res.status(400).json({ message: 'User not found' });
    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP is incorrect or expired' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Phone number verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying OTP', error });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    const otp = otpService.generateOTP();
    const otpExpires = Date.now() + 60 * 1000;

    const user = await User.findOneAndUpdate(
      { phoneNumber },
      { otp, otpExpires },
      { new: true }
    );

    // Send OTP via SMS
    await sendSMS(phoneNumber, `Your OTP code is ${otp}`);
    console.log(`Your OTP code is ${otp}`)

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error resending OTP', error });
  }
};
