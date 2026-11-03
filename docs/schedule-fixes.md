# Schedule Management: Production Bug Fixes & Edge Cases Audit Report

**Branch:** `fix/edge-cases`  
**Date:** November 2026  
**Status:** All Batches Completed & Verified  

---

## 1. Executive Summary

A comprehensive audit and phased remediation of the **Schedule Management** and **Booking** lifecycle in the Luxama Premium Group application has been completed. All 11 bugs and 3 critical architectural risks across dates/timezones, concurrency, authorization, validation, data integrity, and UI state management have been resolved.

Every fix was executed with minimal diff, verified via unit/integration tests (`tests/*.test.mjs`), typechecked with `tsc --noEmit`, and validated with a production Next.js build.

---

## 2. Issues Remediated

### BUG-01: Calendar-Anchored Recurring Slots Causing DST Drift
- **Category:** Dates & Time (Critical)
- **Root Cause:** Recurring weekly schedule time slots were stored as full JavaScript `Date` objects in MongoDB anchored to `new Date()` (the day the slot was created). This anchored the slot to a fixed UTC timestamp. During Daylight Saving Time transitions (e.g., Eastern Standard Time UTC-5 vs Eastern Daylight Time UTC-4), the recurring slot drifted by 1 hour on the client calendar. Furthermore, slot sorting and overlap checks compared arbitrary calendar dates rather than weekday minutes.
- **Remediation:**
  - Updated `ITimeSlot` and `TimeSlotSchema` in [Schedule.ts](file:///d:/PROJECTS/CLIENTS/LUXAMA%20PREMIUM%20GROUP/luxama-preium-group/lib/models/Schedule.ts) to store `startTime` and `endTime` as clean 24-hour `"HH:mm"` strings.
  - Replaced Date math in `checkForOverlap` with minute arithmetic (`toMinutes`).
  - Updated [getAvailableSlotsActions.ts](file:///d:/PROJECTS/CLIENTS/LUXAMA%20PREMIUM%20GROUP/luxama-preium-group/app/actions/public/getAvailableSlotsActions.ts) and [getAvailableDatesActions.ts](file:///d:/PROJECTS/CLIENTS/LUXAMA%20PREMIUM%20GROUP/luxama-preium-group/app/actions/public/getAvailableDatesActions.ts) to construct UTC booking timestamps on the requested appointment date using the slot's `"HH:mm"` string and the admin's IANA timezone via `convertToUTC`.
  - Created idempotent database migration script `scripts/migrate-schedule-slots-to-string.mjs` with backup capabilities.
- **Verification:** `tests/bug-01.test.mjs`, `tests/schedule-integration.test.mjs`.

---

### BUG-02: `toISOString().split("T")[0]` Shifting Calendar Date in Western Timezones
- **Category:** Dates & Time (Critical)
- **Root Cause:** In the public booking calendar (`app/(public)/events/[eventId]/page.tsx`), selecting a date triggered `date.toISOString().split("T")[0]`. For users in UTC-negative timezones (e.g. UTC-5 in New York or UTC-8 in California), a local date like midnight November 3 became `2026-11-02T...Z`, querying available slots for the *previous day*.
- **Remediation:** Formatted dates using local calendar components (`getFullYear()`, `getMonth() + 1`, `getDate()`) padded with zeroes (`YYYY-MM-DD`).
- **Verification:** `tests/bug-02.test.mjs`.

---

### BUG-03: Read-Modify-Write Concurrency Races on `Schedule.timeSlots`
- **Category:** Concurrency (Critical)
- **Root Cause:** `addTimeSlot`, `removeTimeSlot`, `updateTimeSlot`, and `toggleTimeSlotStatus` fetched the entire `Schedule` document into memory, modified the in-memory array in JavaScript, and wrote back the full document via `schedule.save()`. Concurrent requests or simultaneous admin edits caused lost updates and overwritten slots.
- **Remediation:** Replaced read-modify-write patterns with atomic MongoDB operators:
  - Atomic addition: `$push: { timeSlots: newSlot }`
  - Atomic removal: `$pull: { timeSlots: { _id: targetSlot._id } }`
  - Atomic mutation: Positional `$set: { "timeSlots.$.isEnabled": isEnabled }`
- **Verification:** `tests/bug-03.test.mjs`.

---

### BUG-04: Leaking Admin Timezones via Module-Level `timezoneCache`
- **Category:** Concurrency / Data Isolation (Critical)
- **Root Cause:** In `getAvailableSlotsActions.ts`, `timezoneCache` was a single module-level object `{ timezone, timestamp }`. When User A queried Admin 1 (e.g., in Europe/Paris), the cache was populated with Paris. If User B queried Admin 2 (e.g., in America/New_York) within 5 minutes, User B was served slots generated using Admin 1's timezone.
- **Remediation:** Replaced the global object with a `Map<string, { timezone: string; timestamp: number }>` keyed by `adminId`.
- **Verification:** `tests/bug-04.test.mjs`.

---

### BUG-05: Next.js `redirect()` Swallowed by Server Action `catch` Blocks
- **Category:** Auth & Permissions (High)
- **Root Cause:** Next.js uses internal thrown errors (`NEXT_REDIRECT`) to initiate client redirection from server actions. Generic `try ... catch (error)` blocks in `scheduleAction.ts` intercepted these errors, treating them as generic failures and preventing unauthenticated users from being redirected to `/auth/sign-in`.
- **Remediation:** Added `if (isRedirectError(error)) throw error;` as the first statement in every server action catch block.
- **Verification:** `tests/bug-05.test.mjs`.

---

### BUG-06: Zod Schema ASCII String Comparison for Time Slots
- **Category:** Validation (High)
- **Root Cause:** `timeSlotSchema` used `.refine((data) => data.startTime < data.endTime)`. In ASCII string comparison, non-zero-padded single-digit times or irregular formats fail (e.g., `"9:00" < "10:00"` is `false` because `'9' > '1'`), and invalid ranges can slip through.
- **Remediation:** Introduced `toMinutes(time: string): number` to perform numeric minute comparison (`toMinutes(startTime) < toMinutes(endTime)`).
- **Verification:** `tests/bug-06.test.mjs`.

---

### BUG-07: Unsanitized `dayOfWeek` Server Action Parameter
- **Category:** Validation / Security (High)
- **Root Cause:** Server actions accepted `dayOfWeek` as a raw string and passed it directly to Mongoose queries (`Schedule.findOne({ dayOfWeek })`), exposing queries to invalid inputs or NoSQL injection objects.
- **Remediation:** Enforced strict validation using `dayOfWeekSchema = z.enum(DAYS_OF_WEEK)`.
- **Verification:** `tests/bug-07.test.mjs`.

---

### BUG-08: Race Conditions Allowing Double Booking on the Same Slot
- **Category:** Concurrency / Data Integrity (Critical)
- **Root Cause:** No database-level unique constraint prevented two users from simultaneously checking out and confirming the same admin time slot.
- **Remediation:**
  1. Configured partial unique compound index `unique_confirmed_slot_per_admin` on `{ adminId: 1, startTime: 1 }` with `{ partialFilterExpression: { status: "confirmed" } }` in [Booking.ts](file:///d:/PROJECTS/CLIENTS/LUXAMA%20PREMIUM%20GROUP/luxama-preium-group/lib/models/Booking.ts).
  2. Added pre-checkout slot availability check in `createBookingCheckout`.
  3. Intercepted MongoDB duplicate key error code `11000` in the Stripe webhook (`/api/webhook/stripe`), setting the booking status to `"conflict"` and acknowledging Stripe with HTTP 200 so webhooks are not retried indefinitely.
- **Verification:** `tests/bug-08.test.mjs`.

---

### BUG-09: Modal Dialogs Closing on Action Failures
- **Category:** Frontend / UX (Medium)
- **Root Cause:** In `DayScheduleGrid.tsx`, action handlers closed edit/create modals unconditionally before checking if the server action succeeded. When an action failed (e.g. invalid time range or overlap error), the modal closed and user form input was lost.
- **Remediation:** Updated handlers to return boolean status; modals now only close when the operation explicitly succeeds (`success !== false`).
- **Verification:** `tests/bug-09.test.mjs`.

---

### BUG-10: Inverted Time Range Display in Day Schedule Grid
- **Category:** Frontend / Display (Low)
- **Root Cause:** `formatTimeRange(start, end)` in `DayScheduleGrid.tsx` returned `${end} - ${start}`, displaying time ranges backward (e.g. "17:00 - 09:00").
- **Remediation:** Fixed the template literal to return `${start} - ${end}`.
- **Verification:** `tests/bug-10.test.mjs`.

---

### BUG-11: Array Index Targeting When Mutating Subdocument Time Slots
- **Category:** Data Integrity (High)
- **Root Cause:** Modifying or deleting time slots used numeric array indices (`timeSlots[index]`). If another client inserted or deleted a slot concurrently, index shifts caused the mutation to hit the wrong time slot.
- **Remediation:** Exposed subdocument `_id` on `ITimeSlot`, allowing operations to target slots by their immutable `_id`.
- **Verification:** `tests/bug-11.test.mjs`.

---

### RISK-01: Missing Compound Index on `Booking` for Availability Lookups
- **Category:** Performance / Database
- **Remediation:** Added compound index `{ adminId: 1, startTime: 1, status: 1 }` (`booking_availability_idx`) to [Booking.ts](file:///d:/PROJECTS/CLIENTS/LUXAMA%20PREMIUM%20GROUP/luxama-preium-group/lib/models/Booking.ts).
- **Verification:** `tests/risk-01.test.mjs`.

---

### RISK-02: Hardcoded Auth Database Name Across Server Actions and Webhooks
- **Category:** Environment / Configuration
- **Remediation:** Centralized auth database resolution in [db-client.ts](file:///d:/PROJECTS/CLIENTS/LUXAMA%20PREMIUM%20GROUP/luxama-preium-group/lib/db-client.ts) via `AUTH_DB_NAME = process.env.AUTH_DB_NAME || "auth_db"` and `getAuthDb()`. Replaced all raw `client.db("auth_db")` calls in BetterAuth, checkout actions, admin actions, and Stripe webhooks.
- **Verification:** `tests/risk-02.test.mjs`.

---

### RISK-03: Untrusted Client `userId` in `checkoutBooking` Server Action
- **Category:** Security / Authorization
- **Remediation:** Enforced `verifyUser()` session verification inside `createBookingCheckout` and bound the booking strictly to `sessionUser.id`, preventing malicious callers from creating bookings on behalf of arbitrary users.
- **Verification:** `tests/risk-03.test.mjs`.

---

## 3. Database Migration Guide

To migrate legacy `Schedule` documents with `Date` time slots to `"HH:mm"` strings:

```bash
# 1. Preview changes in dry-run mode (no database writes)
node scripts/migrate-schedule-slots-to-string.mjs --dry-run

# 2. Run the migration
node scripts/migrate-schedule-slots-to-string.mjs
```

### Safety & Rollback:
- The script automatically writes a timestamped JSON backup snapshot to `scripts/backups/schedule-migration-backup-<timestamp>.json` before applying changes.
- The migration is idempotent; running it repeatedly produces `0 schedule(s) were migrated`.

---

## 4. Verification & Test Suite Summary

- **TypeScript Typecheck:** `npx tsc --noEmit` -> **0 errors**
- **Unit & Reproduction Tests:** `node --test tests/*.test.mjs` -> **26 tests passing, 0 failing**
- **Integration Test Suite:** `node --test tests/schedule-integration.test.mjs` -> **4 / 4 main flows passing**
- **Production Build:** `npm run build` -> **Compiled successfully, static optimization passed (25/25 routes)**

---

## 5. User Manual Test Checklist

- [ ] **Admin Schedule Management**
  - [ ] Log in as admin and visit `/admin/schedule`.
  - [ ] Add a new time slot (e.g. Monday 09:00 - 12:00); verify time range displays as `09:00 - 12:00`.
  - [ ] Try adding an overlapping slot (e.g. 10:00 - 13:00); verify the error message appears and the modal remains open with input intact.
  - [ ] Edit the slot time and toggle enabled/disabled status; verify changes persist.
  - [ ] Delete a time slot and verify the correct slot is deleted.
- [ ] **Public Booking Calendar**
  - [ ] Visit an event booking page `/events/[eventId]`.
  - [ ] Verify the date selected matches the exact day displayed (no previous day shift in western timezones).
  - [ ] Verify that available slots match the admin's schedule for that day.
- [ ] **Booking & Concurrency**
  - [ ] Book a free or test consultation slot.
  - [ ] Verify booking appears in `/admin/bookings` and `/client/bookings`.
  - [ ] Attempt to book the exact same slot in another browser/incognito session; verify the slot is marked unavailable or blocked at checkout.
- [ ] **Auth Enforcement**
  - [ ] Log out and attempt to trigger an admin action; verify immediate redirection to `/auth/sign-in`.

---

## 6. Go / No-Go Verdict

### **VERDICT: GO FOR PRODUCTION**

All identified critical bugs and architectural risks have been remediated, covered with regression tests, validated by typechecking and full production Next.js builds, and backed by a safe, verified migration path.
