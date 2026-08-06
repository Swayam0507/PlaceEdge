const mongoose = require('mongoose');
require('dotenv').config({path: './server/.env'});
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./server/models/User');
  await User.updateMany({}, { skills: [] });
  console.log('Skills cleared');
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
