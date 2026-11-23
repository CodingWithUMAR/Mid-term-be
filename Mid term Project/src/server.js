require("dotenv").config();
const { validateEnv } = require("./config/env");
const connectDatabase = require("./config/db");
const app = require("./app");

const port = Number(process.env.PORT || 5000);

async function start() {
  validateEnv();
  await connectDatabase();
  const server = app.listen(port, () => console.log(`Server listening on port ${port}`));

  const shutdown = async (signal) => {
    console.log(`${signal} received. Closing server...`);
    server.close(async () => {
      const mongoose = require("mongoose");
      await mongoose.disconnect();
      process.exit(0);
    });
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

start().catch((err) => {
  console.error("Startup failed:", err.message);
  process.exit(1);
});
