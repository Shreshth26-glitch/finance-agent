import { connectDB } from "./db.js";

try {
  await connectDB();
  process.exit(0);
} catch (error) {
  console.error("Connection failed:", error.message);
  process.exit(1);
}