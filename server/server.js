const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require("./routes/authRoutes");
const classRoute = require("./routes/classRoute");
const studentRoute = require('./routes/studentRoutes');
const attendanceRoute = require('./routes/attendanceRoutes');

// const seedDummyData = require("./models/dummyData");
require('dotenv').config();

const app = express();
const PORT = process.env.NODE_PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/classrooms", classRoute);
app.use('/api/students',studentRoute);
app.use('/api/attendance', attendanceRoute);


app.get('/', (req, res) => {
    res.send('Server is running');
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(async () => {
    console.log('MongoDB connected');
    try {
        const Classroom = require('./models/Classroom');
            const Student = require('./models/Student');
        // Drop stale index if present: schoolId_1_name_1
        const coll = mongoose.connection.collection('classrooms');
        const indexes = await coll.indexes();
        const stale = indexes.find(i => i.name === 'schoolId_1_name_1');
        if (stale) {
            await coll.dropIndex('schoolId_1_name_1');
            console.log('Dropped stale index schoolId_1_name_1');
        }
        // Ensure indexes are in sync with schema
        await Classroom.syncIndexes();
        console.log('Classroom indexes synced');

            // Ensure Student indexes are scoped correctly (classroomId + rollNo)
            const studentColl = mongoose.connection.collection('students');
            const sIndexes = await studentColl.indexes();
            // If a legacy unique index exists only on rollNo, drop it to avoid cross-class collisions
            const wrongRollIdx = sIndexes.find(i => i.name === 'rollNo_1' && i.unique);
            if (wrongRollIdx) {
                await studentColl.dropIndex('rollNo_1');
                console.log('Dropped legacy unique index rollNo_1 from students');
            }
            await Student.syncIndexes();
            console.log('Student indexes synced');
    } catch (idxErr) {
        console.warn('Index sync warning:', idxErr.message);
    }
})
.catch(err => console.log(err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
