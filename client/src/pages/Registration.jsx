import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Registration() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    role: "patient",
    bloodGroup: "A+",
    specialty: "General Medicine"
  });
  const [error, setError] = useState("");

  const bloodGroups = [
    "A+","A-","B+","B-","AB+","AB-","O+","O-"
  ];

  const roles = ["patient", "doctor", "staff"];

  // Medical specialties from the existing system
  const specialties = [
    "General Medicine",
    "Gastroenterology", 
    "General Surgery",
    "Emergency Medicine",
    "Cardiology",
    "Gynecology",
    "Orthopedics",
    "Neurology",
    "Physical Therapy",
    "Pulmonology",
    "Allergy",
    "Infectious Disease",
    "Pediatrics",
    "Pain Management",
    "ENT",
    "Endocrinology",
    "Psychiatry",
    "Rheumatology",
    "Dermatology",
    "Oncology",
    "Nutrition",
    "Urology",
    "Obstetrics"
  ];

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
      const res = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) return setError(data.message || "Registration failed");

      localStorage.setItem("userToken", data.token);
      navigate("/login");
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <div className="centered">
      <h1>User Registration - mediCore</h1>
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
          {roles.map(role => (
            <option key={role} value={role}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </option>
          ))}
        </select>

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

        {formData.role === "doctor" && (
          <select
            name="specialty"
            value={formData.specialty}
            onChange={handleChange}
            required
            style={{ width: "100%", marginBottom: 10 }}
          >
            {specialties.map(specialty => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </select>
        )}

        {error && (
          <div style={{ 
            color: "red", 
            marginBottom: 10, 
            textAlign: "center",
            padding: "8px",
            backgroundColor: "#ffe6e6",
            borderRadius: "4px"
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
            cursor: "pointer"
          }}
        >
          Register
        </button>

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <p style={{ color: "#666", marginBottom: "10px" }}>
            Already have an account?
          </p>
          <button
            onClick={() => navigate("/login")}
            style={{
              padding: "8px 16px",
              backgroundColor: "transparent",
              color: "#007bff",
              border: "1px solid #007bff",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Login Now
          </button>
        </div>
      </form>
    </div>
  );
}

export default Registration;
