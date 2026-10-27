import React, { useEffect, useRef, useState } from "react";
import "./DigitalDocuments.css";

const API_URL = "http://localhost:5000/api/digital-documents";

const DigitalDocuments = () => {
    const fileInputRef = useRef(null);

    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        documentType: "",
        documentTitle: "",
        description: "",
        document: null
    });

    // =========================
    // GET LOGIN TOKEN
    // =========================
    const getToken = () => {
        return localStorage.getItem("smartCityToken");
    };

    // =========================
    // GET MY DOCUMENTS
    // =========================
    const fetchDocuments = async () => {
        try {
            setLoading(true);
            setError("");

            const token = getToken();

            if (!token) {
                setError("Please login again.");
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_URL}/my`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load documents"
                );
            }

            setDocuments(data.documents || []);
        } catch (error) {
            console.error("Digital Documents Error:", error);
            setError(error.message || "Unable to load documents.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    // =========================
    // FORM CHANGE
    // =========================
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // =========================
    // FILE CHANGE
    // =========================
    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (!file) {
            return;
        }

        const allowedTypes = [
            "application/pdf",
            "image/jpeg",
            "image/jpg",
            "image/png"
        ];

        if (!allowedTypes.includes(file.type)) {
            alert("Only PDF, JPG, JPEG and PNG files are allowed.");
            e.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("File size must be less than 5 MB.");
            e.target.value = "";
            return;
        }

        setFormData((prev) => ({
            ...prev,
            document: file
        }));
    };

    // =========================
    // UPLOAD
    // =========================
    const handleUpload = async (e) => {
        e.preventDefault();

        if (!formData.documentType) {
            alert("Please select document type.");
            return;
        }

        if (!formData.documentTitle.trim()) {
            alert("Please enter document title.");
            return;
        }

        if (!formData.document) {
            alert("Please select a document.");
            return;
        }

        try {
            setUploading(true);

            const token = getToken();

            if (!token) {
                alert("Login session expired. Please login again.");
                return;
            }

            const uploadData = new FormData();

            uploadData.append(
                "documentType",
                formData.documentType
            );

            uploadData.append(
                "documentTitle",
                formData.documentTitle
            );

            uploadData.append(
                "description",
                formData.description
            );

            uploadData.append(
                "document",
                formData.document
            );

            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: uploadData
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Document upload failed"
                );
            }

            alert("Document uploaded successfully!");

            setFormData({
                documentType: "",
                documentTitle: "",
                description: "",
                document: null
            });

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            setShowUpload(false);

            fetchDocuments();
        } catch (error) {
            console.error("Upload Error:", error);
            alert(error.message || "Unable to upload document.");
        } finally {
            setUploading(false);
        }
    };

    // =========================
    // DELETE
    // =========================
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this document?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            const token = getToken();

            const response = await fetch(
                `${API_URL}/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to delete document"
                );
            }

            alert("Document deleted successfully.");

            fetchDocuments();
        } catch (error) {
            console.error("Delete Error:", error);
            alert(error.message || "Unable to delete document.");
        }
    };

    // =========================
    // VIEW
    // =========================
    const handleView = async (document) => {
        try {
            const token = getToken();

            if (!document.filePath) {
                alert("Document file not found.");
                return;
            }

            const response = await fetch(
                `http://localhost:5000${document.filePath}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Unable to open document.");
            }

            const blob = await response.blob();

            const blobUrl = window.URL.createObjectURL(blob);

            window.open(blobUrl, "_blank");

            setTimeout(() => {
                window.URL.revokeObjectURL(blobUrl);
            }, 60000);
        } catch (error) {
            console.error("View Error:", error);
            alert("Unable to open document.");
        }
    };

    // =========================
    // DOWNLOAD
    // =========================
    const handleDownload = async (document) => {
        try {
            const token = getToken();

            const response = await fetch(
                `http://localhost:5000${document.filePath}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Download failed.");
            }

            const blob = await response.blob();

            const blobUrl = window.URL.createObjectURL(blob);

            const link = window.document.createElement("a");

            link.href = blobUrl;

            link.download =
                document.originalFileName ||
                document.documentTitle ||
                "document";

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download Error:", error);
            alert("Unable to download document.");
        }
    };

    // =========================
    // CLOSE MODAL
    // =========================
    const closeUploadModal = () => {
        if (uploading) {
            return;
        }

        setShowUpload(false);

        setFormData({
            documentType: "",
            documentTitle: "",
            description: "",
            document: null
        });

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // =========================
    // STATUS
    // =========================
    const getStatusClass = (status) => {
        if (status === "Verified") {
            return "status-verified";
        }

        if (status === "Rejected") {
            return "status-rejected";
        }

        return "status-pending";
    };

    // =========================
    // FILE SIZE
    // =========================
    const formatFileSize = (bytes) => {
        if (!bytes) {
            return "0 KB";
        }

        const mb = bytes / (1024 * 1024);

        if (mb >= 1) {
            return `${mb.toFixed(2)} MB`;
        }

        return `${Math.max(
            1,
            Math.round(bytes / 1024)
        )} KB`;
    };

    const pendingCount = documents.filter(
        (doc) => doc.status === "Pending"
    ).length;

    const verifiedCount = documents.filter(
        (doc) => doc.status === "Verified"
    ).length;

    const rejectedCount = documents.filter(
        (doc) => doc.status === "Rejected"
    ).length;

    return (
        <div className="digital-documents-page">

            {/* HEADER */}
            <div className="documents-header">

                <div>
                    <h1>Digital Documents</h1>

                    <p>
                        Upload, manage and access your government
                        documents digitally.
                    </p>
                </div>

                <div className="documents-header-actions">

                    <button
                        className="refresh-btn"
                        onClick={fetchDocuments}
                        disabled={loading}
                    >
                        ↻ Refresh
                    </button>

                    <button
                        className="upload-btn"
                        onClick={() => setShowUpload(true)}
                    >
                        + Upload Document
                    </button>

                </div>

            </div>

            {/* ERROR */}
            {error && (
                <div className="documents-error">
                    <strong>⚠ {error}</strong>

                    <button onClick={fetchDocuments}>
                        Try Again
                    </button>
                </div>
            )}

            {/* STATS */}
            <div className="documents-stats">

                <div className="document-stat-card">
                    <div className="stat-icon total-icon">
                        📄
                    </div>

                    <div>
                        <span>Total Documents</span>
                        <strong>{documents.length}</strong>
                    </div>
                </div>

                <div className="document-stat-card">
                    <div className="stat-icon pending-icon">
                        ⏳
                    </div>

                    <div>
                        <span>Pending</span>
                        <strong>{pendingCount}</strong>
                    </div>
                </div>

                <div className="document-stat-card">
                    <div className="stat-icon verified-icon">
                        ✓
                    </div>

                    <div>
                        <span>Verified</span>
                        <strong>{verifiedCount}</strong>
                    </div>
                </div>

                <div className="document-stat-card">
                    <div className="stat-icon rejected-icon">
                        !
                    </div>

                    <div>
                        <span>Rejected</span>
                        <strong>{rejectedCount}</strong>
                    </div>
                </div>

            </div>

            {/* DOCUMENT SECTION */}
            <div className="documents-section">

                <div className="section-title-row">
                    <div>
                        <h2>My Documents</h2>

                        <p>
                            All documents uploaded by you.
                        </p>
                    </div>
                </div>

                {loading ? (

                    <div className="documents-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading documents...</p>
                    </div>

                ) : documents.length === 0 ? (

                    <div className="documents-empty">

                        <div className="empty-icon">
                            📂
                        </div>

                        <h3>No Documents Found</h3>

                        <p>
                            You haven't uploaded any digital
                            documents yet.
                        </p>

                        <button
                            className="upload-btn"
                            onClick={() =>
                                setShowUpload(true)
                            }
                        >
                            + Upload Your First Document
                        </button>

                    </div>

                ) : (

                    <div className="documents-grid">

                        {documents.map((doc) => (

                            <div
                                className="document-card"
                                key={doc._id}
                            >

                                <div className="document-card-top">

                                    <div className="document-file-icon">
                                        {doc.fileType ===
                                        "application/pdf"
                                            ? "📕"
                                            : "🖼️"}
                                    </div>

                                    <span
                                        className={`document-status ${getStatusClass(
                                            doc.status
                                        )}`}
                                    >
                                        {doc.status}
                                    </span>

                                </div>

                                <div className="document-card-body">

                                    <span className="document-type">
                                        {doc.documentType}
                                    </span>

                                    <h3>
                                        {doc.documentTitle}
                                    </h3>

                                    {doc.description && (
                                        <p className="document-description">
                                            {doc.description}
                                        </p>
                                    )}

                                    <div className="document-info">

                                        <div>
                                            <span>
                                                Document ID
                                            </span>

                                            <strong>
                                                {doc.documentId}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                File Size
                                            </span>

                                            <strong>
                                                {formatFileSize(
                                                    doc.fileSize
                                                )}
                                            </strong>
                                        </div>

                                    </div>

                                    {doc.adminRemark && (
                                        <div className="admin-remark">

                                            <strong>
                                                Admin Remark
                                            </strong>

                                            <p>
                                                {doc.adminRemark}
                                            </p>

                                        </div>
                                    )}

                                </div>

                                <div className="document-card-footer">

                                    <button
                                        className="view-btn"
                                        onClick={() =>
                                            handleView(doc)
                                        }
                                    >
                                        👁 View
                                    </button>

                                    <button
                                        className="download-btn"
                                        onClick={() =>
                                            handleDownload(doc)
                                        }
                                    >
                                        ↓ Download
                                    </button>

                                    {doc.status === "Pending" && (
                                        <button
                                            className="delete-btn"
                                            onClick={() =>
                                                handleDelete(
                                                    doc._id
                                                )
                                            }
                                        >
                                            🗑
                                        </button>
                                    )}

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>

            {/* UPLOAD MODAL */}
            {showUpload && (

                <div
                    className="document-modal-overlay"
                    onClick={closeUploadModal}
                >

                    <div
                        className="document-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="modal-header">

                            <div>
                                <h2>
                                    Upload Document
                                </h2>

                                <p>
                                    Submit your document for
                                    admin verification.
                                </p>
                            </div>

                            <button
                                className="modal-close"
                                onClick={closeUploadModal}
                            >
                                ×
                            </button>

                        </div>

                        <form
                            className="document-upload-form"
                            onSubmit={handleUpload}
                        >

                            {/* TYPE */}
                            <div className="form-group">

                                <label>
                                    Document Type
                                    <span>*</span>
                                </label>

                                <select
                                    name="documentType"
                                    value={
                                        formData.documentType
                                    }
                                    onChange={handleChange}
                                    required
                                >

                                    <option value="">
                                        Select Document Type
                                    </option>

                                    <option value="Aadhaar Card">
                                        Aadhaar Card
                                    </option>

                                    <option value="PAN Card">
                                        PAN Card
                                    </option>

                                    <option value="Driving License">
                                        Driving License
                                    </option>

                                    <option value="Birth Certificate">
                                        Birth Certificate
                                    </option>

                                    <option value="Residence Certificate">
                                        Residence Certificate
                                    </option>

                                    <option value="Income Certificate">
                                        Income Certificate
                                    </option>

                                    <option value="Caste Certificate">
                                        Caste Certificate
                                    </option>

                                    <option value="Property Document">
                                        Property Document
                                    </option>

                                    <option value="Other">
                                        Other
                                    </option>

                                </select>

                            </div>

                            {/* TITLE */}
                            <div className="form-group">

                                <label>
                                    Document Title
                                    <span>*</span>
                                </label>

                                <input
                                    type="text"
                                    name="documentTitle"
                                    value={
                                        formData.documentTitle
                                    }
                                    onChange={handleChange}
                                    placeholder="Enter document title"
                                    maxLength="100"
                                    required
                                />

                            </div>

                            {/* DESCRIPTION */}
                            <div className="form-group">

                                <label>
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={
                                        formData.description
                                    }
                                    onChange={handleChange}
                                    placeholder="Enter document description..."
                                    rows="4"
                                    maxLength="500"
                                />

                            </div>

                            {/* FILE */}
                            <div className="form-group">

                                <label>
                                    Select Document
                                    <span>*</span>
                                </label>

                                <div className="file-upload-box">

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={handleFileChange}
                                        required
                                    />

                                    <div className="file-upload-content">

                                        <div className="file-upload-icon">
                                            ⬆
                                        </div>

                                        <strong>
                                            Click to choose document
                                        </strong>

                                        <small>
                                            PDF, JPG, JPEG or PNG
                                            • Maximum 5 MB
                                        </small>

                                        {formData.document && (
                                            <div className="selected-file">
                                                📎{" "}
                                                {
                                                    formData
                                                        .document
                                                        .name
                                                }
                                            </div>
                                        )}

                                    </div>

                                </div>

                            </div>

                            {/* ACTIONS */}
                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={
                                        closeUploadModal
                                    }
                                    disabled={uploading}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="submit-upload-btn"
                                    disabled={uploading}
                                >
                                    {uploading
                                        ? "Uploading..."
                                        : "Upload Document"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
};

export default DigitalDocuments;