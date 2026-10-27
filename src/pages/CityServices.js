import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CityServices.css";

function CityServices() {

    const navigate = useNavigate();

    const [services, setServices] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedService, setSelectedService] =
        useState(null);


    const categories = [
        "All",
        "Utilities",
        "Environment",
        "Transport",
        "Health",
        "Education",
        "Emergency",
        "Government"
    ];


    const loadServices = async () => {

        try {

            setLoading(true);
            setError("");

            const params =
                new URLSearchParams();

            if (search.trim() !== "") {
                params.append(
                    "search",
                    search.trim()
                );
            }

            if (category !== "All") {
                params.append(
                    "category",
                    category
                );
            }


            const response = await fetch(
                `http://localhost:5000/api/services?${params.toString()}`
            );


            const data =
                await response.json();


            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Unable to load services"
                );
            }


            setServices(
                data.services || []
            );


        } catch (err) {

            console.error(
                "SERVICE LOAD ERROR:",
                err
            );

            setServices([]);

            setError(
                "Unable to load city services. Please make sure the backend server is running."
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        const timer =
            setTimeout(() => {
                loadServices();
            }, 300);

        return () =>
            clearTimeout(timer);

    }, [search, category]);


    const openServiceDetails =
        (service) => {

            setSelectedService(
                service
            );

        };


    const closeServiceDetails =
        () => {

            setSelectedService(
                null
            );

        };


    const handleApply =
        () => {

            if (!selectedService) {
                return;
            }

            navigate(
                "/apply-service",
                {
                    state: {
                        service:
                            selectedService
                    }
                }
            );

        };


    return (

        <div className="city-services-page">


            {/* HEADER */}

            <div className="city-services-header">

                <div>

                    <h1>
                        City Services
                    </h1>

                    <p>
                        Explore important government
                        and civic services.
                    </p>

                </div>


                <button
                    className="dashboard-back-btn"
                    onClick={() =>
                        navigate(
                            "/dashboard"
                        )
                    }
                >
                    ← Dashboard
                </button>

            </div>


            {/* SEARCH */}

            <div className="services-controls">

                <div className="service-search-box">

                    <span>
                        🔍
                    </span>

                    <input
                        type="text"
                        placeholder="Search city services..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />

                </div>


                <div className="service-category-box">

                    <label>
                        Category:
                    </label>

                    <select
                        value={category}
                        onChange={(e) =>
                            setCategory(
                                e.target.value
                            )
                        }
                    >

                        {categories.map(
                            (item) => (

                                <option
                                    key={item}
                                    value={item}
                                >
                                    {item}
                                </option>

                            )
                        )}

                    </select>

                </div>

            </div>


            {/* ERROR */}

            {error && (

                <div className="service-error">
                    {error}
                </div>

            )}


            {/* COUNT */}

            {!loading &&
                !error && (

                    <div className="service-count">

                        Showing{" "}
                        {services.length}{" "}
                        service
                        {services.length !== 1
                            ? "s"
                            : ""}

                    </div>

                )}


            {/* LOADING */}

            {loading && (

                <div className="service-loading">

                    <div className="loading-spinner"></div>

                    <p>
                        Loading city services...
                    </p>

                </div>

            )}


            {/* SERVICES */}

            {!loading &&
                !error &&
                services.length > 0 && (

                    <div className="services-grid">

                        {services.map(
                            (service) => (

                                <div
                                    className="service-card"
                                    key={service._id}
                                >

                                    <div className="service-card-icon">
                                        {service.icon ||
                                            "🏙️"}
                                    </div>


                                    <div className="service-card-content">

                                        <span className="service-category">
                                            {
                                                service.category
                                            }
                                        </span>


                                        <h2>
                                            {
                                                service.name
                                            }
                                        </h2>


                                        <p>
                                            {
                                                service.description
                                            }
                                        </p>


                                        <button
                                            className="view-service-btn"
                                            onClick={() =>
                                                openServiceDetails(
                                                    service
                                                )
                                            }
                                        >
                                            View Service →
                                        </button>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}


            {/* NO SERVICES */}

            {!loading &&
                !error &&
                services.length === 0 && (

                    <div className="no-services">

                        <div className="no-services-icon">
                            🔍
                        </div>

                        <h2>
                            No Services Found
                        </h2>

                        <p>
                            Try a different
                            search or category.
                        </p>

                    </div>

                )}


            {/* DETAILS MODAL */}

            {selectedService && (

                <div
                    className="service-modal-overlay"
                    onClick={
                        closeServiceDetails
                    }
                >

                    <div
                        className="service-details-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="service-modal-header">

                            <div className="service-modal-title">

                                <div className="modal-service-icon">
                                    {
                                        selectedService.icon ||
                                        "🏙️"
                                    }
                                </div>


                                <div>

                                    <span className="modal-category">
                                        {
                                            selectedService.category
                                        }
                                    </span>

                                    <h2>
                                        {
                                            selectedService.name
                                        }
                                    </h2>

                                </div>

                            </div>


                            <button
                                className="close-modal-btn"
                                onClick={
                                    closeServiceDetails
                                }
                            >
                                ×
                            </button>

                        </div>


                        {/* DESCRIPTION */}

                        <div className="service-detail-section">

                            <h3>
                                📋 Service Description
                            </h3>

                            <p>
                                {
                                    selectedService.description
                                }
                            </p>

                        </div>


                        {/* DETAILS */}

                        <div className="service-detail-grid">

                            <div className="detail-box">

                                <span className="detail-icon">
                                    👤
                                </span>

                                <div>

                                    <small>
                                        Eligibility
                                    </small>

                                    <strong>
                                        {
                                            selectedService.eligibility ||
                                            "Available for citizens"
                                        }
                                    </strong>

                                </div>

                            </div>


                            <div className="detail-box">

                                <span className="detail-icon">
                                    💰
                                </span>

                                <div>

                                    <small>
                                        Fees
                                    </small>

                                    <strong>
                                        {
                                            selectedService.fees ||
                                            "Free"
                                        }
                                    </strong>

                                </div>

                            </div>


                            <div className="detail-box">

                                <span className="detail-icon">
                                    ⏱️
                                </span>

                                <div>

                                    <small>
                                        Processing Time
                                    </small>

                                    <strong>
                                        {
                                            selectedService.processingTime ||
                                            "3-5 working days"
                                        }
                                    </strong>

                                </div>

                            </div>


                            <div className="detail-box">

                                <span className="detail-icon">
                                    📞
                                </span>

                                <div>

                                    <small>
                                        Department / Contact
                                    </small>

                                    <strong>
                                        {
                                            selectedService.contact ||
                                            "Municipal Office"
                                        }
                                    </strong>

                                </div>

                            </div>

                        </div>


                        {/* DOCUMENTS */}

                        <div className="service-detail-section">

                            <h3>
                                📄 Required Documents
                            </h3>


                            {selectedService.requiredDocuments &&
                            selectedService.requiredDocuments.length >
                                0 ? (

                                <ul className="documents-list">

                                    {
                                        selectedService
                                            .requiredDocuments
                                            .map(
                                                (
                                                    document,
                                                    index
                                                ) => (

                                                    <li
                                                        key={
                                                            index
                                                        }
                                                    >
                                                        <span>
                                                            ✓
                                                        </span>

                                                        {
                                                            document
                                                        }
                                                    </li>

                                                )
                                            )
                                    }

                                </ul>

                            ) : (

                                <p className="no-documents">
                                    No documents required.
                                </p>

                            )}

                        </div>


                        {/* STATUS */}

                        <div className="service-status-row">

                            <span>
                                Service Status
                            </span>

                            <span
                                className={`service-status ${
                                    selectedService.status ===
                                    "active"
                                        ? "active"
                                        : "inactive"
                                }`}
                            >
                                {
                                    selectedService.status ===
                                    "active"
                                        ? "Active"
                                        : "Inactive"
                                }
                            </span>

                        </div>


                        {/* ACTIONS */}

                        <div className="service-modal-actions">

                            <button
                                className="modal-cancel-btn"
                                onClick={
                                    closeServiceDetails
                                }
                            >
                                Close
                            </button>


                            <button
                                className="modal-apply-btn"
                                onClick={
                                    handleApply
                                }
                                disabled={
                                    selectedService.status !==
                                    "active"
                                }
                            >
                                Apply for Service →
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}

export default CityServices;