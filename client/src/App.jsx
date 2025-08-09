import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage        from './pages/HomePage';
import InventoryPage   from './pages/InventoryPage';
import DoctorRegister  from './pages/DoctorRegister';
import DoctorLogin     from './pages/DoctorLogin';
import DoctorDashboard from './pages/DoctorDashboard';
import StaffRegister   from './pages/StaffRegister';
import StaffLogin      from './pages/StaffLogin';
import StaffDashboard  from './pages/StaffDashboard';
import AdminLogin      from './pages/AdminLogin';
import AdminDashboard  from './pages/AdminDashboard';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: '1rem', background: '#f9f9f9', borderBottom: '1px solid #ddd' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Link to="/" style={{ marginRight: '2rem', fontWeight: 'bold', fontSize: '1.2rem', textDecoration: 'none', color: '#007bff' }}>
              🏥 Hospital Management
            </Link>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/" style={{ textDecoration: 'none', color: '#333' }}>Home</Link>
            <Link to="/inventory" style={{ textDecoration: 'none', color: '#333' }}>Inventory</Link>
            
            {/* Doctor Links */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <span style={{ color: '#666', cursor: 'pointer' }}>
                👨‍⚕️ Doctor ▼
              </span>
              <div style={{ 
                position: 'absolute', 
                top: '100%', 
                left: 0, 
                backgroundColor: 'white', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                minWidth: '150px',
                zIndex: 1000,
                display: 'none' 
              }} className="dropdown">
                <Link to="/doctor/register" style={{ display: 'block', padding: '0.5rem 1rem', textDecoration: 'none', color: '#333' }}>Register</Link>
                <Link to="/doctor/login" style={{ display: 'block', padding: '0.5rem 1rem', textDecoration: 'none', color: '#333' }}>Login</Link>
                <Link to="/doctor/dashboard" style={{ display: 'block', padding: '0.5rem 1rem', textDecoration: 'none', color: '#333' }}>Dashboard</Link>
              </div>
            </div>

            {/* Staff Links */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <span style={{ color: '#666', cursor: 'pointer' }}>
                👩‍💼 Staff ▼
              </span>
              <div style={{ 
                position: 'absolute', 
                top: '100%', 
                left: 0, 
                backgroundColor: 'white', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                minWidth: '150px',
                zIndex: 1000,
                display: 'none' 
              }} className="dropdown">
                <Link to="/staff/register" style={{ display: 'block', padding: '0.5rem 1rem', textDecoration: 'none', color: '#333' }}>Register</Link>
                <Link to="/staff/login" style={{ display: 'block', padding: '0.5rem 1rem', textDecoration: 'none', color: '#333' }}>Login</Link>
                <Link to="/staff/dashboard" style={{ display: 'block', padding: '0.5rem 1rem', textDecoration: 'none', color: '#333' }}>Dashboard</Link>
              </div>
            </div>

            {/* Admin Links */}
            <Link to="/admin/login" style={{ textDecoration: 'none', color: '#dc3545', fontWeight: 'bold' }}>
              🔐 Admin
            </Link>
          </div>
        </div>
      </nav>

      <Routes>
        {/* General Routes */}
        <Route path="/"                    element={<HomePage />} />
        <Route path="/inventory"           element={<InventoryPage />} />
        
        {/* Doctor Routes */}
        <Route path="/doctor/register"     element={<DoctorRegister />} />
        <Route path="/doctor/login"        element={<DoctorLogin />} />
        <Route path="/doctor/dashboard"    element={<DoctorDashboard />} />
        
        {/* Staff Routes */}
        <Route path="/staff/register"      element={<StaffRegister />} />
        <Route path="/staff/login"         element={<StaffLogin />} />
        <Route path="/staff/dashboard"     element={<StaffDashboard />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login"         element={<AdminLogin />} />
        <Route path="/admin/dashboard"     element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
