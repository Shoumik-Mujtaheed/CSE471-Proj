// pages/StaffDashboard.jsx
// Main dashboard for staff - shows leave requests and profile
import React, { useState, useEffect } from 'react';

export default function StaffDashboard() {
  // STATE MANAGEMENT
  const [activeTab, setActiveTab] = useState('leaves'); // leaves, profile
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get staff token from localStorage
  const getToken = () => localStorage.getItem('staffToken');

  // FETCH DATA FUNCTIONS
  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/staff/leave-requests', {
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

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/staff/profile', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    if (activeTab === 'leaves') fetchLeaveRequests();
    if (activeTab === 'profile') fetchProfile();
  }, [activeTab]);

  // LOGOUT FUNCTION
  const handleLogout = () => {
    localStorage.removeItem('staffToken');
    window.location.href = '/staff/login';
  };

  // Check if user is logged in
  if (!getToken()) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Please log in to access staff dashboard</h2>
        <button onClick={() => window.location.href = '/staff/login'}>
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Staff Dashboard</h1>
        <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>
          Logout
        </button>
      </div>

      {/* TAB NAVIGATION */}
      <div style={{ marginBottom: '2rem' }}>
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
          onClick={() => setActiveTab('profile')}
          style={{ 
            padding: '0.75rem 1.5rem',
            backgroundColor: activeTab === 'profile' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'profile' ? 'white' : 'black',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        >
          My Profile
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
          {/* LEAVE REQUESTS TAB */}
          {activeTab === 'leaves' && (
            <LeaveRequestSection 
              leaveRequests={leaveRequests} 
              onRefresh={fetchLeaveRequests}
              token={getToken()}
            />
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <ProfileSection profile={profile} />
          )}
        </>
      )}
    </div>
  );
}

// LEAVE REQUEST SECTION COMPONENT (Similar to doctor's but for staff)
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
      const res = await fetch('/api/staff/leave-requests', {
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

// PROFILE SECTION COMPONENT
function ProfileSection({ profile }) {
  if (!profile) {
    return (
      <div>
        <h2>My Profile</h2>
        <p style={{ color: '#666' }}>Loading profile...</p>
      </div>
    );
  }

  return (
    <div>
      <h2>My Profile</h2>
      <div style={{ backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '4px', padding: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <strong>Name:</strong> {profile.user?.name}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <strong>Email:</strong> {profile.user?.email}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <strong>Phone:</strong> {profile.user?.phoneNumber}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <strong>Department:</strong> {profile.department || 'Not specified'}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <strong>Role:</strong> Staff Member
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <strong>Member Since:</strong> {new Date(profile.createdAt).toLocaleDateString()}
        </div>

        {/* SHIFT INFORMATION */}
        {profile.shifts && profile.shifts.length > 0 && (
          <div>
            <strong>Current Shifts:</strong>
            <div style={{ marginTop: '0.5rem' }}>
              {profile.shifts.map((shift, index) => (
                <div key={index} style={{ 
                  backgroundColor: '#f8f9fa', 
                  padding: '0.5rem', 
                  marginBottom: '0.5rem',
                  borderRadius: '4px' 
                }}>
                  <strong>{shift.startTime} - {shift.endTime}</strong><br />
                  Days: {shift.days.join(', ')}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
