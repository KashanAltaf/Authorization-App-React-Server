// server.js
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();
connectDB();

const allowedOrigins = [
  'http://localhost:3000',
  'https://authorization-app-react.vercel.app',
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      // Echo back the exact origin
      return callback(null, origin);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,            // <- required for cookies
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  optionsSuccessStatus: 204,    // some legacy browsers choke on 204
};

// Apply it _before_ body-parsers & routes
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Now your routes:
app.use('/', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
