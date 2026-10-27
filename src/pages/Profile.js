import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const API_URL = "http://localhost:5000";

const Profile = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [user, setUser] = useState({
        name: "",
        email: "",
        phone: "",
        role: "citizen",
        profileImage: ""
    });

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: ""
    });

    const [profileImage, setProfileImage] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    /* =========================
       LOAD USER
    ========================= */

    useEffect(() => {
        const token = localStorage.getItem("smartCityToken");
        const savedUser = localStorage.getItem("smartCityUser");

        if (!token || !savedUser) {
            navigate("/login", {
                replace: true
            });
            return;
        }

        try {
            const parsedUser = JSON.parse(savedUser);

            setUser(parsedUser);

            setFormData({
                name: parsedUser.name || "",
                email: parsedUser.email || "",
                phone: parsedUser.phone || ""
            });

            setProfileImage(parsedUser.profileImage || "");
        } catch (error) {
            console.error("Profile user error:", error);

            localStorage.removeItem("smartCityToken");
            localStorage.removeItem("smartCityUser");

            navigate("/login", {
                replace: true
            });
        }
    }, [navigate]);

    /* =========================
       INPUT CHANGE
    ========================= */

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        setMessage("");
        setError("");
    };

    /* =========================
       CHANGE PHOTO
    ========================= */

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.type)) {
            setError(
                "Please select a JPG, PNG or WEBP image."
            );
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError(
                "Image size must be less than 5 MB."
            );
            return;
        }

        setSelectedFile(file);
        setError("");
        setMessage("");

        const reader = new FileReader();

        reader.onloadend = () => {
            setProfileImage(reader.result);
        };

        reader.readAsDataURL(file);
    };

    /* =========================
       REMOVE PHOTO
    ========================= */

    const handleRemovePhoto = () => {
        setProfileImage("");
        setSelectedFile(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        setMessage("");
        setError("");
    };

    /* =========================
       SAVE PROFILE
    ========================= */

    const handleSave = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");
        setSaving(true);

        const token =
            localStorage.getItem("smartCityToken");

        if (!token) {
            navigate("/login");
            return;
        }

        try {
            /*
             * Update profile information
             */
            const response = await fetch(
                `${API_URL}/api/users/profile`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        name: formData.name,
                        phone: formData.phone
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to update profile"
                );
            }

            /*
             * Updated user object
             */
            const updatedUser = {
                ...user,
                ...(data.user || {}),
                name: formData.name,
                phone: formData.phone,
                profileImage: profileImage || ""
            };

            /*
             * Save latest user information
             * in localStorage
             */
            localStorage.setItem(
                "smartCityUser",
                JSON.stringify(updatedUser)
            );

            setUser(updatedUser);

            /*
             * Clear selected file
             */
            setSelectedFile(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            setMessage(
                "Profile updated successfully."
            );

        } catch (error) {
            console.error(
                "Profile update error:",
                error
            );

            /*
             * If API fails, still keep
             * profile changes locally.
             */
            const updatedUser = {
                ...user,
                name: formData.name,
                phone: formData.phone,
                profileImage: profileImage || ""
            };

            localStorage.setItem(
                "smartCityUser",
                JSON.stringify(updatedUser)
            );

            setUser(updatedUser);

            setError(
                "Server update failed. Your changes were saved locally."
            );
        } finally {
            setSaving(false);
        }
    };

    /* =========================
       LOGOUT
    ========================= */

    const handleLogout = () => {
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

    /* =========================
       NAVIGATION
    ========================= */

    const goHome = () => {
        navigate("/dashboard");
    };

    const goToServices = () => {
        navigate("/city-services");
    };

    const goToReport = () => {
        navigate("/report-issue");
    };

    const goToComplaints = () => {
        navigate("/my-complaints");
    };

    const goToNotifications = () => {
        navigate("/notifications");
    };

    /* =========================
       PROFILE IMAGE URL
    ========================= */

    const getProfileImage = () => {
        if (!profileImage) {
            return "";
        }

        if (
            profileImage.startsWith("data:image")
        ) {
            return profileImage;
        }

        if (
            profileImage.startsWith("http://") ||
            profileImage.startsWith("https://")
        ) {
            return profileImage;
        }

        return `${API_URL}${profileImage}`;
    };

    const imageUrl = getProfileImage();

    return (
        <div className="profile-page">

            {/* =========================
                HEADER
            ========================= */}

            <header className="profile-header">

                <div
                    className="profile-brand"
                    onClick={goHome}
                >
                    <div className="profile-logo">
                        SC
                    </div>

                    <div className="profile-brand-text">
                        <h2>Smart City</h2>
                        <span>
                            Citizen Platform
                        </span>
                    </div>
                </div>

                <nav className="profile-nav">

                    <button onClick={goHome}>
                        Home
                    </button>

                    <button onClick={goToServices}>
                        City Services
                    </button>

                    <button onClick={goToReport}>
                        Report Issue
                    </button>

                    <button onClick={goToComplaints}>
                        My Complaints
                    </button>

                    <button onClick={goToNotifications}>
                        Notifications
                    </button>

                </nav>

                <div className="profile-user-area">

                    <div
                        className="profile-small-avatar"
                        onClick={goHome}
                    >
                        {profileImage ? (
                            <img
                                src={imageUrl}
                                alt="Profile"
                            />
                        ) : (
                            (
                                user.name ||
                                "C"
                            )
                                .charAt(0)
                                .toUpperCase()
                        )}
                    </div>

                    <div className="profile-user-name">
                        <strong>
                            {user.name || "Citizen"}
                        </strong>

                        <span>
                            Citizen
                        </span>
                    </div>

                    <button
                        className="profile-logout"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </header>

            {/* =========================
                MAIN
            ========================= */}

            <main className="profile-main">

                <div className="profile-title">

                    <div>
                        <h1>
                            My Profile
                        </h1>

                        <p>
                            Manage your Smart City
                            account information
                        </p>
                    </div>

                </div>

                <div className="profile-card">

                    {/* =========================
                        PROFILE HERO
                    ========================= */}

                    <div className="profile-card-top">

                        <div className="large-profile-avatar">

                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt="Profile"
                                />
                            ) : (
                                (
                                    user.name ||
                                    "C"
                                )
                                    .charAt(0)
                                    .toUpperCase()
                            )}

                        </div>

                        <div className="profile-card-info">

                            <h2>
                                {user.name ||
                                    "Citizen"}
                            </h2>

                            <p>
                                Citizen Account
                            </p>

                            <span className="profile-status">
                                ● Active Account
                            </span>

                        </div>

                    </div>

                    {/* =========================
                        PROFILE PHOTO
                    ========================= */}

                    <div className="profile-photo-section">

                        <div className="profile-photo-info">

                            <h3>
                                Profile Photo
                            </h3>

                            <p>
                                JPG, PNG or WEBP
                                · Maximum 5 MB
                            </p>

                            {selectedFile && (
                                <span className="selected-file">
                                    Selected:{" "}
                                    {selectedFile.name}
                                </span>
                            )}

                        </div>

                        <div className="profile-photo-actions">

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={
                                    handlePhotoChange
                                }
                                hidden
                            />

                            <button
                                type="button"
                                className="change-photo-button"
                                onClick={
                                    handlePhotoClick
                                }
                            >
                                📷 Change Photo
                            </button>

                            {profileImage && (
                                <button
                                    type="button"
                                    className="remove-photo-button"
                                    onClick={
                                        handleRemovePhoto
                                    }
                                >
                                    Remove
                                </button>
                            )}

                        </div>

                    </div>

                    {/* =========================
                        MESSAGE
                    ========================= */}

                    {message && (
                        <div className="profile-success">
                            ✓ {message}
                        </div>
                    )}

                    {error && (
                        <div className="profile-error">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* =========================
                        FORM
                    ========================= */}

                    <form
                        className="profile-form"
                        onSubmit={handleSave}
                    >

                        <div className="profile-field">

                            <label>
                                Full Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={
                                    handleChange
                                }
                                placeholder="Enter your name"
                                required
                            />

                        </div>

                        <div className="profile-field">

                            <label>
                                Email Address
                            </label>

                            <input
                                type="email"
                                value={
                                    formData.email
                                }
                                disabled
                            />

                        </div>

                        <div className="profile-field">

                            <label>
                                Mobile Number
                            </label>

                            <input
                                type="tel"
                                name="phone"
                                value={
                                    formData.phone
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Enter mobile number"
                            />

                        </div>

                        <div className="profile-field">

                            <label>
                                Account Type
                            </label>

                            <input
                                type="text"
                                value="Citizen"
                                disabled
                            />

                        </div>

                        {/* =========================
                            ACTION BUTTONS
                        ========================= */}

                        <div className="profile-actions">

                            <button
                                type="button"
                                className="profile-back"
                                onClick={goHome}
                            >
                                ← Back to Home
                            </button>

                            <button
                                type="submit"
                                className="profile-save"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : "Save Changes"}
                            </button>

                        </div>

                    </form>

                </div>

            </main>

        </div>
    );
};

export default Profile;