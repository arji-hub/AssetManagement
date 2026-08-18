const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter(gmailUser, gmailPass) {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });
  }
  return transporter;
}

async function sendEmail({ gmailUser, gmailPass, to, subject, html }) {
  const mailer = getTransporter(gmailUser, gmailPass);

  await mailer.sendMail({
    from: `"CICT Asset Management" <${gmailUser}>`,
    to,
    subject,
    html,
  });
}

module.exports = { sendEmail };
