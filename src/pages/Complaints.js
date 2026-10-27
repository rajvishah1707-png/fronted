import React, {
    useEffect,
    useMemo,
    useState
} from "react";

import { useNavigate } from "react-router-dom";

import "./Complaints.css";


const API_URL =
    "http://localhost:5000/api/admin/complaints";

const SERVER_URL =
    "http://localhost:5000";


const Complaints = () => {

    const navigate =
        useNavigate();


    const [complaints, setComplaints] =
        useState([]);

    const [loading, setLoading] =
        useState(true);


    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("All");

    const [priorityFilter, setPriorityFilter] =
        useState("All");


    const [selectedComplaint, setSelectedComplaint] =
        useState(null);

    const [showModal, setShowModal] =
        useState(false);


    const [status, setStatus] =
        useState("Pending");

    const [adminReply, setAdminReply] =
        useState("");

    const [saving, setSaving] =
        useState(false);


    // Image preview
    const [previewImage, setPreviewImage] =
        useState(null);


    /* =====================================================
       IMAGE URL
    ===================================================== */

    const getImageUrl = (image) => {

        if (!image) {
            return "";
        }

        if (
            image.startsWith("http://") ||
            image.startsWith("https://")
        ) {
            return image;
        }

        return `${SERVER_URL}${image.startsWith("/") ? "" : "/"}${image}`;
    };


    /* =====================================================
       CHECK ADMIN LOGIN
    ===================================================== */

    const checkAdminLogin = () => {

        const adminLoggedIn =
            localStorage.getItem(
                "adminLoggedIn"
            ) === "true";

        const admin =
            localStorage.getItem("admin");


        if (
            !adminLoggedIn ||
            !admin
        ) {

            navigate(
                "/admin-login",
                {
                    replace: true
                }
            );

            return false;
        }

        return true;
    };


    /* =====================================================
       LOAD COMPLAINTS
    ===================================================== */

    const loadComplaints = async () => {

        if (!checkAdminLogin()) {
            return;
        }


        try {

            setLoading(true);


            const response =
                await fetch(API_URL, {
                    method: "GET",

                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                });


            const data =
                await response.json();


            console.log(
                "ADMIN COMPLAINTS RESPONSE:",
                data
            );


            if (
                response.status === 401
            ) {

                alert(
                    data.message ||
                    "Admin authentication required."
                );

                navigate(
                    "/admin-login",
                    {
                        replace: true
                    }
                );

                return;
            }


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to load complaints"
                );

            }


            if (data.success) {

                setComplaints(
                    data.complaints || []
                );

            } else {

                alert(
                    data.message ||
                    "Failed to load complaints"
                );

            }


        } catch (error) {

            console.error(
                "Load Complaints Error:",
                error
            );


            alert(
                error.message ||
                "Cannot connect to backend server."
            );


        } finally {

            setLoading(false);

        }

    };


    /* =====================================================
       LOAD ON PAGE OPEN
    ===================================================== */

    useEffect(() => {

        loadComplaints();

        // eslint-disable-next-line react-hooks/exhaustive-deps

    }, []);


    /* =====================================================
       FILTER
    ===================================================== */

    const filteredComplaints =
        useMemo(() => {

            return complaints.filter(
                (complaint) => {

                    const searchText =
                        search
                            .toLowerCase()
                            .trim();


                    const matchesSearch =
                        !searchText ||

                        complaint.complaintId
                            ?.toLowerCase()
                            .includes(
                                searchText
                            ) ||

                        complaint.citizenName
                            ?.toLowerCase()
                            .includes(
                                searchText
                            ) ||

                        complaint.citizenEmail
                            ?.toLowerCase()
                            .includes(
                                searchText
                            ) ||

                        complaint.subject
                            ?.toLowerCase()
                            .includes(
                                searchText
                            ) ||

                        complaint.category
                            ?.toLowerCase()
                            .includes(
                                searchText
                            );


                    const matchesStatus =
                        statusFilter ===
                            "All" ||
                        complaint.status ===
                            statusFilter;


                    const matchesPriority =
                        priorityFilter ===
                            "All" ||
                        complaint.priority ===
                            priorityFilter;


                    return (
                        matchesSearch &&
                        matchesStatus &&
                        matchesPriority
                    );

                }
            );

        }, [
            complaints,
            search,
            statusFilter,
            priorityFilter
        ]);


    /* =====================================================
       COUNTS
    ===================================================== */

    const totalComplaints =
        complaints.length;


    const pendingComplaints =
        complaints.filter(
            (item) =>
                item.status ===
                "Pending"
        ).length;


    const inProgressComplaints =
        complaints.filter(
            (item) =>
                item.status ===
                "In Progress"
        ).length;


    const resolvedComplaints =
        complaints.filter(
            (item) =>
                item.status ===
                "Resolved"
        ).length;


    const rejectedComplaints =
        complaints.filter(
            (item) =>
                item.status ===
                "Rejected"
        ).length;


    /* =====================================================
       VIEW COMPLAINT
    ===================================================== */

    const handleView = (
        complaint
    ) => {

        setSelectedComplaint(
            complaint
        );


        setStatus(
            complaint.status ||
            "Pending"
        );


        setAdminReply(
            complaint.adminReply ||
            ""
        );


        setShowModal(true);

    };


    /* =====================================================
       UPDATE COMPLAINT
    ===================================================== */

    const handleUpdate = async () => {

        if (
            !selectedComplaint
        ) {
            return;
        }


        try {

            setSaving(true);


            const response =
                await fetch(
                    `${API_URL}/${selectedComplaint._id}/status`,
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            status,
                            adminReply
                        })
                    }
                );


            const data =
                await response.json();


            console.log(
                "UPDATE COMPLAINT RESPONSE:",
                data
            );


            if (
                response.status ===
                401
            ) {

                alert(
                    data.message ||
                    "Admin authentication required."
                );

                navigate(
                    "/admin-login",
                    {
                        replace: true
                    }
                );

                return;
            }


            if (
                !response.ok ||
                !data.success
            ) {

                alert(
                    data.message ||
                    "Failed to update complaint"
                );

                return;
            }


            alert(
                "Complaint updated successfully"
            );


            setShowModal(false);

            setSelectedComplaint(
                null
            );


            await loadComplaints();


        } catch (error) {

            console.error(
                "Update Complaint Error:",
                error
            );


            alert(
                error.message ||
                "Cannot connect to backend server."
            );


        } finally {

            setSaving(false);

        }

    };


    /* =====================================================
       DELETE COMPLAINT
    ===================================================== */

    const handleDelete = async (
        complaint
    ) => {

        const confirmed =
            window.confirm(
                `Delete complaint ${complaint.complaintId}?`
            );


        if (!confirmed) {
            return;
        }


        try {

            const response =
                await fetch(
                    `${API_URL}/${complaint._id}`,
                    {
                        method: "DELETE"
                    }
                );


            const data =
                await response.json();


            console.log(
                "DELETE COMPLAINT RESPONSE:",
                data
            );


            if (
                response.status ===
                401
            ) {

                alert(
                    data.message ||
                    "Admin authentication required."
                );

                navigate(
                    "/admin-login",
                    {
                        replace: true
                    }
                );

                return;
            }


            if (
                !response.ok ||
                !data.success
            ) {

                alert(
                    data.message ||
                    "Failed to delete complaint"
                );

                return;
            }


            alert(
                "Complaint deleted successfully"
            );


            await loadComplaints();


        } catch (error) {

            console.error(
                "Delete Complaint Error:",
                error
            );


            alert(
                error.message ||
                "Cannot connect to backend server."
            );

        }

    };


    /* =====================================================
       DATE
    ===================================================== */

    const formatDate = (
        date
    ) => {

        if (!date) {
            return "-";
        }


        return new Date(
            date
        ).toLocaleString(
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


    /* =====================================================
       LOGOUT
    ===================================================== */

    const handleLogout = () => {

        localStorage.removeItem(
            "adminLoggedIn"
        );

        localStorage.removeItem(
            "admin"
        );

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "adminToken"
        );


        navigate(
            "/admin-login"
        );

    };


    /* =====================================================
       UI
    ===================================================== */

    return (

        <div className="complaints-page">


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="complaints-sidebar">

                <div className="complaints-sidebar-logo">

                    <div className="complaints-logo-icon">
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


                <nav className="complaints-sidebar-menu">

                    <button
                        onClick={() =>
                            navigate(
                                "/admin-dashboard"
                            )
                        }
                    >
                        <span>📊</span>
                        Dashboard
                    </button>


                    <button
                        onClick={() =>
                            navigate(
                                "/admin/citizens"
                            )
                        }
                    >
                        <span>👥</span>
                        Citizens
                    </button>


                    <button
                        onClick={() =>
                            navigate(
                                "/admin/services"
                            )
                        }
                    >
                        <span>🛠️</span>
                        Services
                    </button>


                    <button
                        onClick={() =>
                            navigate(
                                "/admin/applications"
                            )
                        }
                    >
                        <span>📄</span>
                        Applications
                    </button>


                    <button
                        className="active"
                        onClick={() =>
                            navigate(
                                "/admin/complaints"
                            )
                        }
                    >
                        <span>📢</span>
                        Complaints
                    </button>


                    <button
                        onClick={() =>
                            navigate(
                                "/admin/categories"
                            )
                        }
                    >
                        <span>📁</span>
                        Categories
                    </button>


                    <button
                        onClick={() =>
                            navigate(
                                "/admin/notifications"
                            )
                        }
                    >
                        <span>🔔</span>
                        Notifications
                    </button>


                    <button
                        onClick={() =>
                            navigate(
                                "/admin/feedback"
                            )
                        }
                    >
                        <span>⭐</span>
                        Feedback & Ratings
                    </button>


                    <button
                        onClick={() =>
                            navigate(
                                "/admin/statistics"
                            )
                        }
                    >
                        <span>📈</span>
                        Statistics
                    </button>

                </nav>


                <button
                    className="complaints-sidebar-logout"
                    onClick={
                        handleLogout
                    }
                >
                    <span>🚪</span>
                    Logout
                </button>

            </aside>


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="complaints-main">


                <div className="complaints-header">

                    <div>

                        <h1>
                            Complaints Management
                        </h1>

                        <p>
                            Manage and resolve citizen complaints
                        </p>

                    </div>


                    <button
                        className="complaints-refresh"
                        onClick={
                            loadComplaints
                        }
                    >
                        🔄 Refresh
                    </button>

                </div>


                {/* =================================================
                    SUMMARY
                ================================================= */}

                <div className="complaints-summary">

                    <div className="complaint-summary-card">

                        <div className="complaint-summary-icon">
                            📢
                        </div>

                        <div>

                            <span>
                                Total Complaints
                            </span>

                            <strong>
                                {totalComplaints}
                            </strong>

                        </div>

                    </div>


                    <div className="complaint-summary-card">

                        <div className="complaint-summary-icon pending-icon">
                            ⏳
                        </div>

                        <div>

                            <span>
                                Pending
                            </span>

                            <strong>
                                {pendingComplaints}
                            </strong>

                        </div>

                    </div>


                    <div className="complaint-summary-card">

                        <div className="complaint-summary-icon progress-icon">
                            🔄
                        </div>

                        <div>

                            <span>
                                In Progress
                            </span>

                            <strong>
                                {inProgressComplaints}
                            </strong>

                        </div>

                    </div>


                    <div className="complaint-summary-card">

                        <div className="complaint-summary-icon resolved-icon">
                            ✅
                        </div>

                        <div>

                            <span>
                                Resolved
                            </span>

                            <strong>
                                {resolvedComplaints}
                            </strong>

                        </div>

                    </div>


                    <div className="complaint-summary-card">

                        <div className="complaint-summary-icon">
                            ❌
                        </div>

                        <div>

                            <span>
                                Rejected
                            </span>

                            <strong>
                                {rejectedComplaints}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    FILTERS
                ================================================= */}

                <div className="complaints-toolbar">

                    <div className="complaints-search">

                        <span>
                            🔍
                        </span>

                        <input
                            type="text"
                            placeholder="Search complaint, citizen, email or subject..."
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    <select
                        value={
                            statusFilter
                        }
                        onChange={(e) =>
                            setStatusFilter(
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

                        <option value="In Progress">
                            In Progress
                        </option>

                        <option value="Resolved">
                            Resolved
                        </option>

                        <option value="Rejected">
                            Rejected
                        </option>

                    </select>


                    <select
                        value={
                            priorityFilter
                        }
                        onChange={(e) =>
                            setPriorityFilter(
                                e.target.value
                            )
                        }
                    >

                        <option value="All">
                            All Priority
                        </option>

                        <option value="Low">
                            Low
                        </option>

                        <option value="Medium">
                            Medium
                        </option>

                        <option value="High">
                            High
                        </option>

                        <option value="Urgent">
                            Urgent
                        </option>

                    </select>

                </div>


                {/* =================================================
                    TABLE
                ================================================= */}

                <div className="complaints-table-container">

                    {loading ? (

                        <div className="complaints-loading">
                            Loading complaints...
                        </div>

                    ) : filteredComplaints.length === 0 ? (

                        <div className="complaints-empty">

                            <div>
                                📢
                            </div>

                            <h3>
                                No Complaints Found
                            </h3>

                            <p>
                                No complaints match your search or filters.
                            </p>

                        </div>

                    ) : (

                        <table className="complaints-table">

                            <thead>

                                <tr>

                                    <th>
                                        Complaint
                                    </th>

                                    <th>
                                        Photo
                                    </th>

                                    <th>
                                        Citizen
                                    </th>

                                    <th>
                                        Category
                                    </th>

                                    <th>
                                        Priority
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Date
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredComplaints.map(
                                    (complaint) => (

                                        <tr
                                            key={
                                                complaint._id
                                            }
                                        >

                                            <td>

                                                <div className="complaint-title">

                                                    <strong>
                                                        {
                                                            complaint.complaintId
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            complaint.subject
                                                        }
                                                    </span>

                                                </div>

                                            </td>


                                            {/* =========================
                                                COMPLAINT IMAGE
                                            ========================= */}

                                            <td>

                                                {complaint.image ? (

                                                    <img
                                                        src={getImageUrl(
                                                            complaint.image
                                                        )}
                                                        alt="Complaint"
                                                        className="admin-complaint-thumbnail"
                                                        onClick={() =>
                                                            setPreviewImage(
                                                                getImageUrl(
                                                                    complaint.image
                                                                )
                                                            )
                                                        }
                                                        onError={(e) => {
                                                            e.currentTarget.style.display =
                                                                "none";
                                                        }}
                                                    />

                                                ) : (

                                                    <div className="admin-no-image">
                                                        📷
                                                    </div>

                                                )}

                                            </td>


                                            <td>

                                                <div className="complaint-citizen">

                                                    <div className="complaint-avatar">

                                                        {complaint.citizenName
                                                            ?.charAt(
                                                                0
                                                            )
                                                            .toUpperCase() ||
                                                            "C"}

                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {
                                                                complaint.citizenName ||
                                                                "Unknown"
                                                            }
                                                        </strong>

                                                        <small>
                                                            {
                                                                complaint.citizenEmail ||
                                                                "-"
                                                            }
                                                        </small>

                                                    </div>

                                                </div>

                                            </td>


                                            <td>

                                                <span className="category-badge">

                                                    {
                                                        complaint.category ||
                                                        "General"
                                                    }

                                                </span>

                                            </td>


                                            <td>

                                                <span
                                                    className={`priority-badge priority-${(
                                                        complaint.priority ||
                                                        "Medium"
                                                    ).toLowerCase()}`}
                                                >

                                                    {
                                                        complaint.priority ||
                                                        "Medium"
                                                    }

                                                </span>

                                            </td>


                                            <td>

                                                <span
                                                    className={`complaint-status status-${(
                                                        complaint.status ||
                                                        "Pending"
                                                    )
                                                        .toLowerCase()
                                                        .replace(
                                                            /\s/g,
                                                            "-"
                                                        )}`}
                                                >

                                                    {
                                                        complaint.status ||
                                                        "Pending"
                                                    }

                                                </span>

                                            </td>


                                            <td>

                                                {
                                                    formatDate(
                                                        complaint.createdAt
                                                    )
                                                }

                                            </td>


                                            <td>

                                                <div className="complaint-actions">

                                                    <button
                                                        className="complaint-view-btn"
                                                        title="View & Update"
                                                        onClick={() =>
                                                            handleView(
                                                                complaint
                                                            )
                                                        }
                                                    >
                                                        👁
                                                    </button>


                                                    <button
                                                        className="complaint-delete-btn"
                                                        title="Delete"
                                                        onClick={() =>
                                                            handleDelete(
                                                                complaint
                                                            )
                                                        }
                                                    >
                                                        🗑
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    )}

                </div>


                {/* =================================================
                    UPDATE MODAL
                ================================================= */}

                {showModal &&
                    selectedComplaint && (

                        <div className="complaint-modal-overlay">

                            <div className="complaint-modal">


                                <div className="complaint-modal-header">

                                    <div>

                                        <span>
                                            {
                                                selectedComplaint.complaintId
                                            }
                                        </span>

                                        <h2>
                                            {
                                                selectedComplaint.subject
                                            }
                                        </h2>

                                    </div>


                                    <button
                                        onClick={() =>
                                            setShowModal(
                                                false
                                            )
                                        }
                                    >
                                        ×
                                    </button>

                                </div>


                                {/* =========================
                                    COMPLAINT IMAGE
                                ========================= */}

                                {selectedComplaint.image && (

                                    <div className="admin-modal-image-section">

                                        <span>
                                            Complaint Photo
                                        </span>

                                        <img
                                            src={getImageUrl(
                                                selectedComplaint.image
                                            )}
                                            alt="Complaint evidence"
                                            className="admin-modal-complaint-image"
                                            onClick={() =>
                                                setPreviewImage(
                                                    getImageUrl(
                                                        selectedComplaint.image
                                                    )
                                                )
                                            }
                                        />

                                        <small>
                                            Click image to view full size
                                        </small>

                                    </div>

                                )}


                                <div className="complaint-details">


                                    <div className="detail-box">

                                        <span>
                                            Citizen
                                        </span>

                                        <strong>
                                            {
                                                selectedComplaint.citizenName ||
                                                "-"
                                            }
                                        </strong>

                                    </div>


                                    <div className="detail-box">

                                        <span>
                                            Email
                                        </span>

                                        <strong>
                                            {
                                                selectedComplaint.citizenEmail ||
                                                "-"
                                            }
                                        </strong>

                                    </div>


                                    <div className="detail-box">

                                        <span>
                                            Phone
                                        </span>

                                        <strong>
                                            {
                                                selectedComplaint.citizenPhone ||
                                                "-"
                                            }
                                        </strong>

                                    </div>


                                    <div className="detail-box">

                                        <span>
                                            Category
                                        </span>

                                        <strong>
                                            {
                                                selectedComplaint.category ||
                                                "General"
                                            }
                                        </strong>

                                    </div>


                                    <div className="detail-box">

                                        <span>
                                            Priority
                                        </span>

                                        <strong>
                                            {
                                                selectedComplaint.priority ||
                                                "Medium"
                                            }
                                        </strong>

                                    </div>


                                    <div className="detail-box">

                                        <span>
                                            Date
                                        </span>

                                        <strong>
                                            {
                                                formatDate(
                                                    selectedComplaint.createdAt
                                                )
                                            }
                                        </strong>

                                    </div>


                                    <div className="detail-box full">

                                        <span>
                                            Address
                                        </span>

                                        <strong>
                                            {
                                                selectedComplaint.address ||
                                                "-"
                                            }
                                        </strong>

                                    </div>


                                    <div className="detail-box full">

                                        <span>
                                            City
                                        </span>

                                        <strong>
                                            {
                                                selectedComplaint.city ||
                                                "-"
                                            }
                                        </strong>

                                    </div>


                                    <div className="detail-box full">

                                        <span>
                                            Description
                                        </span>

                                        <p>
                                            {
                                                selectedComplaint.description ||
                                                "-"
                                            }
                                        </p>

                                    </div>

                                </div>


                                <div className="complaint-update-section">

                                    <h3>
                                        Admin Action
                                    </h3>


                                    <label>
                                        Complaint Status
                                    </label>


                                    <select
                                        value={status}
                                        onChange={(e) =>
                                            setStatus(
                                                e.target.value
                                            )
                                        }
                                    >

                                        <option value="Pending">
                                            Pending
                                        </option>

                                        <option value="In Progress">
                                            In Progress
                                        </option>

                                        <option value="Resolved">
                                            Resolved
                                        </option>

                                        <option value="Rejected">
                                            Rejected
                                        </option>

                                    </select>


                                    <label>
                                        Admin Reply / Remark
                                    </label>


                                    <textarea
                                        value={
                                            adminReply
                                        }
                                        onChange={(e) =>
                                            setAdminReply(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Write response for citizen..."
                                        rows="5"
                                    />

                                </div>


                                <div className="complaint-modal-actions">

                                    <button
                                        className="complaint-cancel-btn"
                                        onClick={() =>
                                            setShowModal(
                                                false
                                            )
                                        }
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        className="complaint-save-btn"
                                        onClick={
                                            handleUpdate
                                        }
                                        disabled={
                                            saving
                                        }
                                    >

                                        {saving
                                            ? "Updating..."
                                            : "Update Complaint"}

                                    </button>

                                </div>


                            </div>

                        </div>

                    )}


                {/* =================================================
                    FULL IMAGE PREVIEW
                ================================================= */}

                {previewImage && (

                    <div
                        className="admin-image-preview-overlay"
                        onClick={() =>
                            setPreviewImage(null)
                        }
                    >

                        <button
                            className="admin-image-preview-close"
                            onClick={() =>
                                setPreviewImage(null)
                            }
                        >
                            ×
                        </button>

                        <img
                            src={previewImage}
                            alt="Complaint full preview"
                            className="admin-image-preview"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        />

                    </div>

                )}

            </main>

        </div>

    );

};


export default Complaints;