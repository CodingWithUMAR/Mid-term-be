require("dotenv").config();
const { validateEnv } = require("./config/env");
const connectDatabase = require("./config/db");
const app = require("./turbo-app");

const port = Number(process.env.PORT || 5000);
async function start() {
  validateEnv();
  await connectDatabase();
  const server = app.listen(port, () => console.log(`TURBO API listening on http://localhost:${port}`));
  const shutdown = async () => {
    server.close(async () => {
      await require("mongoose").disconnect();
      process.exit(0);
    });
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}
start().catch(err => {
  console.error("TURBO API startup failed:", err.message);
  process.exit(1);
});
