import { MongoClient, ObjectId } from "mongodb";
import fs from "node:fs";
import path from "node:path";
import { toZonedTime, format } from "date-fns-tz";
import dotenv from "dotenv";

// Load .env or .env.local
const envLocalPath = path.resolve(process.cwd(), ".env.local");
const envPath = path.resolve(process.cwd(), ".env");

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const mongoUri = process.env.MONGODB_URL;
if (!mongoUri) {
  console.error("Error: MONGODB_URL is not set in environment.");
  process.exit(1);
}

const isDryRun = process.argv.includes("--dry-run");

function toTimeString(val, timezone = "UTC") {
  if (typeof val === "string" && /^\d{1,2}:\d{2}$/.test(val)) {
    const [h, m] = val.split(":");
    return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
  }
  const dateObj = typeof val === "string" ? new Date(val) : val;
  if (dateObj instanceof Date && !isNaN(dateObj.getTime())) {
    const zoned = toZonedTime(dateObj, timezone);
    return format(zoned, "HH:mm", { timeZone: timezone });
  }
  return val;
}

async function runMigration() {
  console.log(`Starting Schedule migration${isDryRun ? " (DRY-RUN MODE)" : ""}...`);
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    console.log("Connected to MongoDB.");

    const db = client.db();
    const schedulesColl = db.collection("schedules");
    const authDbName = process.env.AUTH_DB_NAME || "auth_db";
    const usersColl = client.db(authDbName).collection("user");

    const schedules = await schedulesColl.find({}).toArray();
    console.log(`Found ${schedules.length} schedule document(s).`);

    let modifiedCount = 0;
    const backups = [];

    for (const schedule of schedules) {
      if (!schedule.timeSlots || !schedule.timeSlots.length) continue;

      let adminTimezone = "UTC";
      try {
        if (schedule.adminId) {
          const admin = await usersColl.findOne({ _id: new ObjectId(schedule.adminId) });
          if (admin?.timezone) {
            adminTimezone = admin.timezone;
          }
        }
      } catch (err) {
        // Fallback to UTC
      }

      let hasChanges = false;
      const updatedSlots = schedule.timeSlots.map((slot) => {
        const newStart = toTimeString(slot.startTime, adminTimezone);
        const newEnd = toTimeString(slot.endTime, adminTimezone);

        if (newStart !== slot.startTime || newEnd !== slot.endTime) {
          hasChanges = true;
        }

        return {
          ...slot,
          startTime: newStart,
          endTime: newEnd,
        };
      });

      if (hasChanges) {
        modifiedCount++;
        backups.push({
          _id: schedule._id,
          originalSlots: schedule.timeSlots,
          updatedSlots,
        });

        if (!isDryRun) {
          await schedulesColl.updateOne(
            { _id: schedule._id },
            { $set: { timeSlots: updatedSlots } },
          );
        }
      }
    }

    if (backups.length > 0 && !isDryRun) {
      const backupDir = path.resolve(process.cwd(), "scripts", "backups");
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      const backupPath = path.join(
        backupDir,
        `schedule-migration-backup-${Date.now()}.json`,
      );
      fs.writeFileSync(backupPath, JSON.stringify(backups, null, 2));
      console.log(`Backup saved to ${backupPath}`);
    }

    console.log(
      `Migration complete. ${modifiedCount} schedule(s) ${isDryRun ? "would be" : "were"} migrated.`,
    );
  } finally {
    await client.close();
  }
}

runMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
