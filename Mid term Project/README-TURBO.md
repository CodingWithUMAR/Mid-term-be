# MID TERM PROJECT — TURBO Men's Clothing Store

**Developer:** Mohammed Umar  
**Brand:** TURBO  
**Market:** Pakistan  
**Currency:** PKR  
**Frontend:** React + Vite + Tailwind CSS  
**Backend:** Existing Mohammed Umar — Authentication Platform v2.0 + separate TURBO store API files  
**Database:** MongoDB Atlas  
**Deployment target:** Vercel

> The original 27 files from `Mohammed Umar — Authentication Platform v2.0` are preserved unchanged. TURBO uses them by importing the original User/OTP models, authentication routes, authentication middleware, validation, environment validation, database connection and security middleware. New store features are in separate files. The original `src/server.js` remains the original authentication-only entry point; run `src/turbo-server.js` for the combined TURBO API.

## 1. Project flow

1. The first page (`/`) is the signup page.
2. The user registers with name, email and password.
3. The existing backend sends an email OTP; the user verifies the email.
4. The user signs in using the existing login endpoint.
5. After login, the user can shop, add items, checkout and view their purchase history.
6. Browsing and guest-cart use are allowed without an account. Checkout and the personal area require a verified login.

## 2. Folder structure

```text
Mid term Project/
├── api/
│   ├── index.js                 # Vercel serverless entry
│   └── [...path].js             # Vercel API catch-all
├── docs/
│   └── README.md                # Original auth-platform documentation (unchanged)
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── components/
│       ├── context/
│       ├── lib/
│       ├── pages/
│       ├── App.jsx
│       ├── main.jsx
│       └── styles.css
├── postman/
│   ├── TURBO-API.postman_collection.json
│   └── TURBO-local.postman_environment.json
├── scripts/
│   └── seed-products.js
├── src/                         # Original auth files remain unchanged
│   ├── config/                  # Original auth configuration
│   ├── controllers/             # Original auth controller + new store controller
│   ├── middleware/              # Original auth middleware + new admin middleware
│   ├── models/                  # Original User/Otp + new Product/Cart/Order
│   ├── routes/                  # Original auth routes + new store routes
│   ├── app.js                   # Original app, unchanged
│   ├── server.js                # Original auth server, unchanged
│   ├── turbo-app.js             # Combined TURBO Express app
│   └── turbo-server.js          # Local combined API server
├── tests/                       # Original tests + store utility tests
├── .env.example                 # Original example, unchanged
├── turbo.env.example           # TURBO environment template
├── package.json                 # Original backend package, unchanged
├── vercel.json
└── README-TURBO.md
```

## 3. Requirements

- Node.js 20 or newer and npm.
- MongoDB Atlas database. Checkout uses MongoDB transactions, so use Atlas or another replica-set deployment; a standalone local MongoDB server does not support multi-document transactions.
- SMTP account for OTP email. Gmail requires an App Password, not your normal Gmail password.
- VS Code recommended.

## 4. Configure environment variables

The original `.env.example` is deliberately untouched. Copy `turbo.env.example` to `.env` in the project root, then edit `.env` yourself.

Windows PowerShell:

```powershell
Copy-Item turbo.env.example .env
```

macOS/Linux:

```bash
cp turbo.env.example .env
```

Set all of the following:

- `MONGODB_URI`: your Atlas connection string and database name.
- `JWT_SECRET`: random secret, at least 32 characters.
- `OTP_SECRET`: a different random secret, at least 32 characters.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`: working SMTP details.
- `APP_ORIGIN=http://localhost:5173` for local React development.
- `ADMIN_EMAILS`: your verified admin email address(es), comma-separated.
- `BANK_ACCOUNT_DETAILS`: real bank transfer instructions, or leave a safe placeholder until configured.

Generate secrets independently:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Never commit `.env`. The existing `.gitignore` already ignores it.

## 5. Run in VS Code (local development)

Open the project root in VS Code. Use two integrated terminals.

**Terminal 1 — backend API:**

```bash
npm install
node src/turbo-server.js
```

The API listens on `http://localhost:5000`.

