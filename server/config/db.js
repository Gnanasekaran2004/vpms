import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const connectDB = async () => {
  try {
    console.log('Starting in-memory MongoDB server...');
    const mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    const db = await mongoose.connect(uri);
    console.log('Connected to local memory mongo: ' + db.connection.host);
  } catch (err) {
    console.log('db error', err);
    process.exit(1);
  }
};

export default connectDB;
