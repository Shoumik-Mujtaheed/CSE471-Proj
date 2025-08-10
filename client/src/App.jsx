import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AdminSignInPage from "./pages/AdminSignInPage";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import InventoryPage from "./pages/InventoryPage";
import { isAdminLoggedIn, isUserLoggedIn, logoutAdmin, logoutUser } from "./utils/auth";
import HomePage from "./pages/HomePage";

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
      {/*Doctor Protected Route */}
      <Route
        path="/doctor-dashboard"
        element={
          isUserLoggedIn() && getUserRole() === 'doctor'
            ? <DoctorDashboard />
            : <Navigate to="/login" />
      }
    />
      {/* User Protected Route */}
      <Route
        path="/home"
        element={
          isUserLoggedIn()
            ? <HomePage /> 
            : <Navigate to="/login" />
        }
      />
    </Routes>
  );
}

export default App;
