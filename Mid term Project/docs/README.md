# Mohammed Umar — Authentication API

A production-minded authentication starter using **Node.js, Express, MongoDB Atlas, Mongoose, bcrypt, JWT, Nodemailer, HTML, CSS and JavaScript**.

> This is a strong starter implementation, not a certification that the application is production-ready. Complete the deployment checklist and independent security testing before handling real customer accounts.

## 1. Features

- Signup with normalized email and email verification.
- Login for verified accounts.
- Six-digit email OTPs for email verification and password recovery.
- OTP expiry (10 minutes by default), resend cooldown and attempt limit.
- Atomic, one-time OTP consumption.
- bcrypt password hashing.
- JWT stored in an HttpOnly, SameSite=Strict cookie.
- Password reset invalidates previously issued JWTs using `sessionVersion`.
- Generic forgot-password response to reduce account enumeration.
- Request validation, JSON body limit, Helmet security headers, rate limits and origin checks.
- Signup, login, verify email, forgot password, reset password and account pages.
- Automated unit tests for OTP utilities and bcrypt behavior.

## 2. Requirements

- Node.js 20 or later
- npm
- MongoDB Atlas account and database
- SMTP account (for Gmail, create an App Password)

## 3. Installation

From the project root:

```bash
npm install
```

Copy `.env.example` to `.env`, then configure the values:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Generate two different secrets:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Use one generated value for `JWT_SECRET` and a different generated value for `OTP_SECRET`.

### MongoDB Atlas

1. Create a database and database user in MongoDB Atlas.
2. Add the server's IP address to the Atlas Network Access allowlist. Avoid `0.0.0.0/0` except for a short, controlled diagnostic.
3. Copy the Node.js connection string into `MONGODB_URI`.
4. Replace the username, password, cluster host and database name.
5. URL-encode special characters in the database password.

### SMTP

Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` and `MAIL_FROM`. Never commit SMTP credentials or `.env`.

## 4. Run

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

Open `http://localhost:5000`. The application serves the frontend and API from the same origin.

Run tests:

```bash
npm test
```

## 5. Frontend pages

| Page | Purpose |
|---|---|
| `/` | Signup |
| `/login.html` | Login |
| `/verify.html` | Verify email and resend OTP |
| `/forgot.html` | Request password reset code |
| `/reset.html` | Set a new password |
| `/dashboard.html` | Protected account page |

The frontend is intentionally plain HTML, CSS and JavaScript, so it can be customized without a frontend framework.

## 6. API reference

All request and response bodies use JSON. Authentication is maintained in an HttpOnly cookie.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/auth/signup` | Create an unverified account and email verification OTP |
| POST | `/api/auth/login` | Authenticate a verified user and set session cookie |
| POST | `/api/auth/logout` | Clear session cookie |
| POST | `/api/auth/verify-email` | Verify email with OTP |
| POST | `/api/auth/resend-otp` | Resend verification or reset OTP |
| POST | `/api/auth/forgot-password` | Request password reset OTP |
| POST | `/api/auth/reset-password` | Consume OTP and change password |
| GET | `/api/auth/me` | Return current authenticated user |

### Example requests

Signup:

```json
{
  "name": "Mohammed Umar",
  "email": "umar@example.com",
  "password": "a-long-password"
}
```

Login:

```json
{
  "email": "umar@example.com",
  "password": "a-long-password"
}
```

Resend verification code:

```json
{
  "email": "umar@example.com",
  "purpose": "verify_email"
}
```

Verify email:

```json
{
  "email": "umar@example.com",
  "otp": "123456"
}
```

Forgot password:

```json
{
  "email": "umar@example.com"
}
```

Reset password:

```json
{
  "email": "umar@example.com",
  "otp": "123456",
  "newPassword": "an-even-longer-password"
}
```

The example OTP is illustrative only. A real code is generated and emailed by the application.

## 7. Security design

### OTP storage and verification
The raw OTP is never stored. The application stores an HMAC-SHA-256 digest keyed with `OTP_SECRET`. OTPs expire, have a resend cooldown and a maximum number of failed attempts. A correct OTP is consumed using one atomic `findOneAndDelete` query, preventing successful reuse under concurrent requests.

### Passwords
Passwords are hashed with bcrypt before persistence. The password field is excluded from normal Mongoose queries. The implementation accepts 8–72 characters because bcrypt has a 72-byte input limit; consider a documented Unicode/byte-length policy if supporting non-ASCII passwords.

### Sessions
JWTs are signed with HS256 and kept in an HttpOnly cookie, not localStorage. The cookie uses `SameSite=Strict`; in production it is marked Secure. The `sessionVersion` claim allows password reset to invalidate previously issued access tokens.

### Request protection
Helmet, a restrictive Content Security Policy, JSON body-size limit, input validation, request rate limiting and same-origin checks are enabled. The app serves its frontend and API from the same origin to reduce cross-origin complexity.

## 8. Production security review — required before launch

1. **Secrets:** Use a secret manager; rotate JWT and OTP secrets through a planned deployment. Never put secrets in source control or frontend code.
2. **Transport:** Deploy only behind HTTPS. Set `NODE_ENV=production`, correct `APP_ORIGIN`, and configure `TRUST_PROXY=true` only when behind a correctly configured trusted reverse proxy.
3. **Rate limiting:** The included in-memory limiter is suitable for a single-process starter. Replace it with a shared Redis-backed limiter for multi-instance deployments; add monitoring and adaptive throttling.
4. **OTP delivery:** Use a reputable transactional email provider, configure SPF, DKIM and DMARC, monitor bounces/complaints, and avoid logging OTPs.
5. **Database:** Restrict Atlas network access and database privileges; enforce TLS, backups, restore drills and production indexes. Create indexes via a controlled migration rather than relying on automatic index creation.
6. **Abuse monitoring:** Add alerting for repeated login failures, OTP abuse, password reset spikes, unusual IP/device activity and email delivery failures.
7. **Cookie/CSRF:** Keep frontend and API same-site. If you later move them to different sites, revisit cookie policy and implement a robust CSRF token strategy; do not simply enable permissive CORS.
8. **Password policy:** Consider breached-password screening, longer passphrases, and MFA for sensitive accounts. Do not force arbitrary periodic password changes.
9. **Operational controls:** Add structured redacted logs, error monitoring, dependency scanning, security headers testing, vulnerability scanning and a documented incident-response process.
10. **Testing:** Add integration tests against a disposable MongoDB instance, concurrency tests for OTP consumption, end-to-end browser tests, and a professional penetration test before handling sensitive or high-value accounts.

## 9. Important implementation notes

- `APP_ORIGIN` must exactly match the browser origin, including scheme and port. For local use, the default is `http://localhost:5000`.
- The OTP TTL and resend cooldown can be changed with environment variables.
- The email provider must be configured before OTP delivery can work.
- Expired OTP documents are removed by MongoDB's TTL monitor, which is asynchronous. The application also checks `expiresAt` during verification.
- The in-memory rate limiter resets when the process restarts and is not shared across multiple server instances.
- This starter does not include refresh tokens, account deletion, MFA, audit-log retention, or an admin interface.
- Add a proper integration/E2E test suite and review deployment-specific risks before production release.

## 10. Project author

**Developer:** Mohammed Umar  
**Project:** Secure Authentication API  
**Stack:** Node.js · Express · MongoDB Atlas · Mongoose · JWT · bcrypt · Nodemailer · HTML · CSS · JavaScript
