const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const fs = require('fs');
const path = require('path');

// const seedDummyData = require("./models/dummyData");
require('dotenv').config();

const app = express();
const PORT = process.env.NODE_PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads folder (optional for debugging)

app.get('/', (req, res) => {
    res.send('Server is running');
});

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


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
