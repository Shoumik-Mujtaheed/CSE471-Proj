# mediCore - Hospital Management System

## Overview
mediCore is a comprehensive hospital management system designed to streamline healthcare operations. The system provides a unified platform for managing patients, doctors, staff, inventory, prescriptions, and appointments.

## Features
- **Patient Management**: Complete patient registration, profiles, and medical history tracking
- **Doctor Management**: Doctor registration, specialty management, and appointment scheduling
- **Staff Management**: Staff registration and role-based access control
- **Inventory Management**: Medicine inventory with reorder alerts and bulk upload
- **Prescription Management**: Digital prescription creation and management
- **Appointment System**: Time slot management and appointment booking
- **User Authentication**: Secure role-based access control for all user types

## Technology Stack
- **Frontend**: React.js with modern UI components
- **Backend**: Node.js with Express.js framework
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based secure authentication
- **API**: RESTful API architecture

## Getting Started
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start the server: `npm run dev`
5. Access the application at `http://localhost:3000`

## User Roles
- **Patients**: Can book appointments, view prescriptions, and search symptoms
- **Doctors**: Can manage patients, create prescriptions, and manage time slots
- **Staff**: Can access basic operations and request leave
- **Admins**: Can manage all system operations and approve requests

## API Documentation
The system provides comprehensive REST APIs for all functionality, with proper authentication and role-based access control.

## Contributing
This project is designed to be a complete, production-ready hospital management solution with a focus on simplicity and user experience.
