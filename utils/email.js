const nodemailer = require('nodemailer');

module.exports = async options => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: '21fad07085ebec',
      pass: '41d399408337b0',
    },
  });

  const emailOptions = {
    from: 'experience app <experienceApp@gmail.com>',
    to: options.to,
    subject: options.subject,
    text: options.text,
  };

  await transporter.sendMail(emailOptions);
};
