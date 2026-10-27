import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ApplyService.css";

function ApplyService() {
    const location = useLocation();
    const navigate = useNavigate();

    const [service, setService] = useState(
        location.state?.service || null
    );

    const [user, setUser] = useState(null);

    const [purpose, setPurpose] = useState("");
    const [additionalDetails, setAdditionalDetails] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const savedUser = localStorage.getItem("smartCityUser");

        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (error) {
                console.error("User data error:", error);
            }
        }

        // If service was passed from City Services
        if (location.state?.service) {
            setService(location.state.service);
            return;
        }

        // If page is refreshed, try to recover service from sessionStorage
        const savedService = sessionStorage.getItem("selectedService");

        if (savedService) {
            try {
                setService(JSON.parse(savedService));
            } catch (error) {
                console.error("Service data error:", error);
            }
        }
    }, [location.state]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        const token = localStorage.getItem("smartCityToken");

        if (!token) {
            setError("Please login first.");
            navigate("/login");
            return;
        }

        if (!service) {
            setError("Service information is required");
            return;
        }

        const serviceId =
            service._id ||
            service.id ||
            service.serviceId;

        const serviceName =
            service.name ||
            service.serviceName;

        if (!serviceId || !serviceName) {
            console.log("SERVICE DATA:", service);

            setError(
                "Service information is required. Please go back to City Services and select the service again."
            );
            return;
        }

        const applicationData = {
            serviceId: serviceId,
            serviceName: serviceName,

            applicantName:
                user?.name ||
                user?.fullName ||
                "",

            email:
                user?.email ||
                "",

            phone:
                user?.phone ||
                "",

            city:
                user?.city ||
                "",

            address:
                user?.address ||
                "",

            pincode:
                user?.pincode ||
                "",

            purpose: purpose,
            additionalDetails: additionalDetails
        };

        console.log("APPLICATION DATA:", applicationData);

        try {
            setLoading(true);

            const response = await fetch(
                "http://localhost:5000/api/service-applications",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(applicationData)
                }
            );

            const data = await response.json();

            console.log("APPLICATION RESPONSE:", data);

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to submit application"
                );
            }

            setSuccess(
                "Application submitted successfully!"
            );

            // Save latest application
            if (data.application) {
                sessionStorage.setItem(
                    "lastApplication",
                    JSON.stringify(data.application)
                );
            }

            setTimeout(() => {
                navigate("/my-applications");
            }, 1200);

        } catch (error) {
            console.error("SUBMIT APPLICATION ERROR:", error);

            setError(
                error.message ||
                "Something went wrong while submitting application."
            );
        } finally {
            setLoading(false);
        }
    };

    if (!service) {
        return (
            <div className="apply-page">
                <div className="apply-container">
                    <div className="apply-error-box">
                        <h2>Service Not Found</h2>

                        <p>
                            Please go back to City Services and select a
                            service again.
                        </p>

                        <button
                            onClick={() => navigate("/city-services")}
                            className="back-button"
                        >
                            ← City Services
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="apply-page">

            <div className="apply-container">

                {/* HEADER */}
                <div className="apply-header">

                    <div>
                        <h1>Apply for Service</h1>

                        <p>
                            Submit your application online.
                        </p>
                    </div>

                    <button
                        className="back-button"
                        onClick={() => navigate("/city-services")}
                    >
                        ← City Services
                    </button>

                </div>


                <div className="apply-grid">

                    {/* SERVICE INFORMATION */}
                    <div className="service-summary">

                        <div className="service-icon">
                            {service.icon || "🏙️"}
                        </div>

                        <div className="service-category">
                            {service.category || "Government"}
                        </div>

                        <h2>
                            {service.name}
                        </h2>

                        <p className="service-description">
                            {service.description}
                        </p>

                        <div className="service-info">

                            <div>
                                <span>Eligibility</span>
                                <strong>
                                    {service.eligibility ||
                                        "All citizens"}
                                </strong>
                            </div>

                            <div>
                                <span>Fees</span>
                                <strong>
                                    {service.fees || "Free"}
                                </strong>
                            </div>

                            <div>
                                <span>Processing Time</span>
                                <strong>
                                    {service.processingTime ||
                                        "3-5 working days"}
                                </strong>
                            </div>

                        </div>

                        <div className="required-documents">

                            <h3>
                                📄 Required Documents
                            </h3>

                            {service.requiredDocuments &&
                            service.requiredDocuments.length > 0 ? (
                                <ul>
                                    {service.requiredDocuments.map(
                                        (doc, index) => (
                                            <li key={index}>
                                                {doc}
                                            </li>
                                        )
                                    )}
                                </ul>
                            ) : (
                                <p>
                                    No specific documents required.
                                </p>
                            )}

                        </div>

                    </div>


                    {/* APPLICATION FORM */}
                    <div className="application-form-card">

                        <h2>
                            Applicant Information
                        </h2>

                        <p className="form-description">
                            Your registered account information will be
                            used for this application.
                        </p>


                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="success-message">
                                {success}
                            </div>
                        )}


                        <form onSubmit={handleSubmit}>

                            <div className="form-row">

                                <div className="form-group">

                                    <label>
                                        Full Name
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            user?.name ||
                                            user?.fullName ||
                                            ""
                                        }
                                        readOnly
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        value={
                                            user?.email || ""
                                        }
                                        readOnly
                                    />

                                </div>

                            </div>


                            <div className="form-row">

                                <div className="form-group">

                                    <label>
                                        Phone
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            user?.phone || ""
                                        }
                                        readOnly
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        City
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            user?.city || ""
                                        }
                                        readOnly
                                    />

                                </div>

                            </div>


                            <div className="form-group">

                                <label>
                                    Address
                                </label>

                                <textarea
                                    value={
                                        user?.address || ""
                                    }
                                    readOnly
                                    rows="3"
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    Pincode
                                </label>

                                <input
                                    type="text"
                                    value={
                                        user?.pincode || ""
                                    }
                                    readOnly
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    Purpose
                                </label>

                                <textarea
                                    placeholder="Enter the purpose of applying for this service"
                                    value={purpose}
                                    onChange={(e) =>
                                        setPurpose(e.target.value)
                                    }
                                    rows="3"
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    Additional Details
                                </label>

                                <textarea
                                    placeholder="Enter any additional information"
                                    value={additionalDetails}
                                    onChange={(e) =>
                                        setAdditionalDetails(
                                            e.target.value
                                        )
                                    }
                                    rows="4"
                                />

                            </div>


                            <button
                                type="submit"
                                className="submit-application-button"
                                disabled={loading}
                            >
                                {loading
                                    ? "Submitting..."
                                    : "Submit Application"}
                            </button>

                        </form>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default ApplyService;