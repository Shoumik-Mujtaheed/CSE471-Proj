// pages/DoctorDashboard.jsx
// Doctor dashboard with proper time slot and leave request functionality

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/api';
import PatientEMR from '../components/PatientEMR';
import WritePrescription from '../components/WritePrescription';

const DoctorDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [showWritePrescription, setShowWritePrescription] = useState(false);
  const [selectedAppointmentForPrescription, setSelectedAppointmentForPrescription] = useState(null);

  const [slotRequestData, setSlotRequestData] = useState({
    dayOfWeek: [],
    timeSlot: '',
    notes: '',
    validFrom: '',
    validTo: ''
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Form states
  const [showSlotRequestForm, setShowSlotRequestForm] = useState(false);
  const [showLeaveRequestForm, setShowLeaveRequestForm] = useState(false);
  const [showPatientEMR, setShowPatientEMR] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [leaveRequestData, setLeaveRequestData] = useState({
    leaveType: 'vacation',
    startDate: '',
    endDate: '',
    reason: '',
    isEmergency: false
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('userToken');
      
      // Fetch patients using the original endpoint
      const patientsRes = await fetch(`${API_BASE_URL}/api/doctor/patients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (patientsRes.ok) {
        const patientsData = await patientsRes.json();
        setPatients(patientsData);
      }

      // Fetch leave requests
      const leaveRequestsRes = await fetch(`${API_BASE_URL}/api/doctor/leave-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (leaveRequestsRes.ok) {
        const leaveRequestsData = await leaveRequestsRes.json();
        setLeaveRequests(leaveRequestsData);
      }

      // Fetch doctor's time slots
      const timeSlotsRes = await fetch(`${API_BASE_URL}/api/time-slots/doctor/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (timeSlotsRes.ok) {
        const timeSlotsData = await timeSlotsRes.json();
        setTimeSlots(timeSlotsData.timeSlots || []);
      }

      // Fetch doctor's appointments
      const appointmentsRes = await fetch(`${API_BASE_URL}/api/appointments/doctor/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        setAppointments(appointmentsData.appointments || []);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    navigate('/');
  };

  // Time Slot Request Functions
  const handleSlotRequestSubmit = async (e) => {
    e.preventDefault();
    
    if (slotRequestData.dayOfWeek.length === 0) {
      alert('Please select at least one day');
      return;
    }

    if (!slotRequestData.validFrom || !slotRequestData.validTo) {
      alert('Please select Start Date and End Date for these weekly slots.');
      return;
    }
    
    const from = new Date(slotRequestData.validFrom);
    const to = new Date(slotRequestData.validTo);
    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      alert('Please select a valid date range.');
      return;
    }
    if (from > to) {
      alert('Start Date must be before End Date.');
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch(`${API_BASE_URL}/api/time-slots/request`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(slotRequestData)
      });

      if (res.ok) {
        alert('Time slot request submitted successfully! (Pending admin approval)');
        setShowSlotRequestForm(false);
        setSlotRequestData({
          dayOfWeek: [],
          timeSlot: '',
          notes: '',
          validFrom: '',
          validTo: ''
        });
        fetchData();
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Failed to submit request');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    }
  };

  const getDayName = (dayNumber) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return '#ffc107';
      case 'ASSIGNED': return '#28a745';
      case 'REJECTED': return '#dc3545';
      case 'BOOKED': return '#6f42c1';
      default: return '#6c757d';
    }
  };

  const getAppointmentStatusColor = (status) => {
    switch (status) {
      case 'booked': return '#007bff';
      case 'confirmed': return '#28a745';
      case 'completed': return '#6c757d';
      case 'cancelled': return '#dc3545';
      case 'no-show': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'low': return '#28a745';
      case 'normal': return '#007bff';
      case 'high': return '#ffc107';
      case 'emergency': return '#dc3545';
      default: return '#6c757d';
    }
  };

  // Leave Request Functions
  const handleLeaveRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch(`${API_BASE_URL}/api/doctor/leave-requests`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(leaveRequestData)
      });

      if (res.ok) {
        alert('Leave request submitted successfully!');
        setShowLeaveRequestForm(false);
        setLeaveRequestData({
          leaveType: 'vacation',
          startDate: '',
          endDate: '',
          reason: '',
          isEmergency: false
        });
        fetchData();
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Failed to submit request');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    }
  };

  const cancelLeaveRequest = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) return;
    
    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch(`${API_BASE_URL}/api/doctor/leave-requests/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        alert('Leave request cancelled successfully!');
        fetchData();
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Failed to cancel request');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    }
  };

  // Patient EMR Functions
  const viewPatientEMR = (patient) => {
    setSelectedPatient(patient);
    setShowPatientEMR(true);
  };

  // Write Prescription Function
  const openWritePrescription = (appointment) => {
    setSelectedAppointmentForPrescription(appointment);
    setShowWritePrescription(true);
  };

  const handlePrescriptionCreated = () => {
    fetchData();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div style={{ backgroundColor: '#e3f2fd', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>👥 Patients</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', color: '#1976d2' }}>{patients.length}</p>
              </div>
              <div style={{ backgroundColor: '#e8f5e8', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>⏰ Time Slots</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', color: '#2e7d32' }}>{timeSlots.length}</p>
              </div>
              <div style={{ backgroundColor: '#fce4ec', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#c2185b' }}>📅 Pending Requests</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', color: '#c2185b' }}>{leaveRequests.length}</p>
              </div>
              <div style={{ backgroundColor: '#fff3cd', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#856404' }}>📋 Appointments</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', color: '#856404' }}>{appointments.filter(apt => apt.status !== 'completed').length}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '20px',
              marginTop: '30px'
            }}>
              <button
                onClick={() => setShowSlotRequestForm(true)}
                style={{
                  padding: '15px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                ⏰ Request Time Slot
              </button>
              <button
                onClick={() => setShowLeaveRequestForm(true)}
                style={{
                  padding: '15px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                📅 Request Leave
              </button>
            </div>
          </div>
        );
      
      case 'patients':
        return (
          <div>
            <h2 style={{ color: '#007bff', marginBottom: '20px' }}>👥 My Patients</h2>
            {patients.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <p>No patients assigned yet.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {patients.map((patient, index) => (
                  <div key={patient._id || index} style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '20px',
                    backgroundColor: '#f8f9fa',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  onClick={() => viewPatientEMR(patient)}
                  >
                    <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{patient.user?.name || patient.name || 'Unknown Patient'}</h3>
                    <p style={{ margin: '5px 0', color: '#666' }}><strong>Email:</strong> {patient.user?.email || patient.email || 'N/A'}</p>
                    <p style={{ margin: '5px 0', color: '#666' }}><strong>Phone:</strong> {patient.user?.phoneNumber || patient.phoneNumber || 'N/A'}</p>
                    <p style={{ margin: '5px 0', color: '#666' }}><strong>Status:</strong> {patient.status || 'Active'}</p>
                    <div style={{ 
                      marginTop: '15px', 
                      padding: '8px 16px', 
                      backgroundColor: '#007bff', 
                      color: 'white', 
                      borderRadius: '5px',
                      textAlign: 'center',
                      fontSize: '14px'
                    }}>
                      👁️ Click to View EMR
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'time-slots':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#007bff', margin: 0 }}>⏰ My Time Slots</h2>
              <button
                onClick={() => setShowSlotRequestForm(true)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                ➕ Request New Slot
              </button>
            </div>
            
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ color: '#007bff', marginBottom: '15px' }}>📅 Time Slots ({timeSlots.length})</h3>
              {timeSlots.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  <p>No time slots assigned yet. Request a time slot to get started!</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                  {timeSlots.map((slot, index) => (
                    <div key={index} style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '20px',
                      backgroundColor: '#f8f9fa'
                    }}>
                      <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
                        {getDayName(slot.dayOfWeek)} - {slot.timeSlot}
                      </h4>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>Status:</strong> 
                        <span style={{ 
                          color: getStatusColor(slot.status),
                          fontWeight: 'bold',
                          marginLeft: '5px'
                        }}>
                          {slot.status}
                        </span>
                      </p>
                      {slot.validFrom && slot.validTo && (
                        <p style={{ margin: '5px 0', color: '#666' }}>
                          <strong>Active:</strong> {new Date(slot.validFrom).toLocaleDateString()} - {new Date(slot.validTo).toLocaleDateString()}
                        </p>
                      )}
                      {slot.notes && (
                        <p style={{ margin: '5px 0', color: '#666' }}>
                          <strong>Notes:</strong> {slot.notes}
                        </p>
                      )}
                      {slot.approvedAt && (
                        <p style={{ margin: '5px 0', color: '#666' }}>
                          <strong>Approved:</strong> {new Date(slot.approvedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      
      case 'appointments':
        return (
          <div>
            <h2 style={{ color: '#007bff', marginBottom: '20px' }}>📋 My Active Appointments</h2>
            {/* Filter out completed appointments */}
            {appointments.filter(appointment => appointment.status !== 'completed').length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <p>No active appointments scheduled yet.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                {appointments
                  .filter(appointment => appointment.status !== 'completed')  // 🔥 Filter out completed appointments
                  .map((appointment, index) => (
                  <div key={appointment._id || index} style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '20px',
                    backgroundColor: '#f8f9fa'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                      <h3 style={{ margin: '0', color: '#333' }}>Patient: {appointment.user?.name || 'Unknown'}</h3>
                      <span style={{
                        padding: '4px 8px',
                        backgroundColor: getAppointmentStatusColor(appointment.status),
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {appointment.status}
                      </span>
                    </div>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      <strong>Date:</strong> {new Date(appointment.bookedDate || appointment.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      <strong>Time:</strong> {appointment.timeSlot}
                    </p>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      <strong>Reason:</strong> {appointment.reason}
                    </p>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      <strong>Urgency:</strong> 
                      <span style={{ 
                        color: getUrgencyColor(appointment.urgency),
                        fontWeight: 'bold',
                        marginLeft: '5px'
                      }}>
                        {appointment.urgency}
                      </span>
                    </p>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      <strong>Email:</strong> {appointment.user?.email || 'N/A'}
                    </p>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      <strong>Phone:</strong> {appointment.user?.phoneNumber || 'N/A'}
                    </p>
                    
                    {/* Write Prescription Button */}
                    <div style={{ marginTop: '15px' }}>
                      <button
                        onClick={() => openWritePrescription(appointment)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        📝 Write Prescription
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      
      case 'requests':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#007bff', margin: 0 }}>📅 Leave Requests</h2>
              <button
                onClick={() => setShowLeaveRequestForm(true)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                ➕ New Request
              </button>
            </div>
            
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ color: '#28a745', marginBottom: '15px' }}>🏖️ Leave Requests ({leaveRequests.length})</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {leaveRequests.map((request, index) => (
                  <div key={index} style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '20px',
                    backgroundColor: '#f8f9fa'
                  }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
                      {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                    </h4>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      <strong>Type:</strong> {request.leaveType}
                    </p>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      <strong>Reason:</strong> {request.reason}
                    </p>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      <strong>Status:</strong> <span style={{ color: '#ffc107' }}>{request.status}</span>
                    </p>
                    {request.status === 'pending' && (
                      <button
                        onClick={() => cancelLeaveRequest(request._id)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          marginTop: '10px'
                        }}
                      >
                        Cancel Request
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'white'
      }}>
        <div style={{ color: '#333', fontSize: '20px' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: 'white',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '10px',
        padding: '30px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <h1 style={{ color: '#333', margin: 0 }}>👨‍⚕️ Doctor Dashboard - mediCore</h1>
          <button 
            onClick={handleLogout} 
            style={{ 
              padding: '10px 20px',
              backgroundColor: '#dc3545', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '30px',
          borderBottom: '2px solid #eee',
          paddingBottom: '10px'
        }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === 'overview' ? '#007bff' : '#f8f9fa',
              color: activeTab === 'overview' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('patients')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === 'patients' ? '#007bff' : '#f8f9fa',
              color: activeTab === 'patients' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            👥 Patients
          </button>
          <button
            onClick={() => setActiveTab('time-slots')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === 'time-slots' ? '#007bff' : '#f8f9fa',
              color: activeTab === 'time-slots' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            ⏰ Time Slots
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === 'appointments' ? '#007bff' : '#f8f9fa',
              color: activeTab === 'appointments' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            📋 Appointments
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === 'requests' ? '#007bff' : '#f8f9fa',
              color: activeTab === 'requests' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            📅 Requests
          </button>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>

      {/* Time Slot Request Modal - Add all your existing modals here */}
      {/* ... existing modal code ... */}

      {/* Patient EMR Modal */}
      {showPatientEMR && selectedPatient && (
        <PatientEMR
          patient={selectedPatient}
          onClose={() => {
            setShowPatientEMR(false);
            setSelectedPatient(null);
          }}
          onPrescriptionCreated={handlePrescriptionCreated}
        />
      )}

      {/* Write Prescription Modal */}
      {showWritePrescription && selectedAppointmentForPrescription && (
        <WritePrescription
          appointment={selectedAppointmentForPrescription}
          onClose={() => {
            setShowWritePrescription(false);
            setSelectedAppointmentForPrescription(null);
          }}
          onSuccess={handlePrescriptionCreated}
        />
      )}
    </div>
  );
};

export default DoctorDashboard;
