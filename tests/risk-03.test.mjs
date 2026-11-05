import test from "node:test";
import assert from "node:assert/strict";

// Simulation of authorization check in checkout
function resolveEffectiveUserId(sessionUser, clientSuppliedUserId) {
  if (!sessionUser || !sessionUser.id) {
    throw new Error("Unauthorized: Login required to book");
  }
  // Secure pattern: trust only the authenticated session user ID
  return sessionUser.id;
}

test("RISK-03: Blocks unauthenticated checkout attempt", () => {
  assert.throws(() => {
    resolveEffectiveUserId(null, "65a123456789abcdef012345");
  }, /Unauthorized: Login required to book/);
});

test("RISK-03: Ignores client-supplied userId and enforces sessionUser ID", () => {
  const sessionUser = { id: "65a000000000000000000001", email: "user@example.com" };
  const spoofedId = "65a999999999999999999999";

  const effectiveId = resolveEffectiveUserId(sessionUser, spoofedId);
  assert.equal(effectiveId, sessionUser.id);
  assert.notEqual(effectiveId, spoofedId);
});
