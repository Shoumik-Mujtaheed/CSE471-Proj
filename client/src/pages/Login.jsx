import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Attempting login with email:", email); // DEBUG

      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      console.log("Login response:", data); // DEBUG
      console.log("Response status:", res.status); // DEBUG

      if (!res.ok) {
        console.log("Login failed:", data.message); // DEBUG
        setError(data.message || "Login failed");
        return;
      }

      // Save token and user data
      localStorage.setItem("userToken", data.token);
      
      // Optionally store user info to avoid immediate API call on HomePage
      if (data.user) {
        localStorage.setItem("userData", JSON.stringify(data.user));
      }

      console.log("Token saved:", localStorage.getItem("userToken")); // DEBUG
      console.log("User data saved:", localStorage.getItem("userData")); // DEBUG

      // Role-based navigation
      const userRole = data.user?.role;
      console.log("User role:", userRole); // DEBUG

      if (userRole === 'doctor') {
        console.log("Navigating to doctor dashboard"); // DEBUG
        navigate("/doctor-dashboard");
      } else if (userRole === 'patient') {
        console.log("Navigating to patient home"); // DEBUG
        navigate("/home");
      } else {
        // Default navigation for other roles or if role is undefined
        console.log("Navigating to default home"); // DEBUG
        navigate("/home");
      }

    } catch (err) {
      console.error("Login error:", err); // DEBUG
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="centered">
      <h1>User Login</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: 350 }}>
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 10 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 10 }}
        />
        <button 
          type="submit" 
          style={{ width: "100%" }}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}
      </form>
      
      <div style={{ marginTop: 20, textAlign: "center" }}>
        <span>Don't have an account? </span>
        <button 
          type="button"
          onClick={() => navigate("/register")}
          style={{ background: "none", border: "none", color: "blue", textDecoration: "underline", cursor: "pointer" }}
        >
          Register here
        </button>
      </div>
    </div>
  );
}

export default Login;
