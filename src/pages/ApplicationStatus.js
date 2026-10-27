import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ApplicationStatus.css";

function ApplicationStatus() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [applicationId, setApplicationId] = useState("");
    const [application, setApplication] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const token = localStorage.getItem("smartCityToken");

    useEffect(() => {
        if (id) {
            setApplicationId(id);
            fetchApplication(id);
        }
    }, [id]);

    const fetchApplication = async (idToCheck) => {
        try {
            setLoading(true);
            setError("");
            setApplication(null);

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await fetch(
                `http://localhost:5000/api/service-applications/${idToCheck}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Application not found"
                );
            }

            setApplication(data.application);

        } catch (error) {
            console.error(
                "APPLICATION STATUS ERROR:",
                error
            );

            setError(
                error.message ||
                "Unable to find application"
            );

        } finally {
            setLoading(false);
        }
    };

    const handleCheckStatus = (e) => {
        e.preventDefault();

        const cleanId = applicationId.trim();

        if (!cleanId) {
            setError("Please enter your application ID.");
            return;
        }

        fetchApplication(cleanId);
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "Pending":
                return "status-pending";

            case "Under Review":
                return "status-review";

            case "Approved":
                return "status-approved";

            case "Rejected":
                return "status-rejected";

            case "Completed":
                return "status-completed";

            default:
                return "status-pending";
        }
    };

    const getStepClass = (step) => {
        if (!application) return "";

        const status = application.status;

        const steps = [
            "Pending",
            "Under Review",
            "Approved",
            "Completed"
        ];

        if (status === "Rejected") {
            return step === "Pending"
                ? "completed"
                : "";
        }

        const currentIndex = steps.indexOf(status);
        const stepIndex = steps.indexOf(step);

        if (stepIndex <= currentIndex) {
            return "completed";
        }

        return "";
    };

    return (
        <div className="application-status-page">

            <div className="application-status-container">

                {/* HEADER */}

                <div className="status-page-header">

                    <div>
                        <h1>
                            Application Status
                        </h1>

                        <p>
                            Track your submitted service application.
                        </p>
                    </div>

                    <button
                        className="dashboard-back-btn"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        ← Dashboard
                    </button>

                </div>


                {/* CHECK STATUS CARD */}

                <div className="check-status-card">

                    <div className="check-status-icon">
                        ✓
                    </div>

                    <div className="check-status-content">

                        <h2>
                            Track Application
                        </h2>

                        <p>
                            Enter your application ID to check
                            the latest status.
                        </p>

                        <form
                            onSubmit={handleCheckStatus}
                            className="status-check-form"
                        >

                            <label>
                                Application ID
                            </label>

                            <div className="status-input-row">

                                <input
                                    type="text"
                                    value={applicationId}
                                    onChange={(e) =>
                                        setApplicationId(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter application ID"
                                />

                                <button
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Checking..."
                                        : "Check Status"}
                                </button>

                            </div>

                        </form>


                        {error && (
                            <div className="status-error-message">
                                {error}
                            </div>
                        )}

                    </div>

                </div>


                {/* APPLICATION RESULT */}

                {application && (

                    <div className="application-result">

                        {/* SERVICE SUMMARY */}

                        <div className="status-service-card">

                            <div className="service-status-icon">
                                🏙️
                            </div>

                            <div className="service-status-info">

                                <span>
                                    SERVICE APPLICATION
                                </span>

                                <h2>
                                    {application.serviceName}
                                </h2>

                                <p>
                                    Application ID:
                                    <strong>
                                        {" "}
                                        {application._id}
                                    </strong>
                                </p>

                            </div>

                            <div
                                className={`application-status-badge ${getStatusClass(
                                    application.status
                                )}`}
                            >
                                {application.status}
                            </div>

                        </div>


                        {/* PROGRESS */}

                        <div className="status-card">

                            <div className="card-title">

                                <h2>
                                    Application Progress
                                </h2>

                                <p>
                                    Your application is currently{" "}
                                    <strong>
                                        {application.status}
                                    </strong>.
                                </p>

                            </div>


                            <div className="progress-container">

                                <div className="progress-step">

                                    <div
                                        className={`progress-circle ${getStepClass(
                                            "Pending"
                                        )}`}
                                    >
                                        ✓
                                    </div>

                                    <div className="progress-content">

                                        <h3>
                                            Submitted
                                        </h3>

                                        <p>
                                            Application has been
                                            submitted successfully.
                                        </p>

                                    </div>

                                </div>


                                <div className="progress-line"></div>


                                <div className="progress-step">

                                    <div
                                        className={`progress-circle ${getStepClass(
                                            "Under Review"
                                        )}`}
                                    >
                                        ✓
                                    </div>

                                    <div className="progress-content">

                                        <h3>
                                            Under Review
                                        </h3>

                                        <p>
                                            Your application is being
                                            reviewed by the department.
                                        </p>

                                    </div>

                                </div>


                                <div className="progress-line"></div>


                                <div className="progress-step">

                                    <div
                                        className={`progress-circle ${getStepClass(
                                            "Approved"
                                        )}`}
                                    >
                                        ✓
                                    </div>

                                    <div className="progress-content">

                                        <h3>
                                            Approved
                                        </h3>

                                        <p>
                                            Application approved by
                                            the department.
                                        </p>

                                    </div>

                                </div>


                                <div className="progress-line"></div>


                                <div className="progress-step">

                                    <div
                                        className={`progress-circle ${getStepClass(
                                            "Completed"
                                        )}`}
                                    >
                                        ✓
                                    </div>

                                    <div className="progress-content">

                                        <h3>
                                            Completed
                                        </h3>

                                        <p>
                                            Service request has been
                                            completed.
                                        </p>

                                    </div>

                                </div>


                                {application.status ===
                                    "Rejected" && (

                                    <div className="rejected-box">

                                        <strong>
                                            Application Rejected
                                        </strong>

                                        <p>
                                            {application.adminRemark ||
                                                "Your application has been rejected by the department."}
                                        </p>

                                    </div>
                                )}

                            </div>

                        </div>


                        {/* APPLICANT INFORMATION */}

                        <div className="status-card">

                            <div className="card-title">

                                <h2>
                                    Applicant Information
                                </h2>

                            </div>

                            <div className="information-grid">

                                <div className="info-item">

                                    <span>
                                        Full Name
                                    </span>

                                    <strong>
                                        {application.applicantName ||
                                            "—"}
                                    </strong>

                                </div>


                                <div className="info-item">

                                    <span>
                                        Email
                                    </span>

                                    <strong>
                                        {application.email ||
                                            "—"}
                                    </strong>

                                </div>


                                <div className="info-item">

                                    <span>
                                        Phone
                                    </span>

                                    <strong>
                                        {application.phone ||
                                            "—"}
                                    </strong>

                                </div>


                                <div className="info-item">

                                    <span>
                                        City
                                    </span>

                                    <strong>
                                        {application.city ||
                                            "—"}
                                    </strong>

                                </div>


                                <div className="info-item full-width">

                                    <span>
                                        Address
                                    </span>

                                    <strong>
                                        {application.address ||
                                            "—"}
                                    </strong>

                                </div>

                            </div>

                        </div>


                        {/* APPLICATION DETAILS */}

                        <div className="status-card">

                            <div className="card-title">

                                <h2>
                                    Application Details
                                </h2>

                            </div>

                            <div className="information-grid">

                                <div className="info-item">

                                    <span>
                                        Applied On
                                    </span>

                                    <strong>
                                        {application.createdAt
                                            ? new Date(
                                                application.createdAt
                                            ).toLocaleDateString(
                                                "en-IN",
                                                {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric"
                                                }
                                            )
                                            : "—"}
                                    </strong>

                                </div>


                                <div className="info-item">

                                    <span>
                                        Service
                                    </span>

                                    <strong>
                                        {application.serviceName}
                                    </strong>

                                </div>


                                <div className="info-item full-width">

                                    <span>
                                        Purpose
                                    </span>

                                    <strong>
                                        {application.purpose ||
                                            "No purpose provided"}
                                    </strong>

                                </div>


                                <div className="info-item full-width">

                                    <span>
                                        Additional Details
                                    </span>

                                    <strong>
                                        {application.additionalDetails ||
                                            "No additional details"}
                                    </strong>

                                </div>

                            </div>

                        </div>

                    </div>
                )}

            </div>

        </div>
    );
}

export default ApplicationStatus;