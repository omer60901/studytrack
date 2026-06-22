import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const connectWithFallback = async (): Promise<boolean> => {
  const localUri = process.env.LOCAL_MONGO || 'mongodb://127.0.0.1:27017/studytrack';
  try {
    console.log('Attempting local MongoDB fallback:', localUri);
    await mongoose.connect(localUri, { serverSelectionTimeoutMS: 2000 });
    console.log('Connected to local MongoDB fallback');
    return true;
  } catch (localErr) {
    console.error('Local MongoDB fallback failed:', localErr);
  }

  if (process.env.NODE_ENV !== 'production') {
    try {
      console.log('Starting in-memory MongoDB fallback for development');
      const mongod = await MongoMemoryServer.create();
      await mongoose.connect(mongod.getUri('studytrack'));
      console.log('Connected to in-memory MongoDB fallback');
      return true;
    } catch (memoryErr) {
      console.error('In-memory MongoDB fallback failed:', memoryErr);
    }
  }

  return false;
};

const connectDatabase = async (): Promise<boolean> => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.warn('MONGO_URI or MONGODB_URI is not defined in environment variables. Skipping remote connect.');
    return await connectWithFallback();
  }

  try {
    // Use a short server selection timeout during development to fail fast when
    // Atlas access is blocked by IP whitelist settings.
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB');
    return true;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    return await connectWithFallback();
  }
};

export default connectDatabase;
