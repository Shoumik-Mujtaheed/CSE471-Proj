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
import './components/Navigation.css';

export default function App() {
  return (
    <BrowserRouter>
      <nav className="nav-container">
        <div className="nav-content">
          <div>
            <Link to="/" className="nav-brand">
              🏥 Hospital Management
            </Link>
          </div>
          
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/inventory" className="nav-link">Inventory</Link>
            
            {/* Doctor Links */}
            <div className="dropdown-container">
              <span className="dropdown-trigger">
                👨‍⚕️ Doctor ▼
              </span>
              <div className="dropdown-menu">
                <Link to="/doctor/register" className="dropdown-item">Register</Link>
                <Link to="/doctor/login" className="dropdown-item">Login</Link>
                <Link to="/doctor/dashboard" className="dropdown-item">Dashboard</Link>
              </div>
            </div>

            {/* Staff Links */}
            <div className="dropdown-container">
              <span className="dropdown-trigger">
                👩‍💼 Staff ▼
              </span>
              <div className="dropdown-menu">
                <Link to="/staff/register" className="dropdown-item">Register</Link>
                <Link to="/staff/login" className="dropdown-item">Login</Link>
                <Link to="/staff/dashboard" className="dropdown-item">Dashboard</Link>
              </div>
            </div>

            {/* Admin Links */}
            <Link to="/admin/login" className="nav-link-admin">
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
