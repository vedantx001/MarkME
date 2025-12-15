const mongoose = require('mongoose');
require('dotenv').config();

<<<<<<< HEAD
=======

>>>>>>> origin/feature/attendance-sessions
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(async () => {
    console.log('MongoDB connected');
})
.catch(err => console.log(err));

mongoose.connection.once('open', () => {
  console.log('Connected DB name:', mongoose.connection.name);
});
