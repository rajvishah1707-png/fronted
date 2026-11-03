import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ManagementLayout from "../components/ManagementLayout";
import { api, money } from "../utils/adminApi";
let checkoutLoading;
function loadCheckout() {
    if (window.Razorpay) return Promise.resolve();
    if (checkoutLoading) return checkoutLoading;
    checkoutLoading = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        const timer = setTimeout(() => { script.remove(); reject(new Error("Payment checkout timed out. Please retry.")); }, 20000);
        script.onload = () => { clearTimeout(timer); window.Razorpay ? resolve() : reject(new Error("Unable to load payment checkout")); };
        script.onerror = () => { clearTimeout(timer); script.remove(); reject(new Error("Unable to load payment checkout")); };
        document.body.appendChild(script);
    }).catch(error => { checkoutLoading = null; throw error; });
    return checkoutLoading;
}
let cashfreeLoading;
function loadCashfree() {
    if (window.Cashfree) return Promise.resolve();
    if (!cashfreeLoading) {
        cashfreeLoading = new Promise((resolve, reject) => {
            const script = document.createElement("script");
            const fail = () => {
                clearTimeout(timer);
                script.remove();
                reject(new Error("Unable to load Cashfree checkout. Please retry."));
            };
            const timer = setTimeout(fail, 20000);
            script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
            script.onerror = fail;
            script.onload = () => {
                clearTimeout(timer);
                if (window.Cashfree) resolve();
                else fail();
            };
            document.body.appendChild(script);
        }).catch(error => { cashfreeLoading = null; throw error; });
    }
    return cashfreeLoading;
}
export default function Payments({ isAdmin = false }) {
    const [data, setData] = useState({ rows: [], total: 0, configured: false });
    const [summary, setSummary] = useState(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [receipt, setReceipt] = useState(null);
    const receiptPanel = useRef(null);
    useEffect(() => {
        if (receipt) receiptPanel.current?.focus();
    }, [receipt]);
    const [query, setQuery] = useState("");
    const load = useCallback(async () => {
        setLoading(true); setError("");
        try {
            const result = await api(`/api/payments?page=${page}`, {}, isAdmin);
            setData(result);
            if (isAdmin) setSummary((await api("/api/payments/summary", {}, true)).summary);
        } catch (e) { setError(e.message); }
        finally { setLoading(false); }
    }, [page, isAdmin]);
    useEffect(() => { load(); }, [load]);
    const action = async (id, fn) => {
        setBusy(id); setError(""); setMessage("");
        try { await fn(); await load(); } catch (e) { setError(e.message); }
        finally { setBusy(""); }
    };
    const pay = row => action(row.application._id, async () => {
        const result = await api("/api/payments/orders", { method: "POST", body: JSON.stringify({ applicationId: row.application._id }) });
        if (result.provider === "cashfree") {
            await loadCashfree();
            const checkout = window.Cashfree({ mode: "sandbox" });
            const outcome = await checkout.checkout({ paymentSessionId: result.sessionId, redirectTarget: "_modal" });
            const verified = await api(`/api/payments/${result.paymentId}/refresh`, { method: "POST" });
            if (verified.payment?.status === "Paid") setMessage("Test payment verified. Your receipt is available below.");
            else setMessage(outcome?.error ? "Checkout did not complete. You can retry or refresh payment status." : "Payment is awaiting confirmation. Use Refresh Payment to check again.");
            return;
        }
        await loadCheckout();
        await new Promise((resolve, reject) => {
            let settled = false;
            const checkout = new window.Razorpay({
                key: result.keyId, order_id: result.order.id, amount: result.order.amount, currency: "INR",
                name: "Smart City", description: row.application.serviceName,
                prefill: { name: row.application.citizenName, email: row.application.citizenEmail, contact: row.application.citizenPhone },
                handler: async response => {
                    settled = true;
                    try { await api("/api/payments/verify", { method: "POST", body: JSON.stringify(response) }); setMessage("Test payment verified. Your receipt is available below."); resolve(); }
                    catch (e) { reject(e); }
                },
                modal: { ondismiss: () => { if (!settled) { settled = true; resolve(); } } }
            });
            checkout.on("payment.failed", () => { setMessage("Payment attempt failed. You can retry in checkout or close it and refresh payment status."); });
            checkout.open();
        });
    });
    const setFee = application => {
        const amount = window.prompt("Set the final application fee in rupees (for example 250.00). Enter 0 for a free service. This cannot be changed after saving.");
        if (amount == null) return;
        action(application._id, () => api(`/api/payments/applications/${application._id}/fee`, { method: "PATCH", body: JSON.stringify({ amount }) }, true));
    };
    const recover = payment => {
        if (payment.provider === "cashfree") {
            action(payment._id, () => api(`/api/payments/${payment._id}/recover-order`, { method: "POST", body: "{}" }, true));
            return;
        }
        const orderId = window.prompt(`Find receipt ${payment.receipt} in Razorpay Test Mode and enter its matching Order ID. Do not create a second order.`);
        if (orderId) action(payment._id, () => api(`/api/payments/${payment._id}/recover-order`, { method: "POST", body: JSON.stringify({ orderId }) }, true));
    };
    const rows = data.rows.filter(row => `${row.application.applicationId} ${row.application.serviceName} ${row.application.citizenName} ${row.status} ${row.payment?.paymentId || ""}`.toLowerCase().includes(query.toLowerCase()));
    return <ManagementLayout title={isAdmin ? "Payment Management" : "My Payments"} isAdmin={isAdmin} subtitle="Service fees, verified transactions and payment receipts.">
        <div className="management-success">{data.provider === "cashfree" ? "Cashfree Sandbox" : "Razorpay Test Mode"} · No real money is collected. Payment becomes available after application approval.</div>
        {!loading && !data.configured && <p className="management-error">Test checkout is not configured. The administrator must add sandbox payment keys on the backend.</p>}
        {summary && <div className="management-stats">{[["Total collected (net)", money(summary.totalPaise)], ["Today (India)", money(summary.todayPaise)], ["Pending applications", summary.pending], ["Failed orders", summary.failed]].map(([label, value]) => <div className="management-stat" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>}
        <div className="management-actions"><label>Search this page<input value={query} onChange={e => setQuery(e.target.value)} placeholder="Application, service, citizen or status" /></label><button className="secondary" onClick={load} disabled={loading || Boolean(busy)}>Refresh List</button></div>
        {error && <p role="alert" className="management-error">{error}</p>}{message && <p role="status" className="management-success">{message}</p>}
        {receipt && (
            <section ref={receiptPanel} tabIndex={-1} className="management-card receipt" aria-label="Payment receipt">
                <header className="receipt-header">
                    <div>
                        <span className="management-eyebrow">SMART CITY · CITIZEN SERVICES</span>
                        <h2>Smart City Payment Receipt</h2>
                    </div>
                    <span className="receipt-status">Verified</span>
                </header>
                <div className="receipt-amount">
                    <span>Amount paid</span>
                    <strong>{money(receipt.amountPaise)}</strong>
                </div>
                <p className="receipt-test">TEST PAYMENT · Not valid as proof of a real payment</p>
                <dl className="management-grid receipt-details">
                    {[
                        ["Receipt number", receipt.receipt],
                        ["Application ID", receipt.applicationReference],
                        ["Citizen", receipt.citizenName],
                        ["Service", receipt.serviceName],
                        ["Transaction ID", receipt.paymentId],
                        ["Paid on", receipt.paidAt ? new Date(receipt.paidAt).toLocaleString("en-IN") : null],
                        ["Refund recorded", money(receipt.refundedPaise)]
                    ].map(([label, value]) => (
                        <div key={label}><dt>{label}</dt><dd>{value || "—"}</dd></div>
                    ))}
                </dl>
                <div className="management-actions">
                    <button onClick={() => window.print()}>Print / Save PDF</button>
                    <button className="secondary" onClick={() => setReceipt(null)}>Close Receipt</button>
                </div>
            </section>
        )}
        {loading ? <p role="status">Loading payments...</p> : rows.length === 0 ? <p className="management-card">No matching applications on this page.</p> : rows.map(row => {
            const a = row.application, p = row.payment;
            return <article className="management-card" key={a._id}>
                <div className="management-actions"><h2>{a.serviceName}</h2><span className="management-badge">{row.status}{p?.refundedPaise > 0 ? " · Refund recorded" : ""}</span></div>
                <dl className="management-grid"><div><dt>Application ID</dt><dd>{a.applicationId || a._id}</dd></div>{isAdmin && <div><dt>Citizen</dt><dd>{a.citizenName || "—"}<br />{a.citizenEmail}</dd></div>}<div><dt>Application status</dt><dd>{a.status}</dd></div><div><dt>Fee</dt><dd>{a.feePaise == null ? "Awaiting fee assessment" : money(a.feePaise)}</dd></div><div><dt>Transaction ID</dt><dd>{p?.paymentId || "—"}</dd></div><div><dt>Order ID</dt><dd>{p?.orderId || "—"}</dd></div></dl>
                {p?.failureMessage && <p className="management-muted">{p.failureMessage}</p>}
                {p?.refundedPaise > 0 && <p>Refund recorded: {money(p.refundedPaise)}</p>}
                <div className="management-actions">
                    {!isAdmin && <Link className="management-button secondary" to={`/application-status/${a._id}`}>Application Details</Link>}
                    {!isAdmin && row.canPay && !["Creating", "Needs Review"].includes(row.status) && <button disabled={Boolean(busy) || !data.configured} onClick={() => pay(row)}>{busy === a._id ? "Please wait..." : `Pay ${money(a.feePaise)}`}</button>}
                    {p?.orderId && <button className="secondary" disabled={Boolean(busy)} onClick={() => action(p._id, () => api(`/api/payments/${p._id}/refresh`, { method: "POST" }, isAdmin))}>Refresh Payment</button>}
                    {p?.status === "Paid" && <button onClick={() => setReceipt(p)}>View Receipt</button>}
                    {isAdmin && a.feePaise == null && <button disabled={Boolean(busy)} onClick={() => setFee(a)}>Assess Fee</button>}
                    {isAdmin && p && ["Creating", "Needs Review"].includes(p.status) && <button disabled={Boolean(busy)} onClick={() => recover(p)}>Recover Provider Order</button>}
                </div>
            </article>;
        })}
        <div className="management-actions"><button className="secondary" disabled={page === 1 || loading || Boolean(busy)} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} · {data.total} applications</span><button className="secondary" disabled={page * 25 >= data.total || loading || Boolean(busy)} onClick={() => setPage(page + 1)}>Next</button></div>

    </ManagementLayout>;
}
