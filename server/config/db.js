import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to mongo: ' + db.connection.host);
  } catch (err) {
    console.log('db error', err);
    process.exit(1);
  }
};

export default connectDB;
