require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('./config/db');
const loggerMiddleware = require('./middlewares/loggerMiddleware');
const reportRoutes  = require('./routes/reports.routes');

// const seedDummyData = require("./models/dummyData");

const app = express();
const PORT = process.env.NODE_PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);


app.use('/api/reports', reportRoutes);

app.get('/', (req, res) => {
    res.send('Server is running');
});








app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
