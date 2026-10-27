import React, {
    useCallback,
    useEffect,
    useState
} from "react";

import { useNavigate } from "react-router-dom";

import "./AdminDashboard.css";


function AdminDashboard() {

    const navigate = useNavigate();


    // =====================================================
    // ADMIN
    // =====================================================

    const [admin, setAdmin] = useState({});


    // =====================================================
    // STATISTICS
    // =====================================================

    const [statistics, setStatistics] = useState({

        totalCitizens: 0,
        activeCitizens: 0,
        inactiveCitizens: 0,

        totalLogins: 0,
        loggedInCitizens: 0,

        totalServices: 0,

        totalApplications: 0,

        totalComplaints: 0,

        pendingApplications: 0,
        underReviewApplications: 0,
        inProgressApplications: 0,
        approvedApplications: 0,
        rejectedApplications: 0,
        completedApplications: 0

    });


    // =====================================================
    // STATES
    // =====================================================

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [lastUpdated, setLastUpdated] =
        useState(null);


    // =====================================================
    // LOAD ADMIN
    // =====================================================

    useEffect(() => {

        try {

            const savedAdmin =
                localStorage.getItem("admin");


            if (savedAdmin) {

                setAdmin(
                    JSON.parse(savedAdmin)
                );

            }

        } catch (error) {

            console.error(
                "Admin data error:",
                error
            );

        }

    }, []);


    // =====================================================
    // LOAD LIVE STATISTICS
    // =====================================================

    const loadStatistics =
        useCallback(async (
            showLoader = false
        ) => {

            try {

                if (showLoader) {

                    setRefreshing(true);

                }


                const response =
                    await fetch(
                        "http://localhost:5000/api/admin/stats",
                        {
                            method: "GET",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            }
                        }
                    );


                const data =
                    await response.json();


                if (
                    response.ok &&
                    data.success &&
                    data.statistics
                ) {

                    setStatistics(
                        (previous) => ({
                            ...previous,
                            ...data.statistics
                        })
                    );


                    setLastUpdated(
                        new Date()
                    );

                } else {

                    console.error(
                        "Statistics error:",
                        data.message
                    );

                }

            } catch (error) {

                console.error(
                    "Dashboard statistics error:",
                    error
                );

            } finally {

                setLoading(false);
                setRefreshing(false);

            }

        }, []);


    // =====================================================
    // INITIAL LOAD + AUTO REFRESH
    // =====================================================

    useEffect(() => {

        // First load
        loadStatistics();


        // Auto refresh every 10 seconds
        const interval =
            setInterval(() => {

                loadStatistics();

            }, 10000);


        // Refresh when browser/tab becomes active
        const handleFocus = () => {

            loadStatistics();

        };


        window.addEventListener(
            "focus",
            handleFocus
        );


        // Cleanup
        return () => {

            clearInterval(interval);

            window.removeEventListener(
                "focus",
                handleFocus
            );

        };

    }, [loadStatistics]);


    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = () => {

        localStorage.removeItem(
            "admin"
        );

        localStorage.removeItem(
            "adminLoggedIn"
        );

        navigate("/admin-login");

    };


    // =====================================================
    // DISPLAY VALUE
    // =====================================================

    const displayValue = (value) => {

        if (loading) {

            return "...";

        }

        return value ?? 0;

    };


    // =====================================================
    // NAVIGATION
    // =====================================================

    const openPage = (path) => {

        navigate(path);

    };


    // =====================================================
    // ADMIN NAME
    // =====================================================

    const adminName =
        admin?.name ||
        admin?.email ||
        "Administrator";


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="admin-dashboard-page">


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="admin-sidebar">


                {/* BRAND */}

                <div className="sidebar-brand">

                    <div className="sidebar-logo">
                        SC
                    </div>

                    <div>

                        <h2>
                            Smart City
                        </h2>

                        <span>
                            Admin Portal
                        </span>

                    </div>

                </div>


                {/* NAVIGATION */}

                <nav className="sidebar-nav">


                    <div className="nav-heading">
                        MAIN
                    </div>


                    <button
                        className="sidebar-nav-item active"
                        onClick={() =>
                            openPage(
                                "/admin-dashboard"
                            )
                        }
                    >

                        <span className="nav-icon">
                            ▦
                        </span>

                        <span>
                            Dashboard
                        </span>

                    </button>


                    <div className="nav-heading">
                        MANAGEMENT
                    </div>


                    <button
                        className="sidebar-nav-item"
                        onClick={() =>
                            openPage(
                                "/admin/citizens"
                            )
                        }
                    >

                        <span className="nav-icon">
                            👥
                        </span>

                        <span>
                            Citizens
                        </span>

                    </button>


                    <button
                        className="sidebar-nav-item"
                        onClick={() =>
                            openPage(
                                "/admin/services"
                            )
                        }
                    >

                        <span className="nav-icon">
                            🏙
                        </span>

                        <span>
                            Services
                        </span>

                    </button>


                    <button
                        className="sidebar-nav-item"
                        onClick={() =>
                            openPage(
                                "/admin/applications"
                            )
                        }
                    >

                        <span className="nav-icon">
                            📋
                        </span>

                        <span>
                            Applications
                        </span>

                    </button>


                    <button
                        className="sidebar-nav-item"
                        onClick={() =>
                            openPage(
                                "/admin/complaints"
                            )
                        }
                    >

                        <span className="nav-icon">
                            ⚠
                        </span>

                        <span>
                            Complaints
                        </span>

                    </button>


                    <div className="nav-heading">
                        SYSTEM
                    </div>


                    <button
                        className="sidebar-nav-item"
                        onClick={() =>
                            openPage(
                                "/admin/categories"
                            )
                        }
                    >

                        <span className="nav-icon">
                            ◫
                        </span>

                        <span>
                            Categories
                        </span>

                    </button>


                    <button
                        className="sidebar-nav-item"
                        onClick={() =>
                            openPage(
                                "/admin/notifications"
                            )
                        }
                    >

                        <span className="nav-icon">
                            🔔
                        </span>

                        <span>
                            Notifications
                        </span>

                    </button>


                    <button
                        className="sidebar-nav-item"
                        onClick={() =>
                            openPage(
                                "/admin/feedback"
                            )
                        }
                    >

                        <span className="nav-icon">
                            ★
                        </span>

                        <span>
                            Feedback
                        </span>

                    </button>


                    <button
                        className="sidebar-nav-item"
                        onClick={() =>
                            openPage(
                                "/admin/statistics"
                            )
                        }
                    >

                        <span className="nav-icon">
                            ◴
                        </span>

                        <span>
                            Statistics
                        </span>

                    </button>


                </nav>


                {/* SIDEBAR BOTTOM */}

                <div className="sidebar-bottom">


                    <div className="sidebar-admin-mini">

                        <div className="mini-avatar">

                            {adminName
                                .charAt(0)
                                .toUpperCase()}

                        </div>


                        <div>

                            <strong>
                                {adminName}
                            </strong>

                            <span>
                                Administrator
                            </span>

                        </div>

                    </div>


                    <button
                        className="sidebar-logout"
                        onClick={handleLogout}
                    >

                        <span>
                            ↪
                        </span>

                        Logout

                    </button>


                </div>


            </aside>


            {/* =================================================
                MAIN AREA
            ================================================= */}

            <div className="admin-content-area">


                {/* =================================================
                    TOP HEADER
                ================================================= */}

                <header className="admin-topbar">


                    <div>

                        <span className="topbar-label">
                            SMART CITY / ADMINISTRATION
                        </span>

                        <h1>
                            Dashboard
                        </h1>

                    </div>


                    <div className="topbar-right">


                        {/* LIVE STATUS */}

                        <div
                            className="live-status"
                            title="Dashboard automatically refreshes every 10 seconds"
                        >

                            <span className="live-dot">
                            </span>

                            <span>
                                LIVE
                            </span>

                        </div>


                        {/* LAST UPDATED */}

                        <div className="last-updated">

                            <span>
                                Last updated
                            </span>

                            <strong>

                                {lastUpdated
                                    ? lastUpdated.toLocaleTimeString()
                                    : "Loading..."}

                            </strong>

                        </div>


                        {/* REFRESH */}

                        <button
                            className={`topbar-refresh ${
                                refreshing
                                    ? "refreshing"
                                    : ""
                            }`}
                            onClick={() =>
                                loadStatistics(true)
                            }
                            title="Refresh dashboard"
                            disabled={refreshing}
                        >

                            ↻

                        </button>


                        <div className="topbar-date">

                            <span>
                                SYSTEM
                            </span>

                            <strong>
                                Administration
                            </strong>

                        </div>


                        <div className="topbar-profile">

                            <div className="topbar-avatar">

                                {adminName
                                    .charAt(0)
                                    .toUpperCase()}

                            </div>


                            <div>

                                <strong>
                                    {adminName}
                                </strong>

                                <span>
                                    Admin
                                </span>

                            </div>

                        </div>


                    </div>


                </header>


                {/* =================================================
                    MAIN CONTENT
                ================================================= */}

                <main className="admin-main">


                    {/* =================================================
                        WELCOME BANNER
                    ================================================= */}

                    <section className="welcome-banner">


                        <div className="welcome-content">

                            <span className="welcome-label">
                                ADMINISTRATION
                            </span>


                            <h2>

                                Welcome back,{" "}

                                {
                                    adminName
                                        .split(" ")[0]
                                }.

                            </h2>


                            <p>
                                Monitor and manage your
                                Smart City Citizen Platform
                                from one central dashboard.
                            </p>


                            <div className="welcome-actions">


                                <button
                                    onClick={() =>
                                        openPage(
                                            "/admin/applications"
                                        )
                                    }
                                >

                                    View Applications

                                    <span>
                                        →
                                    </span>

                                </button>


                                <button
                                    className="secondary-welcome-btn"
                                    onClick={() =>
                                        openPage(
                                            "/admin/citizens"
                                        )
                                    }
                                >

                                    Manage Citizens

                                </button>


                            </div>


                        </div>


                        <div className="welcome-visual">


                            <div className="visual-circle circle-one">
                            </div>


                            <div className="visual-circle circle-two">
                            </div>


                            <div className="visual-icon">
                                🏙
                            </div>


                            <div className="visual-stat">

                                <span>
                                    TOTAL APPLICATIONS
                                </span>

                                <strong>

                                    {displayValue(
                                        statistics.totalApplications
                                    )}

                                </strong>

                            </div>


                        </div>


                    </section>


                    {/* =================================================
                        OVERVIEW
                    ================================================= */}

                    <div className="content-heading">


                        <div>

                            <span>
                                OVERVIEW
                            </span>

                            <h2>
                                Platform Overview
                            </h2>

                        </div>


                        <p>
                            Live statistics from your
                            Smart City platform
                        </p>


                    </div>


                    {/* =================================================
                        MAIN STATISTICS
                    ================================================= */}

                    <section className="main-stat-grid">


                        {/* CITIZENS */}

                        <div
                            className="main-stat-card"
                            onClick={() =>
                                openPage(
                                    "/admin/citizens"
                                )
                            }
                        >

                            <div className="stat-card-top">

                                <div className="large-stat-icon citizens-icon">
                                    👥
                                </div>

                                <span className="stat-arrow">
                                    ↗
                                </span>

                            </div>


                            <span className="large-stat-label">
                                Total Citizens
                            </span>


                            <strong className="large-stat-number">

                                {displayValue(
                                    statistics.totalCitizens
                                )}

                            </strong>


                            <div className="stat-bottom">

                                <span>
                                    Registered users
                                </span>

                                <span className="stat-active">

                                    {displayValue(
                                        statistics.activeCitizens
                                    )}{" "}

                                    active

                                </span>

                            </div>

                        </div>


                        {/* SERVICES */}

                        <div
                            className="main-stat-card"
                            onClick={() =>
                                openPage(
                                    "/admin/services"
                                )
                            }
                        >

                            <div className="stat-card-top">

                                <div className="large-stat-icon services-icon">
                                    🏙
                                </div>

                                <span className="stat-arrow">
                                    ↗
                                </span>

                            </div>


                            <span className="large-stat-label">
                                Total Services
                            </span>


                            <strong className="large-stat-number">

                                {displayValue(
                                    statistics.totalServices
                                )}

                            </strong>


                            <div className="stat-bottom">

                                <span>
                                    City services
                                </span>

                                <span className="stat-active">
                                    Active
                                </span>

                            </div>

                        </div>


                        {/* APPLICATIONS */}

                        <div
                            className="main-stat-card"
                            onClick={() =>
                                openPage(
                                    "/admin/applications"
                                )
                            }
                        >

                            <div className="stat-card-top">

                                <div className="large-stat-icon applications-icon">
                                    📋
                                </div>

                                <span className="stat-arrow">
                                    ↗
                                </span>

                            </div>


                            <span className="large-stat-label">
                                Applications
                            </span>


                            <strong className="large-stat-number">

                                {displayValue(
                                    statistics.totalApplications
                                )}

                            </strong>


                            <div className="stat-bottom">

                                <span>
                                    Citizen requests
                                </span>

                                <span className="stat-pending">

                                    {displayValue(
                                        statistics.pendingApplications
                                    )}{" "}

                                    pending

                                </span>

                            </div>

                        </div>


                        {/* COMPLAINTS */}

                        <div
                            className="main-stat-card"
                            onClick={() =>
                                openPage(
                                    "/admin/complaints"
                                )
                            }
                        >

                            <div className="stat-card-top">

                                <div className="large-stat-icon complaints-icon">
                                    ⚠
                                </div>

                                <span className="stat-arrow">
                                    ↗
                                </span>

                            </div>


                            <span className="large-stat-label">
                                Complaints
                            </span>


                            <strong className="large-stat-number">

                                {displayValue(
                                    statistics.totalComplaints
                                )}

                            </strong>


                            <div className="stat-bottom">

                                <span>
                                    Citizen complaints
                                </span>

                                <span className="stat-active">
                                    Manage
                                </span>

                            </div>

                        </div>


                    </section>


                    {/* =================================================
                        TWO COLUMN AREA
                    ================================================= */}

                    <section className="dashboard-columns">


                        {/* APPLICATION STATUS */}

                        <div className="dashboard-panel status-panel">


                            <div className="panel-header">

                                <div>

                                    <span>
                                        APPLICATIONS
                                    </span>

                                    <h2>
                                        Status Overview
                                    </h2>

                                </div>


                                <button
                                    onClick={() =>
                                        openPage(
                                            "/admin/applications"
                                        )
                                    }
                                >
                                    View All →
                                </button>

                            </div>


                            <div className="status-list">


                                {/* Pending */}

                                <div className="status-row">

                                    <div className="status-row-info">

                                        <div className="status-dot pending-dot">
                                        </div>

                                        <span>
                                            Pending
                                        </span>

                                    </div>

                                    <strong>
                                        {displayValue(
                                            statistics.pendingApplications
                                        )}
                                    </strong>

                                </div>


                                {/* Under Review */}

                                <div className="status-row">

                                    <div className="status-row-info">

                                        <div className="status-dot review-dot">
                                        </div>

                                        <span>
                                            Under Review
                                        </span>

                                    </div>

                                    <strong>
                                        {displayValue(
                                            statistics.underReviewApplications
                                        )}
                                    </strong>

                                </div>


                                {/* In Progress */}

                                <div className="status-row">

                                    <div className="status-row-info">

                                        <div className="status-dot progress-dot">
                                        </div>

                                        <span>
                                            In Progress
                                        </span>

                                    </div>

                                    <strong>
                                        {displayValue(
                                            statistics.inProgressApplications
                                        )}
                                    </strong>

                                </div>


                                {/* Approved */}

                                <div className="status-row">

                                    <div className="status-row-info">

                                        <div className="status-dot approved-dot">
                                        </div>

                                        <span>
                                            Approved
                                        </span>

                                    </div>

                                    <strong>
                                        {displayValue(
                                            statistics.approvedApplications
                                        )}
                                    </strong>

                                </div>


                                {/* Rejected */}

                                <div className="status-row">

                                    <div className="status-row-info">

                                        <div className="status-dot rejected-dot">
                                        </div>

                                        <span>
                                            Rejected
                                        </span>

                                    </div>

                                    <strong>
                                        {displayValue(
                                            statistics.rejectedApplications
                                        )}
                                    </strong>

                                </div>


                                {/* Completed */}

                                <div className="status-row">

                                    <div className="status-row-info">

                                        <div className="status-dot completed-dot">
                                        </div>

                                        <span>
                                            Completed
                                        </span>

                                    </div>

                                    <strong>
                                        {displayValue(
                                            statistics.completedApplications
                                        )}
                                    </strong>

                                </div>


                            </div>


                        </div>


                        {/* USER ACTIVITY */}

                        <div className="dashboard-panel activity-panel">


                            <div className="panel-header">

                                <div>

                                    <span>
                                        USER ACTIVITY
                                    </span>

                                    <h2>
                                        Citizen Activity
                                    </h2>

                                </div>


                                <button
                                    onClick={() =>
                                        openPage(
                                            "/admin/citizens"
                                        )
                                    }
                                >
                                    Manage →
                                </button>

                            </div>


                            <div className="activity-summary">


                                {/* Total Logins */}

                                <div className="activity-item">

                                    <div className="activity-icon login-icon">
                                        ↗
                                    </div>

                                    <div>

                                        <span>
                                            Total Logins
                                        </span>

                                        <strong>
                                            {displayValue(
                                                statistics.totalLogins
                                            )}
                                        </strong>

                                    </div>

                                </div>


                                {/* Logged In Citizens */}

                                <div className="activity-item">

                                    <div className="activity-icon active-icon">
                                        ✓
                                    </div>

                                    <div>

                                        <span>
                                            Logged In Citizens
                                        </span>

                                        <strong>
                                            {displayValue(
                                                statistics.loggedInCitizens
                                            )}
                                        </strong>

                                    </div>

                                </div>


                                {/* Active Citizens */}

                                <div className="activity-item">

                                    <div className="activity-icon registered-icon">
                                        +
                                    </div>

                                    <div>

                                        <span>
                                            Active Citizens
                                        </span>

                                        <strong>
                                            {displayValue(
                                                statistics.activeCitizens
                                            )}
                                        </strong>

                                    </div>

                                </div>


                            </div>


                            <div className="activity-footer">

                                <div>

                                    <span>
                                        Account Status
                                    </span>

                                    <strong>

                                        {displayValue(
                                            statistics.inactiveCitizens
                                        )}{" "}

                                        inactive accounts

                                    </strong>

                                </div>


                                <button
                                    onClick={() =>
                                        openPage(
                                            "/admin/citizens"
                                        )
                                    }
                                >
                                    View Citizens
                                </button>

                            </div>


                        </div>


                    </section>


                    {/* =================================================
                        MANAGEMENT
                    ================================================= */}

                    <section className="management-section">


                        <div className="content-heading">

                            <div>

                                <span>
                                    ADMIN CONTROL
                                </span>

                                <h2>
                                    Management Center
                                </h2>

                            </div>

                            <p>
                                Access and manage all
                                platform modules
                            </p>

                        </div>


                        <div className="management-grid">


                            {/* Citizens */}

                            <div
                                className="management-card"
                                onClick={() =>
                                    openPage(
                                        "/admin/citizens"
                                    )
                                }
                            >

                                <div className="management-icon citizens-management">
                                    👥
                                </div>

                                <div className="management-content">

                                    <h3>
                                        Citizens
                                    </h3>

                                    <p>
                                        View and manage
                                        registered citizens.
                                    </p>

                                </div>

                                <span className="card-arrow">
                                    →
                                </span>

                            </div>


                            {/* Services */}

                            <div
                                className="management-card"
                                onClick={() =>
                                    openPage(
                                        "/admin/services"
                                    )
                                }
                            >

                                <div className="management-icon services-management">
                                    🏙
                                </div>

                                <div className="management-content">

                                    <h3>
                                        Services
                                    </h3>

                                    <p>
                                        Add, edit and manage
                                        city services.
                                    </p>

                                </div>

                                <span className="card-arrow">
                                    →
                                </span>

                            </div>


                            {/* Applications */}

                            <div
                                className="management-card"
                                onClick={() =>
                                    openPage(
                                        "/admin/applications"
                                    )
                                }
                            >

                                <div className="management-icon applications-management">
                                    📋
                                </div>

                                <div className="management-content">

                                    <h3>
                                        Applications
                                    </h3>

                                    <p>
                                        Review and manage
                                        citizen applications.
                                    </p>

                                </div>

                                <span className="card-arrow">
                                    →
                                </span>

                            </div>


                            {/* Complaints */}

                            <div
                                className="management-card"
                                onClick={() =>
                                    openPage(
                                        "/admin/complaints"
                                    )
                                }
                            >

                                <div className="management-icon complaints-management">
                                    ⚠
                                </div>

                                <div className="management-content">

                                    <h3>
                                        Complaints
                                    </h3>

                                    <p>
                                        Review and resolve
                                        citizen complaints.
                                    </p>

                                </div>

                                <span className="card-arrow">
                                    →
                                </span>

                            </div>
                           
                            


                            

                            {/* Categories */}

                            <div
                                className="management-card"
                                onClick={() =>
                                    openPage(
                                        "/admin/categories"
                                    )
                                }
                            >

                                <div className="management-icon categories-management">
                                    ◫
                                </div>

                                <div className="management-content">

                                    <h3>
                                        Categories
                                    </h3>

                                    <p>
                                        Organize service
                                        categories.
                                    </p>

                                </div>

                                <span className="card-arrow">
                                    →
                                </span>

                            </div>


                            {/* Notifications */}

                            <div
                                className="management-card"
                                onClick={() =>
                                    openPage(
                                        "/admin/notifications"
                                    )
                                }
                            >

                                <div className="management-icon notifications-management">
                                    🔔
                                </div>

                                <div className="management-content">

                                    <h3>
                                        Notifications
                                    </h3>

                                    <p>
                                        Send notifications
                                        to citizens.
                                    </p>

                                </div>

                                <span className="card-arrow">
                                    →
                                </span>

                            </div>


                            {/* Feedback */}

                            <div
                                className="management-card"
                                onClick={() =>
                                    openPage(
                                        "/admin/feedback"
                                    )
                                }
                            >

                                <div className="management-icon feedback-management">
                                    ★
                                </div>

                                <div className="management-content">

                                    <h3>
                                        Feedback & Ratings
                                    </h3>

                                    <p>
                                        Review citizen
                                        feedback and ratings.
                                    </p>

                                </div>

                                <span className="card-arrow">
                                    →
                                </span>

                            </div>


                            {/* Statistics */}

                            <div
                                className="management-card"
                                onClick={() =>
                                    openPage(
                                        "/admin/statistics"
                                    )
                                }
                            >

                                <div className="management-icon statistics-management">
                                    ◴
                                </div>

                                <div className="management-content">

                                    <h3>
                                        Statistics
                                    </h3>

                                    <p>
                                        View detailed system
                                        statistics.
                                    </p>

                                </div>

                                <span className="card-arrow">
                                    →
                                </span>

                            </div>


                        </div>


                    </section>


                </main>


                {/* =================================================
                    FOOTER
                ================================================= */}

                <footer className="admin-footer">

                    <span>
                        © 2026 Smart City Citizen Platform
                    </span>

                    <span>
                        Administration Portal
                    </span>

                </footer>


            </div>

        </div>

    );

}


export default AdminDashboard;