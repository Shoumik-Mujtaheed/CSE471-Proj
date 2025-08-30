import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import DoctorDashboard from "./pages/DoctorDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import InventoryPage from "./pages/InventoryPage";
import MedicationsPage from "./pages/MedicationsPage";
import PrescriptionsPage from "./pages/PrescriptionsPage";
import InvoicesPage from "./pages/InvoicesPage";
import SymptomSearch from "./components/SymptomSearch";
import AppointmentPage from "./pages/AppointmentPage";
import EMRPage from "./pages/EMRPage";
import { isAdminLoggedIn, isUserLoggedIn, logoutAdmin, logoutUser } from "./utils/auth";

function App() {
  return (
    <Routes>
      {/* Landing */}
      <Route path="/" element={<LandingPage />} />

      {/* Admin Login */}
      <Route path="/admin-login" element={<AdminLogin />} />

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

      {/* Dashboard Routes */}
      <Route
        path="/doctor"
        element={
          isUserLoggedIn()
            ? <DoctorDashboard />
            : <Navigate to="/login" />
        }
      />
      
      <Route
        path="/doctor-dashboard"
        element={
          isUserLoggedIn()
            ? <DoctorDashboard />
            : <Navigate to="/login" />
        }
      />
      
      <Route
        path="/doctor/dashboard"
        element={
          isUserLoggedIn()
            ? <DoctorDashboard />
            : <Navigate to="/login" />
        }
      />
      
      <Route
        path="/staff-dashboard"
        element={
          isUserLoggedIn()
            ? <StaffDashboard />
            : <Navigate to="/login" />
        }
      />
      
      <Route
        path="/staff/dashboard"
        element={
          isUserLoggedIn()
            ? <StaffDashboard />
            : <Navigate to="/login" />
        }
      />
      
      <Route
        path="/patient-dashboard"
        element={
          isUserLoggedIn()
            ? <PatientDashboard />
            : <Navigate to="/login" />
        }
      />
      
      <Route
        path="/admin-dashboard"
        element={
          isAdminLoggedIn()
            ? <AdminDashboard />
            : <Navigate to="/admin-login" />
        }
      />

      {/* Patient Feature Routes */}
      <Route
        path="/symptom-search"
        element={
          isUserLoggedIn()
            ? <SymptomSearch />
            : <Navigate to="/login" />
        }
      />

      <Route
        path="/search-doctors"
        element={
          isUserLoggedIn()
            ? <SymptomSearch />
            : <Navigate to="/login" />
        }
      />

      <Route
        path="/book-appointment"
        element={
          isUserLoggedIn()
            ? <AppointmentPage />
            : <Navigate to="/login" />
        }
      />

      <Route
        path="/emr"
        element={
          isUserLoggedIn()
            ? <EMRPage />
            : <Navigate to="/login" />
        }
      />

      {/* Feature Pages */}
      <Route path="/inventory" element={<InventoryPage />} />
      <Route path="/medications" element={<MedicationsPage />} />
      <Route path="/prescriptions" element={<PrescriptionsPage />} />
      <Route path="/invoices" element={<InvoicesPage />} />
    </Routes>
  );
}

export default App;
