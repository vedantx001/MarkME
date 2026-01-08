const nodemailer = require("nodemailer");

function getMailConfig() {
  const host = process.env.MAIL_HOST;
  const port = Number(process.env.MAIL_PORT || 587);
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;
  const secureEnv = process.env.MAIL_SECURE;

  if (!host || !user || !pass) {
    return null;
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

  // If SMTP isn't configured (common in dev/demo deployments), don't break auth flows.
  // Use a JSON transport and log the outbound email content to the server console.
  if (!mailConfig) {
    cachedFrom = '"MarkME" <no-reply@local>';
    cachedTransporter = nodemailer.createTransport({ jsonTransport: true });
    cachedTransporter.__mailDisabled = true;
    return cachedTransporter;
  }

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
  const info = await transporter.sendMail({
    from: cachedFrom,
    to,
    subject,
    html,
  });

  if (transporter && transporter.__mailDisabled) {
    // Log the full payload so OTP/reset links can be retrieved from logs when SMTP isn't configured.
    // This is intended for local/dev/demo use.
    try {
      console.warn('[MAIL DISABLED] Outbound email captured (SMTP not configured).');
      console.warn(JSON.stringify(info?.message || { to, subject, html }, null, 2));
    } catch {
      // ignore logging failures
    }
  }
};

module.exports = sendMail;