import React, {
    useEffect,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import "./Citizens.css";


const API_URL =
    "http://localhost:5000/api/admin";


const BACKEND_URL =
    "http://localhost:5000";


const emptyForm = {

    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    password: ""

};


const Citizens = () => {

    const navigate =
        useNavigate();


    const [citizens, setCitizens] =
        useState([]);


    const [loading, setLoading] =
        useState(true);


    const [search, setSearch] =
        useState("");


    const [statusFilter, setStatusFilter] =
        useState("all");


    const [showModal, setShowModal] =
        useState(false);


    const [showViewModal, setShowViewModal] =
        useState(false);


    const [editingCitizen, setEditingCitizen] =
        useState(null);


    const [selectedCitizen, setSelectedCitizen] =
        useState(null);


    const [formData, setFormData] =
        useState(emptyForm);


    const [saving, setSaving] =
        useState(false);


    /* =====================================================
       IMAGE URL
    ===================================================== */

    const getProfileImageUrl =
        (profileImage) => {

            if (!profileImage) {
                return "";
            }


            if (
                profileImage.startsWith(
                    "http://"
                ) ||
                profileImage.startsWith(
                    "https://"
                )
            ) {
                return profileImage;
            }


            return `${BACKEND_URL}${profileImage}`;

        };


    /* =====================================================
       LOAD CITIZENS
    ===================================================== */

    const loadCitizens = async () => {

        try {

            setLoading(true);


            const response =
                await fetch(
                    `${API_URL}/users`
                );


            const data =
                await response.json();


            if (data.success) {

                setCitizens(
                    data.users || []
                );

            } else {

                alert(
                    data.message ||
                    "Failed to load citizens"
                );

            }


        } catch (error) {

            console.error(
                "Load Citizens Error:",
                error
            );


            alert(
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

        loadCitizens();

    }, []);


    /* =====================================================
       FORM CHANGE
    ===================================================== */

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setFormData(
            (previous) => ({
                ...previous,
                [name]: value
            })
        );

    };


    /* =====================================================
       ADD CITIZEN
    ===================================================== */

    const handleAdd = () => {

        setEditingCitizen(
            null
        );


        setFormData({
            ...emptyForm
        });


        setShowModal(
            true
        );

    };


    /* =====================================================
       EDIT CITIZEN
    ===================================================== */

    const handleEdit = (
        citizen
    ) => {

        setEditingCitizen(
            citizen
        );


        setFormData({

            name:
                citizen.name ||
                "",

            email:
                citizen.email ||
                "",

            phone:
                citizen.phone ||
                "",

            address:
                citizen.address ||
                "",

            city:
                citizen.city ||
                "",

            pincode:
                citizen.pincode ||
                "",

            password:
                ""

        });


        setShowModal(
            true
        );

    };


    /* =====================================================
       VIEW CITIZEN
    ===================================================== */

    const handleView = (
        citizen
    ) => {

        setSelectedCitizen(
            citizen
        );


        setShowViewModal(
            true
        );

    };


    /* =====================================================
       ADD / UPDATE CITIZEN
    ===================================================== */

    const handleSubmit = async (
        e
    ) => {

        e.preventDefault();


        if (
            !formData.name.trim()
        ) {

            alert(
                "Please enter citizen name"
            );

            return;

        }


        if (
            !formData.email.trim()
        ) {

            alert(
                "Please enter email"
            );

            return;

        }


        if (
            !formData.phone.trim()
        ) {

            alert(
                "Please enter phone number"
            );

            return;

        }


        if (
            !editingCitizen &&
            !formData.password.trim()
        ) {

            alert(
                "Please enter password"
            );

            return;

        }


        try {

            setSaving(true);


            let url =
                `${API_URL}/users`;


            let method =
                "POST";


            if (
                editingCitizen
            ) {

                url =
                    `${API_URL}/users/${editingCitizen._id}`;

                method =
                    "PUT";

            }


            const response =
                await fetch(
                    url,
                    {

                        method,

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                formData
                            )

                    }
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                alert(
                    data.message ||
                    "Operation failed"
                );

                return;

            }


            alert(
                editingCitizen
                    ? "Citizen updated successfully"
                    : "Citizen added successfully"
            );


            setShowModal(
                false
            );


            setEditingCitizen(
                null
            );


            setFormData({
                ...emptyForm
            });


            await loadCitizens();


        } catch (error) {

            console.error(
                "Save Citizen Error:",
                error
            );


            alert(
                "Cannot connect to backend server."
            );

        } finally {

            setSaving(false);

        }

    };


    /* =====================================================
       DELETE CITIZEN
    ===================================================== */

    const handleDelete = async (
        citizen
    ) => {

        const confirmed =
            window.confirm(
                `Are you sure you want to delete ${citizen.name}?`
            );


        if (!confirmed) {
            return;
        }


        try {

            const response =
                await fetch(
                    `${API_URL}/users/${citizen._id}`,
                    {
                        method: "DELETE"
                    }
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                alert(
                    data.message ||
                    "Failed to delete citizen"
                );

                return;

            }


            alert(
                "Citizen deleted successfully"
            );


            await loadCitizens();


        } catch (error) {

            console.error(
                "Delete Error:",
                error
            );


            alert(
                "Cannot connect to backend server."
            );

        }

    };


    /* =====================================================
   ACTIVATE / DEACTIVATE CITIZEN
===================================================== */

const handleStatus = async (citizen) => {
    const newStatus = !citizen.isActive;

    const action = newStatus
        ? "activate"
        : "deactivate";

    const confirmed = window.confirm(
        `Are you sure you want to ${action} ${citizen.name}?`
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/users/${citizen._id}/status`,
            {
                method: "PATCH",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    isActive: newStatus
                })
            }
        );

        const data = await response.json();

        console.log("Status Update Response:", data);

        if (!response.ok || !data.success) {
            alert(
                data.message ||
                "Failed to update citizen status"
            );

            return;
        }

        alert(data.message);

        await loadCitizens();

    } catch (error) {
        console.error(
            "Status Update Error:",
            error
        );

        alert(
            "Cannot connect to backend server."
        );
    }
};

    /* =====================================================
       SEARCH + FILTER
    ===================================================== */

    const filteredCitizens =
        citizens.filter(
            (citizen) => {

                const searchText =
                    search
                        .toLowerCase()
                        .trim();


                const matchesSearch =
                    !searchText ||
                    citizen.name
                        ?.toLowerCase()
                        .includes(
                            searchText
                        ) ||
                    citizen.email
                        ?.toLowerCase()
                        .includes(
                            searchText
                        ) ||
                    citizen.phone
                        ?.toLowerCase()
                        .includes(
                            searchText
                        ) ||
                    citizen.city
                        ?.toLowerCase()
                        .includes(
                            searchText
                        );


                const matchesStatus =
                    statusFilter ===
                        "all" ||

                    (
                        statusFilter ===
                            "active" &&
                        citizen.isActive ===
                            true
                    ) ||

                    (
                        statusFilter ===
                            "inactive" &&
                        citizen.isActive ===
                            false
                    );


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    /* =====================================================
       SUMMARY
    ===================================================== */

    const totalCitizens =
        citizens.length;


    const activeCitizens =
        citizens.filter(
            (citizen) =>
                citizen.isActive ===
                true
        ).length;


    const inactiveCitizens =
        citizens.filter(
            (citizen) =>
                citizen.isActive ===
                false
        ).length;


    const totalLogins =
        citizens.reduce(
            (
                total,
                citizen
            ) =>
                total +
                (
                    citizen.loginCount ||
                    0
                ),
            0
        );


    /* =====================================================
       DATE FORMAT
    ===================================================== */

    const formatDate = (
        date
    ) => {

        if (!date) {
            return "Never";
        }


        return new Date(
            date
        ).toLocaleString(
            "en-IN",
            {

                day:
                    "2-digit",

                month:
                    "short",

                year:
                    "numeric",

                hour:
                    "2-digit",

                minute:
                    "2-digit"

            }
        );

    };


    /* =====================================================
       LOGOUT
    ===================================================== */

    const handleLogout = () => {

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "user"
        );


        localStorage.removeItem(
            "smartCityToken"
        );

        localStorage.removeItem(
            "smartCityUser"
        );


        navigate(
            "/login"
        );

    };


    /* =====================================================
       AVATAR STYLE
    ===================================================== */

    const avatarStyle = {

        width:
            "38px",

        height:
            "38px",

        borderRadius:
            "50%",

        objectFit:
            "cover",

        display:
            "block"

    };


    /* =====================================================
       LARGE AVATAR STYLE
    ===================================================== */

    const largeAvatarStyle = {

        width:
            "78px",

        height:
            "78px",

        borderRadius:
            "50%",

        objectFit:
            "cover",

        display:
            "block",

        margin:
            "0 auto 12px"

    };


    /* =====================================================
       UI
    ===================================================== */

    return (

        <div className="citizens-page">

            {/* ================= SIDEBAR ================= */}

            <aside className="citizens-sidebar">

                <div className="sidebar-logo">

                    <div className="logo-icon">
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


                <nav className="sidebar-menu">

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
                        className="active"
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
                    className="sidebar-logout"
                    onClick={
                        handleLogout
                    }
                >
                    <span>🚪</span>
                    Logout
                </button>

            </aside>


            {/* ================= MAIN ================= */}

            <main className="citizens-main">

                <div className="citizens-header">

                    <div>

                        <h1>
                            Citizens Management
                        </h1>

                        <p>
                            Manage all registered
                            Smart City citizens
                        </p>

                    </div>


                    <button
                        className="add-citizen-btn"
                        onClick={
                            handleAdd
                        }
                    >
                        + Add Citizen
                    </button>

                </div>


                {/* ================= SUMMARY ================= */}

                <div className="citizens-summary">

                    <div className="summary-card">

                        <div className="summary-icon">
                            👥
                        </div>

                        <div>

                            <span>
                                Total Citizens
                            </span>

                            <strong>
                                {totalCitizens}
                            </strong>

                        </div>

                    </div>


                    <div className="summary-card">

                        <div className="summary-icon">
                            ✅
                        </div>

                        <div>

                            <span>
                                Active Citizens
                            </span>

                            <strong>
                                {activeCitizens}
                            </strong>

                        </div>

                    </div>


                    <div className="summary-card">

                        <div className="summary-icon">
                            ⏸️
                        </div>

                        <div>

                            <span>
                                Inactive Citizens
                            </span>

                            <strong>
                                {inactiveCitizens}
                            </strong>

                        </div>

                    </div>


                    <div className="summary-card">

                        <div className="summary-icon">
                            🔐
                        </div>

                        <div>

                            <span>
                                Total Logins
                            </span>

                            <strong>
                                {totalLogins}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* ================= TOOLBAR ================= */}

                <div className="citizens-toolbar">

                    <div className="search-box">

                        <span>
                            🔍
                        </span>

                        <input
                            type="text"
                            placeholder="Search name, email, phone or city..."
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

                        <option value="all">
                            All Citizens
                        </option>

                        <option value="active">
                            Active
                        </option>

                        <option value="inactive">
                            Inactive
                        </option>

                    </select>


                    <button
                        className="refresh-btn"
                        onClick={
                            loadCitizens
                        }
                    >
                        🔄 Refresh
                    </button>

                </div>


                {/* ================= TABLE ================= */}

                <div className="citizens-table-container">

                    {loading ? (

                        <div className="loading-box">
                            Loading citizens...
                        </div>

                    ) : filteredCitizens.length === 0 ? (

                        <div className="empty-box">

                            <div>
                                👥
                            </div>

                            <h3>
                                No Citizens Found
                            </h3>

                            <p>
                                No citizens match
                                your search or
                                filter.
                            </p>

                        </div>

                    ) : (

                        <table className="citizens-table">

                            <thead>

                                <tr>

                                    <th>
                                        Citizen
                                    </th>

                                    <th>
                                        Contact
                                    </th>

                                    <th>
                                        Location
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Logins
                                    </th>

                                    <th>
                                        Last Login
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredCitizens.map(
                                    (citizen) => (

                                        <tr
                                            key={
                                                citizen._id
                                            }
                                        >

                                            <td>

                                                <div className="citizen-name">

                                                    <div
                                                        className="citizen-avatar"
                                                        style={{
                                                            overflow:
                                                                "hidden"
                                                        }}
                                                    >

                                                        {citizen.profileImage ? (

                                                            <img
                                                                src={
                                                                    getProfileImageUrl(
                                                                        citizen.profileImage
                                                                    )
                                                                }
                                                                alt={
                                                                    citizen.name
                                                                }
                                                                style={
                                                                    avatarStyle
                                                                }
                                                            />

                                                        ) : (

                                                            citizen.name
                                                                ?.charAt(
                                                                    0
                                                                )
                                                                .toUpperCase()

                                                        )}

                                                    </div>


                                                    <div>

                                                        <strong>
                                                            {
                                                                citizen.name
                                                            }
                                                        </strong>

                                                        <small>
                                                            {
                                                                citizen.email
                                                            }
                                                        </small>

                                                    </div>

                                                </div>

                                            </td>


                                            <td>
                                                {
                                                    citizen.phone ||
                                                    "-"
                                                }
                                            </td>


                                            <td>
                                                {
                                                    citizen.city ||
                                                    "-"
                                                }
                                            </td>


                                            <td>

                                                <span
                                                    className={
                                                        citizen.isActive
                                                            ? "status-badge active"
                                                            : "status-badge inactive"
                                                    }
                                                >

                                                    {
                                                        citizen.isActive
                                                            ? "Active"
                                                            : "Inactive"
                                                    }

                                                </span>

                                            </td>


                                            <td>

                                                <strong>
                                                    {
                                                        citizen.loginCount ||
                                                        0
                                                    }
                                                </strong>

                                            </td>


                                            <td>
                                                {
                                                    formatDate(
                                                        citizen.lastLogin
                                                    )
                                                }
                                            </td>


                                            <td>

                                                <div className="action-buttons">

                                                    <button
                                                        className="view-btn"
                                                        title="View"
                                                        onClick={() =>
                                                            handleView(
                                                                citizen
                                                            )
                                                        }
                                                    >
                                                        👁
                                                    </button>


                                                    <button
                                                        className="edit-btn"
                                                        title="Edit"
                                                        onClick={() =>
                                                            handleEdit(
                                                                citizen
                                                            )
                                                        }
                                                    >
                                                        ✏️
                                                    </button>


                                                    <button
                                                        className={
                                                            citizen.isActive
                                                                ? "status-btn deactivate"
                                                                : "status-btn activate"
                                                        }
                                                        title={
                                                            citizen.isActive
                                                                ? "Deactivate"
                                                                : "Activate"
                                                        }
                                                        onClick={() =>
                                                            handleStatus(
                                                                citizen
                                                            )
                                                        }
                                                    >
                                                        {
                                                            citizen.isActive
                                                                ? "⏸"
                                                                : "▶"
                                                        }
                                                    </button>


                                                    <button
                                                        className="delete-btn"
                                                        title="Delete"
                                                        onClick={() =>
                                                            handleDelete(
                                                                citizen
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


                {/* ================= ADD / EDIT MODAL ================= */}

                {showModal && (

                    <div className="modal-overlay">

                        <div className="citizen-modal">

                            <div className="modal-header">

                                <div>

                                    <h2>
                                        {
                                            editingCitizen
                                                ? "Edit Citizen"
                                                : "Add Citizen"
                                        }
                                    </h2>

                                    <p>
                                        {
                                            editingCitizen
                                                ? "Update citizen information"
                                                : "Create a new citizen account"
                                        }
                                    </p>

                                </div>


                                <button
                                    className="close-modal"
                                    onClick={() =>
                                        setShowModal(
                                            false
                                        )
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
                                            Full Name *
                                        </label>

                                        <input
                                            type="text"
                                            name="name"
                                            value={
                                                formData.name
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Enter full name"
                                            required
                                        />

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Email *
                                        </label>

                                        <input
                                            type="email"
                                            name="email"
                                            value={
                                                formData.email
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Enter email"
                                            required
                                        />

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Phone *
                                        </label>

                                        <input
                                            type="text"
                                            name="phone"
                                            value={
                                                formData.phone
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Enter phone"
                                            required
                                        />

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            City
                                        </label>

                                        <input
                                            type="text"
                                            name="city"
                                            value={
                                                formData.city
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Enter city"
                                        />

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Pincode
                                        </label>

                                        <input
                                            type="text"
                                            name="pincode"
                                            value={
                                                formData.pincode
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Enter pincode"
                                        />

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Password
                                            {
                                                !editingCitizen &&
                                                " *"
                                            }
                                        </label>

                                        <input
                                            type="password"
                                            name="password"
                                            value={
                                                formData.password
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder={
                                                editingCitizen
                                                    ? "Leave blank to keep current password"
                                                    : "Enter password"
                                            }
                                            required={
                                                !editingCitizen
                                            }
                                        />

                                    </div>


                                    <div className="form-group full-width">

                                        <label>
                                            Address
                                        </label>

                                        <textarea
                                            name="address"
                                            value={
                                                formData.address
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Enter full address"
                                            rows="3"
                                        />

                                    </div>

                                </div>


                                <div className="modal-actions">

                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={() =>
                                            setShowModal(
                                                false
                                            )
                                        }
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        type="submit"
                                        className="save-btn"
                                        disabled={
                                            saving
                                        }
                                    >

                                        {
                                            saving
                                                ? "Saving..."
                                                : editingCitizen
                                                    ? "Update Citizen"
                                                    : "Add Citizen"
                                        }

                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                )}


                {/* ================= VIEW MODAL ================= */}

                {showViewModal &&
                    selectedCitizen && (

                        <div className="modal-overlay">

                            <div className="view-modal">

                                <div className="modal-header">

                                    <div>

                                        <h2>
                                            Citizen Profile
                                        </h2>

                                        <p>
                                            Complete citizen details
                                        </p>

                                    </div>


                                    <button
                                        className="close-modal"
                                        onClick={() =>
                                            setShowViewModal(
                                                false
                                            )
                                        }
                                    >
                                        ×
                                    </button>

                                </div>


                                <div className="profile-section">

                                    {selectedCitizen.profileImage ? (

                                        <img
                                            src={
                                                getProfileImageUrl(
                                                    selectedCitizen.profileImage
                                                )
                                            }
                                            alt={
                                                selectedCitizen.name
                                            }
                                            style={
                                                largeAvatarStyle
                                            }
                                        />

                                    ) : (

                                        <div
                                            className="large-avatar"
                                        >
                                            {
                                                selectedCitizen.name
                                                    ?.charAt(
                                                        0
                                                    )
                                                    .toUpperCase()
                                            }
                                        </div>

                                    )}


                                    <h2>
                                        {
                                            selectedCitizen.name
                                        }
                                    </h2>


                                    <span
                                        className={
                                            selectedCitizen.isActive
                                                ? "status-badge active"
                                                : "status-badge inactive"
                                        }
                                    >
                                        {
                                            selectedCitizen.isActive
                                                ? "Active"
                                                : "Inactive"
                                        }
                                    </span>

                                </div>


                                <div className="profile-details">

                                    <div>

                                        <span>
                                            Email
                                        </span>

                                        <strong>
                                            {
                                                selectedCitizen.email ||
                                                "-"
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Phone
                                        </span>

                                        <strong>
                                            {
                                                selectedCitizen.phone ||
                                                "-"
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            City
                                        </span>

                                        <strong>
                                            {
                                                selectedCitizen.city ||
                                                "-"
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Pincode
                                        </span>

                                        <strong>
                                            {
                                                selectedCitizen.pincode ||
                                                "-"
                                            }
                                        </strong>

                                    </div>


                                    <div className="full-detail">

                                        <span>
                                            Address
                                        </span>

                                        <strong>
                                            {
                                                selectedCitizen.address ||
                                                "-"
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Login Count
                                        </span>

                                        <strong>
                                            {
                                                selectedCitizen.loginCount ||
                                                0
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Last Login
                                        </span>

                                        <strong>
                                            {
                                                formatDate(
                                                    selectedCitizen.lastLogin
                                                )
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Registration Date
                                        </span>

                                        <strong>
                                            {
                                                formatDate(
                                                    selectedCitizen.createdAt
                                                )
                                            }
                                        </strong>

                                    </div>

                                </div>


                                <div className="modal-actions">

                                    <button
                                        className="cancel-btn"
                                        onClick={() =>
                                            setShowViewModal(
                                                false
                                            )
                                        }
                                    >
                                        Close
                                    </button>


                                    <button
                                        className="save-btn"
                                        onClick={() => {

                                            setShowViewModal(
                                                false
                                            );

                                            handleEdit(
                                                selectedCitizen
                                            );

                                        }}
                                    >
                                        ✏️ Edit Citizen
                                    </button>

                                </div>

                            </div>

                        </div>

                    )}

            </main>

        </div>

    );

};


export default Citizens;