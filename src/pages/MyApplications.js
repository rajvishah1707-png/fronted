import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyApplications.css";

function MyApplications() {

    const navigate = useNavigate();

    const [applications, setApplications] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [filter, setFilter] = useState("All");


    const loadApplications = async () => {

        try {

            setLoading(true);

            setError("");

            const token =
                localStorage.getItem(
                    "smartCityToken"
                );

            if (!token) {

                navigate("/login");

                return;
            }


            const response = await fetch(
                "http://localhost:5000/api/service-applications/my-applications",
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to load applications"
                );
            }


            setApplications(
                data.applications || []
            );

        } catch (error) {

            console.error(
                "My Applications Error:",
                error
            );

            setError(
                error.message ||
                "Unable to load your applications"
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        loadApplications();

    }, []);


    const filteredApplications =
        filter === "All"
            ? applications
            : applications.filter(
                (application) =>
                    application.status === filter
            );


    const getStatusClass = (status) => {

        if (!status) {
            return "status-pending";
        }

        const value =
            status.toLowerCase();

        if (
            value === "approved" ||
            value === "completed"
        ) {
            return "status-success";
        }

        if (
            value === "rejected"
        ) {
            return "status-rejected";
        }

        if (
            value === "under review"
        ) {
            return "status-review";
        }

        return "status-pending";
    };


    const formatDate = (date) => {

        if (!date) {
            return "N/A";
        }

        return new Date(date)
            .toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );
    };


    return (

        <div className="my-applications-page">


            {/* HEADER */}

            <header className="my-applications-header">

                <div>

                    <h1>
                        My Applications
                    </h1>

                    <p>
                        View and track all your
                        submitted service applications.
                    </p>

                </div>


                <button
                    className="back-services-btn"
                    onClick={() =>
                        navigate("/city-services")
                    }
                >
                    ← City Services
                </button>

            </header>


            {/* FILTER */}

            <div className="application-toolbar">

                <div className="application-count">

                    <strong>
                        {applications.length}
                    </strong>

                    <span>
                        Total Applications
                    </span>

                </div>


                <div className="application-actions">

                    <select
                        value={filter}
                        onChange={(e) =>
                            setFilter(
                                e.target.value
                            )
                        }
                    >

                        <option value="All">
                            All Status
                        </option>

                        <option value="Pending">
                            Pending
                        </option>

                        <option value="Under Review">
                            Under Review
                        </option>

                        <option value="Approved">
                            Approved
                        </option>

                        <option value="Rejected">
                            Rejected
                        </option>

                        <option value="Completed">
                            Completed
                        </option>

                    </select>


                    <button
                        className="refresh-btn"
                        onClick={
                            loadApplications
                        }
                    >
                        ↻ Refresh
                    </button>

                </div>

            </div>


            {/* ERROR */}

            {error && (

                <div className="applications-error">

                    {error}

                </div>

            )}


            {/* LOADING */}

            {loading && (

                <div className="applications-loading">

                    <div className="loading-spinner">
                    </div>

                    <p>
                        Loading your applications...
                    </p>

                </div>

            )}


            {/* APPLICATION LIST */}

            {!loading &&
                !error &&
                filteredApplications.length > 0 && (

                    <div className="applications-list">

                        {filteredApplications.map(
                            (application) => (

                                <div
                                    className="application-card"
                                    key={
                                        application._id
                                    }
                                >

                                    <div className="application-card-top">

                                        <div className="service-info">

                                            <div className="service-icon">
                                                🏢
                                            </div>

                                            <div>

                                                <h2>
                                                    {
                                                        application.serviceName ||
                                                        "City Service"
                                                    }
                                                </h2>

                                                <p>
                                                    Application ID:
                                                    {" "}
                                                    <strong>
                                                        {
                                                            application._id
                                                        }
                                                    </strong>
                                                </p>

                                            </div>

                                        </div>


                                        <span
                                            className={`application-status ${getStatusClass(
                                                application.status
                                            )}`}
                                        >
                                            {
                                                application.status ||
                                                "Pending"
                                            }
                                        </span>

                                    </div>


                                    <div className="application-details">

                                        <div>
                                            <span>
                                                Applicant
                                            </span>

                                            <strong>
                                                {
                                                    application.applicantName ||
                                                    "N/A"
                                                }
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Email
                                            </span>

                                            <strong>
                                                {
                                                    application.email ||
                                                    application.applicantEmail ||
                                                    "N/A"
                                                }
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                City
                                            </span>

                                            <strong>
                                                {
                                                    application.city ||
                                                    "N/A"
                                                }
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Applied On
                                            </span>

                                            <strong>
                                                {
                                                    formatDate(
                                                        application.createdAt ||
                                                        application.applicationDate
                                                    )
                                                }
                                            </strong>
                                        </div>

                                    </div>


                                    <div className="application-card-bottom">

                                        <div className="application-progress">

                                            <span className="progress-dot active">
                                            </span>

                                            <span className="progress-line">
                                            </span>

                                            <span
                                                className={
                                                    application.status ===
                                                        "Approved" ||
                                                    application.status ===
                                                        "Completed"
                                                        ? "progress-dot active"
                                                        : "progress-dot"
                                                }
                                            >
                                            </span>

                                            <span className="progress-line">
                                            </span>

                                            <span
                                                className={
                                                    application.status ===
                                                        "Completed"
                                                        ? "progress-dot active"
                                                        : "progress-dot"
                                                }
                                            >
                                            </span>

                                        </div>


                                        <button
                                            className="view-application-btn"
                                            onClick={() =>
                                                navigate(
                                                    `/application-status/${application._id}`
                                                )
                                            }
                                        >
                                            View Details →
                                        </button>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}


            {/* NO APPLICATIONS */}

            {!loading &&
                !error &&
                filteredApplications.length === 0 && (

                    <div className="no-applications">

                        <div className="no-applications-icon">
                            📋
                        </div>

                        <h2>
                            No Applications Found
                        </h2>

                        <p>
                            You have not submitted
                            any service applications yet.
                        </p>

                        <button
                            onClick={() =>
                                navigate(
                                    "/city-services"
                                )
                            }
                        >
                            Explore City Services
                        </button>

                    </div>

                )}

        </div>
    );
}

export default MyApplications;