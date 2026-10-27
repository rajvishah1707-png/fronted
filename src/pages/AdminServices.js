import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminServices.css";

function AdminServices() {

    const navigate = useNavigate();

    const [services, setServices] = useState([]);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);

    const [editingService, setEditingService] =
        useState(null);

    const [error, setError] = useState("");

    const [form, setForm] = useState({
        name: "",
        description: "",
        category: "",
        icon: "🏙️",
        eligibility: "",
        requiredDocuments: "",
        fees: "Free",
        processingTime: "3-5 working days",
        contact: "Municipal Office",
        status: "active"
    });


    // ==================================================
    // LOAD SERVICES
    // ==================================================

    const loadServices = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await fetch(
                "http://localhost:5000/api/services/admin/all"
            );

            const data = await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to load services"
                );

            }

            setServices(
                data.services || []
            );

        } catch (error) {

            console.error(
                "ADMIN SERVICES ERROR:",
                error
            );

            setError(
                error.message ||
                "Unable to load services"
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadServices();

    }, []);


    // ==================================================
    // FORM CHANGE
    // ==================================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));

    };


    // ==================================================
    // OPEN ADD MODAL
    // ==================================================

    const openAddModal = () => {

        setEditingService(null);

        setForm({
            name: "",
            description: "",
            category: "",
            icon: "🏙️",
            eligibility: "",
            requiredDocuments: "",
            fees: "Free",
            processingTime: "3-5 working days",
            contact: "Municipal Office",
            status: "active"
        });

        setError("");

        setShowModal(true);

    };


    // ==================================================
    // OPEN EDIT MODAL
    // ==================================================

    const openEditModal = (service) => {

        setEditingService(service);

        setForm({
            name: service.name || "",
            description:
                service.description || "",
            category:
                service.category || "",
            icon:
                service.icon || "🏙️",
            eligibility:
                service.eligibility || "",
            requiredDocuments:
                Array.isArray(
                    service.requiredDocuments
                )
                    ? service.requiredDocuments.join(
                        ", "
                    )
                    : "",
            fees:
                service.fees || "Free",
            processingTime:
                service.processingTime ||
                "3-5 working days",
            contact:
                service.contact ||
                "Municipal Office",
            status:
                service.status || "active"
        });

        setError("");

        setShowModal(true);

    };


    // ==================================================
    // CLOSE MODAL
    // ==================================================

    const closeModal = () => {

        if (saving) return;

        setShowModal(false);

        setEditingService(null);

    };


    // ==================================================
    // SAVE SERVICE
    // ==================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setSaving(true);
            setError("");

            if (
                !form.name.trim() ||
                !form.description.trim() ||
                !form.category.trim()
            ) {

                setError(
                    "Please fill Name, Description and Category."
                );

                setSaving(false);

                return;
            }


            const payload = {

                name: form.name.trim(),

                description:
                    form.description.trim(),

                category:
                    form.category.trim(),

                icon:
                    form.icon.trim() ||
                    "🏙️",

                eligibility:
                    form.eligibility.trim() ||
                    "Available for citizens",

                requiredDocuments:
                    form.requiredDocuments
                        .split(",")
                        .map(
                            (item) =>
                                item.trim()
                        )
                        .filter(Boolean),

                fees:
                    form.fees.trim() ||
                    "Free",

                processingTime:
                    form.processingTime.trim() ||
                    "3-5 working days",

                contact:
                    form.contact.trim() ||
                    "Municipal Office",

                status:
                    form.status
            };


            let response;


            // ==========================================
            // UPDATE
            // ==========================================

            if (editingService) {

                response = await fetch(
                    `http://localhost:5000/api/services/${editingService._id}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                payload
                            )
                    }
                );

            }

            // ==========================================
            // CREATE
            // ==========================================

            else {

                response = await fetch(
                    "http://localhost:5000/api/services",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                payload
                            )
                    }
                );

            }


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to save service"
                );

            }


            setShowModal(false);

            setEditingService(null);

            await loadServices();


        } catch (error) {

            console.error(
                "SAVE SERVICE ERROR:",
                error
            );

            setError(
                error.message ||
                "Unable to save service"
            );

        } finally {

            setSaving(false);

        }

    };


    // ==================================================
    // DELETE SERVICE
    // ==================================================

    const handleDelete = async (service) => {

        const confirmDelete =
            window.confirm(
                `Are you sure you want to delete "${service.name}"?`
            );


        if (!confirmDelete) {
            return;
        }


        try {

            const response =
                await fetch(
                    `http://localhost:5000/api/services/${service._id}`,
                    {
                        method: "DELETE"
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to delete service"
                );

            }


            await loadServices();


        } catch (error) {

            console.error(
                "DELETE SERVICE ERROR:",
                error
            );

            alert(
                error.message ||
                "Unable to delete service"
            );

        }

    };


    // ==================================================
    // TOGGLE STATUS
    // ==================================================

    const toggleStatus = async (service) => {

        try {

            const newStatus =
                service.status === "active"
                    ? "inactive"
                    : "active";


            const response =
                await fetch(
                    `http://localhost:5000/api/services/${service._id}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            status: newStatus
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to update status"
                );

            }


            await loadServices();


        } catch (error) {

            console.error(
                "STATUS UPDATE ERROR:",
                error
            );

            alert(
                error.message ||
                "Unable to update status"
            );

        }

    };


    // ==================================================
    // SEARCH
    // ==================================================

    const filteredServices =
        services.filter((service) => {

            const text =
                `${service.name} ${service.category} ${service.description}`
                    .toLowerCase();

            return text.includes(
                search.toLowerCase()
            );

        });


    // ==================================================
    // RENDER
    // ==================================================

    return (

        <div className="admin-services-page">


            {/* HEADER */}

            <header className="admin-services-header">

                <div className="admin-services-brand">

                    <div className="admin-logo">
                        SC
                    </div>

                    <div>
                        <h2>
                            Smart City
                        </h2>

                        <p>
                            Administration Portal
                        </p>
                    </div>

                </div>


                <button
                    className="back-dashboard-btn"
                    onClick={() =>
                        navigate(
                            "/admin-dashboard"
                        )
                    }
                >
                    ← Dashboard
                </button>

            </header>


            {/* MAIN */}

            <main className="admin-services-main">


                {/* PAGE HEADER */}

                <section className="services-page-title">

                    <div>

                        <span>
                            ADMIN CONTROL
                        </span>

                        <h1>
                            City Services
                        </h1>

                        <p>
                            Add, edit, delete and manage
                            Smart City services.
                        </p>

                    </div>


                    <button
                        className="add-service-btn"
                        onClick={
                            openAddModal
                        }
                    >
                        + Add New Service
                    </button>

                </section>


                {/* SEARCH */}

                <section className="services-toolbar">

                    <div className="search-box">

                        <span>
                            🔍
                        </span>

                        <input
                            type="text"
                            placeholder="Search services..."
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    <div className="service-count">

                        {filteredServices.length}
                        {" "}
                        Services

                    </div>

                </section>


                {/* ERROR */}

                {error && (

                    <div className="admin-error">
                        {error}
                    </div>

                )}


                {/* LOADING */}

                {loading ? (

                    <div className="services-loading">

                        <div className="loading-spinner"></div>

                        <p>
                            Loading services...
                        </p>

                    </div>

                ) : filteredServices.length === 0 ? (

                    <div className="empty-services">

                        <div>
                            🏙️
                        </div>

                        <h2>
                            No Services Found
                        </h2>

                        <p>
                            Add your first city service
                            to get started.
                        </p>

                        <button
                            onClick={
                                openAddModal
                            }
                        >
                            + Add Service
                        </button>

                    </div>

                ) : (

                    <section className="admin-services-grid">

                        {filteredServices.map(
                            (service) => (

                                <div
                                    className="admin-service-card"
                                    key={
                                        service._id
                                    }
                                >

                                    <div className="service-card-top">

                                        <div className="service-icon">

                                            {service.icon ||
                                                "🏙️"}

                                        </div>


                                        <span
                                            className={
                                                service.status ===
                                                "active"
                                                    ? "status-active"
                                                    : "status-inactive"
                                            }
                                        >
                                            {service.status}
                                        </span>

                                    </div>


                                    <div className="service-card-body">

                                        <span className="service-category">
                                            {service.category}
                                        </span>

                                        <h2>
                                            {service.name}
                                        </h2>

                                        <p>
                                            {
                                                service.description
                                            }
                                        </p>


                                        <div className="service-details">

                                            <div>
                                                <span>
                                                    💰 Fees
                                                </span>

                                                <strong>
                                                    {
                                                        service.fees ||
                                                        "Free"
                                                    }
                                                </strong>
                                            </div>


                                            <div>
                                                <span>
                                                    ⏱️ Processing
                                                </span>

                                                <strong>
                                                    {
                                                        service.processingTime ||
                                                        "—"
                                                    }
                                                </strong>
                                            </div>

                                        </div>

                                    </div>


                                    <div className="service-card-actions">

                                        <button
                                            className="edit-btn"
                                            onClick={() =>
                                                openEditModal(
                                                    service
                                                )
                                            }
                                        >
                                            ✏️ Edit
                                        </button>


                                        <button
                                            className="status-btn"
                                            onClick={() =>
                                                toggleStatus(
                                                    service
                                                )
                                            }
                                        >
                                            {service.status ===
                                            "active"
                                                ? "🔴 Disable"
                                                : "🟢 Activate"}
                                        </button>


                                        <button
                                            className="delete-btn"
                                            onClick={() =>
                                                handleDelete(
                                                    service
                                                )
                                            }
                                        >
                                            🗑️ Delete
                                        </button>

                                    </div>

                                </div>

                            )
                        )}

                    </section>

                )}

            </main>


            {/* ==========================================
                ADD / EDIT MODAL
            ========================================== */}

            {showModal && (

                <div
                    className="service-modal-overlay"
                    onMouseDown={(e) => {

                        if (
                            e.target.className ===
                            "service-modal-overlay"
                        ) {
                            closeModal();
                        }

                    }}
                >

                    <div className="service-modal">

                        <div className="modal-header">

                            <div>

                                <span>
                                    ADMIN SERVICE
                                </span>

                                <h2>
                                    {editingService
                                        ? "Edit Service"
                                        : "Add New Service"}
                                </h2>

                            </div>


                            <button
                                className="modal-close"
                                onClick={
                                    closeModal
                                }
                            >
                                ×
                            </button>

                        </div>


                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >

                            <div className="form-grid">


                                <div className="form-group">

                                    <label>
                                        Service Name *
                                    </label>

                                    <input
                                        name="name"
                                        value={
                                            form.name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. Water Connection"
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Category *
                                    </label>

                                    <input
                                        name="category"
                                        value={
                                            form.category
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. Utilities"
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Icon
                                    </label>

                                    <input
                                        name="icon"
                                        value={
                                            form.icon
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="💧"
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Fees
                                    </label>

                                    <input
                                        name="fees"
                                        value={
                                            form.fees
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Free"
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Processing Time
                                    </label>

                                    <input
                                        name="processingTime"
                                        value={
                                            form.processingTime
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="3-5 working days"
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Contact
                                    </label>

                                    <input
                                        name="contact"
                                        value={
                                            form.contact
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Municipal Office"
                                    />

                                </div>


                                <div className="form-group full-width">

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
                                        placeholder="Enter service description..."
                                        rows="4"
                                    />

                                </div>


                                <div className="form-group full-width">

                                    <label>
                                        Eligibility
                                    </label>

                                    <textarea
                                        name="eligibility"
                                        value={
                                            form.eligibility
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Who can apply for this service?"
                                        rows="3"
                                    />

                                </div>


                                <div className="form-group full-width">

                                    <label>
                                        Required Documents
                                    </label>

                                    <input
                                        name="requiredDocuments"
                                        value={
                                            form.requiredDocuments
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Identity Proof, Address Proof"
                                    />

                                    <small>
                                        Separate multiple
                                        documents with commas.
                                    </small>

                                </div>


                                <div className="form-group">

                                    <label>
                                        Status
                                    </label>

                                    <select
                                        name="status"
                                        value={
                                            form.status
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        <option value="active">
                                            Active
                                        </option>

                                        <option value="inactive">
                                            Inactive
                                        </option>

                                    </select>

                                </div>

                            </div>


                            {error && (

                                <div className="modal-error">
                                    {error}
                                </div>

                            )}


                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={
                                        closeModal
                                    }
                                    disabled={
                                        saving
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="save-service-btn"
                                    disabled={
                                        saving
                                    }
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingService
                                            ? "Update Service"
                                            : "Create Service"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

export default AdminServices;