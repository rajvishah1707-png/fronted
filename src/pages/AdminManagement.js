import React, { useCallback, useEffect, useState } from "react";
import ManagementLayout from "../components/ManagementLayout";
import { api, money } from "../utils/adminApi";
const titles = { categories: "Categories", notifications: "Notifications", feedback: "Feedback", statistics: "Statistics" };
export default function AdminManagement({ section }) {
    const [data, setData] = useState({});
    const [citizens, setCitizens] = useState([]);
    const [payments, setPayments] = useState(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [name, setName] = useState("");
    const [editing, setEditing] = useState(null);
    const [notification, setNotification] = useState({ userId: "", title: "", message: "" });
    const load = useCallback(async () => {
        setLoading(true); setError(""); setData({});
        try {
            if (section === "statistics") {
                setData((await api("/api/admin/stats", {}, true)).statistics);
                setPayments((await api("/api/payments/summary", {}, true)).summary);
            } else {
                setData(await api(`/api/admin/system/${section}`, {}, true));
                if (section === "notifications") setCitizens((await api("/api/admin/users", {}, true)).users || []);
            }
        } catch (e) { setError(e.message); }
        finally { setLoading(false); }
    }, [section]);
    useEffect(() => { setMessage(""); setEditing(null); setName(""); load(); }, [load]);
    const run = async fn => {
        setBusy(true); setError(""); setMessage("");
        try { await fn(); await load(); setMessage("Changes saved successfully."); }
        catch (e) { setError(e.message); }
        finally { setBusy(false); }
    };
    const saveCategory = event => {
        event.preventDefault();
        run(async () => {
            await api(`/api/admin/system/categories${editing ? `/${editing}` : ""}`, { method: editing ? "PUT" : "POST", body: JSON.stringify({ name }) }, true);
            setName(""); setEditing(null);
        });
    };
    const sendNotification = event => {
        event.preventDefault();
        run(async () => {
            await api("/api/admin/system/notifications", { method: "POST", body: JSON.stringify(notification) }, true);
            setNotification({ userId: "", title: "", message: "" });
        });
    };
    const reply = item => {
        const adminReply = window.prompt("Reply to citizen feedback:", item.adminReply || "");
        if (adminReply != null) run(() => api(`/api/admin/system/feedback/${item._id}`, { method: "PATCH", body: JSON.stringify({ adminReply }) }, true));
    };
    return <ManagementLayout title={titles[section]} subtitle="Manage your Smart City platform from one place.">
        <button className="secondary" onClick={load} disabled={loading || busy}>Refresh</button>
        {error && <p className="management-error" role="alert">{error}</p>}{message && <p className="management-success" role="status">{message}</p>}
        {section === "categories" && <section className="management-card"><h2>{editing ? "Rename Category" : "Add Category"}</h2><form onSubmit={saveCategory}><label>Category name<input required maxLength={80} value={name} onChange={e => setName(e.target.value)} /></label><div className="management-actions"><button disabled={busy || loading}>Save Category</button>{editing && <button type="button" className="secondary" onClick={() => { setEditing(null); setName(""); }}>Cancel</button>}</div></form><p className="management-muted">Service categories already in use appear below. Reassign their services before renaming or deleting them.</p></section>}
        {section === "notifications" && <section className="management-card"><h2>Send In-app Notification</h2><form onSubmit={sendNotification}><label>Citizen<select required value={notification.userId} onChange={e => setNotification({ ...notification, userId: e.target.value })}><option value="">Select a citizen</option>{citizens.map(c => <option key={c._id} value={c._id}>{c.name} · {c.email}</option>)}</select></label><label>Title<input required maxLength={150} value={notification.title} onChange={e => setNotification({ ...notification, title: e.target.value })} /></label><label>Message<textarea required maxLength={2000} value={notification.message} onChange={e => setNotification({ ...notification, message: e.target.value })} /></label><button disabled={busy || loading}>Send Notification</button></form></section>}
        {loading ? <p role="status">Loading {titles[section].toLowerCase()}...</p> : <>
            {section === "categories" && (data.categories?.length ? data.categories.map(c => <article className="management-card" key={c.name}><div className="management-actions"><h2>{c.name}</h2><span className="management-badge">{c.inUse ? "Used by services" : "Available"}</span>{c._id && !c.inUse && <><button className="secondary" disabled={busy} onClick={() => { setEditing(c._id); setName(c.name); }}>Rename</button><button className="danger" disabled={busy} onClick={() => { if (window.confirm(`Delete ${c.name}?`)) run(() => api(`/api/admin/system/categories/${c._id}`, { method: "DELETE" }, true)); }}>Delete</button></>}</div></article>) : <p>No categories found.</p>)}
            {section === "notifications" && <><p className="management-muted">Latest 100 notifications, including application and complaint updates.</p>{data.notifications?.length ? data.notifications.map(n => <article className="management-card" key={n._id}><h2>{n.title}</h2><p>{n.message}</p><p className="management-muted">{n.userId?.name || "Deleted citizen"} · {n.userId?.email} · {new Date(n.createdAt).toLocaleString("en-IN")} · {n.isRead ? "Read" : "Unread"}</p></article>) : <p>No notifications yet.</p>}</>}
            {section === "feedback" && <><p className="management-muted">Latest 100 citizen feedback submissions.</p>{data.feedback?.length ? data.feedback.map(item => <article className="management-card" key={item._id}><h2>{item.userId?.name || "Citizen"} · {item.rating}/5</h2><p>{item.message}</p><p className="management-muted">{item.userId?.email} · {new Date(item.createdAt).toLocaleString("en-IN")}</p><p><strong>Admin reply: </strong>{item.adminReply || "No reply yet"}</p><button disabled={busy} onClick={() => reply(item)}>{item.adminReply ? "Edit Reply" : "Reply"}</button></article>) : <p>No citizen feedback yet.</p>}</>}
            {section === "statistics" && <><div className="management-stats">{[["Citizens", data.totalCitizens], ["Services", data.totalServices], ["Applications", data.totalApplications], ["Complaints", data.totalComplaints], ["Total logins", data.totalLogins], ["Citizens who have logged in", data.loggedInCitizens]].map(([label, value]) => <div className="management-stat" key={label}><span>{label}</span><strong>{value ?? 0}</strong></div>)}</div><section className="management-card"><h2>Application Breakdown</h2><div className="management-table-wrap"><table><thead><tr><th>Status</th><th>Count</th></tr></thead><tbody>{[["Pending", data.pendingApplications], ["Under Review", data.underReviewApplications], ["In Progress", data.inProgressApplications], ["Approved", data.approvedApplications], ["Rejected", data.rejectedApplications], ["Completed", data.completedApplications]].map(([label, value]) => <tr key={label}><td>{label}</td><td>{value ?? 0}</td></tr>)}</tbody></table></div></section>{payments && <section className="management-card"><h2>Test Payment Summary</h2><p>Total collected (net of recorded refunds): <strong>{money(payments.totalPaise)}</strong></p><p>Today (India): {money(payments.todayPaise)}</p><p>Pending applications: {payments.pending} · Failed orders: {payments.failed}</p></section>}</>}
        </>}
    </ManagementLayout>;
}
