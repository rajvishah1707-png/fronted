import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const API_URL = "http://localhost:5000";

const Dashboard = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState({
        name: "Citizen",
        email: "",
        phone: "",
        profileImage: ""
    });

    const [applicationCount, setApplicationCount] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);
    const [approvedCount, setApprovedCount] = useState(0);
    const [completedCount, setCompletedCount] = useState(0);

    /* =========================================
       PROFILE IMAGE URL
    ========================================= */

    const getProfileImageUrl = (image) => {
        if (!image) {
            return "";
        }

        if (
            image.startsWith("http://") ||
            image.startsWith("https://")
        ) {
            return image;
        }

        if (image.startsWith("/")) {
            return `${API_URL}${image}`;
        }

        return `${API_URL}/${image}`;
    };

    /* =========================================
       LOAD USER
    ========================================= */

    useEffect(() => {
        const token =
            localStorage.getItem("smartCityToken");

        const savedUser =
            localStorage.getItem("smartCityUser");

        if (!token || !savedUser) {
            navigate("/login", {
                replace: true
            });
            return;
        }

        try {
            const parsedUser =
                JSON.parse(savedUser);

            setUser({
                name: parsedUser.name || "Citizen",
                email: parsedUser.email || "",
                phone: parsedUser.phone || "",
                profileImage:
                    parsedUser.profileImage || ""
            });

            loadApplications(token);

        } catch (error) {
            console.error(
                "Dashboard user error:",
                error
            );

            localStorage.removeItem(
                "smartCityToken"
            );

            localStorage.removeItem(
                "smartCityUser"
            );

            navigate("/login", {
                replace: true
            });
        }
    }, [navigate]);

    /* =========================================
       LOAD APPLICATIONS
    ========================================= */

    const loadApplications = async (token) => {
        try {
            const response = await fetch(
                `${API_URL}/api/service-applications/my-applications`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            const data =
                await response.json();

            if (
                data.success &&
                Array.isArray(data.applications)
            ) {
                const applications =
                    data.applications;

                setApplicationCount(
                    applications.length
                );

                setPendingCount(
                    applications.filter(
                        (application) =>
                            application.status ===
                            "Pending"
                    ).length
                );

                setApprovedCount(
                    applications.filter(
                        (application) =>
                            application.status ===
                            "Approved"
                    ).length
                );

                setCompletedCount(
                    applications.filter(
                        (application) =>
                            application.status ===
                            "Completed"
                    ).length
                );
            }

        } catch (error) {
            console.error(
                "Application loading error:",
                error
            );
        }
    };

    /* =========================================
       LOGOUT
    ========================================= */

    const logout = () => {
        localStorage.removeItem(
            "smartCityToken"
        );

        localStorage.removeItem(
            "smartCityUser"
        );

        navigate("/login", {
            replace: true
        });
    };

    /* =========================================
       PROFILE IMAGE
    ========================================= */

    const profileImageUrl =
        getProfileImageUrl(
            user.profileImage
        );

    /* =========================================
       RENDER
    ========================================= */

    return (
        <div className="citizen-dashboard">

            {/* ======================================
                HEADER
            ====================================== */}

            <header className="citizen-header">

                <div
                    className="citizen-brand"
                    onClick={() =>
                        navigate("/dashboard")
                    }
                >

                    <div className="citizen-logo">
                        SC
                    </div>

                    <div>
                        <h2>
                            Smart City
                        </h2>

                        <span>
                            Citizen Platform
                        </span>
                    </div>

                </div>


                {/* ======================================
                    NAVIGATION
                ====================================== */}

                <nav className="citizen-nav">

                    <button
                        className="active"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        Home
                    </button>

                    <button
                        onClick={() =>
                            navigate("/city-services")
                        }
                    >
                        City Services
                    </button>

                    <button
                        onClick={() =>
                            navigate("/my-applications")
                        }
                    >
                        My Applications
                    </button>

                    <button
                        onClick={() =>
                            navigate("/my-complaints")
                        }
                    >
                        My Complaints
                    </button>

                    <button
                        onClick={() =>
                            navigate("/payments")
                        }
                    >
                        Payments
                    </button>

                    <button
                        onClick={() =>
                            navigate("/digital-documents")
                        }
                    >
                        Digital Documents
                    </button>

                    <button
                        onClick={() =>
                            navigate("/ai-assistant")
                        }
                    >
                        AI Assistant
                    </button>

                    <button
                        onClick={() =>
                            navigate("/notifications")
                        }
                    >
                        Notifications
                    </button>

                </nav>


                {/* ======================================
                    USER PROFILE
                ====================================== */}

                <div className="citizen-user">

                    <button
                        className="citizen-avatar"
                        onClick={() =>
                            navigate("/profile")
                        }
                    >

                        {profileImageUrl ? (
                            <img
                                src={profileImageUrl}
                                alt={
                                    user.name ||
                                    "Profile"
                                }
                                className="dashboard-profile-image"
                                onError={(e) => {
                                    e.currentTarget.style.display =
                                        "none";

                                    const parent =
                                        e.currentTarget.parentElement;

                                    if (parent) {
                                        parent.classList.add(
                                            "profile-image-error"
                                        );
                                    }
                                }}
                            />
                        ) : (
                            (
                                user.name ||
                                "C"
                            )
                                .charAt(0)
                                .toUpperCase()
                        )}

                    </button>


                    <div className="citizen-user-info">

                        <strong>
                            {user.name ||
                                "Citizen"}
                        </strong>

                        <span>
                            Citizen
                        </span>

                    </div>


                    <button
                        className="citizen-logout"
                        onClick={logout}
                    >
                        Logout
                    </button>

                </div>

            </header>


            {/* ======================================
                HERO
            ====================================== */}

            <section className="citizen-hero">

                <div className="citizen-hero-content">

                    <span className="hero-badge">
                        SMART CITY • CITIZEN PORTAL
                    </span>

                    <h1>
                        Your City.
                        <br />

                        <span>
                            Your Voice. Your Future.
                        </span>
                    </h1>

                    <p>
                        Welcome back,{" "}
                        <strong>
                            {user.name ||
                                "Citizen"}
                        </strong>
                        . Access city services,
                        apply for government
                        services and stay
                        connected with your city.
                    </p>

                    <div className="hero-buttons">

                        <button
                            onClick={() =>
                                navigate(
                                    "/city-services"
                                )
                            }
                        >
                            Explore City Services →
                        </button>

                        <button
                            className="secondary"
                            onClick={() =>
                                navigate(
                                    "/my-applications"
                                )
                            }
                        >
                            My Applications
                        </button>

                    </div>

                </div>

            </section>


            {/* ======================================
                QUICK ACCESS
            ====================================== */}

            <section className="dashboard-section">

                <div className="section-heading">

                    <span>
                        QUICK ACCESS
                    </span>

                    <h2>
                        What would you like to do?
                    </h2>

                </div>


                <div className="quick-grid">

                    <div
                        className="quick-card"
                        onClick={() =>
                            navigate(
                                "/city-services"
                            )
                        }
                    >

                        <div className="quick-icon">
                            🏙️
                        </div>

                        <h3>
                            City Services
                        </h3>

                        <p>
                            Explore important
                            government services
                            available in your city.
                        </p>

                        <span>
                            Explore Services →
                        </span>

                    </div>


                    <div
                        className="quick-card"
                        onClick={() =>
                            navigate(
                                "/my-applications"
                            )
                        }
                    >

                        <div className="quick-icon">
                            📄
                        </div>

                        <h3>
                            My Applications
                        </h3>

                        <p>
                            View all government
                            services that you have
                            applied for.
                        </p>

                        <span>
                            View Applications →
                        </span>

                    </div>


                    <div
                        className="quick-card"
                        onClick={() =>
                            navigate(
                                "/my-complaints"
                            )
                        }
                    >

                        <div className="quick-icon">
                            📢
                        </div>

                        <h3>
                            My Complaints
                        </h3>

                        <p>
                            Submit civic complaints
                            and track the status of
                            your reported issues.
                        </p>

                        <span>
                            View Complaints →
                        </span>

                    </div>


                    <div
                        className="quick-card"
                        onClick={() =>
                            navigate("/payments")
                        }
                    >

                        <div className="quick-icon">
                            💳
                        </div>

                        <h3>
                            Payments & Receipts
                        </h3>

                        <p>
                            View service payments,
                            transaction details and
                            download payment receipts.
                        </p>

                        <span>
                            View Payments →
                        </span>

                    </div>


                    <div
                        className="quick-card"
                        onClick={() =>
                            navigate("/digital-documents")
                        }
                    >

                        <div className="quick-icon">
                            📑
                        </div>

                        <h3>
                            Digital Documents
                        </h3>

                        <p>
                            Access approved
                            certificates, receipts
                            and important digital
                            documents.
                        </p>

                        <span>
                            View Documents →
                        </span>

                    </div>


                    <div
                        className="quick-card"
                        onClick={() =>
                            navigate(
                                "/ai-assistant"
                            )
                        }
                    >

                        <div className="quick-icon">
                            🤖
                        </div>

                        <h3>
                            AI Smart Assistant
                        </h3>

                        <p>
                            Get instant help with
                            city services,
                            applications and
                            citizen queries.
                        </p>

                        <span>
                            Ask Assistant →
                        </span>

                    </div>

                </div>

            </section>


            {/* ======================================
                ABOUT US
            ====================================== */}

            <section className="about-section">

                <div className="about-content">

                    <span className="section-label">
                        ABOUT US
                    </span>

                    <h2>
                        Making your city
                        <br />
                        smarter and more connected.
                    </h2>

                    <p>
                        Smart City Citizen Platform
                        brings essential civic services,
                        government applications and
                        city communication together in
                        one convenient platform.
                    </p>

                    <p>
                        Citizens can access services,
                        submit applications, make
                        applicable payments, access
                        digital documents and receive
                        important notifications from
                        the city.
                    </p>

                </div>


                <div className="about-highlights">

                    <div>
                        <strong>
                            24/7
                        </strong>

                        <span>
                            Digital Access
                        </span>
                    </div>

                    <div>
                        <strong>
                            Easy
                        </strong>

                        <span>
                            Application Management
                        </span>
                    </div>

                    <div>
                        <strong>
                            One
                        </strong>

                        <span>
                            Citizen Platform
                        </span>
                    </div>

                </div>

            </section>


            {/* ======================================
                CITY SERVICES
            ====================================== */}

            <section className="services-section">

                <div className="section-heading">

                    <span>
                        OUR SERVICES
                    </span>

                    <h2>
                        Essential city services
                    </h2>

                    <p>
                        Everything you need from your
                        city, available in one place.
                    </p>

                </div>


                <div className="services-grid">

                    <div className="service-card">
                        <span>💧</span>

                        <h3>
                            Water Supply
                        </h3>

                        <p>
                            Water supply information
                            and available services.
                        </p>
                    </div>

                    <div className="service-card">
                        <span>💡</span>

                        <h3>
                            Electricity
                        </h3>

                        <p>
                            Electricity related
                            city services.
                        </p>
                    </div>

                    <div className="service-card">
                        <span>🗑️</span>

                        <h3>
                            Waste Management
                        </h3>

                        <p>
                            Waste management and
                            city cleanliness services.
                        </p>
                    </div>

                    <div className="service-card">
                        <span>🚌</span>

                        <h3>
                            Public Transport
                        </h3>

                        <p>
                            Access information about
                            city transportation.
                        </p>
                    </div>

                    <div className="service-card">
                        <span>🏥</span>

                        <h3>
                            Healthcare
                        </h3>

                        <p>
                            Find important healthcare
                            related city services.
                        </p>
                    </div>

                    <div className="service-card">
                        <span>🚨</span>

                        <h3>
                            Emergency Services
                        </h3>

                        <p>
                            Quickly access important
                            emergency information.
                        </p>
                    </div>

                </div>


                <button
                    className="view-services-button"
                    onClick={() =>
                        navigate(
                            "/city-services"
                        )
                    }
                >
                    View All City Services →
                </button>

            </section>


            {/* ======================================
                APPLICATION SUMMARY
            ====================================== */}

            <section className="complaint-summary">

                <div>

                    <span className="section-label">
                        MY ACTIVITY
                    </span>

                    <h2>
                        Your application overview
                    </h2>

                    <p>
                        Keep track of your government
                        service applications from one
                        place.
                    </p>

                </div>


                <div className="summary-grid">

                    <div className="summary-card">

                        <strong>
                            {applicationCount}
                        </strong>

                        <span>
                            Total Applications
                        </span>

                    </div>


                    <div className="summary-card">

                        <strong>
                            {pendingCount}
                        </strong>

                        <span>
                            Pending
                        </span>

                    </div>


                    <div className="summary-card">

                        <strong>
                            {approvedCount}
                        </strong>

                        <span>
                            Approved
                        </span>

                    </div>


                    <div className="summary-card">

                        <strong>
                            {completedCount}
                        </strong>

                        <span>
                            Completed
                        </span>

                    </div>

                </div>

            </section>


            {/* ======================================
                DIGITAL SERVICES
            ====================================== */}

            <section className="notification-preview">

                <div>

                    <span className="section-label">
                        DIGITAL SERVICES
                    </span>

                    <h2>
                        Everything in one place
                    </h2>

                    <p>
                        Manage payments, access your
                        digital documents and get instant
                        assistance through the Smart City
                        platform.
                    </p>

                </div>

                <button
                    onClick={() =>
                        navigate(
                            "/digital-documents"
                        )
                    }
                >
                    View Digital Documents →
                </button>

            </section>


            {/* ======================================
                NOTIFICATIONS
            ====================================== */}

            <section className="notification-preview">

                <div>

                    <span className="section-label">
                        NOTIFICATIONS
                    </span>

                    <h2>
                        Stay updated
                    </h2>

                    <p>
                        Important city announcements
                        and application updates will
                        appear here.
                    </p>

                </div>

                <button
                    onClick={() =>
                        navigate(
                            "/notifications"
                        )
                    }
                >
                    View Notifications →
                </button>

            </section>


            {/* ======================================
                FOOTER
            ====================================== */}

            <footer className="citizen-footer">

                <div>

                    <strong>
                        Smart City
                    </strong>

                    <p>
                        Your City. Your Voice.
                        Your Future.
                    </p>

                </div>

                <div>
                    © 2026 Smart City Citizen Platform
                </div>

            </footer>

        </div>
    );
};

export default Dashboard;