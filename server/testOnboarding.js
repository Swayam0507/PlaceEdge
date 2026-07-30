const mongoose = require("mongoose");
require("dotenv").config({ path: "./server/.env" });
const User = require("./server/models/User");

const testOnboarding = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to MongoDB.");

    // Find a student
    const user = await User.findOne({ role: "student" });
    if (!user) {
      console.log("No student found");
      return process.exit(0);
    }
    
    console.log("Found user:", user.email);
    console.log("Current onboardingTrack:", user.onboardingTrack);

    user.onboardingTrack = "general";
    user.targetCompany = "";
    user.isOnboardingComplete = true;

    console.log("Attempting to save user...");
    await user.save();
    console.log("User saved successfully!");

    process.exit(0);
  } catch (err) {
    console.error("Error during save:", err);
    process.exit(1);
  }
};

testOnboarding();
