import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";

const money = (value) => `${Number(value || 0).toLocaleString("en-US")} VND`;
const STATUS = [
  ["pending", "Pending", "#d97706"],
  ["confirmed", "Confirmed", "#2563eb"],
  ["completed", "Completed", "#059669"],
  ["cancelled", "Cancelled", "#dc2626"],
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setData((await api.get("/dashboard")).data); setMessage(""); }
    catch (e) { setMessage(e.response?.data?.message || "Unable to load dashboard statistics."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const maxRevenue = Math.max(1, ...(data?.monthlyStats || []).map(x => x.revenue));
  const maxOrders = Math.max(1, ...(data?.monthlyStats || []).map(x => x.orders));

  return <main className="container page admin-dashboard-page">
    <div className="page-title-row">
      <div><span className="section-kicker">ADMINISTRATION</span><h1>Business Dashboard</h1><p className="muted">Monitor revenue, orders, and daily operations at a glance.</p></div>
      <button className="outline-btn" onClick={load} disabled={loading}>{loading ? "Refreshing..." : "↻ Refresh"}</button>
    </div>
    {message && <div className="error" role="alert">{message}</div>}
    {!data ? <div className="empty">Loading dashboard data...</div> : <>
      <section className="analytics-grid">
        <div className="analytics-card highlight"><span>Total Revenue</span><strong>{money(data.revenue)}</strong><small>Completed orders only</small></div>
        <div className="analytics-card"><span>Revenue This Month</span><strong>{money(data.monthlyRevenue)}</strong><small>Current calendar month</small></div>
        <div className="analytics-card"><span>Confirmed Order Value</span><strong>{money(data.confirmedValue)}</strong><small>Confirmed and completed orders</small></div>
      </section>
      <section className="analytics-grid compact">
        <div className="summary-card"><div className="summary-icon blue">👥</div><div><span>Customers</span><strong>{data.users}</strong></div></div>
        <div className="summary-card"><div className="summary-icon purple">📋</div><div><span>Total Orders</span><strong>{data.appointments}</strong></div></div>
        <div className="summary-card"><div className="summary-icon orange">⏳</div><div><span>Pending Orders</span><strong>{data.pending}</strong></div></div>
        <div className="summary-card"><div className="summary-icon green">✓</div><div><span>Completed Orders</span><strong>{data.completed}</strong></div></div>
      </section>

      <section className="admin-module-links">
        <Link to="/admin/customers"><strong>👥 Customer Management</strong><span>Review customer profiles, bookings, and spending.</span></Link>
        <Link to="/admin/bookings"><strong>📋 Order Management</strong><span>Assign employees and update order statuses.</span></Link>
        <Link to="/admin/staff"><strong>🧑‍💼 Staff Management</strong><span>Create, edit, and manage employee profiles.</span></Link>
        <Link to="/admin/schedules"><strong>🗓️ Staff Schedules & Holidays</strong><span>Manage shifts, working hours, and days off.</span></Link>
      </section>

      <section className="dashboard-report-grid">
        <div className="dashboard-report">
          <h2>Monthly Revenue</h2><p className="muted">Revenue from completed orders over the last 6 months</p>
          <div className="bar-chart" role="img" aria-label="Monthly revenue bar chart">
            {(data.monthlyStats || []).map(item => <div className="bar-column" key={item.month}>
              <strong>{money(item.revenue)}</strong><div className="bar-track"><div className="bar-fill revenue-fill" style={{height:`${Math.max(item.revenue ? 3 : 0, item.revenue / maxRevenue * 100)}%`}} /></div><span>{item.label}</span>
            </div>)}
          </div>
        </div>
        <div className="dashboard-report">
          <h2>Order Status Overview</h2><p className="muted">Current order distribution</p>
          <div className="status-report">{STATUS.map(([key,label,color]) => <div className="status-report-row" key={key}>
            <div><span className="status-dot" style={{background:color}} />{label}</div><strong>{data.statusCounts?.[key] || 0}</strong>
            <div className="status-track"><div style={{width:`${(data.statusCounts?.[key] || 0) / Math.max(1,data.appointments) * 100}%`,background:color}} /></div>
          </div>)}</div>
          <div className="report-total"><span>Total orders</span><strong>{data.appointments}</strong></div>
        </div>
      </section>
      <section className="dashboard-report">
        <h2>Monthly Order Volume</h2><p className="muted">All orders created per month, regardless of status</p>
        <div className="bar-chart order-chart" role="img" aria-label="Monthly order volume bar chart">
          {(data.monthlyStats || []).map(item => <div className="bar-column" key={item.month}>
            <strong>{item.orders}</strong><div className="bar-track"><div className="bar-fill orders-fill" style={{height:`${Math.max(item.orders ? 3 : 0, item.orders / maxOrders * 100)}%`}} /></div><span>{item.label}</span>
          </div>)}
        </div>
      </section>
    </>}
    <style>{`
      .dashboard-report-grid{display:grid;grid-template-columns:1.2fr 1fr;gap:20px;margin:24px 0}
      .dashboard-report{background:var(--card,#fff);border:1px solid var(--border,#e5e7eb);border-radius:16px;padding:22px;margin-top:20px;min-width:0}
      .dashboard-report h2{font-size:1.15rem;margin:0 0 6px}.dashboard-report .muted{margin:0 0 18px}
      .bar-chart{height:250px;display:flex;align-items:stretch;gap:12px;padding-top:15px}
      .bar-column{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;min-width:0;gap:7px}
      .bar-column>strong{font-size:.72rem;white-space:nowrap;overflow:hidden;max-width:100%;text-overflow:ellipsis}
      .bar-track{height:175px;width:min(100%,42px);background:#eef2f7;border-radius:8px 8px 3px 3px;display:flex;align-items:flex-end;overflow:hidden}
      .bar-fill{width:100%;border-radius:7px 7px 2px 2px;transition:height .25s}.revenue-fill{background:linear-gradient(180deg,#60a5fa,#2563eb)}.orders-fill{background:linear-gradient(180deg,#a78bfa,#7c3aed)}
      .bar-column>span{font-size:.75rem;color:var(--muted,#6b7280)}
      .status-report{display:grid;gap:17px}.status-report-row{display:grid;grid-template-columns:1fr auto;gap:8px;font-size:.9rem}
      .status-report-row>div:first-child{display:flex;align-items:center;gap:8px}.status-dot{width:9px;height:9px;border-radius:50%;display:inline-block}
      .status-track{grid-column:1/-1;height:7px;border-radius:99px;background:#eef2f7;overflow:hidden}.status-track>div{height:100%;border-radius:99px}
      .report-total{display:flex;justify-content:space-between;border-top:1px solid var(--border,#e5e7eb);padding-top:14px;margin-top:20px}
      @media(max-width:760px){.dashboard-report-grid{grid-template-columns:1fr}.dashboard-report{padding:16px}.bar-chart{gap:6px}.bar-column>strong{font-size:.62rem}}
    `}</style>
  </main>;
}
