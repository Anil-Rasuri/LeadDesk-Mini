import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/api/admin/login", form);
      localStorage.setItem("leaddesk_token", response.data.access_token);
      navigate("/admin");
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="brand" to="/">LeadDesk<span>Mini</span></Link>
        <p className="eyebrow">Admin access</p>
        <h1>Manage every lead in one place.</h1>
        <p className="muted">Use the test credentials provided in the submission folder.</p>
        <form onSubmit={handleSubmit}>
          <label>Email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label>Password<input type="password" required minLength="8" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
          {error && <div className="form-message error">{error}</div>}
          <button className="button primary full" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
        </form>
        <Link className="back-link" to="/">← Back to landing page</Link>
      </section>
    </main>
  );
}
