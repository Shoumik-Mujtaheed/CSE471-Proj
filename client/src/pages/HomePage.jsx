import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function HomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  // Load current user from token
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("userToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await fetch("/api/users/me", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error("Failed to fetch user data:", res.status, res.statusText);
          localStorage.removeItem("userToken");
          localStorage.removeItem("userData");
          navigate("/login");
          return;
        }

        const data = await res.json();
        if (!data?.user) {
          localStorage.removeItem("userToken");
          localStorage.removeItem("userData");
          navigate("/login");
          return;
        }

        // Redirect non-patients to their appropriate pages
        if (data.user.role !== "patient") {
          if (data.user.role === "doctor") {
            navigate("/doctor-dashboard");
            return;
          } else if (data.user.role === "admin") {
            navigate("/admin/inventory");
            return;
          } else {
            navigate("/login");
            return;
          }
        }

        setUser(data.user);
      } catch (e) {
        console.error("Error loading user:", e);
        setError("Failed to load user.");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");
    navigate("/login");
  };

  const goAppointments = () => navigate("/appointments");
  const goProfile = () => navigate("/profile");
  const goPrescriptions = () => navigate("/prescriptions");
  const goHome = () => navigate("/home");

  if (loading) {
    return (
      <div className="homepage-root flex-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="homepage-root">
      {/* HEADER */}
      <div className="header-buttons">
        <img src="/logo.svg" alt="Hospital Logo" className="icon" />
        <button className="button-main" onClick={goHome}>Home</button>
        <button className="button-main" onClick={goAppointments}>Appointments</button>
        <button className="button-main" onClick={goPrescriptions}>Prescriptions</button>
        <button className="button-main" onClick={goProfile}>Profile</button>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          {user && (
            <span className="text-gray" style={{ fontSize: 14 }}>
              {user.name} ({user.role})
            </span>
          )}
          <button className="button-main" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* HERO */}
      <section className="flex-center flex-col mt-2">
        <h1 className="hero-title">
          {user ? `Welcome, ${user.name}` : "Welcome to Hospital Management System"}
        </h1>
        <h2 className="hero-subtitle">Your health, our priority</h2>
        {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}
      </section>

      {/* MAIN ACTIONS */}
      <section className="flex-center mt-2" style={{ gap: 12, flexWrap: "wrap" }}>
        <button className="appointment-button" onClick={goAppointments}>Book Appointment</button>
        <button className="emr-button" onClick={goPrescriptions}>View Prescriptions</button>
        <button className="invoice-button" onClick={() => navigate("/invoices")}>Check Invoice</button>
        <button className="home-button" onClick={goProfile}>Go to Profile</button>
      </section>

      {/* SERVICES */}
      <div className="page-headline mt-2">Services</div>
      <div className="flex-center mt-2">
        <div className="rectangle-shape p-2">
          <span className="section-title text-teal">Patient Care</span>
        </div>
        <div className="rectangle-shape p-2 ml-2">
          <span className="section-title text-teal">Doctor Directory</span>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="flex-center mt-2 p-2 text-gray">
        &copy; {new Date().getFullYear()} Hospital Management System
      </footer>
    </div>
  );
}

export default HomePage;
