require("dotenv").config();
const { validateEnv } = require("../src/config/env");
const connectDatabase = require("../src/config/db");
const app = require("../src/turbo-app");

let dbPromise;
module.exports = async function handler(req, res) {
  try {
    validateEnv();
    if (!dbPromise) dbPromise = connectDatabase().catch(err => { dbPromise = null; throw err; });
    await dbPromise;
    return app(req, res);
  } catch (err) {
    console.error("Vercel API initialization failed:", err.message);
    return res.status(500).json({ message: "Service temporarily unavailable." });
  }
};
