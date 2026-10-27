import React, {
    useEffect,
    useMemo,
    useState
} from "react";

import { useNavigate } from "react-router-dom";

import "./AdminDigitalDocuments.css";


const API_URL =
    "http://localhost:5000/api/digital-documents";


const AdminDigitalDocuments = () => {

    const navigate = useNavigate();


    const [documents, setDocuments] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("All");


    const [selectedDocument, setSelectedDocument] =
        useState(null);

    const [showViewModal, setShowViewModal] =
        useState(false);

    const [showUpdateModal, setShowUpdateModal] =
        useState(false);


    const [updateStatus, setUpdateStatus] =
        useState("Verified");

    const [adminRemark, setAdminRemark] =
        useState("");

    const [saving, setSaving] =
        useState(false);


    /* =====================================================
       ADMIN LOGIN CHECK
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
       LOAD ALL DOCUMENTS
    ===================================================== */

    const loadDocuments = async () => {

        if (!checkAdminLogin()) {
            return;
        }


        try {

            setLoading(true);


            const response =
                await fetch(
                    `${API_URL}/admin/all`,
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


            console.log(
                "ADMIN DIGITAL DOCUMENTS:",
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


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Failed to load digital documents"
                );
            }


            setDocuments(
                data.documents || []
            );


        } catch (error) {

            console.error(
                "Load Digital Documents Error:",
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
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {

        loadDocuments();

        // eslint-disable-next-line react-hooks/exhaustive-deps

    }, []);


    /* =====================================================
       FILTER DOCUMENTS
    ===================================================== */

    const filteredDocuments =
        useMemo(() => {

            return documents.filter(
                (document) => {

                    const searchText =
                        search
                            .toLowerCase()
                            .trim();


                    const matchesSearch =
                        !searchText ||

                        document.documentId
                            ?.toLowerCase()
                            .includes(
                                searchText
                            ) ||

                        document.citizenName
                            ?.toLowerCase()
                            .includes(
                                searchText
                            ) ||

                        document.citizenEmail
                            ?.toLowerCase()
                            .includes(
                                searchText
                            ) ||

                        document.documentTitle
                            ?.toLowerCase()
                            .includes(
                                searchText
                            ) ||

                        document.documentType
                            ?.toLowerCase()
                            .includes(
                                searchText
                            );


                    const matchesStatus =
                        statusFilter ===
                            "All" ||

                        document.status ===
                            statusFilter;


                    return (
                        matchesSearch &&
                        matchesStatus
                    );
                }
            );

        }, [
            documents,
            search,
            statusFilter
        ]);


    /* =====================================================
       COUNTS
    ===================================================== */

    const totalDocuments =
        documents.length;


    const pendingDocuments =
        documents.filter(
            (item) =>
                item.status ===
                "Pending"
        ).length;


    const underReviewDocuments =
        documents.filter(
            (item) =>
                item.status ===
                "Under Review"
        ).length;


    const verifiedDocuments =
        documents.filter(
            (item) =>
                item.status ===
                "Verified"
        ).length;


    const rejectedDocuments =
        documents.filter(
            (item) =>
                item.status ===
                "Rejected"
        ).length;


    /* =====================================================
       FORMAT DATE
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
       VIEW DOCUMENT
    ===================================================== */

    const handleView = (
        document
    ) => {

        setSelectedDocument(
            document
        );

        setShowViewModal(true);
    };


    /* =====================================================
       OPEN UPDATE MODAL
    ===================================================== */

    const handleUpdateOpen = (
        document
    ) => {

        setSelectedDocument(
            document
        );


        setUpdateStatus(
            document.status ===
                "Rejected"
                ? "Rejected"
                : "Verified"
        );


        setAdminRemark(
            document.adminRemark ||
            ""
        );


        setShowUpdateModal(true);
    };


    /* =====================================================
       UPDATE DOCUMENT STATUS
    ===================================================== */

    const handleUpdate = async () => {

        if (!selectedDocument) {
            return;
        }


        if (
            updateStatus ===
                "Rejected" &&
            !adminRemark.trim()
        ) {

            alert(
                "Please enter rejection remark."
            );

            return;
        }


        try {

            setSaving(true);


            const endpoint =
                updateStatus ===
                    "Verified"

                    ? `${API_URL}/admin/${selectedDocument._id}/verify`

                    : `${API_URL}/admin/${selectedDocument._id}/reject`;


            const response =
                await fetch(
                    endpoint,
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            adminRemark:
                                adminRemark.trim()
                        })
                    }
                );


            const data =
                await response.json();


            console.log(
                "UPDATE DOCUMENT:",
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


            if (
                !response.ok ||
                !data.success
            ) {

                alert(
                    data.message ||
                    "Failed to update document"
                );

                return;
            }


            alert(
                updateStatus ===
                    "Verified"

                    ? "Document verified successfully."

                    : "Document rejected successfully."
            );


            setShowUpdateModal(
                false
            );

            setSelectedDocument(
                null
            );

            setAdminRemark("");


            await loadDocuments();


        } catch (error) {

            console.error(
                "Update Document Error:",
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
       DELETE DOCUMENT
    ===================================================== */

    const handleDelete = async (
        document
    ) => {

        const confirmed =
            window.confirm(
                `Delete document "${document.documentTitle}" uploaded by ${document.citizenName}?`
            );


        if (!confirmed) {
            return;
        }


        try {

            const response =
                await fetch(
                    `${API_URL}/admin/${document._id}`,
                    {
                        method: "DELETE"
                    }
                );


            const data =
                await response.json();


            console.log(
                "DELETE DOCUMENT:",
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


            if (
                !response.ok ||
                !data.success
            ) {

                alert(
                    data.message ||
                    "Failed to delete document"
                );

                return;
            }


            alert(
                "Digital document deleted successfully."
            );


            await loadDocuments();


        } catch (error) {

            console.error(
                "Delete Document Error:",
                error
            );


            alert(
                error.message ||
                "Cannot connect to backend server."
            );
        }
    };


    /* =====================================================
       VIEW FILE
    ===================================================== */

    const openFile = (
        document
    ) => {

        if (
            !document ||
            !document.fileName
        ) {

            alert(
                "Document file is not available."
            );

            return;
        }


        const fileUrl =
            `${API_URL}/file/${encodeURIComponent(
                document.fileName
            )}`;


        window.open(
            fileUrl,
            "_blank",
            "noopener,noreferrer"
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
       STATUS CLASS
    ===================================================== */

    const getStatusClass = (
        status
    ) => {

        if (
            status === "Verified"
        ) {
            return "status-verified";
        }


        if (
            status === "Rejected"
        ) {
            return "status-rejected";
        }


        if (
            status === "Under Review"
        ) {
            return "status-review";
        }


        return "status-pending";
    };


    /* =====================================================
       UI
    ===================================================== */

    return (

        <div className="admin-documents-page">


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="admin-documents-sidebar">

                <div className="admin-documents-logo">

                    <div className="admin-documents-logo-icon">
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


                <nav className="admin-documents-menu">


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
                        <span>🏢</span>
                        Services
                    </button>


                    <button
                        onClick={() =>
                            navigate(
                                "/admin/applications"
                            )
                        }
                    >
                        <span>📋</span>
                        Applications
                    </button>


                    <button
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
                        className="active"
                    >
                        <span>📑</span>
                        Digital Documents
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


                </nav>


                <div className="admin-documents-sidebar-bottom">

                    <button
                        onClick={
                            handleLogout
                        }
                    >
                        <span>🚪</span>
                        Logout
                    </button>

                </div>

            </aside>


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="admin-documents-main">


                {/* HEADER */}

                <header className="admin-documents-header">

                    <div>

                        <span className="page-kicker">
                            E-GOVERNANCE
                        </span>

                        <h1>
                            Digital Documents
                        </h1>

                        <p>
                            Review, verify and manage
                            citizen digital documents.
                        </p>

                    </div>


                    <div className="header-admin-info">

                        <div className="header-admin-avatar">
                            A
                        </div>

                        <div>

                            <strong>
                                Administrator
                            </strong>

                            <span>
                                Admin
                            </span>

                        </div>

                    </div>

                </header>


                {/* =================================================
                    STATISTICS
                ================================================= */}

                <section className="document-stats">


                    <div className="document-stat-card">

                        <div className="stat-icon blue">
                            📑
                        </div>

                        <div>

                            <span>
                                Total Documents
                            </span>

                            <strong>
                                {totalDocuments}
                            </strong>

                        </div>

                    </div>


                    <div className="document-stat-card">

                        <div className="stat-icon orange">
                            ⏳
                        </div>

                        <div>

                            <span>
                                Pending
                            </span>

                            <strong>
                                {pendingDocuments}
                            </strong>

                        </div>

                    </div>


                    <div className="document-stat-card">

                        <div className="stat-icon purple">
                            🔍
                        </div>

                        <div>

                            <span>
                                Under Review
                            </span>

                            <strong>
                                {underReviewDocuments}
                            </strong>

                        </div>

                    </div>


                    <div className="document-stat-card">

                        <div className="stat-icon green">
                            ✓
                        </div>

                        <div>

                            <span>
                                Verified
                            </span>

                            <strong>
                                {verifiedDocuments}
                            </strong>

                        </div>

                    </div>


                    <div className="document-stat-card">

                        <div className="stat-icon red">
                            ✕
                        </div>

                        <div>

                            <span>
                                Rejected
                            </span>

                            <strong>
                                {rejectedDocuments}
                            </strong>

                        </div>

                    </div>


                </section>


                {/* =================================================
                    TABLE
                ================================================= */}

                <section className="documents-panel">


                    <div className="documents-panel-header">

                        <div>

                            <h2>
                                Citizen Documents
                            </h2>

                            <p>
                                Manage all documents
                                uploaded by citizens.
                            </p>

                        </div>


                        <div className="documents-controls">

                            <input
                                type="text"
                                placeholder="Search document, citizen..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                            />


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

                                <option value="Under Review">
                                    Under Review
                                </option>

                                <option value="Verified">
                                    Verified
                                </option>

                                <option value="Rejected">
                                    Rejected
                                </option>

                            </select>

                        </div>

                    </div>


                    {loading ? (

                        <div className="documents-loading">

                            <div className="loading-spinner">
                            </div>

                            <p>
                                Loading digital documents...
                            </p>

                        </div>

                    ) : filteredDocuments.length === 0 ? (

                        <div className="documents-empty">

                            <div>
                                📑
                            </div>

                            <h3>
                                No documents found
                            </h3>

                            <p>
                                No digital documents
                                match your search.
                            </p>

                        </div>

                    ) : (

                        <div className="documents-table-wrapper">

                            <table className="documents-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Document
                                        </th>

                                        <th>
                                            Citizen
                                        </th>

                                        <th>
                                            Type
                                        </th>

                                        <th>
                                            Uploaded
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Actions
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredDocuments.map(
                                        (document) => (

                                            <tr
                                                key={
                                                    document._id
                                                }
                                            >


                                                <td>

                                                    <div className="document-name-cell">

                                                        <div className="document-file-icon">
                                                            📄
                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    document.documentTitle
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    document.documentId
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                <td>

                                                    <div className="citizen-cell">

                                                        <strong>
                                                            {
                                                                document.citizenName ||
                                                                "-"
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                document.citizenEmail ||
                                                                "-"
                                                            }
                                                        </span>

                                                    </div>

                                                </td>


                                                <td>

                                                    <span className="document-type">
                                                        {
                                                            document.documentType ||
                                                            "-"
                                                        }
                                                    </span>

                                                </td>


                                                <td>

                                                    <span className="date-cell">
                                                        {
                                                            formatDate(
                                                                document.createdAt
                                                            )
                                                        }
                                                    </span>

                                                </td>


                                                <td>

                                                    <span
                                                        className={`document-status ${getStatusClass(
                                                            document.status
                                                        )}`}
                                                    >

                                                        {
                                                            document.status ||
                                                            "Pending"
                                                        }

                                                    </span>

                                                </td>


                                                <td>

                                                    <div className="document-actions">


                                                        <button
                                                            className="view-action"
                                                            title="View Details"
                                                            onClick={() =>
                                                                handleView(
                                                                    document
                                                                )
                                                            }
                                                        >
                                                            👁
                                                        </button>


                                                        <button
                                                            className="update-action"
                                                            title="Verify / Reject"
                                                            onClick={() =>
                                                                handleUpdateOpen(
                                                                    document
                                                                )
                                                            }
                                                        >
                                                            ✏️
                                                        </button>


                                                        <button
                                                            className="delete-action"
                                                            title="Delete"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    document
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

                        </div>

                    )}

                </section>


            </main>


            {/* =================================================
                VIEW MODAL
            ================================================= */}

            {showViewModal &&
                selectedDocument && (

                    <div
                        className="document-modal-overlay"
                        onClick={() =>
                            setShowViewModal(
                                false
                            )
                        }
                    >

                        <div
                            className="document-modal"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <div className="modal-header">

                                <div>

                                    <span>
                                        DOCUMENT DETAILS
                                    </span>

                                    <h2>
                                        {
                                            selectedDocument.documentTitle
                                        }
                                    </h2>

                                </div>


                                <button
                                    onClick={() =>
                                        setShowViewModal(
                                            false
                                        )
                                    }
                                >
                                    ×
                                </button>

                            </div>


                            <div className="document-detail-grid">


                                <div>
                                    <label>
                                        Document ID
                                    </label>

                                    <strong>
                                        {
                                            selectedDocument.documentId
                                        }
                                    </strong>
                                </div>


                                <div>
                                    <label>
                                        Document Type
                                    </label>

                                    <strong>
                                        {
                                            selectedDocument.documentType
                                        }
                                    </strong>
                                </div>


                                <div>
                                    <label>
                                        Citizen Name
                                    </label>

                                    <strong>
                                        {
                                            selectedDocument.citizenName
                                        }
                                    </strong>
                                </div>


                                <div>
                                    <label>
                                        Citizen Email
                                    </label>

                                    <strong>
                                        {
                                            selectedDocument.citizenEmail
                                        }
                                    </strong>
                                </div>


                                <div>
                                    <label>
                                        Status
                                    </label>

                                    <span
                                        className={`document-status ${getStatusClass(
                                            selectedDocument.status
                                        )}`}
                                    >
                                        {
                                            selectedDocument.status
                                        }
                                    </span>
                                </div>


                                <div>
                                    <label>
                                        Uploaded
                                    </label>

                                    <strong>
                                        {
                                            formatDate(
                                                selectedDocument.createdAt
                                            )
                                        }
                                    </strong>
                                </div>


                                <div className="full-detail">

                                    <label>
                                        Description
                                    </label>

                                    <p>
                                        {
                                            selectedDocument.description ||
                                            "No description provided."
                                        }
                                    </p>

                                </div>


                                <div className="full-detail">

                                    <label>
                                        Admin Remark
                                    </label>

                                    <p>
                                        {
                                            selectedDocument.adminRemark ||
                                            "No admin remark."
                                        }
                                    </p>

                                </div>

                            </div>


                            <div className="modal-actions">

                                <button
                                    className="modal-view-file"
                                    onClick={() =>
                                        openFile(
                                            selectedDocument
                                        )
                                    }
                                >
                                    📄 View / Open Document
                                </button>


                                <button
                                    className="modal-close"
                                    onClick={() =>
                                        setShowViewModal(
                                            false
                                        )
                                    }
                                >
                                    Close
                                </button>

                            </div>

                        </div>

                    </div>
                )}


            {/* =================================================
                UPDATE MODAL
            ================================================= */}

            {showUpdateModal &&
                selectedDocument && (

                    <div
                        className="document-modal-overlay"
                        onClick={() =>
                            !saving &&
                            setShowUpdateModal(
                                false
                            )
                        }
                    >

                        <div
                            className="document-modal update-modal"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <div className="modal-header">

                                <div>

                                    <span>
                                        DOCUMENT REVIEW
                                    </span>

                                    <h2>
                                        Update Document
                                    </h2>

                                </div>


                                <button
                                    disabled={
                                        saving
                                    }
                                    onClick={() =>
                                        setShowUpdateModal(
                                            false
                                        )
                                    }
                                >
                                    ×
                                </button>

                            </div>


                            <div className="review-document-info">

                                <strong>
                                    {
                                        selectedDocument.documentTitle
                                    }
                                </strong>

                                <span>
                                    {
                                        selectedDocument.citizenName
                                    }
                                    {" • "}
                                    {
                                        selectedDocument.documentId
                                    }
                                </span>

                            </div>


                            <div className="form-group">

                                <label>
                                    Status
                                </label>

                                <select
                                    value={
                                        updateStatus
                                    }
                                    onChange={(e) =>
                                        setUpdateStatus(
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="Verified">
                                        Verified
                                    </option>

                                    <option value="Rejected">
                                        Rejected
                                    </option>

                                </select>

                            </div>


                            <div className="form-group">

                                <label>
                                    Admin Remark
                                </label>

                                <textarea
                                    rows="5"
                                    placeholder="Enter verification / rejection remark..."
                                    value={
                                        adminRemark
                                    }
                                    onChange={(e) =>
                                        setAdminRemark(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>


                            <div className="modal-actions">

                                <button
                                    className="modal-close"
                                    disabled={
                                        saving
                                    }
                                    onClick={() =>
                                        setShowUpdateModal(
                                            false
                                        )
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    className="modal-save"
                                    disabled={
                                        saving
                                    }
                                    onClick={
                                        handleUpdate
                                    }
                                >

                                    {saving
                                        ? "Updating..."
                                        : "Update Document"}

                                </button>

                            </div>

                        </div>

                    </div>
                )}

        </div>
    );
};


export default AdminDigitalDocuments;