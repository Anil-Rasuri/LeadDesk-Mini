import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const statuses = ["New", "Contacted", "Closed"];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLeads = async (query = "") => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/api/admin/leads", { params: { search: query } });
      setLeads(response.data);
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        localStorage.removeItem("leaddesk_token");
        navigate("/admin/login");
        return;
      }
      setError("Could not load leads. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => loadLeads(search), 250);
    return () => clearTimeout(timer);
  }, [search]);

  const counts = useMemo(() => ({
    total: leads.length,
    new: leads.filter((lead) => lead.status === "New").length,
    contacted: leads.filter((lead) => lead.status === "Contacted").length,
    closed: leads.filter((lead) => lead.status === "Closed").length,
  }), [leads]);

  const updateStatus = async (leadId, status) => {
    try {
      const response = await api.patch(`/api/admin/leads/${leadId}/status`, { status });
      setLeads((current) => current.map((lead) => (lead.id === leadId ? response.data : lead)));
    } catch {
      setError("Status update failed. Please retry.");
    }
  };

  const logout = () => {
    localStorage.removeItem("leaddesk_token");
    navigate("/admin/login");
  };

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div><p className="eyebrow">LeadDesk Mini</p><h1>Admin dashboard</h1></div>
        <button className="button secondary" onClick={logout}>Logout</button>
      </header>

      <section className="stats-grid">
        <article><span>Total leads</span><strong>{counts.total}</strong></article>
        <article><span>New</span><strong>{counts.new}</strong></article>
        <article><span>Contacted</span><strong>{counts.contacted}</strong></article>
        <article><span>Closed</span><strong>{counts.closed}</strong></article>
      </section>

      <section className="dashboard-card">
        <div className="table-toolbar">
          <div><h2>Incoming leads</h2><p>Search by customer name or email.</p></div>
          <input type="search" placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {error && <div className="form-message error">{error}</div>}
        {loading ? <p className="state-text">Loading leads...</p> : leads.length === 0 ? <p className="state-text">No leads found.</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Lead</th><th>Budget</th><th>Message</th><th>Received</th><th>Status</th></tr></thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td><strong>{lead.name}</strong><a href={`mailto:${lead.email}`}>{lead.email}</a></td>
                    <td>{lead.budget}</td>
                    <td className="message-cell">{lead.message}</td>
                    <td>{new Date(lead.created_at).toLocaleString()}</td>
                    <td><select className={`status-select status-${lead.status.toLowerCase()}`} value={lead.status} onChange={(e) => updateStatus(lead.id, e.target.value)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
