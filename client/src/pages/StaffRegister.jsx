// pages/StaffRegister.jsx
// Staff registration page
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StaffRegister() {
  const navigate = useNavigate();

  const departments = [
    'Emergency Department', 'ICU', 'Cardiology', 'Neurology', 'Pediatrics',
    'Surgery', 'Radiology', 'Pharmacy', 'Laboratory', 'Administration',
    'Nursing', 'Housekeeping', 'Security', 'IT', 'Finance', 'General'
  ];

  const [form, setForm] = useState({
    name: '', 
    email: '', 
    password: '', 
    phoneNumber: '', 
    department: departments[0]
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/staff/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      // Registration successful, redirect to login
      setMessage('✅ Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/staff/login', { replace: true });
      }, 2000);
    } catch (err) {
      setMessage('❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>Staff Registration</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Full Name</label><br/>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Email</label><br/>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Password</label><br/>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            minLength="6"
            style={{ width: '100%', padding: '.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Phone Number</label><br/>
          <input
            type="tel"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Department</label><br/>
          <select
            name="department"
            value={form.department}
            onChange={handleChange}
            style={{ width: '100%', padding: '.5rem' }}
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '.75rem', 
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          {loading ? 'Registering...' : 'Register as Staff'}
        </button>
      </form>

      {message && (
        <p style={{ 
          marginTop: '1rem', 
          color: message.startsWith('✅') ? 'green' : 'red',
          textAlign: 'center'
        }}>
          {message}
        </p>
      )}

      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        Already have an account?{' '}
        <button 
          onClick={() => navigate('/staff/login')}
          style={{ color: '#007bff', background: 'none', border: 'none', textDecoration: 'underline' }}
        >
          Login here
        </button>
      </p>
    </div>
  );
}
