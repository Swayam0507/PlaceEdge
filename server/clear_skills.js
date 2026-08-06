const mongoose = require('mongoose');
require('dotenv').config(); // Load from server/.env
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');
  await User.updateMany({}, { skills: [] });
  console.log('Skills cleared');
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
