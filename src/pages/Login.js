import React, { useEffect, useState } from "react";
import {
    useLocation,
    useNavigate
} from "react-router-dom";

import "./Login.css";

const Login = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState(
        location.state?.registeredEmail || ""
    );

    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    /* ==========================================
       CHECK EXISTING CITIZEN LOGIN
    ========================================== */

    useEffect(() => {

        /*
         * IMPORTANT:
         * Admin session should NEVER control
         * the citizen login page.
         */

        const adminLoggedIn =
            localStorage.getItem("adminLoggedIn") === "true";

        const adminData =
            localStorage.getItem("admin");

        /*
         * If admin session exists but user opened
         * citizen login, clear admin session.
         */

        if (adminLoggedIn || adminData) {

            localStorage.removeItem("admin");
            localStorage.removeItem("adminLoggedIn");
            localStorage.removeItem("adminToken");
        }

        /*
         * Now check only citizen session.
         */

        const token =
            localStorage.getItem("smartCityToken");

        const userData =
            localStorage.getItem("smartCityUser");

        if (!token || !userData) {
            return;
        }

        try {

            const user = JSON.parse(userData);

            /*
             * Citizen login page should not redirect
             * admin users.
             */

            if (user.role === "admin") {

                localStorage.removeItem(
                    "smartCityToken"
                );

                localStorage.removeItem(
                    "smartCityUser"
                );

                return;
            }

            navigate("/dashboard", {
                replace: true
            });

        } catch (error) {

            localStorage.removeItem(
                "smartCityToken"
            );

            localStorage.removeItem(
                "smartCityUser"
            );
        }

    }, [navigate]);

    /* ==========================================
       LOGIN SUBMIT
    ========================================== */

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        /* ===============================
           VALIDATION
        =============================== */

        if (!email.trim()) {

            setError(
                "Please enter your email address."
            );

            return;
        }

        if (!password) {

            setError(
                "Please enter your password."
            );

            return;
        }

        setLoading(true);

        try {

            /* ===============================
               CLEAR ADMIN SESSION
            =============================== */

            localStorage.removeItem("admin");
            localStorage.removeItem("adminLoggedIn");
            localStorage.removeItem("adminToken");

            /* ===============================
               LOGIN API
            =============================== */

            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email
                            .trim()
                            .toLowerCase(),

                        password: password
                    })
                }
            );

            /* ===============================
               READ RESPONSE
            =============================== */

            const text =
                await response.text();

            let data;

            try {

                data = JSON.parse(text);

            } catch (jsonError) {

                throw new Error(
                    "Backend returned an invalid response. Please make sure the server is running on port 5000."
                );
            }

            /* ===============================
               API ERROR
            =============================== */

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Invalid email or password."
                );
            }

            /* ===============================
               CHECK LOGIN RESPONSE
            =============================== */

            if (!data.token) {

                throw new Error(
                    "Login token was not received from server."
                );
            }

            if (!data.user) {

                throw new Error(
                    "User information was not received from server."
                );
            }

            /* ===============================
               BLOCK ADMIN FROM CITIZEN LOGIN
            =============================== */

            if (data.user.role === "admin") {

                throw new Error(
                    "Administrator account detected. Please use Administrator Login."
                );
            }

            /* ===============================
               SAVE CITIZEN SESSION
            =============================== */

            localStorage.setItem(
                "smartCityToken",
                data.token
            );

            localStorage.setItem(
                "smartCityUser",
                JSON.stringify(data.user)
            );

            /* ===============================
               GO TO CITIZEN DASHBOARD
            =============================== */

            navigate("/dashboard", {
                replace: true
            });

        } catch (error) {

            console.error(
                "Login Error:",
                error
            );

            setError(
                error.message ||
                "Login failed. Please try again."
            );

        } finally {

            setLoading(false);
        }
    };

    return (

        <div className="login-page">

            <div className="login-card">

                {/* ===============================
                    BRAND
                =============================== */}

                <div className="login-brand">

                    <div className="login-logo">
                        SC
                    </div>

                    <div>

                        <h1>
                            Smart City
                        </h1>

                        <p>
                            Citizen Platform
                        </p>

                    </div>

                </div>

                {/* ===============================
                    HEADING
                =============================== */}

                <div className="login-heading">

                    <h2>
                        Welcome Back
                    </h2>

                    <p>
                        Login to access your Smart City account
                    </p>

                </div>

                {/* ===============================
                    REGISTRATION SUCCESS
                =============================== */}

                {location.state?.registered && (

                    <div className="login-success">

                        ✓ Registration successful.
                        Please login with your email and password.

                    </div>

                )}

                {/* ===============================
                    ERROR
                =============================== */}

                {error && (

                    <div className="login-error">

                        ⚠️ {error}

                    </div>

                )}

                {/* ===============================
                    LOGIN FORM
                =============================== */}

                <form onSubmit={handleSubmit}>

                    {/* EMAIL */}

                    <div className="login-form-group">

                        <label>
                            Email Address
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {

                                setEmail(
                                    e.target.value
                                );

                                setError("");
                            }}
                            placeholder="Enter your email"
                            autoComplete="email"
                        />

                    </div>

                    {/* PASSWORD */}

                    <div className="login-form-group">

                        <label>
                            Password
                        </label>

                        <div className="password-box">

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                value={password}
                                onChange={(e) => {

                                    setPassword(
                                        e.target.value
                                    );

                                    setError("");
                                }}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                            >
                                {showPassword
                                    ? "Hide"
                                    : "Show"
                                }
                            </button>

                        </div>

                    </div>

                    {/* LOGIN BUTTON */}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >

                        {loading
                            ? "Signing In..."
                            : "Login to Citizen Portal →"
                        }

                    </button>

                </form>

                {/* ===============================
                    REGISTER
                =============================== */}

                <div className="login-register">

                    <span>
                        Don't have an account?
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/register")
                        }
                    >
                        Create Account
                    </button>

                </div>

                {/* ===============================
                    ADMIN LOGIN
                =============================== */}

                <button
                    type="button"
                    className="admin-login-button"
                    onClick={() => {

                        localStorage.removeItem(
                            "smartCityToken"
                        );

                        localStorage.removeItem(
                            "smartCityUser"
                        );

                        navigate("/admin-login");
                    }}
                >
                    Administrator Login
                </button>

                {/* ===============================
                    BACK HOME
                =============================== */}

                <button
                    type="button"
                    className="back-home-button"
                    onClick={() =>
                        navigate("/")
                    }
                >
                    ← Back to Home
                </button>

            </div>

        </div>
    );
};

export default Login;