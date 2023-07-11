const nodemailer = require("nodemailer");
const config = require("../config/config");

const sendEmail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: config.nodemailer.host,
      service: config.nodemailer.service,
      port: 465,
      auth: {
        user: config.nodemailer.userEmail,
        pass: config.nodemailer.userPassword,
      },
    });

    await transporter.sendMail({
      from: config.nodemailer.userEmail,
      to: email,
      subject: subject,
      text: text,
    });
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = sendEmail;
