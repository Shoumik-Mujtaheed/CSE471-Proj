import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Registration() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    role: "patient", // default role
    bloodGroup: "A+"
  });
  const [error, setError] = useState("");

  const bloodGroups = [
    "A+","A-","B+","B-","AB+","AB-","O+","O-"
  ];

  const roles = ["patient", "doctor", "staff"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) return setError(data.message || "Registration failed");

      // Store token & redirect
      localStorage.setItem("userToken", data.token);
      navigate("/home");
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <div className="centered">
      <h1>User Registration</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: 350 }}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
          style={{ width: "100%", marginBottom: 10 }}
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
          style={{ width: "100%", marginBottom: 10 }}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={6}
          style={{ width: "100%", marginBottom: 10 }}
        />
        <input
          type="text"
          name="phoneNumber"
          placeholder="Phone Number"
          value={formData.phoneNumber}
          onChange={handleChange}
          required
          style={{ width: "100%", marginBottom: 10 }}
        />
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          style={{ width: "100%", marginBottom: 10 }}
          required
        >
          {roles.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        {formData.role === "patient" && (
          <select
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={handleChange}
            style={{ width: "100%", marginBottom: 10 }}
            required
          >
            {bloodGroups.map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        )}
        <button type="submit" style={{ width: "100%" }}>
          Register
        </button>
        {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}
      </form>
    </div>
  );
}

export default Registration;
