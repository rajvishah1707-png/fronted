import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

// =========================
// COMMON PAGES
// =========================
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

// =========================
// CITIZEN PAGES
// =========================
import CityServices from "./pages/CityServices";
import ApplyService from "./pages/ApplyService";
import MyApplications from "./pages/MyApplications";
import ApplicationStatus from "./pages/ApplicationStatus";
import MyComplaints from "./pages/MyComplaints";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import DigitalDocuments from "./pages/DigitalDocuments";

// =========================
// AI ASSISTANT
// =========================
import AIAssistant from "./pages/AIAssistant";

// =========================
// ADMIN PAGES
// =========================
import Citizens from "./pages/Citizens";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminServices from "./pages/AdminServices";
import AdminApplications from "./pages/AdminApplications";
import Complaints from "./pages/Complaints";
import AdminDigitalDocuments from "./pages/AdminDigitalDocuments";


// =========================
// CITIZEN PROTECTED ROUTE
// =========================
function ProtectedRoute({ children }) {

    const token = localStorage.getItem("smartCityToken");

    if (!token) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    return children;
}


// =========================
// ADMIN PROTECTED ROUTE
// =========================
function AdminProtectedRoute({ children }) {

    const adminLoggedIn =
        localStorage.getItem("adminLoggedIn") === "true";

    const admin =
        localStorage.getItem("admin");

    if (!adminLoggedIn || !admin) {
        return (
            <Navigate
                to="/admin-login"
                replace
            />
        );
    }

    return children;
}


// =========================
// APP
// =========================
function App() {

    return (
        <Router>

            <Routes>

                {/* =========================
                    PUBLIC ROUTES
                ========================= */}

                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/home"
                    element={<Home />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />


                {/* =========================
                    CITIZEN DASHBOARD
                ========================= */}

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />


                {/* =========================
                    CITY SERVICES
                ========================= */}

                <Route
                    path="/city-services"
                    element={
                        <ProtectedRoute>
                            <CityServices />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/apply-service"
                    element={
                        <ProtectedRoute>
                            <ApplyService />
                        </ProtectedRoute>
                    }
                />


                {/* =========================
                    MY APPLICATIONS
                ========================= */}

                <Route
                    path="/my-applications"
                    element={
                        <ProtectedRoute>
                            <MyApplications />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/application-status"
                    element={
                        <ProtectedRoute>
                            <ApplicationStatus />
                        </ProtectedRoute>
                    }
                />


                {/* =========================
                    CITIZEN COMPLAINTS
                ========================= */}

                <Route
                    path="/my-complaints"
                    element={
                        <ProtectedRoute>
                            <MyComplaints />
                        </ProtectedRoute>
                    }
                />


                {/* =========================
                    NOTIFICATIONS
                ========================= */}

                <Route
                    path="/notifications"
                    element={
                        <ProtectedRoute>
                            <Notifications />
                        </ProtectedRoute>
                    }
                />


                {/* =========================
                    PROFILE
                ========================= */}

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />


                {/* =========================
                    DIGITAL DOCUMENTS
                ========================= */}

                <Route
                    path="/digital-documents"
                    element={
                        <ProtectedRoute>
                            <DigitalDocuments />
                        </ProtectedRoute>
                    }
                />


                {/* =========================
                    AI ASSISTANT
                ========================= */}

                <Route
                    path="/ai-assistant"
                    element={
                        <ProtectedRoute>
                            <AIAssistant />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    ADMIN SECTION
                ================================================== */}

                {/* =========================
                    ADMIN LOGIN
                ========================= */}

                <Route
                    path="/admin-login"
                    element={<AdminLogin />}
                />


                {/* =========================
                    ADMIN DASHBOARD
                ========================= */}

                <Route
                    path="/admin-dashboard"
                    element={
                        <AdminProtectedRoute>
                            <AdminDashboard />
                        </AdminProtectedRoute>
                    }
                />


                {/* =========================
                    ADMIN CITIZENS
                ========================= */}

                <Route
                    path="/admin/citizens"
                    element={
                        <AdminProtectedRoute>
                            <Citizens />
                        </AdminProtectedRoute>
                    }
                />


                {/* =========================
                    ADMIN SERVICES
                ========================= */}

                <Route
                    path="/admin/services"
                    element={
                        <AdminProtectedRoute>
                            <AdminServices />
                        </AdminProtectedRoute>
                    }
                />


                {/* =========================
                    ADMIN APPLICATIONS
                ========================= */}

                <Route
                    path="/admin/applications"
                    element={
                        <AdminProtectedRoute>
                            <AdminApplications />
                        </AdminProtectedRoute>
                    }
                />


                {/* =========================
                    ADMIN COMPLAINTS
                ========================= */}

                <Route
                    path="/admin/complaints"
                    element={
                        <AdminProtectedRoute>
                            <Complaints />
                        </AdminProtectedRoute>
                    }
                />


                {/* =========================
                    ADMIN DIGITAL DOCUMENTS
                ========================= */}

                <Route
                    path="/admin/digital-documents"
                    element={
                        <AdminProtectedRoute>
                            <AdminDigitalDocuments />
                        </AdminProtectedRoute>
                    }
                />


                {/* =========================
                    FALLBACK
                ========================= */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/"
                            replace
                        />
                    }
                />

            </Routes>

        </Router>
    );
}

export default App;