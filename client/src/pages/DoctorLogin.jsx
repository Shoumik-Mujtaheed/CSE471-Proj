import React, { useState } from 'react';

export default function DoctorLogin() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage]   = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('Loading...');
    
    try {
      console.log('Attempting login with:', { email, password: '***' });
      
      const res = await fetch('/api/doctor/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);
      
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Save token and user info
      localStorage.setItem('doctorToken', data.token);
      localStorage.setItem('doctorInfo', JSON.stringify(data.doctor));
      
      setMessage('✅ Logged in successfully! Redirecting to dashboard...');
      
      // Redirect immediately without delay
      window.location.href = '/doctor/dashboard';
      
    } catch (err) {
      console.error('Login error:', err);
      setMessage('❌ ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>Doctor Login</h1>
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
        <p style={{ marginTop: '1rem', color: message.startsWith('✅') ? 'green' : 'red' }}>
          {message}
        </p>
      )}
    </div>
  );
}
