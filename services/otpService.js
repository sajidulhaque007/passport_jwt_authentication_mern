// const otpGenerator = require('otp-generator');

// exports.generateOTP = () => {
//   return otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
// };

// const otpGenerator = require('otp-generator');

// Function to generate a 6-digit numeric OTP
exports.generateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
return otp;
//   return otpGenerator.generate(6, { digits: true, upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
};
