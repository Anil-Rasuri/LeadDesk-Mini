import { useState } from "react";
import api from "../api";

const initialForm = { name: "", email: "", budget: "", message: "" };

export default function LandingPage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const nextErrors = {};
    if (form.name.trim().length < 2) nextErrors.name = "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = "Please enter a valid email.";
    if (!form.budget) nextErrors.budget = "Please select a budget range.";
    if (form.message.trim().length < 10) nextErrors.message = "Please enter at least 10 characters.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setErrors((current) => ({ ...current, [event.target.name]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });
    if (!validate()) return;

    setLoading(true);
    try {
      await api.post("/api/leads", form);
      setForm(initialForm);
      setMessage({ type: "success", text: "Thank you. Your project enquiry has been received." });
    } catch (error) {
      const detail = error.response?.data?.detail;
      setMessage({
        type: "error",
        text: Array.isArray(detail) ? "Please check the form and try again." : detail || "Unable to submit right now.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="site-shell">
      <header className="navbar container">
        <a className="brand" href="#top">LeadDesk<span>Mini</span></a>
        <nav>
          <a href="#services">Services</a>
          <a href="#process">Process</a>
          <a className="nav-cta" href="#contact">Start a project</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero container">
          <div className="hero-copy">
            <p className="eyebrow">Digital products built with clarity</p>
            <h1>Turn your next idea into a product people trust.</h1>
            <p className="hero-text">
              We help growing businesses design and build responsive websites, internal tools and reliable web applications.
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#contact">Discuss your project</a>
              <a className="button secondary" href="#services">See what we build</a>
            </div>
            <div className="trust-row">
              <span>Responsive UI</span><span>Secure APIs</span><span>Reliable delivery</span>
            </div>
          </div>
          <div className="hero-card" aria-label="Project delivery overview">
            <div className="mini-bar"><span></span><span></span><span></span></div>
            <p className="card-label">PROJECT PIPELINE</p>
            <h2>From first message to shipped product.</h2>
            <div className="pipeline-item"><b>01</b><div><strong>Discover</strong><small>Goals, users and scope</small></div></div>
            <div className="pipeline-item"><b>02</b><div><strong>Build</strong><small>Design, code and review</small></div></div>
            <div className="pipeline-item"><b>03</b><div><strong>Launch</strong><small>Test, deploy and improve</small></div></div>
          </div>
        </section>

        <section className="section container" id="services">
          <div className="section-heading">
            <p className="eyebrow">What we do</p>
            <h2>Practical development for real business needs.</h2>
          </div>
          <div className="service-grid">
            {[
              ["01", "Web Applications", "Fast, maintainable products built around your workflow."],
              ["02", "Frontend Development", "Responsive React interfaces with thoughtful interaction details."],
              ["03", "Backend & APIs", "Secure APIs, authentication and database-backed features."],
            ].map(([number, title, text]) => (
              <article className="service-card" key={title}>
                <span>{number}</span><h3>{title}</h3><p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="process-section" id="process">
          <div className="container process-grid">
            <div><p className="eyebrow light">How we work</p><h2>Small steps. Clear communication. No surprises.</h2></div>
            <div className="process-list">
              <p><b>01</b><span><strong>Understand the outcome</strong><small>We begin with the result your business needs.</small></span></p>
              <p><b>02</b><span><strong>Build the useful version first</strong><small>We prioritize the critical path before extra polish.</small></span></p>
              <p><b>03</b><span><strong>Test before launch</strong><small>Validation, edge cases and deployment are part of delivery.</small></span></p>
            </div>
          </div>
        </section>

        <section className="contact-section container" id="contact">
          <div className="contact-copy">
            <p className="eyebrow">Start a conversation</p>
            <h2>Tell us what you want to build.</h2>
            <p>Share a short brief. We will review it and contact you with the most useful next step.</p>
            <div className="contact-note"><strong>What happens next?</strong><span>Your enquiry enters our secure lead dashboard with the status “New”.</span></div>
          </div>

          <form className="lead-form" onSubmit={handleSubmit} noValidate>
            <label>Name<input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" />{errors.name && <small className="error-text">{errors.name}</small>}</label>
            <label>Email<input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@company.com" />{errors.email && <small className="error-text">{errors.email}</small>}</label>
            <label>Budget range<select name="budget" value={form.budget} onChange={handleChange}><option value="">Select a range</option><option>Below ₹25,000</option><option>₹25,000 - ₹50,000</option><option>₹50,000 - ₹1,00,000</option><option>Above ₹1,00,000</option></select>{errors.budget && <small className="error-text">{errors.budget}</small>}</label>
            <label>Project message<textarea name="message" value={form.message} onChange={handleChange} rows="5" placeholder="What are you building, and what result do you need?" />{errors.message && <small className="error-text">{errors.message}</small>}</label>
            {message.text && <div className={`form-message ${message.type}`}>{message.text}</div>}
            <button className="button primary full" type="submit" disabled={loading}>{loading ? "Submitting..." : "Send project enquiry"}</button>
          </form>
        </section>
      </main>

      <footer>
        <div className="container footer-content">
          <span>© 2026 LeadDesk Mini</span>
          <a href="https://digitalheroesco.com" target="_blank" rel="noreferrer">Built for Digital Heroes Training Task</a>
          <a href="/admin/login">Admin</a>
        </div>
      </footer>
    </div>
  );
}
