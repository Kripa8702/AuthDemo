const nodemailer = require("nodemailer");
require('dotenv').config();

const sendMail = async(options) => {
  let transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  let mailDetails = {
    from: process.env.EMAIL_USERNAME,
    to: options.email,
    subject: options.subject,
    text: options.text,
    html: options.message
};

transport.sendMail(mailDetails, function(err, data) {
    if(err) {
        console.log('Error Occurred');
    } else {
        console.log('Email sent successfully');
    }
});

};

module.exports = sendMail;
