const nodemailer = require("nodemailer");
const User = require("../models/User");
const TestAttempt = require("../models/TestAttempt");

/**
 * Create email transporter
 * Uses Ethereal (fake SMTP) for development, real SMTP for production
 */
const createTransporter = async () => {
  // If real SMTP credentials are provided, use them
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Fallback: create Ethereal test account (fake SMTP)
  const testAccount = await nodemailer.createTestAccount();
  console.log("📧 Using Ethereal test account:", testAccount.user);

  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

/**
 * @desc    Send test result email to user
 * @route   POST /api/email/test-result
 * @access  Private
 */
const sendTestResultEmail = async (req, res) => {
  try {
    const userId = req.user._id;
    const { testAttemptId } = req.body;

    // Dynamically resolve client URL from request origin
    const origin = req.headers.origin || req.headers.referer;
    const clientUrl = origin ? origin.replace(/\/+$/, '') : (process.env.CLIENT_URL || 'http://localhost:5173');

    if (!testAttemptId) {
      return res.status(400).json({
        success: false,
        message: "testAttemptId is required.",
      });
    }

    // Fetch user and test attempt
    const user = await User.findById(userId);
    const attempt = await TestAttempt.findById(testAttemptId).populate({
      path: "answers.questionId",
      select: "question category",
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Test attempt not found.",
      });
    }

    // Build email HTML
    const scoreColor =
      attempt.percentage >= 70 ? "#10b981" : attempt.percentage >= 40 ? "#f59e0b" : "#ef4444";
    const gradeEmoji =
      attempt.percentage >= 80 ? "🌟" : attempt.percentage >= 60 ? "👍" : attempt.percentage >= 40 ? "💪" : "📚";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; background: #f1f5f9; color: #334155; margin: 0; padding: 40px 0; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 40px 30px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
          .header p { color: #e0e7ff; margin: 10px 0 0; font-size: 15px; font-weight: 500; }
          .body { padding: 40px 30px; }
          .greeting { font-size: 18px; font-weight: 600; color: #0f172a; margin-bottom: 20px; }
          .intro { color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 30px; }
          .score-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 30px; text-align: center; margin-bottom: 30px; }
          .score { font-size: 56px; font-weight: 900; color: ${scoreColor}; line-height: 1; margin-bottom: 8px; }
          .score-label { color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
          .stats-table { width: 100%; border-collapse: separate; border-spacing: 12px 0; margin-bottom: 30px; }
          .stat-box { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 15px; text-align: center; width: 33%; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
          .stat-value { font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
          .stat-label { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; }
          .feedback { background: ${attempt.percentage >= 70 ? '#ecfdf5' : attempt.percentage >= 40 ? '#fffbeb' : '#fef2f2'}; border: 1px solid ${attempt.percentage >= 70 ? '#a7f3d0' : attempt.percentage >= 40 ? '#fde68a' : '#fecaca'}; padding: 20px; border-radius: 12px; text-align: center; color: ${attempt.percentage >= 70 ? '#065f46' : attempt.percentage >= 40 ? '#92400e' : '#991b1b'}; font-weight: 500; font-size: 15px; margin-bottom: 35px; }
          .btn-container { text-align: center; }
          .btn { display: inline-block; background: linear-gradient(135deg, #2563eb, #7c3aed); color: #ffffff; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 15px; box-shadow: 0 4px 14px rgba(37,99,235,0.25); }
          .footer { background: #f8fafc; padding: 25px 30px; text-align: center; color: #94a3b8; font-size: 13px; border-top: 1px solid #e2e8f0; }
          .footer p { margin: 5px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Test Result Report</h1>
            <p>PlaceEdge Preparation Platform</p>
          </div>
          <div class="body">
            <div class="greeting">Hi <strong>${user.name}</strong>,</div>
            <div class="intro">Here's your performance summary for the <strong>${attempt.category.toUpperCase()}</strong> test you recently completed.</div>

            <div class="score-card">
              <div class="score">${gradeEmoji} ${attempt.percentage}%</div>
              <div class="score-label">Overall Score</div>
            </div>

            <table class="stats-table">
              <tr>
                <td class="stat-box">
                  <div class="stat-value">${attempt.score}</div>
                  <div class="stat-label">Correct</div>
                </td>
                <td class="stat-box">
                  <div class="stat-value">${attempt.totalQuestions}</div>
                  <div class="stat-label">Total Qs</div>
                </td>
                <td class="stat-box">
                  <div class="stat-value" style="text-transform: capitalize;">${attempt.difficulty || "Medium"}</div>
                  <div class="stat-label">Level</div>
                </td>
              </tr>
            </table>

            <div class="feedback">
              ${attempt.percentage >= 70
                ? "🎉 Excellent performance! You're well on your way to mastering this topic."
                : attempt.percentage >= 40
                ? "💡 Good effort! Focus on reviewing your weak areas to improve your score."
                : "📖 Keep practicing! Don't give up, review the concepts and try again."
              }
            </div>

            <div class="btn-container">
              <a href="${clientUrl}/test-history" class="btn">View Detailed Analysis →</a>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated email from PlaceEdge Platform.</p>
            <p>© ${new Date().getFullYear()} PlaceEdge. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    const transporter = await createTransporter();
    const info = await transporter.sendMail({
      from: `"PlaceEdge" <${process.env.EMAIL_USER || "noreply@PlaceEdge.com"}>`,
      to: user.email,
      subject: `📋 Your ${attempt.category} Test Result — ${attempt.percentage}%`,
      html: emailHtml,
    });

    // If using Ethereal, provide preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);

    res.status(200).json({
      success: true,
      message: "Test result email sent successfully.",
      messageId: info.messageId,
      previewUrl: previewUrl || null,
    });
  } catch (error) {
    console.error("Send Test Result Email Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send test result email.",
    });
  }
};

/**
 * @desc    Send placement readiness notification
 * @route   POST /api/email/placement-readiness
 * @access  Private
 */
const sendPlacementReadiness = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    // Dynamically resolve client URL from request origin
    const origin = req.headers.origin || req.headers.referer;
    const clientUrl = origin ? origin.replace(/\/+$/, '') : (process.env.CLIENT_URL || 'http://localhost:5173');

    // Compute analytics
    const attempts = await TestAttempt.find({ userId }).lean();
    const totalTests = attempts.length;
    const avgScore = totalTests > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / totalTests)
      : 0;

    // Category breakdown
    const categoryMap = {};
    attempts.forEach((a) => {
      if (!categoryMap[a.category]) {
        categoryMap[a.category] = { total: 0, sum: 0 };
      }
      categoryMap[a.category].total++;
      categoryMap[a.category].sum += a.percentage;
    });

    const categoryRows = Object.entries(categoryMap)
      .map(([cat, stats]) => {
        const avg = Math.round(stats.sum / stats.total);
        const color = avg >= 70 ? "#10b981" : avg >= 40 ? "#f59e0b" : "#ef4444";
        return `
          <tr>
            <td style="padding: 10px; color: #e2e8f0; text-transform: capitalize;">${cat}</td>
            <td style="padding: 10px; color: ${color}; font-weight: bold;">${avg}%</td>
            <td style="padding: 10px; color: #94a3b8;">${stats.total} tests</td>
          </tr>
        `;
      })
      .join("");

    // Readiness level
    let readinessLevel, readinessColor, readinessEmoji;
    if (avgScore >= 75) {
      readinessLevel = "Placement Ready";
      readinessColor = "#10b981";
      readinessEmoji = "🚀";
    } else if (avgScore >= 50) {
      readinessLevel = "Almost There";
      readinessColor = "#f59e0b";
      readinessEmoji = "⚡";
    } else {
      readinessLevel = "Needs Improvement";
      readinessColor = "#ef4444";
      readinessEmoji = "📚";
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 30px; }
          .header { background: linear-gradient(135deg, #059669, #10b981); padding: 30px; border-radius: 16px 16px 0 0; text-align: center; }
          .header h1 { color: #fff; margin: 0; font-size: 24px; }
          .body { background: #1e293b; padding: 30px; border-radius: 0 0 16px 16px; }
          .readiness { background: #0f172a; border-radius: 12px; padding: 25px; text-align: center; margin: 20px 0; }
          .readiness-badge { font-size: 32px; font-weight: bold; color: ${readinessColor}; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th { text-align: left; padding: 10px; color: #64748b; border-bottom: 1px solid #334155; font-size: 12px; text-transform: uppercase; }
          td { border-bottom: 1px solid #1e293b; }
          .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
          .btn { display: inline-block; background: linear-gradient(135deg, #059669, #10b981); color: #fff; padding: 12px 30px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${readinessEmoji} Placement Readiness Report</h1>
          </div>
          <div class="body">
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>Here's your placement readiness assessment based on your performance:</p>

            <div class="readiness">
              <div style="font-size: 48px;">${readinessEmoji}</div>
              <div class="readiness-badge">${readinessLevel}</div>
              <div style="font-size: 36px; font-weight: bold; color: ${readinessColor}; margin-top: 10px;">
                ${avgScore}%
              </div>
              <div style="color: #94a3b8; margin-top: 5px;">Average Score across ${totalTests} tests</div>
            </div>

            ${totalTests > 0 ? `
              <h3 style="color: #f8fafc; margin-top: 25px;">📊 Category Breakdown</h3>
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Avg Score</th>
                    <th>Tests Taken</th>
                  </tr>
                </thead>
                <tbody>${categoryRows}</tbody>
              </table>
            ` : `
              <p style="color: #94a3b8; text-align: center;">No test attempts yet. Take some tests to get your readiness report!</p>
            `}

            <div style="text-align: center;">
              <a href="${clientUrl}/dashboard" class="btn">
                View Dashboard →
              </a>
            </div>

            <div class="footer">
              <p>This is an automated email from Smart Placement Platform.</p>
              <p>© ${new Date().getFullYear()} PlaceEdge. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const transporter = await createTransporter();
    const info = await transporter.sendMail({
      from: `"PlaceEdge" <${process.env.EMAIL_USER || "noreply@PlaceEdge.com"}>`,
      to: user.email,
      subject: `${readinessEmoji} Your Placement Readiness: ${readinessLevel} (${avgScore}%)`,
      html: emailHtml,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);

    res.status(200).json({
      success: true,
      message: "Placement readiness email sent successfully.",
      messageId: info.messageId,
      previewUrl: previewUrl || null,
      readiness: { level: readinessLevel, score: avgScore },
    });
  } catch (error) {
    console.error("Send Placement Readiness Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send placement readiness email.",
    });
  }
};

module.exports = { sendTestResultEmail, sendPlacementReadiness };
