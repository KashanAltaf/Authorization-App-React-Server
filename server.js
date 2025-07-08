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

// ✅ CORS Setup — Correct and Minimal
app.use(cors({
  origin: 'https://authorization-app-react.vercel.app',
  credentials: true,
}));

// ✅ Handle preflight (OPTIONS) requests globally
app.options('*', cors({
  origin: 'https://authorization-app-react.vercel.app',
  credentials: true,
}));

// ✅ Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/', authRoutes);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
