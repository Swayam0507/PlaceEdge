import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import ResumeUpload from "./pages/ResumeUpload";
import ExamTest from "./pages/ExamTest";
import TestResult from "./pages/TestResult";
import TestHistory from "./pages/TestHistory";
import PlacementPredictor from "./pages/PlacementPredictor";
import JobBoard from "./pages/JobBoard";
import Leaderboard from "./pages/Leaderboard";
import InterviewPrep from "./pages/InterviewPrep";
import AtsChecker from "./pages/AtsChecker";
import Forum from "./pages/Forum";
import CompanyTracker from "./pages/CompanyTracker";
import CompanyPrepList from "./pages/CompanyPrepList";
import CompanyPrepDetail from "./pages/CompanyPrepDetail";
import Bookmarks from "./pages/Bookmarks";
import AdminDashboard from "./pages/AdminDashboard";
import AdminQuestions from "./pages/AdminQuestions";
import AdminUsers from "./pages/AdminUsers";
import AdminInterviewQuestions from "./pages/AdminInterviewQuestions";
import StudyBuddy from "./pages/StudyBuddy";
import CareerAdvisor from "./pages/CareerAdvisor";
import PracticeHub from "./pages/PracticeHub";
import CareerHub from "./pages/CareerHub";
import CommunityHub from "./pages/CommunityHub";
import AIChatbot from "./components/AIChatbot";

// Redirect authenticated users away from auth pages
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={user?.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  return children;
};

// Admin-only route guard
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppContent = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <AppLayout>
      <Routes>
        {/* Public landing page */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to={user?.role === "admin" ? "/admin" : "/dashboard"} replace />
            ) : (
              <LandingPage />
            )
          }
        />

        {/* Auth routes */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />

        {/* ===== Dashboard ===== */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        {/* ===== Practice Module ===== */}
        <Route path="/practice" element={<ProtectedRoute><PracticeHub /></ProtectedRoute>} />
        <Route
          path="/exam/:category"
          element={
            <ProtectedRoute>
              <ExamTest />
            </ProtectedRoute>
          }
        /><Route path="/practice/history" element={<ProtectedRoute><TestHistory /></ProtectedRoute>} />
        <Route path="/practice/interview" element={<ProtectedRoute><InterviewPrep /></ProtectedRoute>} />
        <Route path="/practice/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/practice/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />

        {/* ===== Career Module ===== */}
        <Route path="/career" element={<ProtectedRoute><CareerHub /></ProtectedRoute>} />
        <Route path="/career/resume" element={<ProtectedRoute><ResumeUpload /></ProtectedRoute>} />
        <Route path="/career/ats" element={<ProtectedRoute><AtsChecker /></ProtectedRoute>} />
        <Route path="/career/predictor" element={<ProtectedRoute><PlacementPredictor /></ProtectedRoute>} />
        <Route path="/career/jobs" element={<ProtectedRoute><JobBoard /></ProtectedRoute>} />
        <Route path="/career/companies" element={<ProtectedRoute><CompanyTracker /></ProtectedRoute>} />

        {/* ===== Company Prep (New) ===== */}
        <Route path="/company-prep" element={<ProtectedRoute><CompanyPrepList /></ProtectedRoute>} />
        <Route path="/company-prep/:companyName" element={<ProtectedRoute><CompanyPrepDetail /></ProtectedRoute>} />

        {/* ===== Community Module ===== */}
        <Route path="/community" element={<ProtectedRoute><CommunityHub /></ProtectedRoute>} />
        <Route path="/community/forum" element={<ProtectedRoute><Forum /></ProtectedRoute>} />
        <Route path="/community/study-buddy" element={<ProtectedRoute><StudyBuddy /></ProtectedRoute>} />
        <Route path="/community/career-advisor" element={<ProtectedRoute><CareerAdvisor /></ProtectedRoute>} />

        {/* ===== Profile ===== */}
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        {/* ===== Flat routes (test result is accessed via navigation state) ===== */}
        <Route path="/test-result" element={<ProtectedRoute><TestResult /></ProtectedRoute>} />

        {/* ===== Legacy URL Redirects (so nothing breaks) ===== */}
        <Route path="/aptitude-test" element={<Navigate to="/practice/tests" replace />} />
        <Route path="/test-history" element={<Navigate to="/practice/history" replace />} />
        <Route path="/interview-prep" element={<Navigate to="/practice/interview" replace />} />
        <Route path="/leaderboard" element={<Navigate to="/practice/leaderboard" replace />} />
        <Route path="/bookmarks" element={<Navigate to="/practice/bookmarks" replace />} />
        <Route path="/resume" element={<Navigate to="/career/resume" replace />} />
        <Route path="/ats-checker" element={<Navigate to="/career/ats" replace />} />
        <Route path="/placement-predictor" element={<Navigate to="/career/predictor" replace />} />
        <Route path="/job-board" element={<Navigate to="/career/jobs" replace />} />
        <Route path="/companies" element={<Navigate to="/career/companies" replace />} />
        <Route path="/forum" element={<Navigate to="/community/forum" replace />} />
        <Route path="/community-feed" element={<Navigate to="/community/feed" replace />} />
        <Route path="/mentorship" element={<Navigate to="/community/mentorship" replace />} />

        {/* ===== Admin routes (unchanged) ===== */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/questions" element={<AdminRoute><AdminQuestions /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/interview-questions" element={<AdminRoute><AdminInterviewQuestions /></AdminRoute>} />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Floating AI Chatbot for authenticated students */}
      {isAuthenticated && user?.role !== "admin" && <AIChatbot />}
    </AppLayout>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
