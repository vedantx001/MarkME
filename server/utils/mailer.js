const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL =
  process.env.EMAIL_FROM || '"MarkME" <onboarding@resend.dev>';

/**
 * sendMail({ to, subject, html, text, replyTo })
 * - Backward-compatible with prior Nodemailer usage.
 * - `to` can be string or array.
 * - Resend requires `html` or `text` (we prefer html; fallback to text).
 */
const sendMail = async ({ to, subject, html, text, replyTo } = {}) => {
  try {
    if (!to || !subject) {
      throw new Error('sendMail: "to" and "subject" are required');
    }

    // If API key is missing, do NOT break auth flows (best-effort; logs only)
    if (!process.env.RESEND_API_KEY) {
      console.warn('[MAIL DISABLED] RESEND_API_KEY not configured.');
      console.warn(
        JSON.stringify(
          {
            from: FROM_EMAIL,
            to,
            subject,
            text,
            html,
            replyTo,
          },
          null,
          2
        )
      );
      return;
    }

    const normalizedTo = Array.isArray(to) ? to : [to];

    const resolvedHtml =
      typeof html === 'string' && html.trim()
        ? html
        : typeof text === 'string' && text.trim()
          ? `<pre style="white-space:pre-wrap;word-wrap:break-word">${escapeHtml(text)}</pre>`
          : undefined;

    const resolvedText = typeof text === 'string' && text.trim() ? text : undefined;

    if (!resolvedHtml && !resolvedText) {
      throw new Error('sendMail: either "html" or "text" must be provided');
    }

    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: normalizedTo,
      subject,
      ...(resolvedHtml ? { html: resolvedHtml } : {}),
      ...(resolvedText ? { text: resolvedText } : {}),
      ...(replyTo ? { replyTo } : {}),
    });

    return response;
  } catch (error) {
    console.error('[RESEND ERROR] Failed to send email');
    console.error(error);
    throw error;
  }
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = sendMail;
