import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {

  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
        background: "#f5f8fc",
      }}
    >

      {/* HEADER */}

      <header
        style={{
          background: "#123b63",
          color: "white",
          padding: "20px 60px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >

        <h2 style={{ margin: 0 }}>
          Smart City
        </h2>

        <div>

          <button
            onClick={() => navigate("/login")}
            style={{
              marginRight: "10px",
              padding: "10px 20px",
              borderRadius: "6px",
              border: "1px solid white",
              background: "transparent",
              color: "white",
              cursor: "pointer",
            }}
          >
            Citizen Login
          </button>

          <button
            onClick={() => navigate("/register")}
            style={{
              padding: "10px 20px",
              borderRadius: "6px",
              border: "none",
              background: "#28b6d6",
              color: "white",
              cursor: "pointer",
            }}
          >
            Register
          </button>

        </div>

      </header>


      {/* HERO */}

      <section
        style={{
          padding: "100px 60px",
          textAlign: "center",
        }}
      >

        <h1
          style={{
            fontSize: "52px",
            color: "#123b63",
            marginBottom: "20px",
          }}
        >
          Your City.
          <br />
          <span style={{ color: "#28b6d6" }}>
            Your Voice. Your Future.
          </span>
        </h1>

        <p
          style={{
            fontSize: "20px",
            color: "#555",
            maxWidth: "700px",
            margin: "0 auto 35px",
            lineHeight: "1.6",
          }}
        >
          Access city services, report civic issues,
          track complaints and stay connected with
          your city.
        </p>


        <button
          onClick={() => navigate("/login")}
          style={{
            padding: "15px 35px",
            background: "#28b6d6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "17px",
            cursor: "pointer",
          }}
        >
          Login to Citizen Portal →
        </button>

      </section>


      {/* FEATURES */}

      <section
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "25px",
          padding: "20px 50px 80px",
          flexWrap: "wrap",
        }}
      >

        <div
          style={{
            background: "white",
            padding: "30px",
            width: "250px",
            borderRadius: "12px",
            boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
          }}
        >
          <h3>📢 Report Issues</h3>

          <p>
            Report potholes, garbage,
            street lights and other civic problems.
          </p>
        </div>


        <div
          style={{
            background: "white",
            padding: "30px",
            width: "250px",
            borderRadius: "12px",
            boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
          }}
        >
          <h3>📋 Track Complaints</h3>

          <p>
            Track your submitted complaints
            and check their status.
          </p>
        </div>


        <div
          style={{
            background: "white",
            padding: "30px",
            width: "250px",
            borderRadius: "12px",
            boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
          }}
        >
          <h3>🏙 City Services</h3>

          <p>
            Access important city services
            from one convenient platform.
          </p>
        </div>

      </section>

    </div>
  );
};

export default Home;