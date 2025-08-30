// pages/AdminDashboard.jsx
// Admin dashboard with approve/reject functionality for requests and staff management

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/api';

function AdminDashboard() {
  const [timeSlots, setTimeSlots] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [staff, setStaff] = useState([]);
  const [patients, setPatients] = useState([]); // Added patients state
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending-requests');
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin-login');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      // Fetch patients - Added patients API call
      try {
        const patientsRes = await fetch(`${API_BASE_URL}/api/admin/patients`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (patientsRes.ok) {
          const patientsData = await patientsRes.json();
          setPatients(patientsData || []);
        }
      } catch (patientsError) {
        console.log('Error fetching patients:', patientsError);
        // If the endpoint doesn't exist, you can also fetch from users endpoint
        try {
          const usersRes = await fetch(`${API_BASE_URL}/api/users`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (usersRes.ok) {
            const usersData = await usersRes.json();
            // Filter only patients from users
            const patientUsers = usersData.filter(user => user.role === 'patient');
            setPatients(patientUsers);
          }
        } catch (usersError) {
          console.log('Error fetching users for patients:', usersError);
          setPatients([]);
        }
      }
      
      // Fetch time slots
      const slotRes = await fetch(`${API_BASE_URL}/api/time-slots`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (slotRes.ok) {
        const slotData = await slotRes.json();
        setTimeSlots(slotData.timeSlots || []);
      }

      // Fetch leave requests
      const leaveRes = await fetch(`${API_BASE_URL}/api/admin/leave-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (leaveRes.ok) {
        const leaveData = await leaveRes.json();
        setLeaveRequests(leaveData);
      }

      // Fetch doctors
      const doctorsRes = await fetch(`${API_BASE_URL}/api/admin/doctors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (doctorsRes.ok) {
        const doctorsData = await doctorsRes.json();
        setDoctors(doctorsData);
      }

      // Fetch staff
      const staffRes = await fetch(`${API_BASE_URL}/api/admin/staff`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (staffRes.ok) {
        const staffData = await staffRes.json();
        setStaff(staffData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  // Time Slot Functions
  const approveTimeSlot = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/api/time-slots/${id}/approve`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        alert('Time slot approved successfully!');
        fetchData(); // Refresh data
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Failed to approve time slot');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    }
  };

  const rejectTimeSlot = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/api/time-slots/${id}/reject`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason: 'Rejected by admin' })
      });

      if (res.ok) {
        alert('Time slot rejected successfully!');
        fetchData(); // Refresh data
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Failed to reject time slot');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    }
  };

  // Helper function to get day name
  const getDayName = (dayNumber) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber];
  };

  // Leave Request Functions
  const approveLeaveRequest = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/api/admin/leave-requests/${id}/approve`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ adminComment: 'Approved' })
      });

      if (res.ok) {
        alert('Leave request approved successfully!');
        fetchData(); // Refresh data
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Failed to approve request');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    }
  };

  const rejectLeaveRequest = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/api/admin/leave-requests/${id}/reject`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ adminComment: 'Rejected' })
      });

      if (res.ok) {
        alert('Leave request rejected successfully!');
        fetchData(); // Refresh data
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Failed to reject request');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'pending-requests':
        return (
          <div>
            <h2>Pending Time Slot Requests</h2>
            <p>Review and approve/reject doctor time slot requests</p>
            
            {/* Pending Requests Count */}
            <div style={{ marginBottom: '20px' }}>
              <h3>Pending Requests: {timeSlots.filter(slot => slot.status === 'PENDING').length}</h3>
              <p>These time slots have been requested by doctors and need your approval.</p>
            </div>

            {/* Show Only Pending Slots */}
            {timeSlots.filter(slot => slot.status === 'PENDING').length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
                {timeSlots.filter(slot => slot.status === 'PENDING').map((slot) => {
                  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                  const dayName = days[slot.dayOfWeek];
                  
                  return (
                    <div key={slot._id} style={{
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      padding: '15px',
                      backgroundColor: 'white'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 style={{ margin: 0 }}>
                          {dayName} - {slot.timeSlot}
                        </h3>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          backgroundColor: '#ffc107',
                          color: '#333'
                        }}>
                          PENDING
                        </span>
                      </div>
                      
                      {slot.assignedTo && (
                        <div style={{ marginBottom: '15px' }}>
                          <p style={{ margin: '5px 0', fontSize: '14px' }}>
                            <strong>Doctor:</strong> {slot.assignedTo.user?.name || 'Unknown'}
                          </p>
                          <p style={{ margin: '5px 0', fontSize: '14px' }}>
                            <strong>Email:</strong> {slot.assignedTo.user?.email || 'N/A'}
                          </p>
                          <p style={{ margin: '5px 0', fontSize: '14px' }}>
                            <strong>Specialty:</strong> {slot.assignedTo.specialty || 'N/A'}
                          </p>
                        </div>
                      )}
                      
                      {slot.notes && (
                        <div style={{ marginBottom: '15px' }}>
                          <p style={{ margin: '5px 0', fontSize: '14px' }}>
                            <strong>Notes:</strong> {slot.notes}
                          </p>
                        </div>
                      )}
                      
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => approveTimeSlot(slot._id)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => rejectTimeSlot(slot._id)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <h3 style={{ margin: '0 0 15px 0' }}>No Pending Requests!</h3>
                <p style={{ margin: 0, fontSize: '16px' }}>
                  All time slot requests have been processed. Check the "All Time Slots" tab for complete overview.
                </p>
              </div>
            )}
          </div>
        );
      
      case 'time-slots':
        return (
          <div>
            <h2 style={{ color: '#6f42c1', marginBottom: '10px' }}>Time Slot Management</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>Manage all time slots and approve/reject doctor requests</p>
            
            {/* Summary Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
              <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 5px 0', color: '#28a745' }}>Available</h4>
                <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#28a745' }}>
                  {timeSlots.filter(slot => slot.status === 'AVAILABLE').length}
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 5px 0', color: '#ffc107' }}>Pending</h4>
                <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#ffc107' }}>
                  {timeSlots.filter(slot => slot.status === 'PENDING').length}
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#d1ecf1', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 5px 0', color: '#17a2b8' }}>Assigned</h4>
                <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#17a2b8' }}>
                  {timeSlots.filter(slot => slot.status === 'ASSIGNED').length}
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8d7da', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 5px 0', color: '#dc3545' }}>Booked</h4>
                <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#dc3545' }}>
                  {timeSlots.filter(slot => slot.status === 'BOOKED').length}
                </p>
              </div>
            </div>

            {/* Time Slots by Day */}
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((dayName, dayIndex) => {
              const daySlots = timeSlots.filter(slot => slot.dayOfWeek === dayIndex);
              if (daySlots.length === 0) return null;
              
              return (
                <div key={dayIndex} style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: '#333', marginBottom: '10px', borderBottom: '2px solid #eee', paddingBottom: '5px' }}>
                    {dayName}
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
                    {daySlots.map((slot) => (
                      <div key={slot._id} style={{
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        padding: '15px',
                        backgroundColor: 'white'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <strong style={{ fontSize: '16px' }}>{slot.timeSlot}</strong>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            backgroundColor: 
                              slot.status === 'AVAILABLE' ? '#e8f5e8' :
                              slot.status === 'PENDING' ? '#fff3cd' :
                              slot.status === 'ASSIGNED' ? '#d1ecf1' :
                              slot.status === 'BOOKED' ? '#f8d7da' : '#f8f9fa',
                            color: 
                              slot.status === 'AVAILABLE' ? '#28a745' :
                              slot.status === 'PENDING' ? '#ffc107' :
                              slot.status === 'ASSIGNED' ? '#17a2b8' :
                              slot.status === 'BOOKED' ? '#dc3545' : '#6c757d'
                          }}>
                            {slot.status}
                          </span>
                        </div>
                        
                        {slot.assignedTo && (
                          <p style={{ margin: '5px 0', fontSize: '14px' }}>
                            <strong>Doctor:</strong> {slot.assignedTo.user?.name || 'Unknown'}
                          </p>
                        )}
                        
                        {slot.notes && (
                          <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                            <strong>Notes:</strong> {slot.notes}
                          </p>
                        )}
                        
                        {slot.status === 'PENDING' && (
                          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button
                              onClick={() => approveTimeSlot(slot._id)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectTimeSlot(slot._id)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {timeSlots.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                No time slots found. The system may not be initialized yet.
              </div>
            )}
          </div>
        );
      
      case 'leave-requests':
        return (
          <div>
            <h2 style={{ color: '#007bff', marginBottom: '10px' }}>Pending Leave Requests</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>Review and approve/reject leave requests from doctors and staff</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
              {leaveRequests.map((request, index) => (
                <div key={index} style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: '#f8f9fa'
                }}>
                  <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>
                    {request.requesterType} Leave Request
                  </h3>
                  <p style={{ margin: '5px 0', color: '#666' }}>
                    <strong>Name:</strong> {request.requester?.user?.name || 'Unknown'}
                  </p>
                  <p style={{ margin: '5px 0', color: '#666' }}>
                    <strong>Type:</strong> {request.leaveType}
                  </p>
                  <p style={{ margin: '5px 0', color: '#666' }}>
                    <strong>Dates:</strong> {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                  </p>
                  <p style={{ margin: '5px 0', color: '#666' }}>
                    <strong>Reason:</strong> {request.reason}
                  </p>
                  <p style={{ margin: '5px 0', color: '#666' }}>
                    <strong>Status:</strong> <span style={{ color: '#ffc107' }}>{request.status}</span>
                  </p>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <button
                      onClick={() => approveLeaveRequest(request._id)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectLeaveRequest(request._id)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
              {leaveRequests.length === 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px', 
                  color: '#666',
                  gridColumn: '1 / -1'
                }}>
                  No pending leave requests
                </div>
              )}
            </div>
          </div>
        );
      
      case 'patients':
        return (
          <div>
            <h2 style={{ color: '#007bff', marginBottom: '10px' }}>All Patients</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>View all registered patients in the system</p>
            
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '8px', 
              padding: '20px',
              border: '1px solid #ddd'
            }}>
              {patients.map((patient, index) => (
                <div key={index} style={{
                  padding: '15px 0',
                  borderBottom: index < patients.length - 1 ? '1px solid #eee' : 'none'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>{patient.name || patient.user?.name || 'Unknown'}</h3>
                      <p style={{ margin: '2px 0', color: '#666' }}>
                        <strong>Email:</strong> {patient.email || patient.user?.email || 'N/A'}
                      </p>
                      <p style={{ margin: '2px 0', color: '#666' }}>
                        <strong>Phone:</strong> {patient.phoneNumber || patient.user?.phoneNumber || 'N/A'}
                      </p>
                      {patient.bloodGroup && (
                        <p style={{ margin: '2px 0', color: '#666' }}>
                          <strong>Blood Group:</strong> {patient.bloodGroup}
                        </p>
                      )}
                    </div>
                    <div style={{ color: '#999', fontSize: '14px' }}>
                      Registered: {new Date(patient.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
              {patients.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  No patients registered
                </div>
              )}
            </div>
          </div>
        );
      
      case 'doctors':
        return (
          <div>
            <h2 style={{ color: '#007bff', marginBottom: '10px' }}>All Doctors</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>View all registered doctors in the system</p>
            
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '8px', 
              padding: '20px',
              border: '1px solid #ddd'
            }}>
              {doctors.map((doctor, index) => (
                <div key={index} style={{
                  padding: '15px 0',
                  borderBottom: index < doctors.length - 1 ? '1px solid #eee' : 'none'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>{doctor.user?.name || 'Unknown'}</h3>
                      <p style={{ margin: '2px 0', color: '#666' }}>
                        <strong>Email:</strong> {doctor.user?.email || 'N/A'}
                      </p>
                      <p style={{ margin: '2px 0', color: '#666' }}>
                        <strong>Phone:</strong> {doctor.user?.phoneNumber || 'N/A'}
                      </p>
                      <p style={{ margin: '2px 0', color: '#666' }}>
                        <strong>Specialty:</strong> {doctor.specialty || 'N/A'}
                      </p>
                    </div>
                    <div style={{ color: '#999', fontSize: '14px' }}>
                      Registered: {new Date(doctor.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
              {doctors.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  No doctors registered
                </div>
              )}
            </div>
          </div>
        );
      
      case 'staff':
        return (
          <div>
            <h2 style={{ color: '#007bff', marginBottom: '10px' }}>All Staff</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>View all registered staff members in the system</p>
            
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '8px', 
              padding: '20px',
              border: '1px solid #ddd'
            }}>
              {staff.map((staffMember, index) => (
                <div key={index} style={{
                  padding: '15px 0',
                  borderBottom: index < staff.length - 1 ? '1px solid #eee' : 'none'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>{staffMember.user?.name || 'Unknown'}</h3>
                      <p style={{ margin: '2px 0', color: '#666' }}>
                        <strong>Email:</strong> {staffMember.user?.email || 'N/A'}
                      </p>
                      <p style={{ margin: '2px 0', color: '#666' }}>
                        <strong>Phone:</strong> {staffMember.user?.phoneNumber || 'N/A'}
                      </p>
                      <p style={{ margin: '2px 0', color: '#666' }}>
                        <strong>Department:</strong> {staffMember.department || 'N/A'}
                      </p>
                    </div>
                    <div style={{ color: '#999', fontSize: '14px' }}>
                      Registered: {new Date(staffMember.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
              {staff.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  No staff members registered
                </div>
              )}
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
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#333', margin: '0 0 10px 0' }}>Admin Dashboard</h1>
          <p style={{ color: '#666', margin: 0 }}>Manage mediCore operations, requests, and staff</p>
        </div>

        {/* Top Navigation */}
        <nav style={{
          backgroundColor: '#f8f9fa',
          padding: '15px 20px',
          borderRadius: '8px',
          marginBottom: '30px',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
              🏥 mediCore
            </div>
            
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <button
                onClick={() => navigate('/')}
                style={{ background: 'none', border: 'none', color: '#333', cursor: 'pointer', padding: '8px 12px', borderRadius: '4px' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Home
              </button>
              <button
                onClick={() => navigate('/inventory')}
                style={{ background: 'none', border: 'none', color: '#333', cursor: 'pointer', padding: '8px 12px', borderRadius: '4px' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Inventory
              </button>
              <button
                onClick={() => setActiveTab('patients')}
                style={{ background: 'none', border: 'none', color: '#333', cursor: 'pointer', padding: '8px 12px', borderRadius: '4px' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                👤 Patient
              </button>
              <button
                onClick={() => setActiveTab('doctors')}
                style={{ background: 'none', border: 'none', color: '#333', cursor: 'pointer', padding: '8px 12px', borderRadius: '4px' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                👤 Doctor
              </button>
              <button
                onClick={() => setActiveTab('staff')}
                style={{ background: 'none', border: 'none', color: '#333', cursor: 'pointer', padding: '8px 12px', borderRadius: '4px' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                👤 Staff
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#dc3545',
                    fontWeight: 'bold',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    backgroundColor: '#fff5f5'
                  }}
                >
                  🔒 Admin
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Quick Stats - Updated with Patients widget first */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', // Reduced from 200px to 180px to fit 5 widgets
          gap: '15px', // Reduced from 20px to 15px 
          marginBottom: '30px' 
        }}>
          {/* Patients Widget - Added first */}
          <div style={{ 
            backgroundColor: '#fff3e0', 
            padding: '20px', 
            borderRadius: '8px', 
            textAlign: 'center',
            border: '1px solid #ffcc02'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#f57c00' }}>👥 Patients</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', color: '#f57c00' }}>{patients.length}</p>
          </div>

          {/* Doctors Widget */}
          <div style={{ 
            backgroundColor: '#e3f2fd', 
            padding: '20px', 
            borderRadius: '8px', 
            textAlign: 'center',
            border: '1px solid #bbdefb'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>👨‍⚕️ Doctors</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', color: '#1976d2' }}>{doctors.length}</p>
          </div>

          {/* Staff Widget */}
          <div style={{ 
            backgroundColor: '#e8f5e8', 
            padding: '20px', 
            borderRadius: '8px', 
            textAlign: 'center',
            border: '1px solid #c8e6c9'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>👥 Staff</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', color: '#2e7d32' }}>{staff.length}</p>
          </div>

          {/* Time Slots Widget */}
          <div style={{ 
            backgroundColor: '#f3e5f5', 
            padding: '20px', 
            borderRadius: '8px', 
            textAlign: 'center',
            border: '1px solid #e1bee7'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#6f42c1' }}>⏰ Time Slots</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', color: '#6f42c1' }}>{timeSlots.length || 0}</p>
          </div>

          {/* Leave Requests Widget */}
          <div style={{ 
            backgroundColor: '#fce4ec', 
            padding: '20px', 
            borderRadius: '8px', 
            textAlign: 'center',
            border: '1px solid #f8bbd9'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#c2185b' }}>📅 Leave Requests</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', color: '#c2185b' }}>{leaveRequests.length}</p>
          </div>
        </div>

        {/* Tab Navigation - Updated with Patients tab */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '30px',
          borderBottom: '2px solid #eee',
          paddingBottom: '10px'
        }}>
          <button
            onClick={() => setActiveTab('pending-requests')}
            style={{
              padding: '12px 24px',
              backgroundColor: activeTab === 'pending-requests' ? '#007bff' : 'white',
              color: activeTab === 'pending-requests' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Pending Requests ({timeSlots.filter(slot => slot.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setActiveTab('time-slots')}
            style={{
              padding: '12px 24px',
              backgroundColor: activeTab === 'time-slots' ? '#007bff' : 'white',
              color: activeTab === 'time-slots' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            All Time Slots
          </button>
          <button
            onClick={() => setActiveTab('leave-requests')}
            style={{
              padding: '12px 24px',
              backgroundColor: activeTab === 'leave-requests' ? '#007bff' : 'white',
              color: activeTab === 'leave-requests' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Leave Requests
          </button>
          <button
            onClick={() => setActiveTab('patients')}
            style={{
              padding: '12px 24px',
              backgroundColor: activeTab === 'patients' ? '#007bff' : 'white',
              color: activeTab === 'patients' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Patients
          </button>
          <button
            onClick={() => setActiveTab('doctors')}
            style={{
              padding: '12px 24px',
              backgroundColor: activeTab === 'doctors' ? '#007bff' : 'white',
              color: activeTab === 'doctors' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Doctors
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            style={{
              padding: '12px 24px',
              backgroundColor: activeTab === 'staff' ? '#007bff' : 'white',
              color: activeTab === 'staff' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Staff
          </button>
        </div>

        {/* Tab Content */}
        {renderTabContent()}

        {/* Logout Button */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
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
      </div>
    </div>
  );
}

export default AdminDashboard;
