import React from "react";
import "../App.css";;

function HomePage() {
  return (
    <div className="homepage-root">
      {/* HEADER (could be extracted as a Header component later) */}
      <div className="header-buttons">
        {/* Logo/branding */}
        <img src="/logo.svg" alt="Hospital Logo" className="icon" />
        {/* Navigation buttons */}
        <button className="button-main">Home</button>
        <button className="button-main">Appointments</button>
        <button className="button-main">EMR</button>
        <button className="button-main">Invoices</button>
        {/* Add more nav/actions as needed */}
      </div>

      {/* HERO SECTION */}
      <section className="flex-center flex-col mt-2">
        <h1 className="hero-title">Welcome to Hospital Management System</h1>
        <h2 className="hero-subtitle">Your health, our priority</h2>
      </section>

      {/* CTA / MAIN ACTIONS */}
      <section className="flex-center mt-2">
        <button className="appointment-button">Book Appointment</button>
        <button className="emr-button">View EMR</button>
        <button className="invoice-button">Pay Invoice</button>
        <button className="home-button">Go to Dashboard</button>
      </section>

      {/* PAGE CONTENT/FEATURES (Examples) */}
      <div className="page-headline mt-2">Services</div>
      <div className="flex-center mt-2">
        <div className="rectangle-shape p-2">
          <span className="section-title text-teal">Patient Care</span>
        </div>
        <div className="rectangle-shape p-2 ml-2">
          <span className="section-title text-teal">Doctor Directory</span>
        </div>
      </div>

      {/* FOOTER - Can become its own component */}
      <footer className="flex-center mt-2 p-2 text-gray">
        &copy; {new Date().getFullYear()} Hospital Management System
      </footer>
    </div>
  );
}

export default HomePage;
