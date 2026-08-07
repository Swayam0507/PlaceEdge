const User = require("../models/User");
const TestAttempt = require("../models/TestAttempt");
const Resume = require("../models/Resume");
const { GoogleGenAI } = require("@google/genai");
const Groq = require("groq-sdk");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * @desc    Update user profile
 * @route   PUT /api/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const { name, branch, semester, cgpa, bio, phone, linkedin, github, skills } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (branch !== undefined) updateData.branch = branch;
    if (semester) updateData.semester = semester;
    if (cgpa !== undefined) updateData.cgpa = cgpa;
    if (bio !== undefined) updateData.bio = bio;
    if (phone !== undefined) updateData.phone = phone;
    if (linkedin !== undefined) updateData.linkedin = linkedin;
    if (github !== undefined) updateData.github = github;
    if (skills) updateData.skills = skills;

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch,
        semester: user.semester,
        cgpa: user.cgpa,
        bio: user.bio,
        phone: user.phone,
        linkedin: user.linkedin,
        github: user.github,
        skills: user.skills,
        theme: user.theme,
        streak: user.streak,
        badges: user.badges,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile.",
    });
  }
};

/**
 * @desc    Get full profile with stats
 * @route   GET /api/profile
 * @access  Private
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const totalTests = await TestAttempt.countDocuments({ userId: req.user._id });
    const resumeCount = await Resume.countDocuments({ userId: req.user._id });

    const avgScoreResult = await TestAttempt.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: null, avgScore: { $avg: "$percentage" } } },
    ]);

    res.status(200).json({
      success: true,
      profile: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch,
        semester: user.semester,
        cgpa: user.cgpa,
        bio: user.bio,
        phone: user.phone,
        linkedin: user.linkedin,
        github: user.github,
        skills: user.skills,
        theme: user.theme,
        streak: user.streak,
        badges: user.badges,
        createdAt: user.createdAt,
        stats: {
          totalTests,
          resumeCount,
          avgScore: avgScoreResult.length > 0 ? Math.round(avgScoreResult[0].avgScore) : 0,
        },
      },
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile.",
    });
  }
};

/**
 * @desc    Toggle theme preference
 * @route   PUT /api/profile/theme
 * @access  Private
 */
const toggleTheme = async (req, res) => {
  try {
    const { theme } = req.body;
    if (!["dark", "light"].includes(theme)) {
      return res.status(400).json({ success: false, message: "Invalid theme." });
    }
    await User.findByIdAndUpdate(req.user._id, { theme });
    res.status(200).json({ success: true, theme });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update theme." });
  }
};

/**
 * @desc    Complete onboarding
 * @route   POST /api/profile/onboarding
 * @access  Private
 */
const completeOnboarding = async (req, res) => {
  try {
    const { track, targetCompany } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    user.onboardingTrack = track || "general";
    user.targetCompany = targetCompany || "";
    user.isOnboardingComplete = true;

    // If company track and a resume was uploaded
    if (track === "company" && targetCompany && req.file) {
      let fileText = "";
      const mimeType = req.file.mimetype;
      
      if (mimeType === "application/pdf") {
        const pdfData = await pdfParse(req.file.buffer);
        fileText = pdfData.text;
      } else if (
        mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
        req.file.originalname.endsWith(".docx")
      ) {
        const result = await mammoth.extractRawText({ buffer: req.file.buffer });
        fileText = result.value;
      }

      if (fileText) {
        const prompt = `You are an expert tech recruiter and career coach.
Analyze the provided resume against the typical hiring requirements for a software engineering role at ${targetCompany}.
Generate a personalized 4-week custom roadmap specifically tailored to bridge the gaps in the candidate's resume for ${targetCompany}.
Respond ONLY with a valid JSON object strictly matching this format:
{
  "gapAnalysis": "A 2-3 sentence summary of what the resume is missing for ${targetCompany}.",
  "missingSkills": ["Skill 1", "Skill 2"],
  "weeks": [
    {
      "week": 1,
      "title": "Focus Title for Week 1",
      "tasks": ["Task 1", "Task 2", "Task 3"]
    },
    {
      "week": 2,
      "title": "Focus Title for Week 2",
      "tasks": ["Task 1", "Task 2", "Task 3"]
    },
    {
      "week": 3,
      "title": "Focus Title for Week 3",
      "tasks": ["Task 1", "Task 2", "Task 3"]
    },
    {
      "week": 4,
      "title": "Focus Title for Week 4",
      "tasks": ["Task 1", "Task 2", "Task 3"]
    }
  ]
}

Resume Text:
${fileText}`;

        let responseText = "";
        try {
            const response = await ai.models.generateContent({
              model: 'gemini-2.0-flash',
              contents: prompt,
              config: {
                temperature: 0.2,
                responseMimeType: "application/json"
              }
            });
            responseText = response.text;
        } catch (geminiError) {
            console.log("⚠️ Gemini API failed for Onboarding Roadmap. Falling back to Groq...", geminiError.message);
            const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
            const groqResponse = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.3-70b-versatile",
                temperature: 0.2,
                response_format: { type: "json_object" }
            });
            responseText = groqResponse.choices[0]?.message?.content || "{}";
        }

        try {
          user.customRoadmap = JSON.parse(responseText);
        } catch (e) {
          console.error("Failed to parse AI roadmap:", e);
        }
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Onboarding completed successfully.",
      user: {
        isOnboardingComplete: user.isOnboardingComplete,
        onboardingTrack: user.onboardingTrack,
        targetCompany: user.targetCompany,
        customRoadmap: user.customRoadmap
      }
    });
  } catch (error) {
    console.error("Complete Onboarding Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to complete onboarding."
    });
  }
};

const toggleRoadmapTask = async (req, res) => {
  try {
    const { taskId, completed } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (!user || !user.customRoadmap) {
      return res.status(404).json({ success: false, message: "Roadmap not found" });
    }

    let completedTasks = user.customRoadmap.completedTasks || [];
    
    if (completed) {
      if (!completedTasks.includes(taskId)) {
        completedTasks.push(taskId);
      }
    } else {
      completedTasks = completedTasks.filter(id => id !== taskId);
    }
    
    user.customRoadmap.completedTasks = completedTasks;
    
    // Progressive Skill Gap Logic
    let totalTasks = 0;
    user.customRoadmap.weeks.forEach(w => {
      totalTasks += w.tasks ? w.tasks.length : 0;
    });
    
    if (!user.customRoadmap.originalMissingSkills) {
      user.customRoadmap.originalMissingSkills = user.customRoadmap.missingSkills ? [...user.customRoadmap.missingSkills] : [];
    }
    
    const totalSkills = user.customRoadmap.originalMissingSkills.length;
    const progressPercent = totalTasks > 0 ? completedTasks.length / totalTasks : 0;
    
    const skillsToDrop = Math.floor(progressPercent * totalSkills);
    const skillsToKeep = totalSkills - skillsToDrop;
    
    user.customRoadmap.missingSkills = user.customRoadmap.originalMissingSkills.slice(0, skillsToKeep);
    
    // Need to tell mongoose that the mixed type changed
    user.markModified('customRoadmap');
    await user.save();
    
    res.status(200).json({
      success: true,
      customRoadmap: user.customRoadmap
    });

  } catch (error) {
    console.error("Toggle Roadmap Task Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { updateProfile, getProfile, toggleTheme, completeOnboarding, toggleRoadmapTask };
