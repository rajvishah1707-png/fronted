import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Header.css";

function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const user =
    JSON.parse(localStorage.getItem("loggedInUser")) ||
    JSON.parse(localStorage.getItem("registeredUser"));

  const userName = user?.name || "Citizen";

  const firstLetter = userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/login");
  };

  return (
    <header className="home-header">

      {/* BRAND */}
      <div className="brand-section">

        <div className="brand-logo">
          SC
        </div>

        <div>
          <div className="brand-name">
            Smart City
          </div>

          <div className="brand-subtitle">
            Citizen Platform
          </div>
        </div>

      </div>


      {/* NAVIGATION */}
      <nav className="home-nav">

        <Link
          to="/home"
          className={`nav-button ${
            location.pathname === "/home" ? "active" : ""
          }`}
        >
          Home
        </Link>

        <Link
          to="/city-services"
          className={`nav-button ${
            location.pathname === "/city-services" ? "active" : ""
          }`}
        >
          City Services
        </Link>

        <Link
          to="/report-issue"
          className={`nav-button ${
            location.pathname === "/report-issue" ? "active" : ""
          }`}
        >
          Report Issue
        </Link>

        <Link
          to="/my-complaints"
          className={`nav-button ${
            location.pathname === "/my-complaints" ? "active" : ""
          }`}
        >
          My Complaints
        </Link>

        <Link
          to="/notifications"
          className={`nav-button ${
            location.pathname === "/notifications" ? "active" : ""
          }`}
        >
          Notifications
        </Link>

      </nav>


      {/* USER */}
      <div className="user-section">

        <div className="user-avatar">
          {firstLetter}
        </div>

        <div className="user-details">
          <strong>{userName}</strong>
          <span>Citizen</span>
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>

    </header>
  );
}

export default Header;