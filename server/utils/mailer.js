const nodemailer = require("nodemailer");

function getMailConfig() {
  const host = process.env.MAIL_HOST;
  const port = Number(process.env.MAIL_PORT || 587);
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;
  const secureEnv = process.env.MAIL_SECURE;

  if (!host || !user || !pass) {
    throw new Error('Missing mail env vars: MAIL_HOST, MAIL_USER, MAIL_PASS (and optional MAIL_PORT/MAIL_SECURE)');
  }

  // If MAIL_SECURE is explicitly set, respect it; otherwise infer from port.
  const secure = typeof secureEnv === 'string' ? secureEnv.toLowerCase() === 'true' : port === 465;

  return { host, port, user, pass, secure };
}

let cachedTransporter;
let cachedFrom;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const mailConfig = getMailConfig();
  cachedFrom = `"MarkME" <${mailConfig.user}>`;

  cachedTransporter = nodemailer.createTransport({
    host: mailConfig.host,
    port: mailConfig.port,
    secure: mailConfig.secure,
    auth: {
      user: mailConfig.user,
      pass: mailConfig.pass,
    },
  });

  return cachedTransporter;
}

const sendMail = async ({ to, subject, html }) => {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: cachedFrom,
    to,
    subject,
    html,
  });
};

module.exports = sendMail;