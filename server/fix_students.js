const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "./.env") });

const connectDB = require("./config/db");
const User = require("./models/User");
const TestAttempt = require("./models/TestAttempt");

const fixStudentData = async () => {
  try {
    console.log("Connecting to MongoDB via connectDB...");
    await connectDB();

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

      // Helper for random fluctuations
      const rOffset = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
      const rScore = (base, max) => Math.min(Math.max(base + rOffset(-3, 3), 1), max);
      const rPct = (base) => Math.min(Math.max(base + rOffset(-12, 12), 20), 100);
      const rTime = (base) => Math.max(base + rOffset(-180, 180), 60);

      if (stage >= 1) {
        // Complete Aptitude
        await TestAttempt.insertMany([
          { userId: student._id, category: "quantitative", difficulty: "medium", score: rScore(12, 15), totalQuestions: 15, percentage: rPct(80), timeTaken: rTime(600) },
          { userId: student._id, category: "logical", difficulty: "hard", score: rScore(10, 15), totalQuestions: 15, percentage: rPct(66), timeTaken: rTime(750) },
          { userId: student._id, category: "quantitative", difficulty: "easy", score: rScore(14, 15), totalQuestions: 15, percentage: rPct(93), timeTaken: rTime(400) }
        ]);
      }

      if (stage >= 2) {
        // Complete Coding
        await TestAttempt.insertMany([
          { userId: student._id, category: "technical", difficulty: "medium", score: rScore(15, 20), totalQuestions: 20, percentage: rPct(75), timeTaken: rTime(1200) },
          { userId: student._id, category: "technical", difficulty: "hard", score: rScore(18, 20), totalQuestions: 20, percentage: rPct(90), timeTaken: rTime(1500) }
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
        student.interviewPracticeCount = 5 + rOffset(-2, 5);
      }

      // Add a couple of random test attempts that are incomplete for some realism
      if (stage === 0) {
        await TestAttempt.insertMany([
          { userId: student._id, category: "quantitative", difficulty: "easy", score: rScore(5, 15), totalQuestions: 15, percentage: rPct(33), timeTaken: rTime(300) }
        ]);
        student.interviewPracticeCount = 1; // 1 mock interview
      } else if (stage === 1) {
        await TestAttempt.insertMany([
          { userId: student._id, category: "technical", difficulty: "easy", score: rScore(6, 20), totalQuestions: 20, percentage: rPct(30), timeTaken: rTime(500) }
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
