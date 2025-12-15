const express = require('express');
const cors = require('cors');
<<<<<<< HEAD
const cookieParser = require('cookie-parser');
require('./config/db');
=======
const db = require('./config/db');
const fs = require('fs');
const path = require('path');
>>>>>>> origin/feature/classes

// const seedDummyData = require("./models/dummyData");
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userController = require('./controllers/userController');
const authMiddleware = require('./middlewares/authMiddleware');

const app = express();
const PORT = process.env.NODE_PORT || 5000;

<<<<<<< HEAD
app.use(
  cors({
    origin: process.env.APP_BASE_URL || 'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
=======
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads folder (optional for debugging)
>>>>>>> origin/feature/classes

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


/* -----------------------------------------
   MOUNT ONLY YOUR PART (Classes + Students)
------------------------------------------ */
try {
    const classRoutes = require('./routes/classesRoutes.js');
    const studentRoutes = require('./routes/studentsRoutes.js');

    app.use('/api/classes', classRoutes);
    app.use('/api/students', studentRoutes);

    console.log("Mounted: /api/classes and /api/students");
} catch (err) {
    console.error("\n❌ Error mounting routes:", err.message);
    console.error("Make sure routes and middlewares exist.\n");
}

/* -----------------------------------------
   GLOBAL ERROR HANDLER
------------------------------------------ */
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.stack || err);
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error"
    });
});


// Routes
app.use('/api/auth', authRoutes);       // register, login, refresh, verify, reset
app.use('/api/admin', adminRoutes);     // admin-only endpoints (router already protects)
app.get('/api/users/me', authMiddleware, userController.getMe); // profile

// Generic error handler (minimal)
app.use((err, req, res, next) => {
  console.error(err); // developer-only console logging
  const status = err.status || 500;
  res.status(status).json({ success: false, message: err.message || 'Server error' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
