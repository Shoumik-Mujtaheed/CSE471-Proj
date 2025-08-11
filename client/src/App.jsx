import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AdminSignInPage from "./pages/AdminSignInPage";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import InventoryPage from "./pages/InventoryPage";
import HomePage from "./pages/HomePage";
import DoctorDashboard from "./pages/DoctorDashboard";
import { isAdminLoggedIn, isUserLoggedIn, logoutAdmin, getUserRole } from "./utils/auth";

function App() {
  return (
    <Routes>
      {/* Landing */}
      <Route path="/" element={<LandingPage />} />

      {/* Admin Login */}
      <Route path="/admin-login" element={<AdminSignInPage />} />

      {/* User Registration & Login */}
      <Route path="/register" element={<Registration />} />
      <Route path="/login" element={<Login />} />

      {/* Admin Protected Route */}
      <Route
        path="/admin/inventory"
        element={
          isAdminLoggedIn()
            ? <InventoryPage onLogout={logoutAdmin} />
            : <Navigate to="/admin-login" />
        }
      />

      {/* Doctor Protected Route */}
      <Route
        path="/doctor-dashboard"
        element={
          (() => {
            const isLoggedIn = isUserLoggedIn();
            const userRole = getUserRole();
            
            console.log("=== DOCTOR ROUTE CHECK ===");
            console.log("isLoggedIn:", isLoggedIn);
            console.log("userRole:", userRole);
            console.log("========================");
            
            if (!isLoggedIn) {
              console.log("Not logged in, redirecting to login");
              return <Navigate to="/login" replace />;
            }
            
            if (userRole === 'doctor') {
              console.log("Doctor access granted");
              return <DoctorDashboard />;
            } else if (userRole === 'patient') {
              console.log("Patient accessing doctor route, redirecting to home");
              return <Navigate to="/home" replace />;
            } else if (userRole === 'admin') {
              console.log("Admin accessing doctor route, redirecting to admin");
              return <Navigate to="/admin/inventory" replace />;
            } else {
              console.log("Unknown role, redirecting to login");
              return <Navigate to="/login" replace />;
            }
          })()
        }
      />

      {/* Patient Protected Route */}
      <Route
        path="/home"
        element={
          (() => {
            const isLoggedIn = isUserLoggedIn();
            const userRole = getUserRole();
            
            console.log("=== PATIENT ROUTE CHECK ===");
            console.log("isLoggedIn:", isLoggedIn);
            console.log("userRole:", userRole);
            console.log("Route condition met:", isLoggedIn && userRole === 'patient');
            console.log("========================");
            
            if (!isLoggedIn) {
              console.log("Not logged in, redirecting to login");
              return <Navigate to="/login" replace />;
            }
            
            if (userRole === 'patient') {
              console.log("Patient access granted");
              return <HomePage />;
            } else if (userRole === 'doctor') {
              console.log("Doctor accessing patient route, redirecting to dashboard");
              return <Navigate to="/doctor-dashboard" replace />;
            } else if (userRole === 'admin') {
              console.log("Admin accessing patient route, redirecting to admin");
              return <Navigate to="/admin/inventory" replace />;
            } else {
              console.log("Unknown role or no role, redirecting to login");
              return <Navigate to="/login" replace />;
            }
          })()
        }
      />
    </Routes>
  );
}

export default App;
