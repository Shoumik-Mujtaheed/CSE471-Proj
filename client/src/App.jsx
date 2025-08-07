import React, { useState, useEffect } from "react";
import InventoryPage from "./pages/InventoryPage";
import AdminSignInPage from "./pages/AdminSignInPage";

function App() {
  // Start by assuming NOT logged in
  const [loggedIn, setLoggedIn] = useState(false);

  // On initial mount, check for token in localStorage
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    setLoggedIn(!!token);
  }, []);

  // Handler for successful login
  const handleLogin = () => setLoggedIn(true);

  // Handler for logout — call this from your inventory page somewhere if you make a logout button
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setLoggedIn(false);
  };

  // Optionally, pass handleLogout to InventoryPage

  return (
    loggedIn
      ? <InventoryPage onLogout={handleLogout} />
      : <AdminSignInPage onLogin={handleLogin} />
  );
}

export default App;
