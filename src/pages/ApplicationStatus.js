import ValidatedForm, { FormField } from "../components/ValidatedForm";
import useLiveRefresh from "../hooks/useLiveRefresh";
import ApplicationDocuments from "../components/ApplicationDocuments";
import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./ApplicationStatus.css";
import { api, money } from "../utils/adminApi";

function ServicePayment({ applicationId }) {
    const [payment, setPayment] = useState(null);
    const [error, setError] = useState(false);
    const query = new URLSearchParams({ applicationId });
    const destination = `/payments?${query}`;

    useLiveRefresh(async () => {
        try {
            const data = await api(`/api/payments?${query}`, { cache: "no-store" });
            const row = data.rows.find(item => item.application._id === applicationId);
            setPayment(row ? { ...row, configured: data.configured } : null);
            setError(!row);
        } catch {
            setError(true);
        }
    }, applicationId);

    const canPay = !error && payment?.configured && payment.canPay &&
        !["Creating", "Needs Review"].includes(payment.status);
    return (
        <section className="status-card">
            <h2>Service Payment</h2>
            <p role="status">
                {error ? "Payment status is temporarily unavailable." : payment
                    ? `Payment status: ${payment.status}${payment.application.feePaise == null ? "" : ` · ${money(payment.application.feePaise)}`}`
                    : "Checking payment status…"}
            </p>
            <p>Payment opens after approval or when processing begins, if a payable fee is set.</p>
            <div className="status-payment-actions">
                <Link className="status-payment-button" to={destination}>View Payment Status</Link>
                {canPay ? <Link className="status-payment-button primary" to={destination}>Pay Fee</Link>
                    : <button className="status-payment-button" disabled>Pay Fee</button>}
            </div>
        </section>
    );
}


function ApplicationStatus() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [applicationId, setApplicationId] = useState("");
    const [application, setApplication] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const token = localStorage.getItem("smartCityToken");

    const fetchApplication = useCallback(async (idToCheck, silent = false) => {
        try {
            if (!silent) setLoading(true);
            setError("");
            if (!silent) setApplication(null);

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await fetch(
                `https://backend-1df5.onrender.com/api/service-applications/${encodeURIComponent(idToCheck)}`,
                {
                    cache: "no-store",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (response.status === 401) {
                navigate("/login", { replace: true });
                return;
            }
            if (!response.ok || !data.application) {
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
    }, [token, navigate]);

    useEffect(() => {
        if (id) {
            setApplicationId(id);

        } else {
            setApplication(null);
            setApplicationId("");
            setError("");
        }
    }, [id, fetchApplication]);

    useLiveRefresh(silent => id ? fetchApplication(id, silent) : undefined, id);

    const handleCheckStatus = (e) => {
        e.preventDefault();

        const cleanId = applicationId.trim();

        if (!cleanId) {
            setError("Please enter your application ID.");
            return;
        }

        if (cleanId === id) {
            fetchApplication(cleanId);
        } else {
            navigate(`/application-status/${encodeURIComponent(cleanId)}`);
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "Pending":
                return "status-pending";

            case "In Progress":
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

    return (
        <div className="application-status-page">

            <div className="application-status-container">

                {/* HEADER */}

                <div className="status-page-header">

                    <div>
                        <h1>
                            Application Details
                        </h1>

                        <p>
                            Track your submitted service application.
                        </p>
                    </div>

                    <button
                        className="dashboard-back-btn"
                        onClick={() =>
                            navigate("/my-applications")
                        }
                    >
                        ← My Applications
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

                        <ValidatedForm
                            onSubmit={handleCheckStatus}
                            className="status-check-form"
                        >

                            <label>
                                Application ID
                            </label>

                            <div className="status-input-row">

                                <FormField as="input" rules={{ label: "Application ID", required: true }}
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

                        </ValidatedForm>


                        {error && (
                            <div className="status-error-message">
                                {error}
                            </div>
                        )}

                    </div>

                </div>


                {loading && <p role="status">Loading application details...</p>}

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
                                        {application.applicationId || application._id}
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


                        <div className="status-card" aria-live="polite">
                            <div className="card-title">
                                <h2>Current Status</h2>
                                <p>{application.status || "Pending"}</p>
                            </div>
                            <p>Last updated: {application.updatedAt
                                ? new Date(application.updatedAt).toLocaleString("en-IN")
                                : "Not available"}</p>
                            <h3>Department Remark</h3>
                            <p>{application.adminRemark || "No remark has been added yet."}</p>
                            <button type="button" className="dashboard-back-btn"
                                disabled={loading}
                                onClick={() => fetchApplication(application._id)}>
                                Refresh Status
                            </button>
                        </div>

                        <ServicePayment key={application._id} applicationId={application._id} />

                        <ApplicationDocuments key={application._id} applicationId={application._id} />

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
                                        {application.citizenName || application.applicantName ||
                                            "—"}
                                    </strong>

                                </div>


                                <div className="info-item">

                                    <span>
                                        Email
                                    </span>

                                    <strong>
                                        {application.citizenEmail || application.email ||
                                            "—"}
                                    </strong>

                                </div>


                                <div className="info-item">

                                    <span>
                                        Phone
                                    </span>

                                    <strong>
                                        {application.citizenPhone || application.phone ||
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
                                        {application.applicationData?.purpose || application.purpose || application.description ||
                                            "Not recorded for this application"}
                                    </strong>

                                </div>


                                <div className="info-item full-width">

                                    <span>
                                        Additional Details
                                    </span>

                                    <strong>
                                        {application.applicationData?.additionalDetails || application.additionalDetails ||
                                            "Not recorded for this application"}
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
