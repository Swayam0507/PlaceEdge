const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function findLinks() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  const User = require('./models/User');
  const user = await User.findOne({ email: 's06122710@gmail.com' });
  if (!user) {
    console.log('User not found');
    process.exit(0);
  }
  console.log('Found user:', user._id);

  const ForumPost = require('./models/ForumPost');
  const posts = await ForumPost.find({ userId: user._id });
  console.log('Forum Posts by user:');
  posts.forEach(p => {
    console.log(`Title: ${p.title}`);
    console.log(`Content: ${p.content}`);
    console.log('---');
  });

  const TestAttempt = require('./models/TestAttempt');
  const tests = await TestAttempt.find({ userId: user._id });
  console.log(`Found ${tests.length} test attempts by user.`);
  // Log any test attempt that might contain a link? Test attempts don't usually have custom text fields.

  console.log('Done');
  process.exit(0);
}

findLinks().catch(console.error);
