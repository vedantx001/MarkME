const express = require('express');
const cors = require('cors');
const db = require('./config/db');

// const seedDummyData = require("./models/dummyData");
require('dotenv').config();

const app = express();
const PORT = process.env.NODE_PORT || 5000;

app.use(cors());
app.use(express.json());

const attendanceSessionsRoutes = require('./routes/attendanceSessionsRoutes');
const classroomImagesRoutes = require('./routes/classroomImagesRoutes');
const attendanceRecordsRoutes = require('./routes/attendanceRecordsRoutes');

app.use('/api/attendance-sessions', attendanceSessionsRoutes);
app.use('/api/classroom-images', classroomImagesRoutes);
app.use('/api/attendance-records', attendanceRecordsRoutes);


app.get('/', (req, res) => {
    res.send('Server is running');
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