**Terminal 2 — React frontend:**

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` requests to port 5000. The browser's origin must match `APP_ORIGIN` in `.env`.

Create production indexes before your first production deployment (the original database connector disables automatic index creation in production):

```bash
node scripts/create-indexes.js
```

Seed demo products (run from the project root after configuring Atlas):

```bash
node scripts/seed-products.js
```

The seed script is safe to re-run: it upserts products by their slug. It creates demo catalogue entries and sample stock. Replace demo photos, descriptions, prices, SKUs and stock with your actual TURBO inventory before selling.

Run the included unit tests:

```bash
npm test
```

Build the frontend locally:

```bash
cd frontend
npm run build
```

## 6. Website pages and flow

| URL | Purpose | Access |
|---|---|---|
| `/` or `/signup` | Signup | Public; first entry page |
| `/verify-email` | Verify email OTP / resend OTP | Public |
| `/login` | Login | Public |
| `/forgot-password` | Request reset OTP | Public |
| `/reset-password` | Reset password | Public |
| `/home` | TURBO campaign homepage | Public |
| `/shop` | Product catalogue and filters | Public |
| `/product/:slug` | Product details, size, colour, stock | Public |
| `/cart` | Guest or account cart | Public |
| `/checkout` | Shipping and payment | Verified login required |
| `/account` | Profile, saved addresses and purchase history | Verified login required |
| `/policies` | Shipping/payment information and editable return-policy draft | Public |
| `/admin` | Product creation/archive and order management | Admin email allowlist required |

## 7. API routes

### Existing authentication routes — imported unchanged

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/signup` | Register account and send verification OTP |
| POST | `/api/auth/login` | Login and set HttpOnly JWT cookie |
| POST | `/api/auth/logout` | Clear auth cookie |
| POST | `/api/auth/resend-otp` | Resend verification/reset OTP |
| POST | `/api/auth/verify-email` | Verify email |
| POST | `/api/auth/forgot-password` | Request reset code |
| POST | `/api/auth/reset-password` | Reset password and invalidate prior JWTs |
| GET | `/api/auth/me` | Current authenticated user |

### New store routes

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | API health |
| GET | `/api/store/products` | Public | List/search/filter products |
| GET | `/api/store/products/:slug` | Public | Product details |
| GET | `/api/store/cart` | Login | Get persistent cart |
| GET | `/api/store/addresses` | Login | List saved delivery addresses |
| POST | `/api/store/addresses` | Login | Save a delivery address (maximum five) |
| DELETE | `/api/store/addresses/:id` | Owner only | Remove a saved address |
| POST | `/api/store/cart/items` | Login | Add item |
| PATCH | `/api/store/cart/items/:productId` | Login | Update quantity (size + colour in body) |
| DELETE | `/api/store/cart/items/:productId` | Login | Remove item (size + colour in body) |
| POST | `/api/store/cart/merge` | Login | Merge guest cart after login |
| POST | `/api/store/checkout` | Login | Place order |
| GET | `/api/store/orders` | Login | Purchase history |
| GET | `/api/store/orders/:id` | Owner only | One order detail |
| POST | `/api/store/orders/:id/cancel` | Owner only | Cancel a pending/confirmed unpaid order and release reserved stock |
| GET | `/api/store/admin/orders` | Admin | List orders |
| PATCH | `/api/store/admin/orders/:id` | Admin | Update order/payment status |
| POST | `/api/store/admin/products` | Admin | Create product |
| PATCH | `/api/store/admin/products/:id` | Admin | Update product |
| DELETE | `/api/store/admin/products/:id` | Admin | Archive product (soft delete) |

### Example checkout body

```json
{
  "paymentMethod": "cod",
  "shippingAddress": {
    "fullName": "Customer Name",
    "phone": "03001234567",
    "addressLine": "House 12, Street 4",
    "city": "Karachi",
    "province": "Sindh",
    "postalCode": "75500"
  },
  "customerNote": "Please call before delivery."
}
```

Supported payment methods: `cod` and `bank_transfer`. Bank transfer orders remain `pending` until an admin manually verifies payment and sets `paymentStatus` to `paid`. No online payment gateway is connected in this version.

Shipping rule in this starter: PKR 250 below PKR 8,000; free at PKR 8,000 and above. Change the rule in the store checkout controller and frontend summary together if your business policy differs.

## 8. Postman API testing

1. Open Postman.
2. Import `postman/TURBO-API.postman_collection.json`.
3. Import `postman/TURBO-local.postman_environment.json` and select it.
4. Set `baseUrl` to `http://localhost:5000`.
5. Set a real test email and password.
6. Run **Health** first.
7. Run **Signup**; check the test inbox for the OTP.
8. Put the received OTP in the collection variable `otp`; run **Verify email OTP**.
9. Run **Login**. Postman should retain the HttpOnly cookie in its cookie jar for subsequent protected requests. If it does not, open Cookies for `localhost` and confirm `access_token` exists.
10. Run **List products**, copy a product `_id` from the API response into `productId`, then run cart and checkout requests.
11. To test admin routes, set `ADMIN_EMAILS` to the verified account email, restart the backend, log in again and use the admin requests.

