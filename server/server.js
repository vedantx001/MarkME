const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const db = require('./config/db');
const fs = require('fs');
const path = require('path');

// const seedDummyData = require("./models/dummyData");
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userController = require('./controllers/userController');
const authMiddleware = require('./middlewares/authMiddleware');
const classRoutes = require('./routes/classesRoutes.js');
const studentRoutes = require('./routes/studentsRoutes.js');

const app = express();
const PORT = process.env.NODE_PORT || 5000;

app.use(
  cors({
    origin: process.env.APP_BASE_URL || 'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploads folder (optional for debugging)

app.get('/', (req, res) => {
    res.send('Server is running');
});
app.get('/health', (req, res) => res.json({ ok: true }));

// Ensure /uploads exists for Excel uploads (multer)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory:', uploadsDir);
}

app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', authRoutes);       // register, login, refresh, verify, reset
app.use('/api/admin', adminRoutes);     // admin-only endpoints (router already protects)
app.get('/api/users/me', authMiddleware, userController.getMe); // profile
app.use('/api/classes', classRoutes);
app.use('/api/students', studentRoutes);

// Generic error handler (minimal)
app.use((err, req, res, next) => {
  console.error(err); // developer-only console logging
  const status = err.status || 500;
  res.status(status).json({ success: false, message: err.message || 'Server error' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
