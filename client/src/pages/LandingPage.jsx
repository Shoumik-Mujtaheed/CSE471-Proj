import React from "react";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="centered">
      <h1>Welcome to mediCore</h1>
      <p>Please choose an option:</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 250 }}>
        <button onClick={() => navigate("/admin-login")} style={{ padding: '12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px' }}>
          👨‍💼 Admin Login
        </button>
        <button onClick={() => navigate("/register")} style={{ padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}>
          📝 User Registration
        </button>
        <button onClick={() => navigate("/login")} style={{ padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px' }}>
          🔑 User Login 
        </button>
      </div>
      
      {/* <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p><strong>Note:</strong> User Login handles Patients, Doctors, and Staff automatically</p>
        <p>Admin Login is separate for system administration</p>
      </div> */}
    </div>
  );
}

export default LandingPage;
