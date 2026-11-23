require("dotenv").config();
const { validateEnv } = require("../src/config/env");
const connectDatabase = require("../src/config/db");
const models = [
  require("../src/models/User"),
  require("../src/models/Otp"),
  require("../src/models/Product"),
  require("../src/models/Cart"),
  require("../src/models/Order"),
  require("../src/models/Address")
];

async function run() {
  validateEnv();
  await connectDatabase();
  for (const model of models) {
    await model.createIndexes();
    console.log(`Indexes ensured: ${model.modelName}`);
  }
  await require("mongoose").disconnect();
}
run().catch(async err => {
  console.error("Index creation failed:", err.message);
  await require("mongoose").disconnect();
  process.exit(1);
});
