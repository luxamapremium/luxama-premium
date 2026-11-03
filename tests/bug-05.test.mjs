import test from "node:test";
import assert from "node:assert/strict";
import { isRedirectError } from "next/dist/client/components/redirect-error.js";

// Simulation of current getAdminSchedules catch behavior vs fixed behavior
async function mockCurrentGetAdminSchedules(throwRedirect) {
  try {
    if (throwRedirect) {
      const error = new Error("NEXT_REDIRECT");
      error.digest = "NEXT_REDIRECT;replace;/auth/sign-in;307;";
      throw error;
    }
    return { success: true, data: [] };
  } catch (error) {
    // Current buggy behavior: swallows redirect
    return {
      success: false,
      error: "Failed to fetch schedules",
    };
  }
}

async function mockFixedGetAdminSchedules(throwRedirect) {
  try {
    if (throwRedirect) {
      const error = new Error("NEXT_REDIRECT");
      error.digest = "NEXT_REDIRECT;replace;/auth/sign-in;307;";
      throw error;
    }
    return { success: true, data: [] };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return {
      success: false,
      error: "Failed to fetch schedules",
    };
  }
}

test("BUG-05: Current implementation swallows NEXT_REDIRECT error", async () => {
  const result = await mockCurrentGetAdminSchedules(true);
  // Current code returns an error object instead of letting redirect throw
  assert.equal(result.success, false);
  assert.equal(result.error, "Failed to fetch schedules");
});

test("BUG-05: Fixed implementation propagates redirect error", async () => {
  await assert.rejects(
    async () => {
      await mockFixedGetAdminSchedules(true);
    },
    (err) => {
      return isRedirectError(err);
    }
  );
});
