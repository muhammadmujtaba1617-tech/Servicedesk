const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const dbConnection = async () => {
  try {
    // For development, use MongoDB Memory Server if no MONGODB_URI is provided
    if (!process.env.MONGODB_URI) {
      console.log('Initializing MongoDB Memory Server for development...');
      
      // Download and start the in-memory MongoDB server
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      
      await mongoose.connect(mongoUri);
      console.log('MongoDB Memory Server connected successfully');
    } else {
      // Use provided MongoDB URI (e.g., MongoDB Atlas or local instance)
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected successfully');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error disconnecting MongoDB:', error.message);
  }
};

module.exports = { dbConnection, disconnectDB };
