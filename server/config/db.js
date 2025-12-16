// const mongoose = require('mongoose');
// require('dotenv').config();





// // Connect to MongoDB
// mongoose.connect(process.env.MONGO_URL, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// })
// .then(async () => {
//     console.log('MongoDB connected');
// })
// .catch(err => console.log(err));
const mongoose = require('mongoose');
require('dotenv').config();

console.log("MONGO_URL USED BY SERVER =", process.env.MONGO_URL);

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
  console.log('CONNECTED TO DB:', mongoose.connection.name);
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

module.exports = mongoose;
