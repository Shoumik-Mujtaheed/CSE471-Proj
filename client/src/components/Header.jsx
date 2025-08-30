import React from "react";

function Header() {
  return (
    <header style={{
      backgroundColor: '#007bff',
      color: 'white',
      padding: '1rem',
      textAlign: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>MediCore</h1>
    </header>
  );
}

export default Header;
