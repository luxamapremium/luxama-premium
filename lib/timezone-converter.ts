import { fromZonedTime, toZonedTime, format } from "date-fns-tz";

export function convertToUTC(
  time: string,
  timezone: string,
  baseDate: Date = new Date(),
) {
  const [hours, minutes] = time.split(":").map(Number);

  // Get the date part in the target timezone
  const zonedDate = toZonedTime(baseDate, timezone);

  // Apply the specific hours/minutes to that zoned date
  zonedDate.setHours(hours, minutes, 0, 0);

  // Convert that precise wall-clock moment back to UTC
  return fromZonedTime(zonedDate, timezone);
}

export function convertFromUTC(date: Date | string, timezone: string) {
  // Ensure we are working with a Date object
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const zonedDate = toZonedTime(dateObj, timezone);

  return format(zonedDate, "HH:mm", { timeZone: timezone });
}
3