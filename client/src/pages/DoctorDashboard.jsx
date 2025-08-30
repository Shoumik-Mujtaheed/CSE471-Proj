// pages/DoctorDashboard.jsx
// Doctor dashboard with proper time slot and leave request functionality

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/api';
import PatientEMR from '../components/PatientEMR';

const DoctorDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  const [slotRequestData, setSlotRequestData] = useState({
    dayOfWeek: [],
    timeSlot: '',
    notes: ''
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
      
      // Fetch patients
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
    
    // Validate that at least one day is selected
    if (slotRequestData.dayOfWeek.length === 0) {
      alert('Please select at least one day');
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
          notes: ''
        });
        fetchData(); // Refresh data
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
        fetchData(); // Refresh data
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
        fetchData(); // Refresh data
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

  const handlePrescriptionCreated = () => {
    fetchData(); // Refresh data when prescription is created
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
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', color: '#856404' }}>{appointments.length}</p>
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
                  <div key={index} style={{
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
                    <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{patient.user?.name || 'Unknown Patient'}</h3>
                    <p style={{ margin: '5px 0', color: '#666' }}><strong>Email:</strong> {patient.user?.email || 'N/A'}</p>
                    <p style={{ margin: '5px 0', color: '#666' }}><strong>Phone:</strong> {patient.user?.phoneNumber || 'N/A'}</p>
                    <p style={{ margin: '5px 0', color: '#666' }}><strong>Status:</strong> {patient.status}</p>
                    <div style={{ 
                      marginTop: '15px', 
                      padding: '8px 16px', 
                      backgroundColor: '#007bff', 
                      color: 'white', 
                      borderRadius: '5px',
                      textAlign: 'center',
                      fontSize: '14px'
                    }}>
                      👁️ Click to View EMR & Write Prescription
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
            <h2 style={{ color: '#007bff', marginBottom: '20px' }}>📋 My Appointments</h2>
            {appointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <p>No appointments scheduled yet.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                {appointments.map((appointment, index) => (
                  <div key={index} style={{
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
                      <strong>Date:</strong> {new Date(appointment.date).toLocaleDateString('en-US', { 
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

      {/* Time Slot Request Modal */}
      {showSlotRequestForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            width: '90%',
            maxWidth: '500px'
          }}>
            <h2 style={{ marginBottom: '20px', color: '#333' }}>Request Time Slot</h2>
            <form onSubmit={handleSlotRequestSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>
                  Select Days:
                </label>
                <div style={{ marginBottom: '10px' }}>
                  {[
                    { value: 0, label: 'Sunday' },
                    { value: 1, label: 'Monday' },
                    { value: 2, label: 'Tuesday' },
                    { value: 3, label: 'Wednesday' },
                    { value: 4, label: 'Thursday' },
                    { value: 5, label: 'Friday' },
                    { value: 6, label: 'Saturday' }
                  ].map(day => (
                    <label key={day.value} style={{ display: 'block', marginBottom: '5px' }}>
                      <input
                        type="checkbox"
                        checked={slotRequestData.dayOfWeek.includes(day.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSlotRequestData({
                              ...slotRequestData,
                              dayOfWeek: [...slotRequestData.dayOfWeek, day.value]
                            });
                          } else {
                            setSlotRequestData({
                              ...slotRequestData,
                              dayOfWeek: slotRequestData.dayOfWeek.filter(d => d !== day.value)
                            });
                          }
                        }}
                      />
                      {day.label}
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>
                  Time Slot:
                </label>
                <select
                  value={slotRequestData.timeSlot}
                  onChange={(e) => setSlotRequestData({...slotRequestData, timeSlot: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '16px'
                  }}
                >
                  <option value="">Select a time slot</option>
                  <option value="8-12">8:00 AM - 12:00 PM</option>
                  <option value="12-4">12:00 PM - 4:00 PM</option>
                  <option value="4-8">4:00 PM - 8:00 PM</option>
                  <option value="20-00">8:00 PM - 12:00 AM</option>
                </select>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>
                  Notes (Optional):
                </label>
                <textarea
                  value={slotRequestData.notes}
                  onChange={(e) => setSlotRequestData({...slotRequestData, notes: e.target.value})}
                  rows="3"
                  placeholder="Any additional notes for this time slot request"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '16px',
                    resize: 'vertical'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowSlotRequestForm(false)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leave Request Modal */}
      {showLeaveRequestForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            width: '90%',
            maxWidth: '500px'
          }}>
            <h2 style={{ marginBottom: '20px', color: '#333' }}>Request Leave</h2>
            <form onSubmit={handleLeaveRequestSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>
                  Leave Type:
                </label>
                <select
                  value={leaveRequestData.leaveType}
                  onChange={(e) => setLeaveRequestData({...leaveRequestData, leaveType: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '16px'
                  }}
                >
                  <option value="vacation">Annual Leave</option>
                  <option value="sick_leave">Sick Leave</option>
                  <option value="personal_leave">Personal Leave</option>
                  <option value="emergency_leave">Emergency Leave</option>
                  <option value="maternity_leave">Maternity Leave</option>
                  <option value="paternity_leave">Paternity Leave</option>
                  <option value="bereavement_leave">Bereavement Leave</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>
                  Start Date:
                </label>
                <input
                  type="date"
                  value={leaveRequestData.startDate}
                  onChange={(e) => setLeaveRequestData({...leaveRequestData, startDate: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '16px'
                  }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>
                  End Date:
                </label>
                <input
                  type="date"
                  value={leaveRequestData.endDate}
                  onChange={(e) => setLeaveRequestData({...leaveRequestData, endDate: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '16px'
                  }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>
                  Reason:
                </label>
                <textarea
                  value={leaveRequestData.reason}
                  onChange={(e) => setLeaveRequestData({...leaveRequestData, reason: e.target.value})}
                  required
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '16px',
                    resize: 'vertical'
                  }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    checked={leaveRequestData.isEmergency}
                    onChange={(e) => setLeaveRequestData({...leaveRequestData, isEmergency: e.target.checked})}
                    style={{ transform: 'scale(1.2)' }}
                  />
                  <span style={{ color: '#555' }}>Emergency Leave</span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowLeaveRequestForm(false)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default DoctorDashboard;



