import React from "react";
import "../styles/components/Footer.css"; // New CSS for footer-specific styling

function Footer() {
  return (
    <footer className="footer-main">
      &copy; {new Date().getFullYear()} Hospital Management System
    </footer>
  );
}

export default Footer;
