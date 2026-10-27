import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ReportsIssue.css";

const ReportsIssue = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        category: "",
        description: "",
        location: ""
    });

    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
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

        setMessage(
            "Your civic issue has been submitted successfully."
        );

        setFormData({
            title: "",
            category: "",
            description: "",
            location: ""
        });
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
                        >
                            Submit Complaint
                        </button>

                    </form>
                </div>

            </div>
        </div>
    );
};

export default ReportsIssue;