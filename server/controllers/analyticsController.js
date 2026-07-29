const TestAttempt = require("../models/TestAttempt");
const Resume = require("../models/Resume");
const Company = require("../models/Company");
const User = require("../models/User");

/**
 * @desc    Get dashboard analytics for current user
 * @route   GET /api/analytics/dashboard
 * @access  Private
 */
const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Overall stats
    const allAttempts = await TestAttempt.find({ userId }).sort({ createdAt: 1 }).lean();

    const totalTests = allAttempts.length;
    const avgScore =
      totalTests > 0
        ? Math.round(allAttempts.reduce((sum, a) => sum + a.percentage, 0) / totalTests)
        : 0;

    // 2. Category-wise performance
    const categoryStats = await TestAttempt.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$category",
          totalAttempts: { $sum: 1 },
          avgPercentage: { $avg: "$percentage" },
          bestScore: { $max: "$percentage" },
          totalQuestions: { $sum: "$totalQuestions" },
          totalCorrect: { $sum: "$score" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 3. Performance trend (last 10 tests)
    const recentAttempts = allAttempts.slice(-10).map((a) => ({
      date: a.createdAt,
      percentage: a.percentage,
      category: a.category,
      score: a.score,
      totalQuestions: a.totalQuestions,
    }));

    // 4. Weak areas — categories where avg < 50%
    const weakAreas = categoryStats
      .filter((c) => c.avgPercentage < 50)
      .map((c) => ({
        category: c._id,
        avgPercentage: Math.round(c.avgPercentage),
        attempts: c.totalAttempts,
      }));

    // 5. Strong areas — categories where avg >= 70%
    const strongAreas = categoryStats
      .filter((c) => c.avgPercentage >= 70)
      .map((c) => ({
        category: c._id,
        avgPercentage: Math.round(c.avgPercentage),
        attempts: c.totalAttempts,
      }));

    // 6. Placement readiness score (weighted average)
    let readinessScore = 0;
    if (categoryStats.length > 0) {
      const weights = {
        quantitative: 0.3,
        logical: 0.3,
        technical: 0.4,
      };

      let weightedSum = 0;
      let totalWeight = 0;

      categoryStats.forEach((cat) => {
        const w = weights[cat._id] || 0.33;
        weightedSum += cat.avgPercentage * w;
        totalWeight += w;
      });

      readinessScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
    }

    // 7. Resume status
    const resumeCount = await Resume.countDocuments({ userId });
    const latestResume = await Resume.findOne({ userId })
      .sort({ createdAt: -1 })
      .lean();

    // 8. Difficulty breakdown
    const difficultyStats = await TestAttempt.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$difficulty",
          avgPercentage: { $avg: "$percentage" },
          count: { $sum: 1 },
        },
      },
    ]);

    // ── 9. Journey stages computation ──
    const aptitudeCategories = ["quantitative", "logical"];
    const codingCategories = ["technical"];

    const aptitudeStats = categoryStats.filter((c) =>
      aptitudeCategories.includes(c._id?.toLowerCase())
    );
    const codingStats = categoryStats.filter((c) =>
      codingCategories.includes(c._id?.toLowerCase())
    );

    const aptitudeCount = aptitudeStats.reduce((s, c) => s + c.totalAttempts, 0);
    const aptitudeAvg =
      aptitudeStats.length > 0
        ? Math.round(
            aptitudeStats.reduce((s, c) => s + c.avgPercentage, 0) /
              aptitudeStats.length
          )
        : 0;

    const codingCount = codingStats.reduce((s, c) => s + c.totalAttempts, 0);
    const codingAvg =
      codingStats.length > 0
        ? Math.round(
            codingStats.reduce((s, c) => s + c.avgPercentage, 0) /
              codingStats.length
          )
        : 0;

    // Fetch user's interview practice count and profile fields
    const currentUser = await User.findById(userId).select("interviewPracticeCount bio skills linkedin github").lean();
    const interviewPracticeCount = currentUser?.interviewPracticeCount || 0;
    const isProfileComplete = (currentUser?.skills?.length > 0) || (currentUser?.bio && currentUser?.bio.length > 0) || (currentUser?.linkedin && currentUser?.linkedin.length > 0) || (currentUser?.github && currentUser?.github.length > 0);

    // Stage completion rules
    const aptitudeDone = aptitudeCount >= 3 && aptitudeAvg >= 40;
    const codingDone = codingCount >= 2 && codingAvg >= 40;
    const resumeDone = resumeCount > 0 || isProfileComplete;
    const interviewDone = interviewPracticeCount >= 5;
    const allDone = aptitudeDone && codingDone && resumeDone && interviewDone;

    // Determine statuses — stages unlock sequentially
    const stageCompleted = [aptitudeDone, codingDone, resumeDone, interviewDone, allDone];
    let currentStageIndex = 0;
    for (let i = 0; i < stageCompleted.length; i++) {
      if (stageCompleted[i]) {
        currentStageIndex = i + 1; // move to next stage
      } else {
        break;
      }
    }
    // Clamp to max index
    if (currentStageIndex > 4) currentStageIndex = 4;

    const completedCount = stageCompleted.filter(Boolean).length;
    const overallProgress = Math.round((completedCount / 5) * 100);

    const getStatus = (idx) => {
      if (stageCompleted[idx]) return "completed";
      if (idx === currentStageIndex) return "current";
      return "locked";
    };

    const getSublabel = (idx) => {
      switch (idx) {
        case 0:
          return aptitudeCount > 0
            ? `${aptitudeCount} test${aptitudeCount > 1 ? "s" : ""} · ${aptitudeAvg}% avg`
            : `0/${3} tests`;
        case 1:
          return codingCount > 0
            ? `${codingCount} test${codingCount > 1 ? "s" : ""} · ${codingAvg}% avg`
            : `0/${2} tests`;
        case 2:
          if (resumeCount > 0) return `${resumeCount} resume uploaded`;
          if (isProfileComplete) return "Profile updated";
          return "No resume yet";
        case 3:
          return interviewPracticeCount > 0
            ? `${interviewPracticeCount}/5 practiced`
            : "Not started";
        case 4:
          return allDone ? "All stages clear!" : "";
        default:
          return "";
      }
    };

    const journeyStages = {
      stages: [
        { key: "aptitude", label: "Aptitude", status: getStatus(0), sublabel: getSublabel(0) },
        { key: "coding", label: "Coding Test", status: getStatus(1), sublabel: getSublabel(1) },
        { key: "resume", label: "Resume + ATS", status: getStatus(2), sublabel: getSublabel(2) },
        { key: "interview", label: "Mock Interview", status: getStatus(3), sublabel: getSublabel(3) },
        { key: "placed", label: "Placed", status: getStatus(4), sublabel: getSublabel(4) },
      ],
      currentStageIndex,
      completedCount,
      overallProgress,
    };

    // 9. Get upcoming companies
    const upcomingCompaniesList = await Company.find({
      status: "upcoming",
      visitDate: { $gte: new Date() }
    })
      .sort({ visitDate: 1 })
      .limit(3)
      .select('name visitDate roles type industry website package eligibility selectionProcess description')
      .lean();

    const formattedUpcoming = upcomingCompaniesList.map(comp => {
      const diffTime = Math.abs(new Date(comp.visitDate) - new Date());
      return {
        ...comp,
        type: comp.type || "On-campus",
        rolesStr: comp.roles?.join(" · ") || "Multiple Roles",
        daysLeft: Math.ceil(diffTime / (1000 * 60 * 60 * 24)),
      };
    });

    let upcomingEvent = formattedUpcoming.length > 0 ? formattedUpcoming[0] : null;

    // 10. Global Rank & Total Users
    const totalUsers = await User.countDocuments();
    // Percentile-based rank approximation (lower readiness = higher rank number)
    // Example: readiness 90% -> rank is in top 10%
    const globalRank = totalUsers > 0 
      ? Math.max(1, Math.floor(totalUsers * (1 - (readinessScore / 100)))) + (readinessScore === 100 ? 0 : 1)
      : 1;

    // 11. Smart Focus Recommendation
    let focusRecommendation = "Keep up the momentum! You're on track.";
    if (weakAreas.length > 0) {
      const weakest = weakAreas[0].category.toLowerCase();
      let displayCategory = weakest.charAt(0).toUpperCase() + weakest.slice(1);
      if (weakest === 'mixed') displayCategory = 'Mixed Mock Tests';
      else if (weakest === 'technical') displayCategory = 'Technical Skills';
      else if (weakest === 'quantitative') displayCategory = 'Quantitative Aptitude';
      else if (weakest === 'logical') displayCategory = 'Logical Reasoning';
      else if (weakest === 'verbal') displayCategory = 'Verbal Ability';

      if (weakest.includes("quantitative") || weakest.includes("logical")) {
        focusRecommendation = `Your Aptitude is holding you back. Practice more ${displayCategory} questions.`;
      } else if (weakest.includes("technical")) {
        focusRecommendation = `Your Coding score is low. Focus on Data Structures and Algorithms.`;
      } else {
        focusRecommendation = `Spend more time practicing your weak area: ${displayCategory}.`;
      }
    } else if (!resumeDone) {
      focusRecommendation = "You haven't uploaded a resume. Get your ATS score to stand out.";
    } else if (currentStageIndex === 4) {
      focusRecommendation = "You're placement ready! Start applying for companies in Career Hub.";
    }

    res.status(200).json({
      success: true,
      analytics: {
        overview: {
          totalTests,
          avgScore,
          readinessScore,
          resumeCount,
          totalUsers,
          globalRank,
          focusRecommendation,
          latestResume: latestResume
            ? {
                fileName: latestResume.originalName,
                skills: latestResume.skills,
                uploadDate: latestResume.createdAt,
                atsScore: latestResume.atsScore || 0,
              }
            : null,
        },
        upcomingCompanies: formattedUpcoming,
        categoryPerformance: categoryStats.map((c) => ({
          category: c._id,
          avgPercentage: Math.round(c.avgPercentage),
          bestScore: c.bestScore,
          totalAttempts: c.totalAttempts,
          accuracy: c.totalQuestions > 0
            ? Math.round((c.totalCorrect / c.totalQuestions) * 100)
            : 0,
        })),
        performanceTrend: recentAttempts,
        weakAreas,
        strongAreas,
        difficultyBreakdown: difficultyStats.map((d) => ({
          difficulty: d._id,
          avgPercentage: Math.round(d.avgPercentage),
          count: d.count,
        })),
        journeyStages,
        upcomingEvent,
      },
    });
  } catch (error) {
    console.error("Dashboard Analytics Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics.",
    });
  }
};

module.exports = { getDashboardAnalytics };
