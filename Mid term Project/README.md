# Mid term Project — TURBO

A React + Tailwind men's clothing storefront for TURBO, connected to the existing **Mohammed Umar — Authentication Platform v2.0** backend without changing any of its original files.

**Start here:** Read [README-TURBO.md](README-TURBO.md) for setup, MongoDB Atlas configuration, local VS Code workflow, Postman API testing, Vercel deployment and security notes.

## Quick start

1. Copy `turbo.env.example` to `.env` and configure your MongoDB Atlas, JWT, OTP, SMTP and admin email values.
2. In terminal 1 (project root): `npm install` then `node src/turbo-server.js`.
3. In terminal 2: `cd frontend`, `npm install`, then `npm run dev`.
4. Open `http://localhost:5173`.
5. Seed sample catalogue products from the project root with `node scripts/seed-products.js`.
6. Import `postman/TURBO-API.postman_collection.json` into Postman to test the API.

The first website route is signup. After email verification and login, users can shop, add products to a guest or account cart, checkout, save delivery addresses and view purchase history. See the full guide for all setup and production steps.

**Developer:** Mohammed Umar  
**Project name:** Mid term Project  
**Store brand:** TURBO
