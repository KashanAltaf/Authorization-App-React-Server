// server.js
require('dotenv').config();
const express       = require('express');
const cors          = require('cors'); // ✅ Make sure this is imported
const connectDB     = require('./config/db');
const authRoutes    = require('./routes/authRoutes');

const app = express();
connectDB();

// ⛔️ Your old manual CORS middleware should be completely deleted. ⛔️

// ✅ This should be the ONLY CORS configuration.
const allowedOrigins = [
  'http://localhost:3000',
  'https://authorization-app-react.vercel.app'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions)); // ✅ Use the cors middleware

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));