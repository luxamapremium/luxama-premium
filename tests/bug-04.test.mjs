import test from "node:test";
import assert from "node:assert/strict";

// Simulation of buggy single-entry cache
class BuggyTimezoneCache {
  constructor() {
    this.cache = null;
    this.ttl = 5 * 60 * 1000;
  }
  async getTimezone(adminId, fetchFromDb) {
    const now = Date.now();
    if (this.cache && now - this.cache.timestamp < this.ttl) {
      return this.cache.timezone;
    }
    const tz = await fetchFromDb(adminId);
    this.cache = { timezone: tz, timestamp: now };
    return tz;
  }
}

// Simulation of fixed per-admin keyed cache
class FixedTimezoneCache {
  constructor() {
    this.cache = new Map();
    this.ttl = 5 * 60 * 1000;
  }
  async getTimezone(adminId, fetchFromDb) {
    const now = Date.now();
    const cached = this.cache.get(adminId);
    if (cached && now - cached.timestamp < this.ttl) {
      return cached.timezone;
    }
    const tz = await fetchFromDb(adminId);
    this.cache.set(adminId, { timezone: tz, timestamp: now });
    return tz;
  }
}

const mockDb = {
  admin_tokyo: "Asia/Tokyo",
  admin_ny: "America/New_York",
};
const fetchTz = async (id) => mockDb[id];

test("BUG-04: Buggy single-slot cache leaks Admin A's timezone to Admin B", async () => {
  const buggy = new BuggyTimezoneCache();
  const tz1 = await buggy.getTimezone("admin_tokyo", fetchTz);
  assert.equal(tz1, "Asia/Tokyo");

  // Admin NY mistakenly gets Tokyo because the cache is not keyed by adminId
  const tz2 = await buggy.getTimezone("admin_ny", fetchTz);
  assert.equal(tz2, "Asia/Tokyo");
});

test("BUG-04: Fixed Map cache keeps timezones isolated per adminId", async () => {
  const fixed = new FixedTimezoneCache();
  const tz1 = await fixed.getTimezone("admin_tokyo", fetchTz);
  assert.equal(tz1, "Asia/Tokyo");

  const tz2 = await fixed.getTimezone("admin_ny", fetchTz);
  assert.equal(tz2, "America/New_York");
});
