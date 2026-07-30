require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const connectDB = require("./config/db");

const seedMixedStudents = async () => {
  try {
    console.log("Connecting to DB...");
    await connectDB();
    
    // 1. Delete all students (keep admins)
    const result = await User.deleteMany({ role: "student" });
    console.log(`Deleted ${result.deletedCount} old students.`);

    // 2. Insert mixed students
    const studentsToCreate = [
      {
        name: "Rahul Verma",
        email: "rahul@example.com",
        password: "password123", // Will be hashed by pre-save hook
        role: "student",
        branch: "Computer Engineering",
        semester: 7,
        cgpa: 8.5,
        isOnboardingComplete: true,
        onboardingTrack: "company",
        targetCompany: "Google",
        customRoadmap: {
          gapAnalysis: "Rahul has good frontend skills but is missing advanced System Design and core Data Structures expected at Google.",
          missingSkills: ["System Design", "Advanced DP", "Graphs"],
          weeks: [
            { week: 1, title: "Data Structures Mastery", tasks: ["Master Graphs & Trees", "Solve 50 LeetCode Hard"] },
            { week: 2, title: "System Design Basics", tasks: ["Learn CAP Theorem", "Design a URL shortener"] },
            { week: 3, title: "Advanced Algorithms", tasks: ["Dynamic Programming", "Greedy Algorithms"] },
            { week: 4, title: "Mock Interviews", tasks: ["Do 3 peer mock interviews", "Revise core concepts"] }
          ]
        }
      },
      {
        name: "Priya Sharma",
        email: "priya@example.com",
        password: "password123",
        role: "student",
        branch: "Information Technology",
        semester: 6,
        cgpa: 9.1,
        isOnboardingComplete: true,
        onboardingTrack: "general",
        targetCompany: "",
        customRoadmap: null // Will show generic journey map
      },
      {
        name: "Amit Patel",
        email: "amit@example.com",
        password: "password123",
        role: "student",
        branch: "Computer Science",
        semester: 5,
        cgpa: 7.8,
        isOnboardingComplete: false, // Will be redirected to onboarding
        onboardingTrack: "general"
      }
    ];

    for (const student of studentsToCreate) {
      await User.create(student);
    }
    
    console.log(`Successfully seeded ${studentsToCreate.length} mixed students.`);
    console.log("Credentials:");
    console.log("- rahul@example.com (Company Track)");
    console.log("- priya@example.com (General Track)");
    console.log("- amit@example.com (Needs Onboarding)");
    console.log("Password for all: password123");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding students:", error);
    process.exit(1);
  }
};

seedMixedStudents();
