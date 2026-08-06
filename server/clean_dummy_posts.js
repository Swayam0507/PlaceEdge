require("dotenv").config();
const mongoose = require("mongoose");
const ForumPost = require("./models/ForumPost");
const User = require("./models/User");

const cleanPosts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    // Find all users
    const validUsers = await User.find().select("_id");
    const validUserIds = validUsers.map(u => u._id.toString());

    // Find all posts
    const allPosts = await ForumPost.find();
    let deletedCount = 0;

    for (let post of allPosts) {
      if (!validUserIds.includes(post.userId.toString())) {
        await ForumPost.findByIdAndDelete(post._id);
        deletedCount++;
      }
    }

    console.log(`Deleted ${deletedCount} dummy posts with unknown authors.`);
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

cleanPosts();
