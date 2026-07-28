import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/api";
import { useAuth } from "../context/AuthContext";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth(); // If we want to auto-login, or we can just redirect

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }
    
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const { data } = await resetPassword(token, { password });
      setMessage("Password reset successfully! Redirecting to login...");
      
      // Auto-redirect to login after 2 seconds
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password. The link might be expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper animate-fade-in p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-line">
        <h2 className="font-display font-bold text-2xl text-ink mb-2 text-center">Reset Password</h2>
        <p className="text-muted text-sm text-center mb-8">
          Enter your new password below.
        </p>

        {message && <div className="bg-emerald-soft border border-emerald/50 text-emerald px-4 py-3 rounded-xl mb-6 text-sm font-medium text-center">{message}</div>}
        {error && <div className="bg-coral/10 border border-coral/50 text-coral px-4 py-3 rounded-xl mb-6 text-sm font-medium text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-ink mb-2">New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl border border-line bg-white text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-ink mb-2">Confirm New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl border border-line bg-white text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all"
            />
          </div>
          <button type="submit" className="w-full flex justify-center items-center gap-2 bg-ink text-paper py-3.5 rounded-xl font-bold shadow-sm hover:bg-ink-soft transition-colors mt-2" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
