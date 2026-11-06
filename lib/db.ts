import mongoose from "mongoose";
import "@/lib/models/Booking";
import "@/lib/models/Event";
import "@/lib/models/Schedule";
import "@/lib/models/Timezone";

if (!process.env.MONGODB_URL) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URL"');
}

const MONGODB_URL = process.env.MONGODB_URL;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Use a different name for the global variable
declare global {
  var _mongoose: MongooseCache | undefined
}

// Initialize with a different name
const cached: MongooseCache = global._mongoose ?? { conn: null, promise: null };

if (!global._mongoose) {
  global._mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      autoIndex: process.env.NODE_ENV !== "production",
    };

    cached.promise = mongoose
      .connect(MONGODB_URL, opts)
      .then((mongooseInstance) => {
        return mongooseInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
