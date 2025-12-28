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
const attendanceSessionsRoutes = require('./routes/attendanceSessionsRoutes');
const classroomImagesRoutes = require('./routes/classroomImagesRoutes');
const attendanceRecordsRoutes = require('./routes/attendanceRecordsRoutes');
const reportRoutes = require('./routes/reportsRoutes');

const app = express();
const PORT = process.env.NODE_PORT || 5000;

app.use(
  cors({
    origin: process.env.APP_BASE_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



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
app.use('/api/attendance-sessions', attendanceSessionsRoutes);
app.use('/api/classroom-images', classroomImagesRoutes);
app.use('/api/attendance-records', attendanceRecordsRoutes);
app.use('/api/reports', reportRoutes);

// Generic error handler (minimal)
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err); // Log full error
  const status = err.status || 500;
  res.status(status).json({ success: false, message: err.message || 'Server error', errorField: err.field });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));