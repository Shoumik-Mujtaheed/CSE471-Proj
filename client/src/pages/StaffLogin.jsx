// pages/StaffLogin.jsx
// Staff login page
import React, { useState } from 'react';

export default function StaffLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch('/api/staff/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      // Save token for later auth
      localStorage.setItem('staffToken', data.token);
      setMessage('✅ Logged in successfully! Redirecting...');
      
      // Redirect to staff dashboard
      setTimeout(() => {
        window.location.href = '/staff/dashboard';
      }, 1000);
    } catch (err) {
      setMessage('❌ ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>Staff Login</h1>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Email</label><br/>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '.5rem' }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label>Password</label><br/>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '.5rem' }}
          />
        </div>
        
        <button type="submit" style={{ padding: '.75rem 1.5rem' }}>
          Log In
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

      <p style={{ marginTop: '1rem' }}>
        Don't have an account?{' '}
        <button 
          onClick={() => window.location.href = '/staff/register'}
          style={{ color: '#007bff', background: 'none', border: 'none', textDecoration: 'underline' }}
        >
          Register here
        </button>
      </p>
    </div>
  );
}
