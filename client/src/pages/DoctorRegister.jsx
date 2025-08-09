import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ← CHANGED (added)

export default function DoctorRegister() {
  const navigate = useNavigate(); // ← CHANGED (added)

  const specialties = [
    'Cardiology','Dermatology','Endocrinology','Gastroenterology','Hematology',
    'Neurology','Oncology','Ophthalmology','Orthopedics','Pediatrics',
    'Psychiatry','Radiology','Rheumatology','Urology','Nephrology',
    'Pulmonology','Immunology','Pathology','Emergency Medicine','Family Medicine'
  ];

  const [form, setForm] = useState({
    name: '', email: '', password: '', phoneNumber: '', specialty: specialties[0]
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
      const res = await fetch('/api/doctor/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      // DO NOT auto-login or save token here anymore
      // localStorage.setItem('doctorToken', data.token); // (removed)

      // Redirect to the login page after successful registration
      navigate('/doctor/login', { replace: true }); // ← CHANGED (redirect to login)
    } catch (err) {
      setMessage('❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>Doctor Registration</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Name</label><br/>
          <input
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
            style={{ width: '100%', padding: '.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Phone Number</label><br/>
          <input
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Specialty</label><br/>
          <select
            name="specialty"
            value={form.specialty}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '.5rem' }}
          >
            {specialties.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ padding: '.75rem 1.5rem', width: '100%' }}
        >
          {loading ? 'Registering…' : 'Register'}
        </button>
      </form>

      {message && (
        <p style={{ marginTop: '1rem', color: message.startsWith('❌') ? 'red' : 'green' }}>
          {message}
        </p>
      )}
    </div>
  );
}
