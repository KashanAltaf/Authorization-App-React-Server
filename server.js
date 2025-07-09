// server.js
require('dotenv').config();
const express       = require('express');
const cors          = require('cors'); // Import the cors package
const connectDB     = require('./config/db');
const authRoutes    = require('./routes/authRoutes');

const app = express();
connectDB();

// ─── CORS Configuration ───────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'https://authorization-app-react.vercel.app'
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests from the allowed origins or requests with no origin (like Postman/curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // This is crucial for allowing cookies and credentials
};

app.use(cors(corsOptions)); // Use the cors middleware

// Remove your old manual app.use((req, res, next) => { ... }) block
// ────────────────────────────────────────────────────────────────────────────────

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Mount auth routes
app.use('/', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));