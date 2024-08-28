const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  console.log(process.env.EMAIL_HOST);
  console.log(process.env.EMAIL_PORT);
  console.log(process.env.EMAIL_USERNAME);
  console.log(process.env.EMAIL_PASSWORD);

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: 'Harish Pendhota <harishpendhota08@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};
module.exports = sendEmail;
