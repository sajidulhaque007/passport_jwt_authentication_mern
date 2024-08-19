const request = require('request');

module.exports = function sendSMS(phoneNumber, message) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      url: 'https://api.sms.net.bd/sendsms',
      formData: {
        api_key: process.env.API_KEY,
        msg: message,
        to: '8801893466419'
      }
    };

    request(options, function (error, response) {
      if (error) return reject(error);
      resolve(response.body);
    });
  });
};
