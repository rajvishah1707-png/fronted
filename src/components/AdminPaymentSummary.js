import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, money } from "../utils/adminApi";
export default function AdminPaymentSummary() {
    const [summary, setSummary] = useState(null);
    const [error, setError] = useState("");
    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try { const data = await api("/api/payments/summary", {}, true); if (mounted) { setSummary(data.summary); setError(""); } }
            catch (e) { if (mounted) setError(e.message); }
        };
        load(); const timer = setInterval(load, 30000);
        return () => { mounted = false; clearInterval(timer); };
    }, []);
    return <section style={{ background: "white", padding: 24, borderRadius: 14, marginBottom: 24 }}><h2>Test Payments</h2>{error ? <p role="alert">{error}</p> : summary ? <div style={{ display: "flex", gap: 28, flexWrap: "wrap", marginBottom: 16 }}>{[["Total collected", money(summary.totalPaise)], ["Today (India)", money(summary.todayPaise)], ["Pending", summary.pending], ["Failed", summary.failed]].map(([label, value]) => <div key={label}><span>{label}</span><strong style={{ display: "block", fontSize: 24, marginTop: 8 }}>{value}</strong></div>)}</div> : <p>Loading payments...</p>}<Link to="/admin/payments">Manage Payments →</Link></section>;
}
