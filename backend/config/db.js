const mongoose = require('mongoose');

let cachedConn = null;

const connectDB = async () => {
  if (cachedConn) {
    return cachedConn;
  }

  if (!process.env.MONGODB_URI) {
    console.error('Error: MONGODB_URI environment variable is missing.');
    return null;
  }

  try {
    // Set buffer timeout options to fail fast instead of hanging
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    cachedConn = conn;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // In serverless, do not call process.exit(1) as it kills the instance container.
    // Instead, throw the error so the API invocation reports the issue.
    throw error;
  }
};

module.exports = connectDB;
