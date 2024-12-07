import mongoose from "mongoose"
import { env } from "@/lib/env"
/**
 * connect MongoDB and init data
 */
export async function connectToDatabase(): Promise<void> {
  if (global.mongodb) {
    return
  }
  global.mongodb = "connecting"

  try {
    global.mongodb = await mongoose.connect(env.MONGODB_URI, {
      bufferCommands: true,
      maxConnecting: Number(env.DB_MAX_LINK || 5),
      maxPoolSize: Number(env.DB_MAX_LINK || 5),
      minPoolSize: 2,
    })

    console.log("mongo connected")
  } catch (error: unknown) {
    console.log("error->", "mongo connect error", error)
    global.mongodb = null
  }
}
