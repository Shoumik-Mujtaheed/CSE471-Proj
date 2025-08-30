import React from "react";

function Footer() {
  return (
    <footer style={{
      backgroundColor: '#f8f9fa',
      color: '#6c757d',
      padding: '1rem',
      textAlign: 'center',
      borderTop: '1px solid #dee2e6',
      marginTop: 'auto'
    }}>
      &copy; {new Date().getFullYear()} MediCore
    </footer>
  );
}

export default Footer;
