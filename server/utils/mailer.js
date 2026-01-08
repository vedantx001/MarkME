const nodemailer = require("nodemailer");

function looksLikeEmail(value) {
  return typeof value === 'string' && value.includes('@');
}

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
  const explicitFrom = process.env.MAIL_FROM;

  // If SMTP isn't configured (common in dev/demo deployments), don't break auth flows.
  // Use a JSON transport and log the outbound email content to the server console.
  if (!mailConfig) {
    cachedFrom = '"MarkME" <no-reply@local>';
    cachedTransporter = nodemailer.createTransport({ jsonTransport: true });
    cachedTransporter.__mailDisabled = true;
    return cachedTransporter;
  }

  // Some SMTP providers use a non-email username (e.g., SendGrid uses "apikey").
  // In that case, you MUST set MAIL_FROM to a verified sender address.
  if (explicitFrom) {
    cachedFrom = explicitFrom;
  } else if (looksLikeEmail(mailConfig.user)) {
    cachedFrom = `"MarkME" <${mailConfig.user}>`;
  } else {
    cachedFrom = '"MarkME" <no-reply@local>';
    console.warn(
      '[MAIL] MAIL_USER is not an email address; set MAIL_FROM to a verified sender to avoid SMTP 550/unauthorized sender errors.'
    );
  }

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

const sendMail = async ({ to, subject, html, text, ...rest }) => {
  if (!to) {
    throw new Error('sendMail: "to" is required');
  }
  if (!subject) {
    throw new Error('sendMail: "subject" is required');
  }
  if (!html && !text) {
    throw new Error('sendMail: either "html" or "text" is required');
  }

  const transporter = getTransporter();
  const info = await transporter.sendMail({
    from: cachedFrom,
    to,
    subject,
    ...(text ? { text } : {}),
    ...(html ? { html } : {}),
    ...rest,
  });

  if (transporter && transporter.__mailDisabled) {
    // Log the full payload so OTP/reset links can be retrieved from logs when SMTP isn't configured.
    // This is intended for local/dev/demo use.
    try {
      console.warn('[MAIL DISABLED] Outbound email captured (SMTP not configured).');
      console.warn(
        JSON.stringify(
          info?.message || { to, subject, text: text || undefined, html: html || undefined },
          null,
          2
        )
      );
    } catch {
      // ignore logging failures
    }
  }

  return info;
};

module.exports = sendMail;