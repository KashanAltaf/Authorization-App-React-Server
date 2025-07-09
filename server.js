// server.js

require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const connectDB  = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();
connectDB();

const allowedOrigins = [
  'http://localhost:3000',
  'https://authorization-app-react.vercel.app',
];

const corsOptions = {
  origin: (origin, callback) => {
    // allow tools like Postman or same‑site requests without origin
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      // echo back the requesting origin
      return callback(null, origin);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  optionsSuccessStatus: 204,
};

// **Apply this once** before any body‑parsing or routes
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// your auth routes
app.use('/', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
