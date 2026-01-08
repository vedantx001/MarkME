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

// For cookie-based auth across domains (Vercel -> Render), origin must be explicit (not '*').
// Set this to your Vercel deployment URL, e.g. https://<your-app>.vercel.app
const CLIENT_ORIGIN = process.env.CLIENT_URL?.replace(/\/+$/, '');

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server, health checks, Postman, curl
      if (!origin) return callback(null, true);

      // Allow frontend only if CLIENT_URL is set and matches
      if (CLIENT_ORIGIN && origin === CLIENT_ORIGIN) {
        return callback(null, true);
      }

      return callback(null, false); // IMPORTANT: false, not Error
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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

// 404 for unknown API routes (must be after all /api routes)
app.use('/api', (req, res) => {
  return res.status(404).json({ success: false, message: 'API route not found' });
});

// Generic error handler (minimal)
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err); // Log full error
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Server error',
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));