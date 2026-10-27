import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Register.css";

const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        pincode: "",
        password: "",
        confirmPassword: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        setError("");
        setSuccess("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        const {
            name,
            email,
            phone,
            address,
            city,
            pincode,
            password,
            confirmPassword
        } = formData;

        /* ==============================
           FRONTEND VALIDATION
        ============================== */

        if (
            !name.trim() ||
            !email.trim() ||
            !phone.trim() ||
            !address.trim() ||
            !city.trim() ||
            !pincode.trim() ||
            !password ||
            !confirmPassword
        ) {
            setError("All required fields must be filled.");
            return;
        }

        if (name.trim().length < 2) {
            setError("Please enter a valid full name.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setError("Please enter a valid email address.");
            return;
        }

        if (!/^\d{10}$/.test(phone.trim())) {
            setError("Please enter a valid 10-digit mobile number.");
            return;
        }

        if (!/^\d{6}$/.test(pincode.trim())) {
            setError("Please enter a valid 6-digit pincode.");
            return;
        }

        if (password.length < 6) {
            setError("Password must contain at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Password and confirm password do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: name.trim(),
                        email: email.trim().toLowerCase(),
                        phone: phone.trim(),
                        address: address.trim(),
                        city: city.trim(),
                        pincode: pincode.trim(),
                        password,
                        confirmPassword
                    })
                }
            );

            const text = await response.text();

            let data;

            try {
                data = JSON.parse(text);
            } catch (jsonError) {
                throw new Error(
                    "Backend returned an invalid response. Please check whether the server is running on port 5000."
                );
            }

            if (!response.ok) {
                throw new Error(
                    data.message || "Registration failed."
                );
            }

            /* ==============================
               IMPORTANT:
               CLEAR ALL EXISTING SESSIONS
            ============================== */

            localStorage.removeItem("smartCityToken");
            localStorage.removeItem("smartCityUser");

            localStorage.removeItem("adminToken");
            localStorage.removeItem("admin");
            localStorage.removeItem("adminLoggedIn");

            /* ==============================
               SUCCESS
            ============================== */

            setSuccess(
                "Registration successful! Redirecting to citizen login..."
            );

            setFormData({
                name: "",
                email: "",
                phone: "",
                address: "",
                city: "",
                pincode: "",
                password: "",
                confirmPassword: ""
            });

            /* ==============================
               GO TO CITIZEN LOGIN
            ============================== */

            setTimeout(() => {
                navigate("/login", {
                    replace: true,
                    state: {
                        registered: true,
                        registeredEmail: email.trim().toLowerCase()
                    }
                });
            }, 1000);

        } catch (error) {
            console.error("Registration Error:", error);

            setError(
                error.message || "Registration failed."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">

            {/* ==============================
                LEFT SECTION
            ============================== */}

            <div className="register-left">

                <div className="register-left-content">

                    <div className="brand-small">
                        SC • SMART CITY
                    </div>

                    <h1>
                        Build a Smarter
                        <br />
                        <span>City Together</span>
                    </h1>

                    <p>
                        Join the Smart City platform and access
                        modern civic services, report issues,
                        and stay connected with your community.
                    </p>

                    <div className="register-features">

                        <div className="register-feature">

                            <div className="feature-icon">
                                ✓
                            </div>

                            <div>
                                <h3>Easy Access</h3>

                                <p>
                                    Access city services from one place.
                                </p>
                            </div>

                        </div>

                        <div className="register-feature">

                            <div className="feature-icon">
                                ✓
                            </div>

                            <div>
                                <h3>Stay Connected</h3>

                                <p>
                                    Receive important city notifications.
                                </p>
                            </div>

                        </div>

                        <div className="register-feature">

                            <div className="feature-icon">
                                ✓
                            </div>

                            <div>
                                <h3>Report Issues</h3>

                                <p>
                                    Raise and track civic complaints.
                                </p>
                            </div>

                        </div>

                    </div>

                </div>

            </div>

            {/* ==============================
                RIGHT SECTION
            ============================== */}

            <div className="register-right">

                <div className="register-form-container">

                    <h2>
                        Create Citizen Account
                    </h2>

                    <p className="register-subtitle">
                        Register to access Smart City services
                    </p>

                    {/* ERROR */}

                    {error && (
                        <div className="register-error">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* SUCCESS */}

                    {success && (
                        <div className="register-success">
                            ✓ {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        {/* NAME */}

                        <div className="form-group">

                            <label>
                                Full Name *
                            </label>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    👤
                                </span>

                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    autoComplete="name"
                                />

                            </div>

                        </div>

                        {/* EMAIL */}

                        <div className="form-group">

                            <label>
                                Email Address *
                            </label>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    ✉
                                </span>

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    autoComplete="email"
                                />

                            </div>

                        </div>

                        {/* PHONE */}

                        <div className="form-group">

                            <label>
                                Mobile Number *
                            </label>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    📱
                                </span>

                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Enter 10-digit mobile number"
                                    maxLength="10"
                                    inputMode="numeric"
                                    autoComplete="tel"
                                />

                            </div>

                        </div>

                        {/* ADDRESS */}

                        <div className="form-group">

                            <label>
                                Address *
                            </label>

                            <div className="input-wrapper textarea-wrapper">

                                <span className="input-icon">
                                    🏠
                                </span>

                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Enter your residential address"
                                    rows="3"
                                    autoComplete="street-address"
                                />

                            </div>

                        </div>

                        {/* CITY + PINCODE */}

                        <div className="form-row">

                            <div className="form-group">

                                <label>
                                    City *
                                </label>

                                <div className="input-wrapper">

                                    <span className="input-icon">
                                        🏙️
                                    </span>

                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="Ahmedabad"
                                        autoComplete="address-level2"
                                    />

                                </div>

                            </div>

                            <div className="form-group">

                                <label>
                                    Pincode *
                                </label>

                                <div className="input-wrapper">

                                    <span className="input-icon">
                                        📍
                                    </span>

                                    <input
                                        type="tel"
                                        name="pincode"
                                        value={formData.pincode}
                                        onChange={handleChange}
                                        placeholder="380001"
                                        maxLength="6"
                                        inputMode="numeric"
                                        autoComplete="postal-code"
                                    />

                                </div>

                            </div>

                        </div>

                        {/* PASSWORD */}

                        <div className="form-group">

                            <label>
                                Password *
                            </label>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    🔒
                                </span>

                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Create a password"
                                    autoComplete="new-password"
                                />

                            </div>

                        </div>

                        {/* CONFIRM PASSWORD */}

                        <div className="form-group">

                            <label>
                                Confirm Password *
                            </label>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    🔐
                                </span>

                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm your password"
                                    autoComplete="new-password"
                                />

                            </div>

                        </div>

                        {/* REGISTER BUTTON */}

                        <button
                            type="submit"
                            className="register-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating Account..."
                                : "Create Citizen Account →"
                            }
                        </button>

                    </form>

                    {/* LOGIN */}

                    <div className="register-login">

                        <span>
                            Already have an account?
                        </span>

                        <button
                            type="button"
                            onClick={() => {
                                navigate("/login");
                            }}
                        >
                            Login
                        </button>

                    </div>

                    {/* ADMIN */}

                    <div className="admin-login-link">

                        <span>
                            Are you an administrator?
                        </span>

                        <button
                            type="button"
                            onClick={() => {
                                navigate("/admin-login");
                            }}
                        >
                            Admin Login
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Register;