// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

// Initialize Express app
const app = express();

// Connect to Database
connectDB();

// ✅ Allowed Origins: Development + Production
const allowedOrigins = [
  'http://localhost:3000',
  'https://authorization-app-react.vercel.app', // Your Vercel frontend
];

// ✅ CORS middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    } 
    if (origin === 'https://authorization-app-react.vercel.app') {
      return callback(null, origin);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// ✅ Handle preflight OPTIONS requests
app.options('*', cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  origin: 'https://authorization-app-react.vercel.app',
  credentials: true,
}));

// ✅ Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ✅ Routes
app.use('/', authRoutes);

// ✅ Server Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
