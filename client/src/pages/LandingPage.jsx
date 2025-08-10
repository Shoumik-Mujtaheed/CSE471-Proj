import React from "react";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="centered">
      <h1>Welcome</h1>
      <p>Please choose an option:</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 250 }}>
        <button onClick={() => navigate("/admin-login")}>Admin Login</button>
        <button onClick={() => navigate("/register")}>User Registration</button>
        <button onClick={() => navigate("/login")}>User Login</button>
      </div>
    </div>
  );
}

export default LandingPage;
