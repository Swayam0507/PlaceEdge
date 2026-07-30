import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const { data } = await forgotPassword({ email });
      setMessage(data.message || "Email sent. Please check your inbox.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-paper animate-fade-in p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-line">
        <h2 className="font-display font-bold text-2xl text-ink mb-2 text-center">Forgot Password</h2>
        <p className="text-muted text-sm text-center mb-8">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {message && <div className="bg-emerald-soft border border-emerald/50 text-emerald px-4 py-3 rounded-xl mb-6 text-sm font-medium text-center">{message}</div>}
        {error && <div className="bg-coral/10 border border-coral/50 text-coral px-4 py-3 rounded-xl mb-6 text-sm font-medium text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-ink mb-2">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-line bg-white text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all"
            />
          </div>
          <button type="submit" className="w-full flex justify-center items-center gap-2 bg-ink text-paper py-3.5 rounded-xl font-bold shadow-sm hover:bg-ink-soft transition-colors mt-2" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-muted">
          Remember your password? <Link to="/login" className="font-bold text-ink hover:underline">Log in here</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;

