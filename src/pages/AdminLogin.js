import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

const AdminLogin = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleCitizenLogin = () => {
        localStorage.removeItem("admin");
        localStorage.removeItem("adminLoggedIn");
        localStorage.removeItem("adminToken");

        navigate("/login");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!email.trim()) {
            setError("Please enter your admin email.");
            return;
        }

        if (!password) {
            setError("Please enter your password.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/admin-login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email.trim().toLowerCase(),
                        password
                    })
                }
            );

            const text = await response.text();

            let data;

            try {
                data = JSON.parse(text);
            } catch {
                throw new Error(
                    "Invalid server response. Please check your backend."
                );
            }

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Invalid admin email or password."
                );
            }

            if (!data.token) {
                throw new Error(
                    "Admin authentication token was not received."
                );
            }

            /* Clear citizen session */
            localStorage.removeItem("smartCityToken");
            localStorage.removeItem("smartCityUser");

            /* Save admin session */
            localStorage.setItem(
                "adminToken",
                data.token
            );

            localStorage.setItem(
                "adminLoggedIn",
                "true"
            );

            localStorage.setItem(
                "admin",
                JSON.stringify(
                    data.user || {
                        name: "Administrator",
                        email: email.trim(),
                        role: "admin"
                    }
                )
            );

            navigate("/admin-dashboard", {
                replace: true
            });

        } catch (error) {
            console.error("Admin Login Error:", error);

            setError(
                error.message ||
                "Admin login failed."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-page">

            {/* LEFT BRAND PANEL */}

            <div className="admin-login-left">

                <div className="admin-brand-content">

                    <div className="admin-brand-logo">
                        SC
                    </div>

                    <div className="admin-brand-title">
                        <h1>Smart City</h1>
                        <span>Administration Portal</span>
                    </div>

                    <div className="admin-brand-divider"></div>

                    <h2>
                        Manage Your City.
                        <br />
                        <span>Build Its Future.</span>
                    </h2>

                    <p>
                        A centralized administration portal to
                        manage citizens, civic services,
                        applications and city operations.
                    </p>

                    <div className="admin-feature-list">

                        <div className="admin-feature">
                            <div className="admin-feature-icon">
                                ✓
                            </div>
                            <div>
                                <strong>
                                    Citizen Management
                                </strong>
                                <span>
                                    Manage registered citizens
                                </span>
                            </div>
                        </div>

                        <div className="admin-feature">
                            <div className="admin-feature-icon">
                                ✓
                            </div>
                            <div>
                                <strong>
                                    City Services
                                </strong>
                                <span>
                                    Manage government services
                                </span>
                            </div>
                        </div>

                        <div className="admin-feature">
                            <div className="admin-feature-icon">
                                ✓
                            </div>
                            <div>
                                <strong>
                                    Applications & Complaints
                                </strong>
                                <span>
                                    Review and manage citizen requests
                                </span>
                            </div>
                        </div>

                    </div>

                </div>

                <div className="admin-left-footer">
                    © 2026 Smart City Citizen Platform
                </div>

            </div>

            {/* RIGHT LOGIN PANEL */}

            <div className="admin-login-right">

                <div className="admin-login-box">

                    <div className="admin-login-heading">

                        <div className="secure-badge">
                            <span>🔐</span>
                            SECURE ADMIN ACCESS
                        </div>

                        <h2>
                            Welcome Back
                        </h2>

                        <p>
                            Sign in to your administration account
                        </p>

                    </div>

                    {error && (
                        <div className="admin-error">
                            <span>⚠</span>
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        {/* EMAIL */}

                        <div className="admin-input-group">

                            <label>
                                Admin Email Address
                            </label>

                            <div className="admin-input-wrapper">

                                <span className="admin-input-icon">
                                    ✉
                                </span>

                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setError("");
                                    }}
                                    placeholder="Enter your admin email"
                                    autoComplete="email"
                                />

                            </div>

                        </div>

                        {/* PASSWORD */}

                        <div className="admin-input-group">

                            <div className="admin-label-row">

                                <label>
                                    Password
                                </label>

                                <span>
                                    Protected
                                </span>

                            </div>

                            <div className="admin-input-wrapper">

                                <span className="admin-input-icon">
                                    🔒
                                </span>

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setError("");
                                    }}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                />

                                <button
                                    type="button"
                                    className="admin-show-password"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                >
                                    {showPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>

                            </div>

                        </div>

                        {/* LOGIN */}

                        <button
                            type="submit"
                            className="admin-submit-button"
                            disabled={loading}
                        >

                            {loading ? (
                                <>
                                    <span className="admin-spinner"></span>
                                    Signing In...
                                </>
                            ) : (
                                <>
                                    Sign In to Admin Portal
                                    <span>→</span>
                                </>
                            )}

                        </button>

                    </form>

                    {/* SECURITY NOTE */}

                    <div className="admin-security-note">

                        <div className="security-icon">
                            🛡️
                        </div>

                        <div>
                            <strong>
                                Secure Administration
                            </strong>

                            <p>
                                This area is restricted to
                                authorized administrators only.
                            </p>
                        </div>

                    </div>

                    {/* CITIZEN LOGIN */}

                    <div className="admin-citizen-section">

                        <span>
                            Are you a citizen?
                        </span>

                        <button
                            type="button"
                            onClick={handleCitizenLogin}
                        >
                            ← Go to Citizen Login
                        </button>

                    </div>

                    {/* HOME */}

                    <button
                        type="button"
                        className="admin-home-button"
                        onClick={() => navigate("/")}
                    >
                        Back to Smart City Home
                    </button>

                </div>

            </div>

        </div>
    );
};

export default AdminLogin;