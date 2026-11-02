import React, { useEffect, useState } from "react";
import {
    useLocation,
    useNavigate
} from "react-router-dom";

import "./Login.css";

const AUTH_API_URL = "https://backend-1df5.onrender.com/api/auth";

const readResponse = async (response) => {
    const text = await response.text();

    try {
        return text ? JSON.parse(text) : {};
    } catch (error) {
        throw new Error(
            "Backend returned an invalid response. Please try again later."
        );
    }
};

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState(
        location.state?.registeredEmail || ""
    );
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState(
        location.state?.registeredPhone || ""
    );
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [flow, setFlow] = useState("login");
    const [step, setStep] = useState("credentials");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(0);

    useEffect(() => {
        const adminLoggedIn =
            localStorage.getItem("adminLoggedIn") === "true";
        const adminData = localStorage.getItem("admin");

        if (adminLoggedIn || adminData) {
            localStorage.removeItem("admin");
            localStorage.removeItem("adminLoggedIn");
            localStorage.removeItem("adminToken");
        }

        const token = localStorage.getItem("smartCityToken");
        const userData = localStorage.getItem("smartCityUser");

        if (!token || !userData) {
            return;
        }

        try {
            const user = JSON.parse(userData);

            if (user.role === "admin") {
                localStorage.removeItem("smartCityToken");
                localStorage.removeItem("smartCityUser");
                return;
            }

            navigate("/dashboard", { replace: true });
        } catch (parseError) {
            localStorage.removeItem("smartCityToken");
            localStorage.removeItem("smartCityUser");
        }
    }, [navigate]);

    useEffect(() => {
        if (resendCountdown <= 0) {
            return undefined;
        }

        const timer = window.setTimeout(
            () => setResendCountdown((remaining) => remaining - 1),
            1000
        );

        return () => window.clearTimeout(timer);
    }, [resendCountdown]);

    const requestOtp = async (isResend = false) => {
        if (flow === "login" && (!email.trim() || !password)) {
            setError("Please enter your email and password.");
            return;
        }

        if (flow === "forgot" && !/^\d{10}$/.test(phone.trim())) {
            setError("Please enter a valid 10-digit mobile number.");
            return;
        }

        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const endpoint = flow === "login"
                ? "/request-login-otp"
                : "/forgot-password";
            const response = await fetch(`${AUTH_API_URL}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    flow === "login"
                        ? { email: email.trim().toLowerCase(), password }
                        : { phone: phone.trim() }
                )
            });
            const data = await readResponse(response);

            if (!response.ok) {
                throw new Error(data.message || "Unable to send the OTP.");
            }

            setStep("otp");
            setOtp("");
            setResendCountdown(60);
            setSuccess(
                isResend
                    ? "A new OTP has been sent to your registered mobile."
                    : flow === "login"
                        ? "Email and password verified. An OTP has been sent to your registered mobile."
                        : "If an account exists for this phone, a password reset OTP has been sent by SMS."
            );
        } catch (requestError) {
            setError(requestError.message || "Unable to send the OTP.");
        } finally {
            setLoading(false);
        }
    };

    const verifyLoginOtp = async () => {
        if (!/^\d{6}$/.test(otp.trim())) {
            setError("Please enter the 6-digit OTP sent to your phone.");
            return;
        }

        setError("");
        setSuccess("");
        setLoading(true);

        try {
            localStorage.removeItem("admin");
            localStorage.removeItem("adminLoggedIn");
            localStorage.removeItem("adminToken");

            const response = await fetch(`${AUTH_API_URL}/verify-login-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    otp: otp.trim()
                })
            });
            const data = await readResponse(response);

            if (!response.ok) {
                throw new Error(data.message || "OTP verification failed.");
            }

            if (!data.token || !data.user) {
                throw new Error("Login information was not received from server.");
            }

            if (data.user.role === "admin") {
                throw new Error(
                    "Administrator account detected. Please use Administrator Login."
                );
            }

            localStorage.setItem("smartCityToken", data.token);
            localStorage.setItem("smartCityUser", JSON.stringify(data.user));
            navigate("/dashboard", { replace: true });
        } catch (verificationError) {
            setError(verificationError.message || "OTP verification failed.");
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async () => {
        if (!/^\d{6}$/.test(otp.trim())) {
            setError("Please enter the 6-digit OTP sent to your phone.");
            return;
        }

        if (newPassword.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Password and confirm password do not match.");
            return;
        }

        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const response = await fetch(`${AUTH_API_URL}/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    phone: phone.trim(),
                    otp: otp.trim(),
                    newPassword
                })
            });
            const data = await readResponse(response);

            if (!response.ok) {
                throw new Error(data.message || "Unable to reset your password.");
            }

            setFlow("login");
            setStep("credentials");
            setOtp("");
            setNewPassword("");
            setConfirmPassword("");
            setResendCountdown(0);
            setSuccess("Password reset successfully. Request a login OTP to continue.");
        } catch (resetError) {
            setError(resetError.message || "Unable to reset your password.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (step === "credentials" || step === "phone") {
            requestOtp();
        } else if (flow === "login") {
            verifyLoginOtp();
        } else {
            resetPassword();
        }
    };

    const switchFlow = (nextFlow) => {
        setFlow(nextFlow);
        setStep(nextFlow === "login" ? "credentials" : "phone");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
        setError("");
        setSuccess("");
        setResendCountdown(0);
    };

    const changePhone = () => {
        setStep(flow === "login" ? "credentials" : "phone");
        setOtp("");
        setError("");
        setSuccess("");
        setResendCountdown(0);
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-brand">
                    <div className="login-logo">SC</div>
                    <div>
                        <h1>Smart City</h1>
                        <p>Citizen Platform</p>
                    </div>
                </div>

                <div className="login-heading">
                    <h2>
                        {flow === "forgot"
                            ? "Reset Password"
                            : "Welcome Back"}
                    </h2>
                    <p>
                        {step === "credentials"
                            ? "Enter your registered email and password, then verify the SMS OTP"
                            : step === "phone"
                                ? "Get a password reset OTP on your registered mobile number"
                                : flow === "forgot"
                                ? "Verify your SMS OTP and choose a new password"
                                : "Enter the OTP sent to your registered mobile number"}
                    </p>
                </div>

                {location.state?.registered && (
                    <div className="login-success">
                        Registration successful. Log in with your email and password, then verify the SMS OTP.
                    </div>
                )}

                {success && <div className="login-success">{success}</div>}
                {error && <div className="login-error">⚠️ {error}</div>}

                <form onSubmit={handleSubmit}>
                    {step === "credentials" ? (
                        <>
                            <div className="login-form-group">
                                <label htmlFor="login-email">Email Address</label>
                                <input
                                    id="login-email"
                                    type="email"
                                    value={email}
                                    onChange={(event) => {
                                        setEmail(event.target.value);
                                        setError("");
                                    }}
                                    placeholder="Enter your registered email"
                                    autoComplete="username"
                                    required
                                />
                            </div>
                            <div className="login-form-group">
                                <label htmlFor="login-password">Password</label>
                                <input
                                    id="login-password"
                                    type="password"
                                    value={password}
                                    onChange={(event) => {
                                        setPassword(event.target.value);
                                        setError("");
                                    }}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    required
                                />
                            </div>
                        </>
                    ) : step === "phone" ? (
                        <div className="login-form-group">
                            <label htmlFor="login-phone">Mobile Number</label>
                            <input
                                id="login-phone"
                                type="tel"
                                value={phone}
                                onChange={(event) => {
                                    setPhone(event.target.value.replace(/\D/g, "").slice(0, 10));
                                    setError("");
                                }}
                                placeholder="Enter your 10-digit mobile number"
                                autoComplete="tel"
                                inputMode="numeric"
                                maxLength={10}
                                required
                            />
                        </div>
                    ) : (
                        <>
                            <div className="login-form-group">
                                <label htmlFor="login-otp">SMS Verification Code</label>
                                <input
                                    id="login-otp"
                                    type="text"
                                    value={otp}
                                    onChange={(event) => {
                                        setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
                                        setError("");
                                    }}
                                    placeholder="Enter 6-digit OTP"
                                    autoComplete="one-time-code"
                                    inputMode="numeric"
                                    maxLength={6}
                                    required
                                />
                            </div>

                            {flow === "forgot" && (
                                <>
                                    <div className="login-form-group">
                                        <label htmlFor="new-password">New Password</label>
                                        <input
                                            id="new-password"
                                            type="password"
                                            value={newPassword}
                                            onChange={(event) => {
                                                setNewPassword(event.target.value);
                                                setError("");
                                            }}
                                            placeholder="At least 8 characters"
                                            autoComplete="new-password"
                                            minLength={8}
                                            required
                                        />
                                    </div>
                                    <div className="login-form-group">
                                        <label htmlFor="confirm-password">
                                            Confirm New Password
                                        </label>
                                        <input
                                            id="confirm-password"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(event) => {
                                                setConfirmPassword(event.target.value);
                                                setError("");
                                            }}
                                            placeholder="Re-enter your new password"
                                            autoComplete="new-password"
                                            minLength={8}
                                            required
                                        />
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Please wait..."
                            : step === "credentials" || step === "phone"
                                ? flow === "forgot"
                                    ? "Send Password Reset OTP"
                                    : "Send Login OTP"
                                : flow === "forgot"
                                    ? "Reset Password"
                                    : "Verify OTP & Login"}
                    </button>
                </form>

                {step === "otp" && (
                    <div className="login-otp-actions">
                        <button
                            type="button"
                            className="login-text-button"
                            onClick={changePhone}
                            disabled={loading}
                        >
                            Change mobile number
                        </button>
                        <button
                            type="button"
                            className="login-text-button"
                            onClick={() => requestOtp(true)}
                            disabled={loading || resendCountdown > 0}
                        >
                            {resendCountdown > 0
                                ? `Resend OTP in ${resendCountdown}s`
                                : "Resend OTP"}
                        </button>
                    </div>
                )}

                {flow === "login" && step === "credentials" && (
                    <div className="login-forgot">
                        <button
                            type="button"
                            className="login-text-button"
                            onClick={() => switchFlow("forgot")}
                        >
                            Forgot password?
                        </button>
                    </div>
                )}

                {flow === "forgot" && (
                    <div className="login-register">
                        <span>Remembered your password?</span>
                        <button type="button" onClick={() => switchFlow("login")}>
                            Back to Login
                        </button>
                    </div>
                )}

                {flow === "login" && (
                    <div className="login-register">
                        <span>Don't have an account?</span>
                        <button type="button" onClick={() => navigate("/register")}>
                            Create Account
                        </button>
                    </div>
                )}

                <button
                    type="button"
                    className="admin-login-button"
                    onClick={() => {
                        localStorage.removeItem("smartCityToken");
                        localStorage.removeItem("smartCityUser");
                        navigate("/admin-login");
                    }}
                >
                    Administrator Login
                </button>

                <button
                    type="button"
                    className="back-home-button"
                    onClick={() => navigate("/")}
                >
                    ← Back to Home
                </button>
            </div>
        </div>
    );
};

export default Login;
