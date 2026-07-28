const mongoose = require("mongoose");
const dotenv = require("dotenv");
const dns = require("dns");
const Company = require("../models/Company");
const User = require("../models/User");

dotenv.config({ path: __dirname + "/../.env" });
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const seedCompanies = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 30000 });
    console.log("✅ Connected to MongoDB");

    await Company.deleteMany({});
    console.log("🗑️  Old companies cleaned");

    // Fetch admin user
    const admin = await User.findOne({ role: "admin" });
    const adminId = admin ? admin._id : null;

    const companies = [
      {
        name: "Tata Consultancy Services (TCS)",
        industry: "IT Services",
        website: "https://www.tcs.com",
        package: { min: 3.36, max: 9.0, currency: "INR Lakhs" },
        eligibility: { minCGPA: 6.0, branches: ["Computer Science", "Information Technology", "Electronics"], maxBacklogs: 1 },
        visitDate: new Date(Date.now() + 15 * 86400000), // 15 days from now
        status: "upcoming",
        roles: ["Ninja", "Digital", "Prime"],
        description: "TCS National Qualifier Test (NQT) for 2026 passouts. One of the largest mass recruiters in India.",
        selectionProcess: ["Online NQT (Aptitude + Coding)", "Technical Interview", "HR Interview"],
        createdBy: adminId
      },
      {
        name: "Infosys",
        industry: "IT Services",
        website: "https://www.infosys.com",
        package: { min: 3.6, max: 9.5, currency: "INR Lakhs" },
        eligibility: { minCGPA: 6.5, branches: ["Computer Science", "Information Technology", "Electronics", "Mechanical"], maxBacklogs: 0 },
        visitDate: new Date(Date.now() + 25 * 86400000), // 25 days from now
        status: "upcoming",
        roles: ["System Engineer", "Specialist Programmer", "Power Programmer"],
        description: "Infosys Campus Recruitment Drive for 2026 passouts.",
        selectionProcess: ["Online Assessment", "Technical Interview", "HR Interview"],
        createdBy: adminId
      },
      {
        name: "Amazon India",
        industry: "Product/E-commerce",
        website: "https://www.amazon.jobs/en/locations/india",
        package: { min: 25.0, max: 45.0, currency: "INR Lakhs" },
        eligibility: { minCGPA: 8.0, branches: ["Computer Science", "Information Technology"], maxBacklogs: 0 },
        visitDate: new Date(Date.now() - 5 * 86400000), // 5 days ago
        status: "ongoing",
        roles: ["SDE-1 (Software Development Engineer)", "Cloud Support Associate"],
        description: "Amazon India Campus Recruitment for Software Development roles.",
        selectionProcess: ["Online Assessment (DSA)", "Technical Interview 1", "Technical Interview 2", "Bar Raiser/HR"],
        createdBy: adminId
      },
      {
        name: "Flipkart",
        industry: "Product/E-commerce",
        website: "https://www.flipkartcareers.com",
        package: { min: 20.0, max: 32.0, currency: "INR Lakhs" },
        eligibility: { minCGPA: 7.5, branches: ["Computer Science", "Information Technology"], maxBacklogs: 0 },
        visitDate: new Date(Date.now() - 30 * 86400000), // 30 days ago
        status: "completed",
        studentsPlaced: 12,
        roles: ["SDE-1", "Data Analyst"],
        description: "Flipkart Grid Hackathon route and Direct Campus Placement.",
        selectionProcess: ["Online Coding Test", "Machine Coding Round", "Problem Solving Round", "Hiring Manager Round"],
        createdBy: adminId
      },
      {
        name: "Wipro",
        industry: "IT Services",
        website: "https://careers.wipro.com",
        package: { min: 3.5, max: 6.5, currency: "INR Lakhs" },
        eligibility: { minCGPA: 6.0, branches: [], maxBacklogs: 1 },
        visitDate: new Date(Date.now() + 45 * 86400000),
        status: "upcoming",
        roles: ["Project Engineer", "Turbo"],
        description: "Wipro Elite National Level Talent Hunt (NLTH) 2026.",
        selectionProcess: ["Aptitude Test", "Written Communication Test", "Online Programming", "Business Discussion Round"],
        createdBy: adminId
      },
      {
        name: "Zomato",
        industry: "Product/FoodTech",
        website: "https://www.zomato.com/careers",
        package: { min: 18.0, max: 28.0, currency: "INR Lakhs" },
        eligibility: { minCGPA: 8.0, branches: ["Computer Science", "Information Technology"], maxBacklogs: 0 },
        visitDate: new Date(Date.now() + 10 * 86400000),
        status: "upcoming",
        roles: ["Frontend Engineer", "Backend Engineer"],
        description: "Zomato is hiring passionate software engineers for their Gurgaon headquarters.",
        selectionProcess: ["Resume Shortlisting", "Online Assessment", "Technical Interview 1 (System Design)", "HR Interview"],
        createdBy: adminId
      },
      {
        name: "Cognizant",
        industry: "IT Services",
        website: "https://careers.cognizant.com/in/en",
        package: { min: 4.0, max: 8.0, currency: "INR Lakhs" },
        eligibility: { minCGPA: 6.0, branches: ["Computer Science", "Information Technology", "Electronics", "Mechanical"], maxBacklogs: 1 },
        visitDate: new Date(Date.now() + 20 * 86400000),
        status: "upcoming",
        roles: ["GenC", "GenC Elevate", "GenC Pro"],
        description: "Cognizant GenC campus recruitment drive. Looking for adaptable minds ready for the digital era.",
        selectionProcess: ["Online Aptitude Test", "Technical Interview", "HR Interview"],
        createdBy: adminId
      },
      {
        name: "Capgemini",
        industry: "IT Services & Consulting",
        website: "https://www.capgemini.com/in-en/careers/",
        package: { min: 4.25, max: 7.5, currency: "INR Lakhs" },
        eligibility: { minCGPA: 6.0, branches: ["Computer Science", "Information Technology", "Electronics"], maxBacklogs: 0 },
        visitDate: new Date(Date.now() - 15 * 86400000),
        status: "completed",
        studentsPlaced: 24,
        roles: ["Analyst", "Senior Analyst"],
        description: "Capgemini Exceller Campus Drive for 2026 graduates.",
        selectionProcess: ["Pseudocode & English Test", "Game Based Aptitude", "Behavioral Profiling", "Technical & HR Interview"],
        createdBy: adminId
      },
      {
        name: "Reliance Jio",
        industry: "Telecommunications",
        website: "https://careers.jio.com",
        package: { min: 7.0, max: 12.0, currency: "INR Lakhs" },
        eligibility: { minCGPA: 7.0, branches: ["Computer Science", "Information Technology", "Electronics"], maxBacklogs: 0 },
        visitDate: new Date(Date.now() + 50 * 86400000),
        status: "upcoming",
        roles: ["Graduate Engineer Trainee (GET)"],
        description: "Jio Platforms is looking for young engineers to build the future of 5G and digital services in India.",
        selectionProcess: ["Online Aptitude & Coding", "Technical Interview", "HR Interview"],
        createdBy: adminId
      },
      {
        name: "Deloitte India",
        industry: "Consulting",
        website: "https://www2.deloitte.com/in/en/careers.html",
        package: { min: 6.0, max: 8.5, currency: "INR Lakhs" },
        eligibility: { minCGPA: 7.0, branches: ["Computer Science", "Information Technology"], maxBacklogs: 0 },
        visitDate: new Date(Date.now() + 5 * 86400000),
        status: "upcoming",
        roles: ["Business Technology Analyst (BTA)"],
        description: "Deloitte USI and India offices hiring for technology consulting roles.",
        selectionProcess: ["Online AMCAT Assessment", "Group Discussion / JAM", "Personal Interview (Tech + HR)"],
        createdBy: adminId
      },
      {
        name: "Accenture",
        industry: "IT Services & Consulting",
        website: "https://www.accenture.com/in-en/careers",
        package: { min: 4.5, max: 6.5, currency: "INR Lakhs" },
        eligibility: { minCGPA: 6.5, branches: ["Computer Science", "Information Technology", "Electronics", "Electrical"], maxBacklogs: 0 },
        visitDate: new Date(Date.now() - 10 * 86400000),
        status: "ongoing",
        roles: ["Associate Software Engineer (ASE)", "Advanced App Engineering (AAE)"],
        description: "Accenture campus recruitment for ASE and AAE roles.",
        selectionProcess: ["Cognitive & Technical Assessment", "Coding Test", "Communication Assessment", "Interview"],
        createdBy: adminId
      },
      {
        name: "Tech Mahindra",
        industry: "IT Services",
        website: "https://careers.techmahindra.com/",
        package: { min: 3.25, max: 5.5, currency: "INR Lakhs" },
        eligibility: { minCGPA: 6.0, branches: ["Computer Science", "Information Technology", "Electronics"], maxBacklogs: 1 },
        visitDate: new Date(Date.now() + 35 * 86400000),
        status: "upcoming",
        roles: ["Associate Software Engineer"],
        description: "Tech Mahindra off-campus and on-campus recruitment drive.",
        selectionProcess: ["Online Aptitude Test", "English Essay Writing", "Technical Interview", "HR Interview"],
        createdBy: adminId
      }
    ];

    await Company.insertMany(companies);
    console.log(`✅ Seeded ${companies.length} Indian companies!`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding companies:", error);
    process.exit(1);
  }
};

seedCompanies();
