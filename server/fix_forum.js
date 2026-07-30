require("dotenv").config();
const mongoose = require("mongoose");
const ForumPost = require("./models/ForumPost");
const User = require("./models/User");
const connectDB = require("./config/db");

const fixForum = async () => {
  try {
    await connectDB();
    
    // Find the new students
    const rahul = await User.findOne({ email: "rahul@example.com" });
    const priya = await User.findOne({ email: "priya@example.com" });

    if (!rahul) {
      console.log("Rahul not found!");
      process.exit(1);
    }

    // Get all forum posts
    const posts = await ForumPost.find();
    let fixed = 0;

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      // Assign alternate posts to Rahul and Priya so it looks natural
      post.userId = i % 2 === 0 ? rahul._id : priya._id;
      
      // Also fix replies
      if (post.replies && post.replies.length > 0) {
        post.replies.forEach((reply, idx) => {
          reply.userId = idx % 2 === 0 ? priya._id : rahul._id;
        });
      }
      
      await post.save();
      fixed++;
    }

    console.log(`Successfully reassigned ${fixed} forum posts to Rahul and Priya.`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

fixForum();
