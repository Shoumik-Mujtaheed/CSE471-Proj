import React from "react";
import "../styles/components/Header.css"; // New CSS for header-specific styling

function Header() {
  return (
    <header className="header-main">
      {/* Your logo, nav, etc. here */}
      <h1 className="header-title">Hospital Management System</h1>
      {/* ...nav, user controls, etc. */}
    </header>
  );
}

export default Header;
