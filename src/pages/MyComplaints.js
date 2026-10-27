import React, {
    useCallback,
    useEffect,
    useState
} from "react";

import { useNavigate } from "react-router-dom";

import "./MyComplaints.css";

const API_URL = "http://localhost:5000";

const MyComplaints = () => {
    const navigate = useNavigate();

    const token =
        localStorage.getItem(
            "smartCityToken"
        );

    const userString =
        localStorage.getItem(
            "smartCityUser"
        );

    const user = userString
        ? JSON.parse(userString)
        : null;

    const [complaints, setComplaints] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [submitting, setSubmitting] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");

    const [selectedImage, setSelectedImage] =
        useState(null);

    const [imagePreview, setImagePreview] =
        useState("");

    const [form, setForm] = useState({
        category: "",
        subject: "",
        description: "",
        address:
            user?.address || "",
        city:
            user?.city || "",
        priority: "Medium"
    });

    /* =========================================================
       LOAD MY COMPLAINTS
    ========================================================= */

    const loadComplaints =
        useCallback(async () => {
            if (!token) {
                navigate("/login", {
                    replace: true
                });

                return;
            }

            try {
                setLoading(true);
                setError("");

                const response =
                    await fetch(
                        `${API_URL}/api/complaints/my`,
                        {
                            method: "GET",

                            headers: {
                                Authorization:
                                    `Bearer ${token}`,

                                "Content-Type":
                                    "application/json"
                            }
                        }
                    );

                const data =
                    await response.json();

                if (
                    response.status ===
                    401
                ) {
                    localStorage.removeItem(
                        "smartCityToken"
                    );

                    localStorage.removeItem(
                        "smartCityUser"
                    );

                    navigate("/login", {
                        replace: true
                    });

                    return;
                }

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        "Failed to load complaints"
                    );
                }

                setComplaints(
                    data.complaints ||
                    []
                );

            } catch (err) {
                console.error(
                    "Load complaints error:",
                    err
                );

                setError(
                    err.message ||
                    "Unable to load complaints"
                );

            } finally {
                setLoading(false);
            }
        }, [
            token,
            navigate
        ]);

    /* =========================================================
       LOAD ON PAGE OPEN
    ========================================================= */

    useEffect(() => {
        loadComplaints();
    }, [
        loadComplaints
    ]);

    /* =========================================================
       FORM CHANGE
    ========================================================= */

    const handleChange = (e) => {
        const {
            name,
            value
        } = e.target;

        setForm(
            (previous) => ({
                ...previous,
                [name]: value
            })
        );
    };

    /* =========================================================
       IMAGE CHANGE
    ========================================================= */

    const handleImageChange = (e) => {
        const file =
            e.target.files?.[0];

        setError("");

        if (!file) {
            setSelectedImage(null);
            setImagePreview("");
            return;
        }

        /* ---------------------------------------------
           FILE TYPE VALIDATION
        --------------------------------------------- */

        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
        ];

        if (
            !allowedTypes.includes(
                file.type
            )
        ) {
            setError(
                "Only JPG, JPEG, PNG and WEBP images are allowed."
            );

            e.target.value = "";

            setSelectedImage(null);
            setImagePreview("");

            return;
        }

        /* ---------------------------------------------
           FILE SIZE VALIDATION
           Maximum 5MB
        --------------------------------------------- */

        const maxSize =
            5 * 1024 * 1024;

        if (file.size > maxSize) {
            setError(
                "Image size must be less than 5MB."
            );

            e.target.value = "";

            setSelectedImage(null);
            setImagePreview("");

            return;
        }

        setSelectedImage(file);

        setImagePreview(
            URL.createObjectURL(file)
        );
    };

    /* =========================================================
       REMOVE SELECTED IMAGE
    ========================================================= */

    const removeSelectedImage = () => {
        setSelectedImage(null);
        setImagePreview("");

        const imageInput =
            document.getElementById(
                "complaint-image"
            );

        if (imageInput) {
            imageInput.value = "";
        }
    };

    /* =========================================================
       SUBMIT COMPLAINT
    ========================================================= */

    const submitComplaint =
        async (e) => {
            e.preventDefault();

            setMessage("");
            setError("");

            /* ---------------------------------------------
               BASIC VALIDATION
            --------------------------------------------- */

            if (!form.category) {
                setError(
                    "Please select complaint category."
                );

                return;
            }

            if (
                !form.subject ||
                form.subject.trim()
                    .length < 3
            ) {
                setError(
                    "Subject must contain at least 3 characters."
                );

                return;
            }

            if (
                !form.description ||
                form.description.trim()
                    .length < 10
            ) {
                setError(
                    "Description must contain at least 10 characters."
                );

                return;
            }

            if (!token) {
                navigate("/login");
                return;
            }

            try {
                setSubmitting(true);

                /* ---------------------------------------------
                   FORM DATA
                --------------------------------------------- */

                const formData =
                    new FormData();

                formData.append(
                    "citizenName",
                    user?.name || ""
                );

                formData.append(
                    "citizenEmail",
                    user?.email || ""
                );

                formData.append(
                    "citizenPhone",
                    user?.phone || ""
                );

                formData.append(
                    "category",
                    form.category
                );

                formData.append(
                    "subject",
                    form.subject.trim()
                );

                formData.append(
                    "description",
                    form.description.trim()
                );

                formData.append(
                    "address",
                    form.address.trim()
                );

                formData.append(
                    "city",
                    form.city.trim()
                );

                formData.append(
                    "priority",
                    form.priority
                );

                /* ---------------------------------------------
                   IMAGE
                --------------------------------------------- */

                if (selectedImage) {
                    formData.append(
                        "image",
                        selectedImage
                    );
                }

                /* ---------------------------------------------
                   API REQUEST
                --------------------------------------------- */

                const response =
                    await fetch(
                        `${API_URL}/api/complaints`,
                        {
                            method: "POST",

                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            },

                            body: formData
                        }
                    );

                const data =
                    await response.json();

                console.log(
                    "CREATE COMPLAINT RESPONSE:",
                    data
                );

                /* ---------------------------------------------
                   UNAUTHORIZED
                --------------------------------------------- */

                if (
                    response.status ===
                    401
                ) {
                    localStorage.removeItem(
                        "smartCityToken"
                    );

                    localStorage.removeItem(
                        "smartCityUser"
                    );

                    navigate("/login", {
                        replace: true
                    });

                    return;
                }

                /* ---------------------------------------------
                   ERROR
                --------------------------------------------- */

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        "Failed to submit complaint"
                    );
                }

                /* ---------------------------------------------
                   SUCCESS
                --------------------------------------------- */

                setMessage(
                    data.message ||
                    "Complaint submitted successfully."
                );

                /* ---------------------------------------------
                   RESET FORM
                --------------------------------------------- */

                setForm({
                    category: "",
                    subject: "",
                    description: "",
                    address:
                        user?.address ||
                        "",
                    city:
                        user?.city ||
                        "",
                    priority:
                        "Medium"
                });

                setSelectedImage(
                    null
                );

                setImagePreview("");

                const imageInput =
                    document.getElementById(
                        "complaint-image"
                    );

                if (imageInput) {
                    imageInput.value =
                        "";
                }

                /* ---------------------------------------------
                   RELOAD COMPLAINTS
                --------------------------------------------- */

                await loadComplaints();

            } catch (err) {
                console.error(
                    "Submit complaint error:",
                    err
                );

                setError(
                    err.message ||
                    "Unable to submit complaint"
                );

            } finally {
                setSubmitting(false);
            }
        };

    /* =========================================================
       DELETE COMPLAINT
    ========================================================= */

    const deleteComplaint =
        async (id) => {
            const confirmDelete =
                window.confirm(
                    "Are you sure you want to delete this complaint?"
                );

            if (!confirmDelete) {
                return;
            }

            try {
                setError("");
                setMessage("");

                const response =
                    await fetch(
                        `${API_URL}/api/complaints/${id}`,
                        {
                            method: "DELETE",

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
                        "Failed to delete complaint"
                    );
                }

                setMessage(
                    data.message ||
                    "Complaint deleted successfully."
                );

                await loadComplaints();

            } catch (err) {
                console.error(
                    "Delete complaint error:",
                    err
                );

                setError(
                    err.message ||
                    "Unable to delete complaint"
                );
            }
        };

    /* =========================================================
       DATE FORMAT
    ========================================================= */

    const formatDate = (
        date
    ) => {
        if (!date) {
            return "N/A";
        }

        return new Date(
            date
        ).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    /* =========================================================
       IMAGE URL
    ========================================================= */

    const getImageUrl = (
        image
    ) => {
        if (!image) {
            return "";
        }

        if (
            image.startsWith(
                "http://"
            ) ||
            image.startsWith(
                "https://"
            )
        ) {
            return image;
        }

        return `${API_URL}${image}`;
    };

    /* =========================================================
       STATS
    ========================================================= */

    const total =
        complaints.length;

    const pending =
        complaints.filter(
            (item) =>
                item.status ===
                "Pending"
        ).length;

    const inProgress =
        complaints.filter(
            (item) =>
                item.status ===
                "In Progress"
        ).length;

    const resolved =
        complaints.filter(
            (item) =>
                item.status ===
                "Resolved"
        ).length;

    /* =========================================================
       UI
    ========================================================= */

    return (
        <div className="complaints-page">

            {/* ==================================================
                HEADER
            ================================================== */}

            <header className="complaints-header">

                <div className="complaints-logo">

                    <span>
                        🏙️
                    </span>

                    <div>
                        <h2>
                            Smart City
                        </h2>

                        <small>
                            Citizen Platform
                        </small>
                    </div>

                </div>

                <nav>

                    <button
                        onClick={() =>
                            navigate(
                                "/dashboard"
                            )
                        }
                    >
                        Home
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/city-services"
                            )
                        }
                    >
                        City Services
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/my-applications"
                            )
                        }
                    >
                        My Applications
                    </button>

                    <button
                        className="active"
                        onClick={() =>
                            navigate(
                                "/my-complaints"
                            )
                        }
                    >
                        My Complaints
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/notifications"
                            )
                        }
                    >
                        Notifications
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/profile"
                            )
                        }
                    >
                        Profile
                    </button>

                </nav>

            </header>

            {/* ==================================================
                MAIN
            ================================================== */}

            <main className="complaints-container">

                <div className="complaints-title">

                    <div>

                        <h1>
                            My Complaints
                        </h1>

                        <p>
                            Report civic issues
                            and track your
                            complaints.
                        </p>

                    </div>

                    <button
                        className="back-dashboard-btn"
                        onClick={() =>
                            navigate(
                                "/dashboard"
                            )
                        }
                    >
                        ← Dashboard
                    </button>

                </div>

                {/* ==================================================
                    MESSAGES
                ================================================== */}

                {message && (
                    <div className="success-message">
                        ✓ {message}
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        ⚠ {error}
                    </div>
                )}

                {/* ==================================================
                    STATS
                ================================================== */}

                <div className="complaint-stats">

                    <div className="stat-card">
                        <div className="stat-icon">
                            📋
                        </div>

                        <div>
                            <span>
                                Total
                            </span>

                            <strong>
                                {total}
                            </strong>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            ⏳
                        </div>

                        <div>
                            <span>
                                Pending
                            </span>

                            <strong>
                                {pending}
                            </strong>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            🔄
                        </div>

                        <div>
                            <span>
                                In Progress
                            </span>

                            <strong>
                                {inProgress}
                            </strong>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            ✓
                        </div>

                        <div>
                            <span>
                                Resolved
                            </span>

                            <strong>
                                {resolved}
                            </strong>
                        </div>
                    </div>

                </div>

                {/* ==================================================
                    NEW COMPLAINT FORM
                ================================================== */}

                <section className="complaint-form-card">

                    <div className="section-heading">

                        <div>

                            <h2>
                                Report New Complaint
                            </h2>

                            <p>
                                Tell us about the
                                civic issue you
                                are facing.
                            </p>

                        </div>

                        <span>
                            📢
                        </span>

                    </div>

                    <form
                        onSubmit={
                            submitComplaint
                        }
                    >

                        <div className="form-grid">

                            {/* CATEGORY */}

                            <div className="form-group">

                                <label>
                                    Category *
                                </label>

                                <select
                                    name="category"
                                    value={
                                        form.category
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                >

                                    <option value="">
                                        Select Category
                                    </option>

                                    <option value="Road">
                                        Road / Pothole
                                    </option>

                                    <option value="Garbage">
                                        Garbage
                                    </option>

                                    <option value="Water">
                                        Water Supply
                                    </option>

                                    <option value="Electricity">
                                        Electricity
                                    </option>

                                    <option value="Street Light">
                                        Street Light
                                    </option>

                                    <option value="Drainage">
                                        Drainage
                                    </option>

                                    <option value="Traffic">
                                        Traffic
                                    </option>

                                    <option value="Public Safety">
                                        Public Safety
                                    </option>

                                    <option value="Other">
                                        Other
                                    </option>

                                </select>

                            </div>

                            {/* PRIORITY */}

                            <div className="form-group">

                                <label>
                                    Priority
                                </label>

                                <select
                                    name="priority"
                                    value={
                                        form.priority
                                    }
                                    onChange={
                                        handleChange
                                    }
                                >

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

                            {/* SUBJECT */}

                            <div className="form-group full">

                                <label>
                                    Subject *
                                </label>

                                <input
                                    type="text"
                                    name="subject"
                                    value={
                                        form.subject
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter complaint subject"
                                    required
                                />

                            </div>

                            {/* DESCRIPTION */}

                            <div className="form-group full">

                                <label>
                                    Description *
                                </label>

                                <textarea
                                    name="description"
                                    value={
                                        form.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Describe the issue in detail..."
                                    rows="5"
                                    required
                                />

                            </div>

                            {/* ADDRESS */}

                            <div className="form-group">

                                <label>
                                    Address
                                </label>

                                <input
                                    type="text"
                                    name="address"
                                    value={
                                        form.address
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Issue location"
                                />

                            </div>

                            {/* CITY */}

                            <div className="form-group">

                                <label>
                                    City
                                </label>

                                <input
                                    type="text"
                                    name="city"
                                    value={
                                        form.city
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="City"
                                />

                            </div>

                            {/* ==================================================
                                IMAGE UPLOAD
                            ================================================== */}

                            <div className="form-group full">

                                <label>
                                    Complaint Image
                                    <span className="optional-label">
                                        Optional
                                    </span>
                                </label>

                                <div className="image-upload-box">

                                    <input
                                        id="complaint-image"
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                        onChange={
                                            handleImageChange
                                        }
                                    />

                                    <label
                                        htmlFor="complaint-image"
                                        className="image-upload-label"
                                    >

                                        <span className="upload-icon">
                                            📷
                                        </span>

                                        <span>
                                            Click to upload
                                            complaint image
                                        </span>

                                        <small>
                                            JPG, PNG, WEBP
                                            • Maximum 5MB
                                        </small>

                                    </label>

                                </div>

                                {/* IMAGE PREVIEW */}

                                {imagePreview && (
                                    <div className="image-preview-box">

                                        <img
                                            src={
                                                imagePreview
                                            }
                                            alt="Complaint preview"
                                        />

                                        <div className="image-preview-info">

                                            <span>
                                                {selectedImage?.name}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={
                                                    removeSelectedImage
                                                }
                                            >
                                                ✕ Remove
                                            </button>

                                        </div>

                                    </div>
                                )}

                            </div>

                        </div>

                        <button
                            type="submit"
                            className="submit-complaint-btn"
                            disabled={
                                submitting
                            }
                        >
                            {submitting
                                ? "Submitting..."
                                : "📢 Submit Complaint"}
                        </button>

                    </form>

                </section>

                {/* ==================================================
                    COMPLAINT LIST
                ================================================== */}

                <section className="my-complaints-section">

                    <div className="section-heading">

                        <div>

                            <h2>
                                Submitted Complaints
                            </h2>

                            <p>
                                Track your complaint
                                status, images and
                                admin replies.
                            </p>

                        </div>

                    </div>

                    {loading ? (

                        <div className="loading-box">
                            Loading complaints...
                        </div>

                    ) : complaints.length ===
                      0 ? (

                        <div className="empty-box">

                            <div className="empty-icon">
                                📭
                            </div>

                            <h3>
                                No complaints
                                submitted yet
                            </h3>

                            <p>
                                If you have a civic
                                issue, use the form
                                above to report it.
                            </p>

                        </div>

                    ) : (

                        <div className="complaints-list">

                            {complaints.map(
                                (complaint) => (

                                    <div
                                        className="complaint-card"
                                        key={
                                            complaint._id
                                        }
                                    >

                                        {/* TOP */}

                                        <div className="complaint-card-top">

                                            <div>

                                                <span className="complaint-id">
                                                    {
                                                        complaint.complaintId
                                                    }
                                                </span>

                                                <h3>
                                                    {
                                                        complaint.subject
                                                    }
                                                </h3>

                                            </div>

                                            <span
                                                className={
                                                    `status-badge status-${(
                                                        complaint.status ||
                                                        "Pending"
                                                    )
                                                        .toLowerCase()
                                                        .replace(
                                                            /\s+/g,
                                                            "-"
                                                        )}`
                                                }
                                            >
                                                {
                                                    complaint.status
                                                }
                                            </span>

                                        </div>

                                        {/* DETAILS */}

                                        <div className="complaint-details">

                                            <div>
                                                <strong>
                                                    Category
                                                </strong>

                                                <span>
                                                    {
                                                        complaint.category
                                                    }
                                                </span>
                                            </div>

                                            <div>
                                                <strong>
                                                    Priority
                                                </strong>

                                                <span
                                                    className={
                                                        `priority-${(
                                                            complaint.priority ||
                                                            "Medium"
                                                        ).toLowerCase()}`
                                                    }
                                                >
                                                    {
                                                        complaint.priority
                                                    }
                                                </span>
                                            </div>

                                            <div>
                                                <strong>
                                                    Date
                                                </strong>

                                                <span>
                                                    {formatDate(
                                                        complaint.createdAt
                                                    )}
                                                </span>
                                            </div>

                                        </div>

                                        {/* DESCRIPTION */}

                                        <div className="complaint-description">

                                            <strong>
                                                Description
                                            </strong>

                                            <p>
                                                {
                                                    complaint.description
                                                }
                                            </p>

                                        </div>

                                        {/* ==================================================
                                            COMPLAINT IMAGE
                                        ================================================== */}

                                        {complaint.image && (

                                            <div className="complaint-image-section">

                                                <strong>
                                                    📷 Uploaded Image
                                                </strong>

                                                <a
                                                    href={
                                                        getImageUrl(
                                                            complaint.image
                                                        )
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >

                                                    <img
                                                        src={
                                                            getImageUrl(
                                                                complaint.image
                                                            )
                                                        }
                                                        alt="Complaint"
                                                        className="complaint-image"
                                                    />

                                                </a>

                                                <small>
                                                    Click image
                                                    to view full
                                                    size
                                                </small>

                                            </div>

                                        )}

                                        {/* LOCATION */}

                                        {complaint.address && (

                                            <div className="complaint-location">

                                                📍{" "}

                                                {
                                                    complaint.address
                                                }

                                                {complaint.city
                                                    ? `, ${complaint.city}`
                                                    : ""}

                                            </div>

                                        )}

                                        {/* ADMIN REPLY */}

                                        {complaint.adminReply && (

                                            <div className="admin-reply">

                                                <strong>
                                                    💬 Admin Reply
                                                </strong>

                                                <p>
                                                    {
                                                        complaint.adminReply
                                                    }
                                                </p>

                                            </div>

                                        )}

                                        {/* FOOTER */}

                                        <div className="complaint-card-footer">

                                            <span>
                                                Complaint ID:{" "}

                                                <strong>
                                                    {
                                                        complaint.complaintId
                                                    }
                                                </strong>
                                            </span>

                                            {complaint.status ===
                                                "Pending" && (

                                                <button
                                                    className="delete-complaint-btn"
                                                    onClick={() =>
                                                        deleteComplaint(
                                                            complaint._id
                                                        )
                                                    }
                                                >
                                                    🗑 Delete
                                                </button>

                                            )}

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
};

export default MyComplaints;