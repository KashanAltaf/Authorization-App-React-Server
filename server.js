// server.js
require('dotenv').config();
const express    = require('express');
const connectDB  = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();
connectDB();

// ─── Manual CORS Middleware ────────────────────────────────────────────────────
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed = [
    'http://localhost:3000',
    'https://authorization-app-react.vercel.app'
  ];

  if (allowed.includes(origin)) {
    // 1) Echo the exact origin back:
    res.setHeader('Access-Control-Allow-Origin', origin);
    // 2) Allow cookies:
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  // 3) Permit these methods:
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  // 4) Dynamically allow whatever headers the browser requests:
  const requestHeaders = req.headers['access-control-request-headers'];
  if (requestHeaders) {
    res.setHeader('Access-Control-Allow-Headers', requestHeaders);
  } else {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  // 5) Immediately respond to preflight:
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});
// ────────────────────────────────────────────────────────────────────────────────

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Mount your auth routes under '/'
app.use('/', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
