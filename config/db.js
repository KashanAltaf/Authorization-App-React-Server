const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Attempt to connect to the MongoDB cluster
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB connected successfully.');
  } catch (err) {
    // Log any errors that occur during connection
    console.error('MongoDB connection error:', err.message);
    // Exit the process with failure code
    process.exit(1);
  }
};

module.exports = connectDB;
