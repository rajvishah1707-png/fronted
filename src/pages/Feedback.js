import ValidatedForm, { FormField } from "../components/ValidatedForm";
import React, { useCallback, useEffect, useState } from "react";
import ManagementLayout from "../components/ManagementLayout";
import { api } from "../utils/adminApi";
export default function Feedback() {
    const [rating, setRating] = useState(5);
    const [message, setMessage] = useState("");
    const [items, setItems] = useState([]);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const [notice, setNotice] = useState("");
    const load = useCallback(async () => {
        try { setItems((await api("/api/feedback")).feedback); }
        catch (e) { setError(e.message); }
    }, []);
    useEffect(() => { load(); }, [load]);
    const submit = async e => {
        e.preventDefault(); setBusy(true); setError(""); setNotice("");
        try { await api("/api/feedback", { method: "POST", body: JSON.stringify({ rating, message }) }); setMessage(""); await load(); setNotice("Your feedback has been submitted."); }
        catch (error) { setError(error.message); }
        finally { setBusy(false); }
    };
    return <ManagementLayout title="Feedback & Ratings" isAdmin={false} subtitle="Share your experience and read the administrator's reply.">{error && <p className="management-error" role="alert">{error}</p>}{notice && <p className="management-success" role="status">{notice}</p>}<section className="management-card"><ValidatedForm onSubmit={submit}><label>Rating<FormField as="select" rules={{ label: "Rating", required: true, number: true, integer: true, min: 1, max: 5 }} value={rating} onChange={e => setRating(Number(e.target.value))}>{[5,4,3,2,1].map(n => <option key={n} value={n}>{n} / 5</option>)}</FormField></label><label>Your feedback<FormField as="textarea" rules={{ required: true, maxLength: 2000, label: "Your feedback" }}   value={message} onChange={e => setMessage(e.target.value)} /></label><button disabled={busy}>{busy ? "Submitting..." : "Submit Feedback"}</button></ValidatedForm></section><h2>Your Recent Feedback</h2>{items.length === 0 ? <p>No feedback submitted yet.</p> : items.map(item => <article className="management-card" key={item._id}><strong>{item.rating}/5 · {new Date(item.createdAt).toLocaleDateString("en-IN")}</strong><p>{item.message}</p><p><strong>Admin reply: </strong>{item.adminReply || "Awaiting a reply"}</p></article>)}</ManagementLayout>;
}
