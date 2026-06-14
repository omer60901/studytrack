import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("MONGODB_URI missing. API will start, but database routes require MongoDB.");
    return;
  }

  await mongoose.connect(uri);
  console.log("MongoDB connected");
}
