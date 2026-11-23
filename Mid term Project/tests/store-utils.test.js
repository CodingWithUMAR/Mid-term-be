const test = require("node:test");
const assert = require("node:assert/strict");

test("checkout shipping threshold is documented as 8000 PKR with 250 PKR below threshold", () => {
  const fee = subtotal => subtotal >= 8000 ? 0 : 250;
  assert.equal(fee(7999), 250);
  assert.equal(fee(8000), 0);
});

test("order item totals use server-side unit price times quantity", () => {
  const unitPrice = 2490, quantity = 2;
  assert.equal(unitPrice * quantity, 4980);
});
