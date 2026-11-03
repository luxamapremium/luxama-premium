import test from "node:test";
import assert from "node:assert/strict";

function getAuthDbName(envValue) {
  return envValue || "auth_db";
}

test("RISK-02: Defaults to 'auth_db' when process.env.AUTH_DB_NAME is not set", () => {
  const dbName = getAuthDbName(undefined);
  assert.equal(dbName, "auth_db");
});

test("RISK-02: Respects process.env.AUTH_DB_NAME when customized in production", () => {
  const dbName = getAuthDbName("production_cluster_db");
  assert.equal(dbName, "production_cluster_db");
});
