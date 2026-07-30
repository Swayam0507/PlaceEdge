const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "./.env") });

const User = require("./models/User");
const TestAttempt = require("./models/TestAttempt");

const MONGODB_URI = process.env.MONGO_URI;

const fixStudentData = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, family: 4 });
    console.log("Connected to MongoDB.");

    // Delete old test attempts to start fresh
    await TestAttempt.deleteMany({});
    console.log("Wiped old test attempts.");

    const students = await User.find({ role: "student" });
    console.log(`Found ${students.length} students. Distributing into logical stages...`);

    const stageSize = Math.floor(students.length / 5);

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const stage = Math.min(Math.floor(i / stageSize), 4); // 0 to 4

      // Reset values
      student.interviewPracticeCount = 0;
      student.skills = [];
      student.bio = "";
      student.isOnboardingComplete = true;

      // Stage 0: Nothing done
      // Stage 1: Aptitude done
      // Stage 2: Aptitude + Coding done
      // Stage 3: Aptitude + Coding + Resume done
      // Stage 4: Everything done

      if (stage >= 1) {
        // Complete Aptitude
        await TestAttempt.insertMany([
          { userId: student._id, category: "quantitative", difficulty: "medium", score: 12, totalQuestions: 15, percentage: 80, timeTaken: 600 },
          { userId: student._id, category: "logical", difficulty: "hard", score: 10, totalQuestions: 15, percentage: 66, timeTaken: 750 },
          { userId: student._id, category: "quantitative", difficulty: "easy", score: 14, totalQuestions: 15, percentage: 93, timeTaken: 400 }
        ]);
      }

      if (stage >= 2) {
        // Complete Coding
        await TestAttempt.insertMany([
          { userId: student._id, category: "technical", difficulty: "medium", score: 15, totalQuestions: 20, percentage: 75, timeTaken: 1200 },
          { userId: student._id, category: "technical", difficulty: "hard", score: 18, totalQuestions: 20, percentage: 90, timeTaken: 1500 }
        ]);
      }

      if (stage >= 3) {
        // Complete Profile/Resume
        student.skills = ["JavaScript", "React", "Node.js", "MongoDB", "Data Structures", "Algorithms"];
        student.bio = "Passionate computer engineering student looking for SDE roles.";
        student.linkedin = "https://linkedin.com/in/student" + i;
        student.github = "https://github.com/student" + i;
      }

      if (stage >= 4) {
        // Complete Interview
        student.interviewPracticeCount = 5;
      }

      // Add a couple of random test attempts that are incomplete for some realism
      if (stage === 0) {
        await TestAttempt.insertMany([
          { userId: student._id, category: "quantitative", difficulty: "easy", score: 5, totalQuestions: 15, percentage: 33, timeTaken: 300 }
        ]);
        student.interviewPracticeCount = 1; // 1 mock interview
      } else if (stage === 1) {
        await TestAttempt.insertMany([
          { userId: student._id, category: "technical", difficulty: "easy", score: 6, totalQuestions: 20, percentage: 30, timeTaken: 500 }
        ]);
        student.interviewPracticeCount = 2; // 2 mock interviews
      } else if (stage === 2) {
        student.interviewPracticeCount = 3;
      }

      await student.save();
    }

    console.log("Successfully fixed and logically seeded all students!");
    process.exit(0);
  } catch (err) {
    console.error("Error fixing student data:", err);
    process.exit(1);
  }
};

fixStudentData();