Postman requests do not need a browser `Origin` header; the origin middleware permits requests without one for non-browser API clients. Never disable origin checks just to make browser requests work. If your React app runs on a different origin, update `APP_ORIGIN` to that exact origin and restart the API.

## 9. Vercel deployment

This repository is configured for Vercel with the React build output at `frontend/dist` and an Express serverless function under `api/`. The Vercel function imports the same original authentication routes/models plus the new store routes; it does not edit the original auth files.

1. Push the project root to a Git repository.
2. Import the repository into Vercel. Keep the project root as the Vercel Root Directory.
3. Vercel uses `vercel.json` to install root and frontend dependencies and build the Vite frontend.
4. Add environment variables in Vercel Project Settings → Environment Variables. Add the same variables from `.env`, but set:
   - `NODE_ENV=production`
   - `APP_ORIGIN=https://YOUR-PRODUCTION-DOMAIN.vercel.app` (exact scheme + host; no trailing slash)
   - `TRUST_PROXY=true` only when Vercel's proxy configuration is correctly trusted by the deployment.
5. Add the Vercel deployment's outbound database access requirements to MongoDB Atlas. Prefer Atlas network access configuration appropriate for your deployment; do not casually open the database to the entire internet.
6. Deploy and test `/api/health`, signup, OTP, login, cart and checkout.
7. Set the production custom domain and update `APP_ORIGIN` to that exact domain.

Preview deployment domains differ from the production domain. The existing origin check compares against one exact `APP_ORIGIN`; preview URLs will be rejected unless separately configured. Do not weaken the check to `*`. Use a dedicated preview environment with its own exact allowed origin if you need preview testing.

## 10. Security and correctness notes

- Existing password hashing, OTP verification, login, JWT signing and auth middleware are reused unchanged.
- JWT remains in an HttpOnly, SameSite=Strict cookie; it is not put in localStorage.
- Product prices and totals are read/calculated on the server. The client never decides the charged amount.
- Checkout re-checks stock and decrements it inside a MongoDB transaction, then writes the order and clears the cart in the same transaction. This requires a replica set such as MongoDB Atlas.
- Cart quantity is capped at 10 per line and validated against variant stock.
- Guest cart is stored in browser localStorage and merged into the authenticated database cart at login. Do not store sensitive personal/payment information in localStorage.
- Purchase history is scoped to the authenticated user. Admin routes require a verified login plus an email in `ADMIN_EMAILS`. The admin page supports product create/edit/archive and order/payment status management. The account area supports up to five saved delivery addresses. Customers can cancel their own unpaid pending/confirmed orders; stock is released transactionally. Paid orders require support-assisted refund handling.
- Order status transitions are constrained. Customers can cancel their own pending/confirmed unpaid orders; inventory is restored transactionally. Admins can cancel pending/confirmed/processing orders and restore stock. Shipped and delivered orders cannot be cancelled by this endpoint. Paid orders require support-assisted refund handling.
- Bank transfer is manual verification, not a payment gateway. Do not mark payment as paid until funds are confirmed in the business bank account.
- The built-in rate limiter is in-memory. For horizontally scaled production deployments, replace it with a shared Redis-backed limiter and add monitoring.
- The unchanged authentication backend clears the browser cookie on logout but does not maintain a server-side JWT revocation list. With the default 15-minute token expiry, a stolen token may remain valid until it expires. Keep the expiry short; stronger immediate logout revocation would require extending the auth middleware/session design, which is intentionally outside this read-only backend integration.
- Configure SPF, DKIM and DMARC for your sending domain. Do not log OTPs or passwords.
- Product seed images are remote stock/demo images (Unsplash and a Pexels male streetwear campaign image), not photos of your real garments. Replace them with original, accurately representative TURBO product/model photography before taking orders. Verify licensing and usage rights for every image.
- Add integration tests against a disposable Atlas/test replica set, concurrency tests for checkout and OTP, browser E2E tests, dependency scanning and a professional security review before production launch.

## 11. Business items to complete before launch

- Real product images, model releases, size chart, materials and care instructions.
- Real prices, SKUs, size/colour inventory and stock audit process.
- Confirmed delivery fees, courier partner, delivery estimates and COD remittance process.
- Return/exchange/refund policy and customer support contact.
- Real bank details and a payment reconciliation process.
- Admin account allowlist and operational staff access policy.
- Privacy policy and terms of sale appropriate for your business and applicable law.

**Project author:** Mohammed Umar  
**Project title:** Mid term Project — TURBO Men's Clothing E-commerce
