const test = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");

test("bcrypt hashes are not stored as plaintext and verify correctly", async () => {
  const plain = "correct-horse-battery-staple";
  const hash = await bcrypt.hash(plain, 10);
  assert.notEqual(hash, plain);
  assert.equal(await bcrypt.compare(plain, hash), true);
  assert.equal(await bcrypt.compare("wrong-password", hash), false);
});
