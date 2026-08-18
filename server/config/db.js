import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }
    const db = await mongoose.connect(uri);
    console.log('Connected to MongoDB: ' + db.connection.host);
  } catch (err) {
    console.log('db error', err);
    process.exit(1);
  }
};

export default connectDB;
