import { api } from "../utils/adminApi";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ReportIssue.css";

const ReportsIssue = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        category: "",
        description: "",
        location: ""
    });

    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !formData.title ||
            !formData.category ||
            !formData.description ||
            !formData.location
        ) {
            setMessage("Please fill all required fields.");
            return;
        }

        setBusy(true); setError(""); setMessage("");
        try {
            await api("/api/complaints", { method: "POST", body: JSON.stringify({
                subject: formData.title, category: formData.category,
                description: formData.description, address: formData.location
            }) });
            setMessage("Your civic issue has been submitted. View it in My Complaints.");
            setFormData({ title: "", category: "", description: "", location: "" });
        } catch (e) { setError(e.message); }
        finally { setBusy(false); }
    };

    return (
        <div className="reports-page">

            <div className="reports-header">
                <div>
                    <h1>Report Civic Issue</h1>
                    <p>
                        Report potholes, garbage, street lights and other
                        civic problems in your area.
                    </p>
                </div>

                <button
                    className="back-button"
                    onClick={() => navigate("/dashboard")}
                >
                    ← Back to Dashboard
                </button>
            </div>

            <div className="reports-container">

                <div className="reports-info">
                    <h2>Help Improve Your City</h2>

                    <p>
                        Your complaint helps the city administration
                        identify and resolve civic problems.
                    </p>

                    <div className="info-item">
                        <span>📍</span>
                        <div>
                            <strong>Provide Location</strong>
                            <p>
                                Mention the exact location of the issue.
                            </p>
                        </div>
                    </div>

                    <div className="info-item">
                        <span>📝</span>
                        <div>
                            <strong>Describe the Problem</strong>
                            <p>
                                Give clear details about the issue.
                            </p>
                        </div>
                    </div>

                    <div className="info-item">
                        <span>🏙️</span>
                        <div>
                            <strong>Make Your City Better</strong>
                            <p>
                                Help authorities improve public services.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="reports-form-card">

                    <h2>Issue Details</h2>

                    {error && <p role="alert">{error}</p>}
                    {message && (
                        <div className="reports-message">
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        <div className="form-group">
                            <label>Issue Title *</label>

                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Example: Large pothole on main road"
                            />
                        </div>

                        <div className="form-group">
                            <label>Issue Category *</label>

                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option value="">
                                    Select Category
                                </option>

                                <option value="Roads">
                                    Roads & Potholes
                                </option>

                                <option value="Garbage">
                                    Garbage & Waste
                                </option>

                                <option value="Street Light">
                                    Street Lights
                                </option>

                                <option value="Water">
                                    Water Supply
                                </option>

                                <option value="Drainage">
                                    Drainage
                                </option>

                                <option value="Traffic">
                                    Traffic
                                </option>

                                <option value="Other">
                                    Other
                                </option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Location *</label>

                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Enter issue location"
                            />
                        </div>

                        <div className="form-group">
                            <label>Description *</label>

                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the issue in detail..."
                                rows="6"
                            />
                        </div>

                        <button
                            type="submit"
                            className="submit-report-button"
                            disabled={busy}
                        >
                            {busy ? "Submitting..." : "Submit Complaint"}
                        </button>

                    </form>
                </div>

            </div>
        </div>
    );
};

export default ReportsIssue;
