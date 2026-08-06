const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const ForumPost = require('./models/ForumPost');

const seedForum = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing posts
    await ForumPost.deleteMany({});
    console.log("Deleted old forum posts.");

    // Get an admin or regular user to assign as author
    const author = await User.findOne({ role: 'admin' }) || await User.findOne({});
    if (!author) {
      console.log("No users found in database to assign as author.");
      process.exit(1);
    }

    const dummyPosts = [
      {
        userId: author._id,
        title: "Top 50 SQL Queries for Data Analyst Interviews 📊",
        content: `I found this amazing cheat sheet for SQL queries commonly asked in Data Analyst interviews. Linking it below:\n\nhttps://github.com/techtalk/sql-interview-questions\n\nIt covers:\n*   **Joins** (Inner, Left, Right, Full)\n*   **Window Functions** (RANK, DENSE_RANK)\n*   **CTEs** and Subqueries\n\nHighly recommend going through this before your next technical round!`,
        category: "resources",
        tags: ["SQL", "Data Analyst", "Interview Prep"],
        isPinned: true,
        views: 342,
        upvotes: [author._id]
      },
      {
        userId: author._id,
        title: "TCS Ninja Interview Experience (Selected) 🎉",
        content: `Hey everyone, I recently cleared the TCS Ninja interview. Here is my experience:\n\n### Aptitude Round\nPretty standard. Focus on Time & Work, Speed & Distance, and Syllogisms.\n\n### Coding Round\nThey asked 2 questions:\n1.  Find the second largest element in an array.\n2.  Check if a string is a palindrome.\n\nI practiced a lot from this playlist: https://youtube.com/playlist?list=PL_z_8CaSLPWgO4VzD90aW5gH\n\nGood luck to everyone preparing!`,
        category: "company-reviews",
        tags: ["TCS", "Interview Experience"],
        isPinned: false,
        views: 512,
        upvotes: []
      },
      {
        userId: author._id,
        title: "Doubt in React useEffect dependency array",
        content: `I am building my final year project and getting an infinite loop when using \`useEffect\`. \n\nHere is my code snippet:\n\`\`\`javascript\nuseEffect(() => {\n  fetchData();\n}, [fetchData]);\n\`\`\`\n\nAny idea why this keeps running endlessly? Read some docs here https://react.dev/reference/react/useEffect but still confused.`,
        category: "doubt-clearing",
        tags: ["React", "JavaScript", "Frontend"],
        isPinned: false,
        views: 89,
        upvotes: []
      }
    ];

    await ForumPost.insertMany(dummyPosts);
    console.log("Successfully seeded new forum posts with rich text and links!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding forum:", error);
    process.exit(1);
  }
};

seedForum();
