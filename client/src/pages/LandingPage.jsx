import React from "react";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="centered">
      <h1>Welcome to mediCore</h1>
      <p>Please choose an option:</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 15, maxWidth: 800 }}>
        <button onClick={() => navigate("/admin-login")} style={{ padding: '15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px' }}>
          👨‍💼 Admin Login
        </button>
        <button onClick={() => navigate("/register")} style={{ padding: '15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}>
          📝 User Registration
        </button>
        <button onClick={() => navigate("/login")} style={{ padding: '15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px' }}>
          🔑 User Login 
        </button>
      </div>
    </div>
  );
}

export default LandingPage;
