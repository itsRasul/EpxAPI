const nodemailer = require('nodemailer');

module.exports = class Email {
  constructor(user) {
    this.user = user;
  }
  async sendWelcome() {
    const emailOptions = {
      from: 'experience app <experienceApp@gmail.com>',
      to: this.user.email,
      subject: 'welcome to Experience App :)',
      text: 'thanks to signing up in our web application, we hope enjoy it!',
    };
    let transporter;
    if (process.env.NODE_ENV === 'development') {
      // development envirement
      transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_HOST,
        port: process.env.MAILTRAP_PORT,
        auth: {
          user: process.env.MAILTRAP_USERNAME,
          pass: process.env.MAILTRAP_PASS,
        },
      });
    } else {
      // production envirement
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USERNAME,
          pass: process.env.GMAIL_PASS,
        },
      });
    }
    await transporter.sendMail(emailOptions);
  }

  async sendResetToken(resetPasswordToken) {
    const emailOptions = {
      from: 'experience app <experienceApp@gmail.com>',
      to: this.user.email,
      subject: 'reset password (valid for 10 minutes)',
      text: `please send a patch request to http://127.0.0.1:3000/api/v1/users/resetPassword/${resetPasswordToken}`,
    };
    let transporter;
    if (process.env.NODE_ENV === 'development') {
      // development envirement
      transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_HOST,
        port: process.env.MAILTRAP_PORT,
        auth: {
          user: process.env.MAILTRAP_USERNAME,
          pass: process.env.MAILTRAP_PASS,
        },
      });
    } else {
      // production envirement
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USERNAME,
          pass: process.env.GMAIL_PASS,
        },
      });
    }
    await transporter.sendMail(emailOptions);
  }
};

// module.exports = async options => {
//   if (process.env.NODE_ENV === 'development') {
//     const transporter = nodemailer.createTransport({
//       host: 'smtp.mailtrap.io',
//       port: 2525,
//       auth: {
//         user: '21fad07085ebec',
//         pass: '41d399408337b0',
//       },
//     });

//     const emailOptions = {
//       from: 'experience app <experienceApp@gmail.com>',
//       to: options.to,
//       subject: options.subject,
//       text: options.text,
//     };

//     await transporter.sendMail(emailOptions);
//   } else {
//     // production
//     // to use gmail service turn on lesssecure apps option in gmail
//     // turn on 2-steps verification
//     // use app password
//     // how to do:
//     // go to gmail account click on profile => manage your account => security
//     // Signing in to Google => click on 2-steps verification and app password (then find lesssecure app option and turn it on)

//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.GMAIL_USERNAME,
//         pass: process.env.GMAIL_PASS,
//       },
//     });

//     const emailOptions = {
//       from: 'experience app <experienceApp@gmail.com>',
//       to: options.to,
//       subject: options.subject,
//       text: options.text,
//     };

//     await transporter.sendMail(emailOptions);
//   }
// };
