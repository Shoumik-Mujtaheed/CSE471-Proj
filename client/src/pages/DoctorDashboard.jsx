// pages/DoctorDashboard.jsx
// Main dashboard for doctors - shows time slots and leave requests
import React, { useState, useEffect } from 'react';

export default function DoctorDashboard() {
  // STATE MANAGEMENT
  const [activeTab, setActiveTab] = useState('timeslots'); // timeslots, leaves, patients
  const [timeSlots, setTimeSlots] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get doctor token from localStorage
  const getToken = () => localStorage.getItem('doctorToken');

  // FETCH DATA FUNCTIONS
  const fetchTimeSlots = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/doctor/timeslots', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error('Failed to fetch time slots');
      const data = await res.json();
      setTimeSlots(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/doctor/leave-requests', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error('Failed to fetch leave requests');
      const data = await res.json();
      setLeaveRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/doctor/patients', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error('Failed to fetch patients');
      const data = await res.json();
      setPatients(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    if (activeTab === 'timeslots') fetchTimeSlots();
    if (activeTab === 'leaves') fetchLeaveRequests();
    if (activeTab === 'patients') fetchPatients();
  }, [activeTab]);

  // LOGOUT FUNCTION
  const handleLogout = () => {
    localStorage.removeItem('doctorToken');
    window.location.href = '/doctor/login';
  };

  // Check if user is logged in
  if (!getToken()) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Please log in to access doctor dashboard</h2>
        <button onClick={() => window.location.href = '/doctor/login'}>
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Doctor Dashboard</h1>
        <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>
          Logout
        </button>
      </div>

      {/* TAB NAVIGATION */}
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('timeslots')}
          style={{ 
            padding: '0.75rem 1.5rem', 
            marginRight: '1rem',
            backgroundColor: activeTab === 'timeslots' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'timeslots' ? 'white' : 'black',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        >
          Time Slots
        </button>
        <button 
          onClick={() => setActiveTab('leaves')}
          style={{ 
            padding: '0.75rem 1.5rem', 
            marginRight: '1rem',
            backgroundColor: activeTab === 'leaves' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'leaves' ? 'white' : 'black',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        >
          Leave Requests
        </button>
        <button 
          onClick={() => setActiveTab('patients')}
          style={{ 
            padding: '0.75rem 1.5rem',
            backgroundColor: activeTab === 'patients' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'patients' ? 'white' : 'black',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        >
          My Patients
        </button>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div style={{ color: 'red', backgroundColor: '#fee', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {/* LOADING STATE */}
      {loading && <p>Loading...</p>}

      {/* TAB CONTENT */}
      {!loading && (
        <>
          {/* TIME SLOTS TAB */}
          {activeTab === 'timeslots' && (
            <TimeSlotSection 
              timeSlots={timeSlots} 
              onRefresh={fetchTimeSlots}
              token={getToken()}
            />
          )}

          {/* LEAVE REQUESTS TAB */}
          {activeTab === 'leaves' && (
            <LeaveRequestSection 
              leaveRequests={leaveRequests} 
              onRefresh={fetchLeaveRequests}
              token={getToken()}
            />
          )}

          {/* PATIENTS TAB */}
          {activeTab === 'patients' && (
            <PatientsSection patients={patients} />
          )}
        </>
      )}
    </div>
  );
}

// TIME SLOT SECTION COMPONENT
function TimeSlotSection({ timeSlots, onRefresh, token }) {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState({
    date: '',
    startTime: '',
    endTime: ''
  });

  // REQUEST NEW TIME SLOT
  const handleRequestSlot = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/doctor/slot-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(requestForm)
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      
      alert('Time slot requested successfully!');
      setShowRequestForm(false);
      setRequestForm({ date: '', startTime: '', endTime: '' });
      onRefresh();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>My Time Slots</h2>
        <button 
          onClick={() => setShowRequestForm(!showRequestForm)}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Request New Slot
        </button>
      </div>

      {/* REQUEST FORM */}
      {showRequestForm && (
        <form onSubmit={handleRequestSlot} style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '4px', marginBottom: '2rem' }}>
          <h3>Request New Time Slot</h3>
          <div style={{ marginBottom: '1rem' }}>
            <label>Date:</label><br />
            <input
              type="date"
              value={requestForm.date}
              onChange={(e) => setRequestForm({...requestForm, date: e.target.value})}
              required
              style={{ padding: '0.5rem', width: '200px' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Start Time:</label><br />
            <input
              type="time"
              value={requestForm.startTime}
              onChange={(e) => setRequestForm({...requestForm, startTime: e.target.value})}
              required
              style={{ padding: '0.5rem', width: '150px' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>End Time:</label><br />
            <input
              type="time"
              value={requestForm.endTime}
              onChange={(e) => setRequestForm({...requestForm, endTime: e.target.value})}
              required
              style={{ padding: '0.5rem', width: '150px' }}
            />
          </div>
          <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', marginRight: '1rem' }}>
            Submit Request
          </button>
          <button type="button" onClick={() => setShowRequestForm(false)} style={{ padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}>
            Cancel
          </button>
        </form>
      )}

      {/* TIME SLOTS LIST */}
      <div style={{ backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '4px' }}>
        {timeSlots.length === 0 ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No time slots found</p>
        ) : (
          timeSlots.map((slot) => (
            <div key={slot._id} style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{new Date(slot.date).toLocaleDateString()}</strong> | 
                  {slot.startTime} - {slot.endTime}
                </div>
                <span style={{ 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '4px',
                  backgroundColor: 
                    slot.status === 'available' ? '#d4edda' :
                    slot.status === 'booked' ? '#f8d7da' :
                    slot.status === 'requested' ? '#fff3cd' : '#e2e3e5',
                  color:
                    slot.status === 'available' ? '#155724' :
                    slot.status === 'booked' ? '#721c24' :
                    slot.status === 'requested' ? '#856404' : '#383d41'
                }}>
                  {slot.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// LEAVE REQUEST SECTION COMPONENT
function LeaveRequestSection({ leaveRequests, onRefresh, token }) {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState({
    leaveType: 'vacation',
    startDate: '',
    endDate: '',
    reason: '',
    isEmergency: false
  });

  const leaveTypes = [
    'sick_leave', 'vacation', 'personal_leave', 'emergency_leave',
    'maternity_leave', 'paternity_leave', 'bereavement_leave', 'other'
  ];

  // REQUEST NEW LEAVE
  const handleRequestLeave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/doctor/leave-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(requestForm)
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      
      alert('Leave request submitted successfully!');
      setShowRequestForm(false);
      setRequestForm({ leaveType: 'vacation', startDate: '', endDate: '', reason: '', isEmergency: false });
      onRefresh();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>My Leave Requests</h2>
        <button 
          onClick={() => setShowRequestForm(!showRequestForm)}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Request Leave
        </button>
      </div>

      {/* REQUEST FORM */}
      {showRequestForm && (
        <form onSubmit={handleRequestLeave} style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '4px', marginBottom: '2rem' }}>
          <h3>Request Leave</h3>
          <div style={{ marginBottom: '1rem' }}>
            <label>Leave Type:</label><br />
            <select
              value={requestForm.leaveType}
              onChange={(e) => setRequestForm({...requestForm, leaveType: e.target.value})}
              style={{ padding: '0.5rem', width: '200px' }}
            >
              {leaveTypes.map(type => (
                <option key={type} value={type}>{type.replace('_', ' ').toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Start Date:</label><br />
            <input
              type="date"
              value={requestForm.startDate}
              onChange={(e) => setRequestForm({...requestForm, startDate: e.target.value})}
              required
              style={{ padding: '0.5rem', width: '200px' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>End Date:</label><br />
            <input
              type="date"
              value={requestForm.endDate}
              onChange={(e) => setRequestForm({...requestForm, endDate: e.target.value})}
              required
              style={{ padding: '0.5rem', width: '200px' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Reason:</label><br />
            <textarea
              value={requestForm.reason}
              onChange={(e) => setRequestForm({...requestForm, reason: e.target.value})}
              required
              rows="3"
              style={{ padding: '0.5rem', width: '400px' }}
              placeholder="Please provide a reason for your leave request"
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>
              <input
                type="checkbox"
                checked={requestForm.isEmergency}
                onChange={(e) => setRequestForm({...requestForm, isEmergency: e.target.checked})}
              />
              Emergency Leave
            </label>
          </div>
          <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', marginRight: '1rem' }}>
            Submit Request
          </button>
          <button type="button" onClick={() => setShowRequestForm(false)} style={{ padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}>
            Cancel
          </button>
        </form>
      )}

      {/* LEAVE REQUESTS LIST */}
      <div style={{ backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '4px' }}>
        {leaveRequests.length === 0 ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No leave requests found</p>
        ) : (
          leaveRequests.map((request) => (
            <div key={request._id} style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div><strong>{request.leaveType.replace('_', ' ').toUpperCase()}</strong></div>
                  <div>{new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}</div>
                  <div style={{ color: '#666', fontSize: '0.9rem' }}>{request.reason}</div>
                  {request.adminComment && (
                    <div style={{ color: '#007bff', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                      Admin: {request.adminComment}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '4px',
                    backgroundColor: 
                      request.status === 'approved' ? '#d4edda' :
                      request.status === 'rejected' ? '#f8d7da' : '#fff3cd',
                    color:
                      request.status === 'approved' ? '#155724' :
                      request.status === 'rejected' ? '#721c24' : '#856404'
                  }}>
                    {request.status}
                  </span>
                  <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                    {request.totalDays} day(s)
                  </div>
                  {request.isEmergency && (
                    <div style={{ fontSize: '0.8rem', color: '#dc3545', fontWeight: 'bold' }}>
                      EMERGENCY
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// PATIENTS SECTION COMPONENT
function PatientsSection({ patients }) {
  return (
    <div>
      <h2>My Patients</h2>
      <div style={{ backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '4px' }}>
        {patients.length === 0 ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No patients found</p>
        ) : (
          patients.map((appointment) => (
            <div key={appointment._id} style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{appointment.user?.name || 'Unknown Patient'}</strong><br />
                  <span style={{ color: '#666' }}>
                    {appointment.user?.email} | {appointment.user?.phoneNumber}
                  </span>
                </div>
                <span style={{ 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '4px',
                  backgroundColor: appointment.status === 'treated' ? '#d4edda' : '#fff3cd',
                  color: appointment.status === 'treated' ? '#155724' : '#856404'
                }}>
                  {appointment.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
