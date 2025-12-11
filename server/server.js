const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// const seedDummyData = require("./models/dummyData");
require('dotenv').config();

const app = express();
const PORT = process.env.NODE_PORT || 5000;

app.use(cors());
app.use(express.json());


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
})
.catch(err => console.log(err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
