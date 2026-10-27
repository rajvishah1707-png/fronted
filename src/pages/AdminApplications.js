import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const STATUS_OPTIONS = [
    "Pending",
    "Under Review",
    "In Progress",
    "Approved",
    "Rejected",
    "Completed"
];

const AdminApplications = () => {
    const navigate = useNavigate();

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [serviceFilter, setServiceFilter] = useState("All");

    const [editing, setEditing] = useState({});
    const [updatingId, setUpdatingId] = useState(null);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // =====================================================
    // LOAD APPLICATIONS
    // =====================================================

    const loadApplications = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                "http://localhost:5000/api/admin/applications"
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load applications"
                );
            }

            setApplications(data.applications || []);
        } catch (err) {
            console.error("Load applications error:", err);

            setError(
                err.message ||
                "Unable to load applications."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadApplications();
    }, []);

    // =====================================================
    // SERVICE LIST
    // =====================================================

    const serviceList = useMemo(() => {
        const services = applications
            .map((item) => item.serviceName)
            .filter(Boolean);

        return [...new Set(services)];
    }, [applications]);

    // =====================================================
    // FILTER APPLICATIONS
    // =====================================================

    const filteredApplications = useMemo(() => {
        return applications.filter((application) => {
            const text = search
                .toLowerCase()
                .trim();

            const matchesSearch =
                !text ||
                String(application.applicationId || "")
                    .toLowerCase()
                    .includes(text) ||
                String(application.citizenName || "")
                    .toLowerCase()
                    .includes(text) ||
                String(application.citizenEmail || "")
                    .toLowerCase()
                    .includes(text) ||
                String(application.citizenPhone || "")
                    .toLowerCase()
                    .includes(text) ||
                String(application.serviceName || "")
                    .toLowerCase()
                    .includes(text);

            const matchesStatus =
                statusFilter === "All" ||
                application.status === statusFilter;

            const matchesService =
                serviceFilter === "All" ||
                application.serviceName === serviceFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesService
            );
        });
    }, [
        applications,
        search,
        statusFilter,
        serviceFilter
    ]);

    // =====================================================
    // STATUS COUNT
    // =====================================================

    const getStatusCount = (status) => {
        return applications.filter(
            (item) => item.status === status
        ).length;
    };

    // =====================================================
    // EDIT FIELD
    // =====================================================

    const handleEditChange = (
        id,
        field,
        value
    ) => {
        setEditing((previous) => ({
            ...previous,
            [id]: {
                ...previous[id],
                [field]: value
            }
        }));
    };

    // =====================================================
    // UPDATE APPLICATION
    // =====================================================

    const updateApplication = async (
        application
    ) => {
        const currentEdit =
            editing[application._id] || {};

        const status =
            currentEdit.status ||
            application.status ||
            "Pending";

        const adminRemark =
            currentEdit.adminRemark !== undefined
                ? currentEdit.adminRemark
                : application.adminRemark || "";

        try {
            setUpdatingId(application._id);
            setMessage("");
            setError("");

            const response = await fetch(
                `http://localhost:5000/api/admin/applications/${application._id}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        status,
                        adminRemark
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to update application"
                );
            }

            setApplications((previous) =>
                previous.map((item) =>
                    item._id === application._id
                        ? {
                              ...item,
                              status,
                              adminRemark,
                              updatedAt:
                                  new Date().toISOString()
                          }
                        : item
                )
            );

            setEditing((previous) => {
                const copy = {
                    ...previous
                };

                delete copy[application._id];

                return copy;
            });

            setMessage(
                `Application ${application.applicationId} updated successfully.`
            );

            setTimeout(() => {
                setMessage("");
            }, 3000);
        } catch (err) {
            console.error(
                "Update application error:",
                err
            );

            setError(
                err.message ||
                "Unable to update application."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    // =====================================================
    // DELETE APPLICATION
    // =====================================================

    const deleteApplication = async (
        application
    ) => {
        const confirmDelete =
            window.confirm(
                `Are you sure you want to delete application ${application.applicationId}?`
            );

        if (!confirmDelete) {
            return;
        }

        try {
            setMessage("");
            setError("");

            const response = await fetch(
                `http://localhost:5000/api/admin/applications/${application._id}`,
                {
                    method: "DELETE"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to delete application"
                );
            }

            setApplications((previous) =>
                previous.filter(
                    (item) =>
                        item._id !== application._id
                )
            );

            setMessage(
                `Application ${application.applicationId} deleted successfully.`
            );

            setTimeout(() => {
                setMessage("");
            }, 3000);
        } catch (err) {
            console.error(
                "Delete application error:",
                err
            );

            setError(
                err.message ||
                "Unable to delete application."
            );
        }
    };

    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    };

    // =====================================================
    // STATUS CLASS
    // =====================================================

    const getStatusClass = (status) => {
        switch (status) {
            case "Pending":
                return "pending";

            case "Under Review":
                return "review";

            case "In Progress":
                return "progress";

            case "Approved":
                return "approved";

            case "Rejected":
                return "rejected";

            case "Completed":
                return "completed";

            default:
                return "pending";
        }
    };

    return (
        <div className="admin-applications">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="top-header">

                <div className="header-left">

                    <button
                        className="back-btn"
                        onClick={() =>
                            navigate(
                                "/admin-dashboard"
                            )
                        }
                    >
                        ←
                    </button>

                    <div>

                        <div className="breadcrumb">
                            Admin Dashboard / Applications
                        </div>

                        <h1>
                            Service Applications
                        </h1>

                        <p>
                            Review and manage citizen
                            service applications
                        </p>

                    </div>

                </div>

                <button
                    className="refresh-btn"
                    onClick={loadApplications}
                >
                    ↻ Refresh
                </button>

            </div>

            {/* =================================================
                ALERTS
            ================================================= */}

            {message && (
                <div className="alert success">
                    <span>✓</span>
                    {message}
                </div>
            )}

            {error && (
                <div className="alert danger">
                    <span>!</span>
                    {error}
                </div>
            )}

            {/* =================================================
                STATISTICS
            ================================================= */}

            <div className="stats-grid">

                <div className="stat-card total-card">
                    <div className="stat-icon">
                        📋
                    </div>

                    <div>
                        <span>Total</span>
                        <strong>
                            {applications.length}
                        </strong>
                    </div>
                </div>

                <div className="stat-card pending-card">
                    <div className="stat-icon">
                        🕐
                    </div>

                    <div>
                        <span>Pending</span>
                        <strong>
                            {getStatusCount(
                                "Pending"
                            )}
                        </strong>
                    </div>
                </div>

                <div className="stat-card review-card">
                    <div className="stat-icon">
                        🔍
                    </div>

                    <div>
                        <span>Under Review</span>
                        <strong>
                            {getStatusCount(
                                "Under Review"
                            )}
                        </strong>
                    </div>
                </div>

                <div className="stat-card progress-card">
                    <div className="stat-icon">
                        ⚙
                    </div>

                    <div>
                        <span>In Progress</span>
                        <strong>
                            {getStatusCount(
                                "In Progress"
                            )}
                        </strong>
                    </div>
                </div>

                <div className="stat-card approved-card">
                    <div className="stat-icon">
                        ✓
                    </div>

                    <div>
                        <span>Approved</span>
                        <strong>
                            {getStatusCount(
                                "Approved"
                            )}
                        </strong>
                    </div>
                </div>

                <div className="stat-card rejected-card">
                    <div className="stat-icon">
                        ×
                    </div>

                    <div>
                        <span>Rejected</span>
                        <strong>
                            {getStatusCount(
                                "Rejected"
                            )}
                        </strong>
                    </div>
                </div>

                <div className="stat-card completed-card">
                    <div className="stat-icon">
                        ✓
                    </div>

                    <div>
                        <span>Completed</span>
                        <strong>
                            {getStatusCount(
                                "Completed"
                            )}
                        </strong>
                    </div>
                </div>

            </div>

            {/* =================================================
                FILTER
            ================================================= */}

            <div className="filter-panel">

                <div className="filter-title">

                    <div>
                        <h2>
                            Applications
                        </h2>

                        <p>
                            Manage all citizen service
                            requests
                        </p>
                    </div>

                    <span className="result-count">
                        {filteredApplications.length}{" "}
                        result
                        {filteredApplications.length !==
                        1
                            ? "s"
                            : ""}
                    </span>

                </div>

                <div className="filters">

                    <div className="search-box">

                        <span>⌕</span>

                        <input
                            type="text"
                            placeholder="Search application, citizen, email or service..."
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                        />

                        {search && (
                            <button
                                onClick={() =>
                                    setSearch("")
                                }
                            >
                                ×
                            </button>
                        )}

                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(
                                e.target.value
                            )
                        }
                    >
                        <option value="All">
                            All Status
                        </option>

                        {STATUS_OPTIONS.map(
                            (status) => (
                                <option
                                    key={status}
                                    value={status}
                                >
                                    {status}
                                </option>
                            )
                        )}
                    </select>

                    <select
                        value={serviceFilter}
                        onChange={(e) =>
                            setServiceFilter(
                                e.target.value
                            )
                        }
                    >
                        <option value="All">
                            All Services
                        </option>

                        {serviceList.map(
                            (service) => (
                                <option
                                    key={service}
                                    value={service}
                                >
                                    {service}
                                </option>
                            )
                        )}
                    </select>

                </div>

            </div>

            {/* =================================================
                APPLICATION LIST
            ================================================= */}

            {loading ? (
                <div className="empty-box">

                    <div className="loader"></div>

                    <h3>
                        Loading Applications
                    </h3>

                    <p>
                        Please wait while we fetch
                        the latest applications.
                    </p>

                </div>
            ) : filteredApplications.length ===
              0 ? (
                <div className="empty-box">

                    <div className="empty-icon">
                        📄
                    </div>

                    <h3>
                        No Applications Found
                    </h3>

                    <p>
                        Try changing your search or
                        filter options.
                    </p>

                </div>
            ) : (
                <div className="application-list">

                    {filteredApplications.map(
                        (application) => {

                            const currentEdit =
                                editing[
                                    application._id
                                ] || {};

                            const currentStatus =
                                currentEdit.status ||
                                application.status ||
                                "Pending";

                            const currentRemark =
                                currentEdit.adminRemark !==
                                undefined
                                    ? currentEdit.adminRemark
                                    : application.adminRemark ||
                                      "";

                            return (
                                <div
                                    className="application-card"
                                    key={
                                        application._id
                                    }
                                >

                                    {/* CARD HEADER */}

                                    <div className="card-header">

                                        <div className="application-id-section">

                                            <div className="document-icon">
                                                📄
                                            </div>

                                            <div>

                                                <span>
                                                    Application ID
                                                </span>

                                                <h3>
                                                    {
                                                        application.applicationId ||
                                                        application._id
                                                    }
                                                </h3>

                                            </div>

                                        </div>

                                        <div
                                            className={`status-badge ${getStatusClass(
                                                application.status
                                            )}`}
                                        >
                                            <span className="status-dot"></span>

                                            {
                                                application.status ||
                                                "Pending"
                                            }
                                        </div>

                                    </div>

                                    {/* CARD BODY */}

                                    <div className="card-body">

                                        {/* CITIZEN INFORMATION */}

                                        <div className="section">

                                            <div className="section-title">
                                                <span>
                                                    👤
                                                </span>

                                                Citizen Information
                                            </div>

                                            <div className="info-grid">

                                                <div className="info-item">

                                                    <label>
                                                        Full Name
                                                    </label>

                                                    <strong>
                                                        {
                                                            application.citizenName ||
                                                            "-"
                                                        }
                                                    </strong>

                                                </div>

                                                <div className="info-item">

                                                    <label>
                                                        Email
                                                    </label>

                                                    <strong>
                                                        {
                                                            application.citizenEmail ||
                                                            "-"
                                                        }
                                                    </strong>

                                                </div>

                                                <div className="info-item">

                                                    <label>
                                                        Phone
                                                    </label>

                                                    <strong>
                                                        {
                                                            application.citizenPhone ||
                                                            "-"
                                                        }
                                                    </strong>

                                                </div>

                                                <div className="info-item">

                                                    <label>
                                                        Submitted
                                                    </label>

                                                    <strong>
                                                        {formatDate(
                                                            application.submittedAt ||
                                                            application.createdAt
                                                        )}
                                                    </strong>

                                                </div>

                                            </div>

                                        </div>

                                        <div className="divider"></div>

                                        {/* SERVICE INFORMATION */}

                                        <div className="section">

                                            <div className="section-title">
                                                <span>
                                                    🏛
                                                </span>

                                                Service Information
                                            </div>

                                            <div className="info-grid">

                                                <div className="info-item">

                                                    <label>
                                                        Service
                                                    </label>

                                                    <strong className="service-name">
                                                        {
                                                            application.serviceName ||
                                                            "-"
                                                        }
                                                    </strong>

                                                </div>

                                                <div className="info-item">

                                                    <label>
                                                        Category
                                                    </label>

                                                    <strong>
                                                        {
                                                            application.category ||
                                                            "-"
                                                        }
                                                    </strong>

                                                </div>

                                                <div className="info-item full-width">

                                                    <label>
                                                        Address
                                                    </label>

                                                    <strong>
                                                        {
                                                            application.address ||
                                                            "-"
                                                        }

                                                        {application.city
                                                            ? `, ${application.city}`
                                                            : ""}
                                                    </strong>

                                                </div>

                                                <div className="info-item full-width">

                                                    <label>
                                                        Description
                                                    </label>

                                                    <strong className="description">
                                                        {
                                                            application.description ||
                                                            "-"
                                                        }
                                                    </strong>

                                                </div>

                                            </div>

                                        </div>

                                        <div className="divider"></div>

                                        {/* ADMIN ACTION */}

                                        <div className="update-section">

                                            <div className="admin-action-header">

                                                <div className="section-title">
                                                    <span>
                                                        ⚙
                                                    </span>

                                                    Admin Action
                                                </div>

                                                <div className="header-actions">

                                                    <button
                                                        className="delete-btn"
                                                        onClick={() =>
                                                            deleteApplication(
                                                                application
                                                            )
                                                        }
                                                    >
                                                        🗑 Delete
                                                    </button>

                                                    <button
                                                        className="update-btn"
                                                        disabled={
                                                            updatingId ===
                                                            application._id
                                                        }
                                                        onClick={() =>
                                                            updateApplication(
                                                                application
                                                            )
                                                        }
                                                    >
                                                        {updatingId ===
                                                        application._id
                                                            ? "Updating..."
                                                            : "✓ Update Application"}
                                                    </button>

                                                </div>

                                            </div>

                                            <div className="update-grid">

                                                <div className="control-group">

                                                    <label>
                                                        Application Status
                                                    </label>

                                                    <select
                                                        value={
                                                            currentStatus
                                                        }
                                                        onChange={(
                                                            e
                                                        ) =>
                                                            handleEditChange(
                                                                application._id,
                                                                "status",
                                                                e
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                    >
                                                        {STATUS_OPTIONS.map(
                                                            (
                                                                status
                                                            ) => (
                                                                <option
                                                                    key={
                                                                        status
                                                                    }
                                                                    value={
                                                                        status
                                                                    }
                                                                >
                                                                    {
                                                                        status
                                                                    }
                                                                </option>
                                                            )
                                                        )}
                                                    </select>

                                                </div>

                                                <div className="control-group">

                                                    <label>
                                                        Admin Remark
                                                    </label>

                                                    <textarea
                                                        rows="3"
                                                        placeholder="Enter a remark or instruction for the citizen..."
                                                        value={
                                                            currentRemark
                                                        }
                                                        onChange={(
                                                            e
                                                        ) =>
                                                            handleEditChange(
                                                                application._id,
                                                                "adminRemark",
                                                                e
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                    />

                                                </div>

                                            </div>

                                            <div className="current-remark">

                                                <span>
                                                    CURRENT REMARK
                                                </span>

                                                <p>
                                                    {application.adminRemark
                                                        ? application.adminRemark
                                                        : "No remark added yet."}
                                                </p>

                                            </div>

                                            <div className="action-footer">

                                                <span className="last-updated">
                                                    Last updated:{" "}
                                                    {formatDate(
                                                        application.updatedAt ||
                                                        application.createdAt
                                                    )}
                                                </span>

                                            </div>

                                        </div>

                                    </div>

                                </div>
                            );
                        }
                    )}

                </div>
            )}

            {/* =================================================
                CSS
            ================================================= */}

            <style>{`

                * {
                    box-sizing: border-box;
                }

                .admin-applications {
                    min-height: 100vh;
                    background: #f5f7fb;
                    padding: 28px 32px 50px;
                    color: #172033;
                    font-family: Arial, Helvetica, sans-serif;
                }

                /* ================= HEADER ================= */

                .top-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 28px;
                    gap: 20px;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .back-btn {
                    width: 44px;
                    height: 44px;
                    border: 1px solid #e1e5ec;
                    background: white;
                    color: #39445b;
                    border-radius: 10px;
                    font-size: 22px;
                    cursor: pointer;
                    transition: 0.2s;
                }

                .back-btn:hover {
                    background: #eef2ff;
                    color: #4f46e5;
                    border-color: #c7d2fe;
                }

                .breadcrumb {
                    color: #7b8497;
                    font-size: 12px;
                    margin-bottom: 5px;
                }

                .top-header h1 {
                    margin: 0;
                    font-size: 28px;
                    font-weight: 750;
                    color: #172033;
                }

                .top-header p {
                    margin: 5px 0 0;
                    color: #7b8497;
                    font-size: 14px;
                }

                .refresh-btn {
                    border: 0;
                    background: #172033;
                    color: white;
                    padding: 11px 18px;
                    border-radius: 9px;
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: 0.2s;
                }

                .refresh-btn:hover {
                    background: #29354b;
                }

                /* ================= ALERT ================= */

                .alert {
                    padding: 13px 16px;
                    border-radius: 9px;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 14px;
                    font-weight: 600;
                }

                .alert.success {
                    background: #ecfdf3;
                    border: 1px solid #bbf7d0;
                    color: #166534;
                }

                .alert.danger {
                    background: #fff1f2;
                    border: 1px solid #fecdd3;
                    color: #be123c;
                }

                /* ================= STATS ================= */

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 12px;
                    margin-bottom: 22px;
                }

                .stat-card {
                    background: white;
                    border: 1px solid #e7eaf0;
                    border-radius: 12px;
                    padding: 16px 12px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    min-width: 0;
                    box-shadow: 0 2px 8px rgba(20, 30, 50, 0.03);
                }

                .stat-icon {
                    width: 38px;
                    height: 38px;
                    border-radius: 9px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 17px;
                    flex-shrink: 0;
                }

                .stat-card span {
                    display: block;
                    color: #7b8497;
                    font-size: 11px;
                    font-weight: 600;
                    margin-bottom: 3px;
                    white-space: nowrap;
                }

                .stat-card strong {
                    display: block;
                    font-size: 22px;
                    color: #172033;
                }

                .total-card .stat-icon {
                    background: #eef2ff;
                }

                .pending-card .stat-icon {
                    background: #fff7e6;
                }

                .review-card .stat-icon {
                    background: #f3e8ff;
                }

                .progress-card .stat-icon {
                    background: #eaf3ff;
                }

                .approved-card .stat-icon {
                    background: #e9fbf2;
                }

                .rejected-card .stat-icon {
                    background: #fff0f1;
                }

                .completed-card .stat-icon {
                    background: #e6faf4;
                }

                /* ================= FILTER ================= */

                .filter-panel {
                    background: white;
                    border: 1px solid #e7eaf0;
                    border-radius: 13px;
                    padding: 20px;
                    margin-bottom: 20px;
                    box-shadow: 0 2px 8px rgba(20, 30, 50, 0.03);
                }

                .filter-title {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }

                .filter-title h2 {
                    margin: 0;
                    font-size: 19px;
                    color: #172033;
                }

                .filter-title p {
                    margin: 4px 0 0;
                    color: #8a93a3;
                    font-size: 12px;
                }

                .result-count {
                    color: #7b8497;
                    font-size: 13px;
                }

                .filters {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr;
                    gap: 12px;
                }

                .search-box {
                    height: 43px;
                    display: flex;
                    align-items: center;
                    border: 1px solid #dfe3ea;
                    border-radius: 8px;
                    padding: 0 12px;
                    background: #fbfcfe;
                }

                .search-box > span {
                    color: #7b8497;
                    font-size: 20px;
                    margin-right: 8px;
                }

                .search-box input {
                    border: 0;
                    outline: none;
                    background: transparent;
                    width: 100%;
                    font-size: 13px;
                    color: #172033;
                }

                .search-box input::placeholder {
                    color: #9aa2b1;
                }

                .search-box button {
                    border: 0;
                    background: transparent;
                    color: #7b8497;
                    font-size: 18px;
                    cursor: pointer;
                }

                .filters select {
                    height: 43px;
                    border: 1px solid #dfe3ea;
                    border-radius: 8px;
                    padding: 0 12px;
                    background: #fbfcfe;
                    color: #39445b;
                    outline: none;
                    font-size: 13px;
                    cursor: pointer;
                }

                .filters select:focus,
                .search-box:focus-within {
                    border-color: #818cf8;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.08);
                }

                /* ================= APPLICATION ================= */

                .application-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .application-card {
                    background: white;
                    border: 1px solid #e5e8ee;
                    border-radius: 13px;
                    overflow: hidden;
                    box-shadow: 0 3px 12px rgba(20, 30, 50, 0.04);
                }

                .card-header {
                    padding: 18px 20px;
                    border-bottom: 1px solid #edf0f4;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 15px;
                    background: #fcfdff;
                }

                .application-id-section {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .document-icon {
                    width: 42px;
                    height: 42px;
                    border-radius: 9px;
                    background: #eef2ff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 19px;
                }

                .application-id-section span {
                    display: block;
                    font-size: 11px;
                    color: #8a93a3;
                    margin-bottom: 3px;
                }

                .application-id-section h3 {
                    margin: 0;
                    font-size: 15px;
                    color: #172033;
                    font-weight: 750;
                }

                /* ================= STATUS ================= */

                .status-badge {
                    padding: 7px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    white-space: nowrap;
                }

                .status-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    display: block;
                }

                .status-badge.pending {
                    background: #fff7e6;
                    color: #a16207;
                }

                .status-badge.pending .status-dot {
                    background: #f59e0b;
                }

                .status-badge.review {
                    background: #f3e8ff;
                    color: #7e22ce;
                }

                .status-badge.review .status-dot {
                    background: #a855f7;
                }

                .status-badge.progress {
                    background: #eaf3ff;
                    color: #2563eb;
                }

                .status-badge.progress .status-dot {
                    background: #3b82f6;
                }

                .status-badge.approved {
                    background: #e9fbf2;
                    color: #047857;
                }

                .status-badge.approved .status-dot {
                    background: #10b981;
                }

                .status-badge.rejected {
                    background: #fff0f1;
                    color: #be123c;
                }

                .status-badge.rejected .status-dot {
                    background: #ef4444;
                }

                .status-badge.completed {
                    background: #e6faf4;
                    color: #047857;
                }

                .status-badge.completed .status-dot {
                    background: #059669;
                }

                /* ================= CARD BODY ================= */

                .card-body {
                    padding: 20px;
                }

                .section-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    font-weight: 750;
                    color: #39445b;
                    margin-bottom: 14px;
                }

                .section-title span {
                    font-size: 15px;
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 15px 20px;
                }

                .info-item {
                    min-width: 0;
                }

                .info-item.full-width {
                    grid-column: span 2;
                }

                .info-item label {
                    display: block;
                    color: #929aaa;
                    font-size: 11px;
                    font-weight: 600;
                    margin-bottom: 5px;
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                }

                .info-item strong {
                    display: block;
                    color: #29354b;
                    font-size: 13px;
                    line-height: 1.5;
                    word-break: break-word;
                }

                .service-name {
                    color: #4f46e5 !important;
                }

                .description {
                    color: #606b7d !important;
                    font-weight: 500 !important;
                }

                .divider {
                    height: 1px;
                    background: #edf0f4;
                    margin: 20px 0;
                }

                /* ================= ADMIN ACTION ================= */

                .update-section {
                    background: #f8fafc;
                    border: 1px solid #e7ebf1;
                    border-radius: 10px;
                    padding: 17px;
                }

                .admin-action-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 15px;
                    margin-bottom: 15px;
                }

                .admin-action-header .section-title {
                    margin-bottom: 0;
                }

                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 9px;
                }

                .delete-btn,
                .update-btn {
                    height: 38px;
                    min-width: 118px;
                    border-radius: 7px;
                    padding: 0 14px;
                    font-size: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    transition: all 0.2s ease;
                }

                .delete-btn {
                    background: white;
                    color: #dc2626;
                    border: 1px solid #fecaca;
                }

                .delete-btn:hover {
                    background: #fef2f2;
                    border-color: #fca5a5;
                }

                .update-btn {
                    background: #4f46e5;
                    color: white;
                    border: 1px solid #4f46e5;
                    box-shadow: 0 2px 5px rgba(79, 70, 229, 0.18);
                }

                .update-btn:hover {
                    background: #4338ca;
                    border-color: #4338ca;
                    transform: translateY(-1px);
                }

                .update-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }

                .update-grid {
                    display: grid;
                    grid-template-columns: 250px 1fr;
                    gap: 15px;
                }

                .control-group {
                    display: flex;
                    flex-direction: column;
                    gap: 7px;
                }

                .control-group label {
                    color: #4b5568;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                }

                .control-group select,
                .control-group textarea {
                    border: 1px solid #dce1e8;
                    background: white;
                    border-radius: 8px;
                    padding: 10px 11px;
                    outline: none;
                    font-size: 13px;
                    color: #29354b;
                    font-family: inherit;
                }

                .control-group select {
                    height: 42px;
                }

                .control-group textarea {
                    resize: vertical;
                    min-height: 80px;
                }

                .control-group select:focus,
                .control-group textarea:focus {
                    border-color: #818cf8;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.08);
                }

                .current-remark {
                    margin-top: 13px;
                    padding: 10px 12px;
                    background: white;
                    border: 1px solid #e5e8ee;
                    border-radius: 7px;
                }

                .current-remark span {
                    display: block;
                    color: #8a93a3;
                    font-size: 10px;
                    text-transform: uppercase;
                    font-weight: 700;
                    margin-bottom: 4px;
                }

                .current-remark p {
                    margin: 0;
                    color: #4b5568;
                    font-size: 12px;
                }

                .action-footer {
                    margin-top: 13px;
                    padding-top: 11px;
                    border-top: 1px solid #e5e8ee;
                }

                .last-updated {
                    color: #929aaa;
                    font-size: 11px;
                }

                /* ================= EMPTY ================= */

                .empty-box {
                    background: white;
                    border: 1px solid #e7eaf0;
                    border-radius: 13px;
                    padding: 65px 20px;
                    text-align: center;
                }

                .empty-icon {
                    width: 58px;
                    height: 58px;
                    background: #eef2ff;
                    border-radius: 50%;
                    margin: 0 auto 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 25px;
                }

                .empty-box h3 {
                    margin: 0 0 6px;
                    color: #29354b;
                    font-size: 17px;
                }

                .empty-box p {
                    margin: 0;
                    color: #929aaa;
                    font-size: 13px;
                }

                .loader {
                    width: 34px;
                    height: 34px;
                    border: 3px solid #e5e7eb;
                    border-top-color: #4f46e5;
                    border-radius: 50%;
                    margin: 0 auto 15px;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }

                /* ================= RESPONSIVE ================= */

                @media (max-width: 1300px) {

                    .stats-grid {
                        grid-template-columns: repeat(4, 1fr);
                    }

                    .info-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }

                }

                @media (max-width: 900px) {

                    .admin-applications {
                        padding: 20px;
                    }

                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .filters {
                        grid-template-columns: 1fr;
                    }

                    .update-grid {
                        grid-template-columns: 1fr;
                    }

                    .admin-action-header {
                        align-items: flex-start;
                        flex-direction: column;
                    }

                    .header-actions {
                        width: 100%;
                    }

                    .delete-btn,
                    .update-btn {
                        flex: 1;
                    }

                }

                @media (max-width: 600px) {

                    .admin-applications {
                        padding: 14px;
                    }

                    .top-header {
                        align-items: flex-start;
                    }

                    .top-header h1 {
                        font-size: 22px;
                    }

                    .refresh-btn {
                        padding: 9px 12px;
                    }

                    .stats-grid {
                        grid-template-columns: 1fr 1fr;
                    }

                    .stat-card {
                        padding: 13px 10px;
                    }

                    .stat-icon {
                        display: none;
                    }

                    .card-header {
                        align-items: flex-start;
                        flex-direction: column;
                    }

                    .info-grid {
                        grid-template-columns: 1fr;
                    }

                    .info-item.full-width {
                        grid-column: span 1;
                    }

                    .admin-action-header {
                        align-items: stretch;
                    }

                    .header-actions {
                        width: 100%;
                    }

                    .delete-btn,
                    .update-btn {
                        flex: 1;
                        min-width: 0;
                    }

                }

            `}</style>

        </div>
    );
};

export default AdminApplications;