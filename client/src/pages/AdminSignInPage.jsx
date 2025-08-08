import React, { useState } from "react";
import "../App.css";

function AdminSignInPage({ onLogin }) {
  const [name, setname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password })
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "Login failed");

      // Save token in localStorage
      localStorage.setItem('adminToken', data.token);
      if (onLogin) onLogin();
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <div className="centered">
      <h1>Admin Sign In</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: 350 }}>
        <div>
          <input
            type="text"
            placeholder="name"
            autoComplete="name"
            required
            value={name}
            onChange={e => setname(e.target.value)}
            style={{ width: "100%", marginBottom: 10 }}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: "100%", marginBottom: 10 }}
          />
        </div>
        <button type="submit" style={{ width: "100%" }}>
          Sign In
        </button>
        {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}
      </form>
    </div>
  );
}

export default AdminSignInPage;
