// pages/AdminLogin.jsx
// Simple admin login page - no authentication required for now, just redirect to dashboard
import React, { useState } from 'react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  // Simple admin access - no real authentication for now
  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');

    // Simple password check (in real app, this would be proper authentication)
    if (password === 'admin123') {
      setMessage('✅ Admin access granted!');
      // Redirect to admin dashboard
      setTimeout(() => {
        window.location.href = '/admin/dashboard';
      }, 1000);
    } else {
      setMessage('❌ Invalid admin password');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>Admin Login</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Enter admin password to access the dashboard
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Admin Password</label><br/>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="Enter admin password"
            style={{ width: '100%', padding: '.5rem' }}
          />
        </div>
        
        <button type="submit" style={{ padding: '.75rem 1.5rem' }}>
          Access Admin Dashboard
        </button>
      </form>

      {message && (
        <p style={{ 
          marginTop: '1rem', 
          color: message.startsWith('✅') ? 'green' : 'red' 
        }}>
          {message}
        </p>
      )}

      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '4px',
        fontSize: '0.9rem',
        color: '#666'
      }}>
        <strong>For demo purposes:</strong><br />
        Admin Password: <code>admin123</code>
      </div>
    </div>
  );
}
