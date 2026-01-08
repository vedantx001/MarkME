# SIH-MarkME
Automated Attendance System for Rural Schools

## Render SMTP configuration (required for Admin registration)

Admin registration calls `POST /api/auth/register-admin`, which *must* send an OTP email. If SMTP is not configured correctly on Render, the API returns a 5xx and the frontend shows the `/errors/500` page.

### Set these environment variables in Render
Render Dashboard → your backend service → **Environment**:

- `MONGO_URL` (Mongo connection string)
- `JWT_SECRET` (long random string)
- `CLIENT_URL` = `https://markme-ai-online.vercel.app`
- `NODE_ENV` = `production`

**SMTP (OTP emails):**
- `MAIL_HOST`
- `MAIL_PORT` (typically `587` for STARTTLS or `465` for implicit TLS)
- `MAIL_SECURE` (`false` for 587, `true` for 465)
- `MAIL_USER`
- `MAIL_PASS`
- `MAIL_FROM` (recommended; REQUIRED if `MAIL_USER` is not a real sender email, e.g. SendGrid `apikey`)

After saving env vars, click **Manual Deploy** (or restart) so the Node process picks up the new values.

### Recommended SMTP settings
Provider-agnostic examples:

- STARTTLS (most providers)
	- `MAIL_PORT=587`
	- `MAIL_SECURE=false`
- TLS (some providers)
	- `MAIL_PORT=465`
	- `MAIL_SECURE=true`

For local development, see `server/.env.example`.
